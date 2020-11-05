import React, { CSSProperties, ReactElement, useEffect, useState, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import Icon from '@mdi/react';
import { mdiEye, mdiEyeOff, mdiImageFilterCenterFocus, mdiLayers } from '@mdi/js';
import { History } from 'history';
import { Feature, FeatureCollection } from 'geojson';
import { Feature as OlFeature, MapBrowserEvent } from 'ol';
import Map from 'ol/Map';
import View from 'ol/View';
import { Vector as VectorSource, TileImage } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { Circle as CircleStyle, Fill, Stroke, Style }  from 'ol/style';
import { Geometry, Polygon } from 'ol/geom';
import { Select } from 'ol/interaction';
import TileGrid from 'ol/tilegrid/TileGrid';
import GeoJSON from 'ol/format/GeoJSON';
import { never } from 'ol/events/condition';
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from '../constants';
import { getColor, hexToRgb } from '../categoryColors';
import { ResultDocument } from '../api/result';
import { Document } from '../api/document';
import { LoginContext } from '../App';
import { LoginData } from '../login';
import { get, search } from '../api/documents';
import { getImageUrl } from '../api/image';
import { getTileLayerExtent, getResolutions } from './tileLayer';
import './project-map.css';
import { getBackUrl } from './navigation';


export const FIT_OPTIONS = { padding: [ 100, 100, 100, SIDEBAR_WIDTH + 100 ], duration: 500 };
const STYLE_CACHE: { [ category: string ] : Style } = { };


type VisibleTileLayersSetter = React.Dispatch<React.SetStateAction<string[]>>;


/* eslint-disable react-hooks/exhaustive-deps */
export default function ProjectMap({ document, documents, project }
        : { document: Document, documents: ResultDocument[], project: string }): ReactElement {

    const history = useHistory();
    const location = useLocation();
    const loginData = useContext(LoginContext);
    const [map, setMap] = useState<Map>(null);
    const [vectorLayer, setVectorLayer] = useState<VectorLayer>(null);
    const [select, setSelect] = useState<Select>(null);
    const [tileLayers, setTileLayers] = useState<TileLayer[]>([]);
    const [visibleTileLayers, setVisibleTileLayers] = useState<string[]>([]);
    const [layerControlsVisible, setLayerControlsVisible] = useState<boolean>(false);
    const [mapClickFunction, setMapClickFunction] = useState<() => any>(null);
 
    useEffect(() => {

        const newMap = createMap();
        setMap(newMap);
        setSelect(createSelect(newMap));
        configureCursor(newMap);

        return () => newMap ?? newMap.setTarget(null);
    }, []);

    useEffect(() => {

        let mounted = true;

        getTileLayers(project, loginData).then((newTileLayers) => {
            if (mounted) {
                setTileLayers(newTileLayers);
                newTileLayers.forEach(layer => map.addLayer(layer));
                setVisibleTileLayers([]);
            }
        });

        return () => mounted = false;
    }, [map, project, loginData]);

    useEffect(() => {

        if (!map) return;
        if (mapClickFunction) map.un('click', mapClickFunction);

        const newMapClickFunction = handleMapClick(history, location.search, document);
        setMapClickFunction(() => newMapClickFunction);
        map.on('click', newMapClickFunction);
    }, [map, history, document, location.search]);

    useEffect(() => {

        if (!map || !documents?.length) return;

        const featureCollection = createFeatureCollection(documents);
        
        const newVectorLayer = getGeoJSONLayer(featureCollection);
        if (newVectorLayer) map.addLayer(newVectorLayer);
        setVectorLayer(newVectorLayer);

        map.getView().fit((newVectorLayer.getSource() as VectorSource<Geometry>).getExtent(),
            { padding: FIT_OPTIONS.padding });
        return () => map.removeLayer(newVectorLayer);
    }, [map, documents]);

    useEffect(() => {

        if (!map || !vectorLayer) return;
        select.getFeatures().clear();

        if (document?.resource?.geometry) {
            const feature = (vectorLayer.getSource() as VectorSource<Geometry>)
                .getFeatureById(document.resource.id);
            if (!feature) return;

            select.getFeatures().push(feature);
            map.getView().fit(feature.getGeometry().getExtent(), FIT_OPTIONS);
        } else {
            map.getView().fit((vectorLayer.getSource() as VectorSource<Geometry>).getExtent(), FIT_OPTIONS);
        }
    }, [map, document, vectorLayer, select]);

    return <>
        <div className="project-map" id="ol-project-map" style={ mapStyle } />
        { layerControlsVisible && renderLayerControls(map, tileLayers, visibleTileLayers, setVisibleTileLayers) }
        { renderLayerControlsButton(layerControlsVisible, setLayerControlsVisible) }
    </>;
}
/* eslint-enable react-hooks/exhaustive-deps */


const createMap = (): Map => {

    return new Map({
        target: 'ol-project-map',
        view: new View()
    });
};


const renderLayerControlsButton = (layerControlsVisible: boolean,
        setLayerControlsVisible: React.Dispatch<React.SetStateAction<boolean>>): ReactElement => <>
    <Button variant="primary" style={ layerControlsButtonStyle }
            onClick={ () => setLayerControlsVisible(!layerControlsVisible)}>
        <Icon path={ mdiLayers } size={ 0.8 } />
    </Button>
</>;


const renderLayerControls = (map: Map, tileLayers: TileLayer[], visibleTileLayers: string[],
        setVisibleTileLayers: VisibleTileLayersSetter): ReactElement => {

    return <>
        <div style={ layerSelectorStyle } className="layer-controls">
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
        <li style={ layerSelectorItemStyle } key={ resource.id } className="list-group-item">
                <Button variant="link" onClick={ () => toggleLayer(tileLayer, setVisibleTileLayers) }
                        style={ layerSelectorButtonStyle }
                        className={ visibleTileLayers.includes(resource.id) && 'active' }>
                    <Icon path={ visibleTileLayers.includes(resource.id) ? mdiEye : mdiEyeOff } size={ 0.7 } />
                </Button>
                <Button variant="link" onClick={ () => map.getView().fit(extent, FIT_OPTIONS) }
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


const handleMapClick = (history: History, searchParams: string, selectedDocument?: Document)
        : ((_: MapBrowserEvent) => void) => {

    return async (e: MapBrowserEvent) => {

        const features = e.map.getFeaturesAtPixel(e.pixel);
        if (features.length) {
            let smallestFeature = features[0];
            let smallestArea = 0;
            for (const feature of features) {
                if (feature.getGeometry().getType() === 'Polygon'
                        || feature.getGeometry().getType() === 'MultiPolygon') {
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
            history.push({ pathname: `/project/${project}/${id}`, search: searchParams });
        } else if (selectedDocument) {
            history.push(getBackUrl(selectedDocument.project, searchParams, undefined, selectedDocument));
        }
    };
};


const configureCursor = (map: Map) => {

    map.on('pointermove', event => {
        map.getTargetElement().style.cursor = map.getFeaturesAtPixel(event.pixel).length > 0
            ? 'pointer'
            : '';
    });
};


const getGeoJSONLayer = (featureCollection: FeatureCollection): VectorLayer => {

    if (!featureCollection) return;

    const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(featureCollection),
    });

    return new VectorLayer({
        source: vectorSource,
        style: getStyle,
        updateWhileAnimating: true,
        zIndex: 1000
    });
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
        visible: false,
        extent
    });
    
    layer.set('document', document);
    
    return layer;
};


const getStyle = (feature: OlFeature): Style => {

    const category = feature.getProperties().category;

    if (STYLE_CACHE[category]) return STYLE_CACHE[category];

    const transparentColor = getColorForCategory(feature.getProperties().category, 0.3);
    const color = getColorForCategory(feature.getProperties().category, 1);

    const style = new Style({
        image: new CircleStyle({
            radius: 4,
            fill: new Fill({ color: 'white' }),
            stroke: new Stroke({ color, width: 5 }),
        }),
        stroke: new Stroke({ color }),
        fill: new Fill({ color: transparentColor })
    });

    STYLE_CACHE[category] = style;

    return style;
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
        category: document.resource.category.name,
        project: document.project
    }
});


const mapStyle: CSSProperties = {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`
};

const layerControlsButtonStyle: CSSProperties = {
    position: 'absolute',
    top: `${NAVBAR_HEIGHT + 10}px`,
    right: '10px'
};

const layerSelectorStyle: CSSProperties = {
    position: 'absolute',
    top: `${NAVBAR_HEIGHT + 50}px`,
    right: '10px',
    zIndex: 100,
    height: `calc(100vh - ${NAVBAR_HEIGHT + 60}px)`,
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
