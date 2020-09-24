import React, { CSSProperties, ReactElement, useEffect, useState, useContext } from 'react';
import { Feature, FeatureCollection } from 'geojson';
import turfExtent from 'turf-extent';
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from '../constants';
import { getColor, hexToRgb } from '../categoryColors';
import { ResultDocument } from '../api/result';
import { Document } from '../api/document';
import Map from 'ol/Map';
import View from 'ol/View';
import { Vector as VectorSource, TileImage } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { Circle as CircleStyle, Fill, Stroke, Style }  from 'ol/style';
import TileGrid from 'ol/tilegrid/TileGrid';
import { Feature as OlFeature, MapBrowserEvent } from 'ol';
import GeoJSON from 'ol/format/GeoJSON';
import { Polygon } from 'ol/geom';
import { Select } from 'ol/interaction';
import { never } from 'ol/events/condition';
import { useHistory, useLocation } from 'react-router-dom';
import { History } from 'history';
import { LoginContext } from '../App';
import { LoginData } from '../login';
import { get, search } from '../api/documents';
import { getTileLayerExtent, getResolutions } from './tileLayer';
import './project-map.css';
import { getImageUrl } from '../api/image';
import Icon from '@mdi/react';
import { mdiEye, mdiEyeOff, mdiImageFilterCenterFocus } from '@mdi/js';
import { Button } from 'react-bootstrap';


const fitOptions = { padding: [ 20, 20, 20, SIDEBAR_WIDTH + 20 ], duration: 500 };


type VisibleTileLayersSetter = React.Dispatch<React.SetStateAction<string[]>>;


export default function ProjectMap({ document, documents, project }
        : { document: Document, documents: ResultDocument[], project: string }): ReactElement {

    const history = useHistory();
    const location = useLocation();
    const loginData = useContext(LoginContext);
    const [map, setMap] = useState<Map>(null);
    const [vectorLayer, setVectorLayer] = useState<VectorLayer>(null);
    const [select, setSelect] = useState<Select>(null);
    const [tileLayers, setTileLayers] = useState<TileLayer[]>([]);
    const [visibleTileLayers, setVsibileTileLayers] = useState<string[]>([]);
 
    useEffect(() => {
        const newMap = createMap();
        setMap(newMap);
        setSelect(createSelect(newMap));

        return () => newMap ?? newMap.setTarget(null);
    }, []);

    useEffect(() => {

        let mounted = true;

        getTileLayers(project, loginData).then((newTileLayers) => {
            if (mounted) {
                setTileLayers(newTileLayers);
                newTileLayers.forEach(layer => map.addLayer(layer));
            }
        });

        return () => mounted = false;
    }, [map, project, loginData]);

    useEffect(() => {

        if (!map) return;

        map.on('click', handleMapClick(history, location.search));
    }, [map, history, location.search]);

    useEffect(() => {

        if (!map || !documents?.length) return;

        const featureCollection = createFeatureCollection(documents);
        
        const newVectorLayer = getGeoJSONLayer(featureCollection);
        if (newVectorLayer) map.addLayer(newVectorLayer);
        setVectorLayer(newVectorLayer);

        map.getView().fit(turfExtent(featureCollection), { padding: fitOptions.padding });
        return () => map.removeLayer(newVectorLayer);
    }, [map, documents]);

    useEffect(() => {

        if (map && vectorLayer && document?.resource?.geometry) {

            const feature = vectorLayer.getSource().getFeatureById(document.resource.id);
            select.getFeatures().clear();
            select.getFeatures().push(feature);
            map.getView().fit(turfExtent(document.resource.geometry), fitOptions);
        }
    }, [map, document, vectorLayer, select]);

    return <>
        <div className="project-map" id="ol-project-map" style={ mapStyle } />
        { renderLayerControls(map, tileLayers, visibleTileLayers, setVsibileTileLayers) }
    </>;
}


const createMap = (): Map => {

    return new Map({
        target: 'ol-project-map',
        view: new View()
    });
};


const renderLayerControls = (map: Map, tileLayers: TileLayer[], visibleTileLayers: string[],
        setVisibleTileLayers: VisibleTileLayersSetter): ReactElement => {

    return <>
        <div style={ layerSelectorStyle }>
            <ul className="list-group">
                { tileLayers.map(renderLayerControl(map, visibleTileLayers, setVisibleTileLayers)) }
            </ul>
        </div>
    </>;
};


const renderLayerControl = (map: Map, visibleTileLayers: string[], setVisibleTileLayers: VisibleTileLayersSetter) =>
        (tileLayer: TileLayer): ReactElement => {

    const resource = tileLayer.get('document').resource;
    const extent = tileLayer.getSource().getTileGrid().getExtent();

    return (
        <li style={ layerSelectorItemStyle } key={ resource.id }
                className={ 'list-group-item' + (visibleTileLayers.includes(resource.id) ? ' active' : '') }>
                <Button variant="link" onClick={ () => toggleLayer(tileLayer, setVisibleTileLayers) }
                        style={ layerSelectorButtonStyle }>
                    <Icon path={ visibleTileLayers.includes(resource.id) ? mdiEye : mdiEyeOff } size={ 0.7 } />
                </Button>
                <Button variant="link" onClick={ () => map.getView().fit(extent, fitOptions) }
                        style={ layerSelectorButtonStyle }>
                    <Icon path={ mdiImageFilterCenterFocus } size={ 0.7 } />
                </Button>
            { resource.identifier }
        </li>
    );
};


const toggleLayer = (tileLayer: TileLayer,
        setVisibleTileLayers: React.Dispatch<React.SetStateAction<string[]>>): void => {

    const docId = tileLayer.get('document').resource.id;

    tileLayer.setVisible(!tileLayer.getVisible());
    tileLayer.getVisible()
        ? setVisibleTileLayers(old => [...old, docId])
        : setVisibleTileLayers(old => old.filter(id => id !== docId));
};


const createSelect = (map: Map): Select => {

    const select = new Select({ condition: never, style: getSelectStyle });
    map.addInteraction(select);
    return select;
};


const handleMapClick = (history: History, searchParams: string)
        : ((_: MapBrowserEvent) => void) => {

    return async (e: MapBrowserEvent) => {

        const features = e.map.getFeaturesAtPixel(e.pixel);
        if (features.length) {
            let smallestFeature = features[0];
            let smallestArea = 0;
            for (const feature of features) {
                if (feature.getGeometry().getType() === 'Polygon') {
                    const featureArea = (feature.getGeometry() as Polygon).getArea();
                    if (!smallestArea || featureArea < smallestArea) {
                        smallestFeature = feature;
                        smallestArea = featureArea;
                    }
                } else {
                    smallestFeature = feature;
                    break;
                }
                
            }
            const { id, project } = smallestFeature.getProperties();
            history.push(`/project/${project}/${id}`, searchParams);
        }
    };
};


const getGeoJSONLayer = (featureCollection: FeatureCollection): VectorLayer => {

    if (!featureCollection) return;

    const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(featureCollection),
    });

    const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: getStyle,
        updateWhileAnimating: true,
        zIndex: 1000
    });

    return vectorLayer;
};


const getTileLayers = async (project: string, loginData: LoginData): Promise<TileLayer[]> =>
    (await getTileLayerDocuments(project, loginData)).map(doc => getTileLayer(doc, loginData));


const getTileLayerDocuments = async (project: string, loginData: LoginData): Promise<Document[]> => {

    const result = await search({
        q: '*',
        exists: ['resource.georeference'],
        filters: [{ field: 'project', value: project }]
    }, loginData.token);
    return Promise.all(result.documents.map((doc: ResultDocument) => get(doc.resource.id, loginData.token)));
};


const getTileLayer = (document: Document, loginData: LoginData): TileLayer => {

    const tileSize: [number, number] = [256, 256];
    const pathTemplate = `${document.resource.id}/{z}/{x}/{y}.png`;
    const extent = getTileLayerExtent(document);
    const resolutions = getResolutions(extent, tileSize[0], document);

    const layer = new TileLayer({
        source: new TileImage({
            tileGrid: new TileGrid({
                extent,
                origin: [ extent[0], extent[3] ],
                resolutions,
                tileSize
            }),
            tileUrlFunction: (tileCoord) => {
                const path = pathTemplate
                    .replace('{z}', String(tileCoord[0]))
                    .replace('{x}', String(tileCoord[1]))
                    .replace('{y}', String(tileCoord[2]));
                return getImageUrl(document.project, path , tileSize[0], tileSize[1], loginData.token, 'png');
            }
        }),
        visible: false
    });
    
    layer.set('document', document);
    
    return layer;
};


const getStyle = (feature: OlFeature): Style => {

    const transparentColor = getColorForCategory(feature.getProperties().category, 0.3);
    const color = getColorForCategory(feature.getProperties().category, 1);

    return new Style({
        image: new CircleStyle({
            radius: 4,
            fill: new Fill({ color: 'white' }),
            stroke: new Stroke({ color, width: 5 }),
        }),
        stroke: new Stroke({ color }),
        fill: new Fill({ color: transparentColor })
    });
};


const getSelectStyle = (feature: OlFeature) => {

    const transparentColor = getColorForCategory(feature.getProperties().category, 0.3);
    const color = getColorForCategory(feature.getProperties().category, 1);

    return new Style({
        image: new CircleStyle({
            radius: 4,
            fill: new Fill({ color }),
            stroke: new Stroke({ color: 'white', width: 5 }),
        }),
        stroke: new Stroke({ color: 'white' }),
        fill: new Fill({ color: transparentColor }),
        zIndex: 100
    });
};


const getColorForCategory = (category: string, opacity: number): string => {
    const rgb = hexToRgb(getColor(category));
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
};


const createFeatureCollection = (documents: any[]): any => {

    if (documents.length === 0) return undefined;

    return {
        type: 'FeatureCollection',
        features: documents
            .filter(document => document?.resource.geometry)
            .map(createFeature)
    };
};


const createFeature = (document: any): Feature => ({
    type: 'Feature',
    id: document.resource.id,
    geometry: document.resource.geometry,
    properties: {
        id: document.resource.id,
        identifier: document.resource.identifier,
        category: document.resource.category,
        project: document.project
    }
});


const mapStyle: CSSProperties = {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`
};

const layerSelectorStyle: CSSProperties = {
    position: 'absolute',
    top: `${NAVBAR_HEIGHT + 10}px`,
    right: '10px',
    width: '300px',
    zIndex: 100,
    height: `calc(100vh - ${NAVBAR_HEIGHT + 20}px)`,
    overflow: 'auto'
};

const layerSelectorItemStyle: CSSProperties = {
    padding: '.375em .75em',
    fontSize: '.9em'
};

const layerSelectorButtonStyle: CSSProperties = {
    padding: '0 .375em .2em 0',
    lineHeight: 1
};
