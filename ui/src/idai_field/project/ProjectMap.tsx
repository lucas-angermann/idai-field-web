import { Feature, FeatureCollection } from 'geojson';
import { History } from 'history';
import { Feature as OlFeature, MapBrowserEvent } from 'ol';
import { never } from 'ol/events/condition';
import GeoJSON from 'ol/format/GeoJSON';
import { Polygon } from 'ol/geom';
import { Select } from 'ol/interaction';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import Map from 'ol/Map';
import { TileImage, Vector as VectorSource } from 'ol/source';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import TileGrid from 'ol/tilegrid/TileGrid';
import View from 'ol/View';
import React, { CSSProperties, ReactElement, useContext, useEffect, useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { Document } from '../../api/document';
import { search, searchMap } from '../../api/documents';
import { getImageUrl } from '../../api/image';
import { buildProjectQueryTemplate } from '../../api/query';
import { Result, ResultDocument } from '../../api/result';
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from '../../constants';
import { getColor, hexToRgb } from '../../shared/categoryColors';
import { useSearchParams } from '../../shared/location';
import { LoginContext, LoginData } from '../../shared/login';
import { EXCLUDED_TYPES_FIELD } from '../constants';
import LayerControls from './LayerControls';
import './project-map.css';
import { getResolutions, getTileLayerExtent } from './tileLayer';


export const FIT_OPTIONS = { padding: [ 100, 100, 100, SIDEBAR_WIDTH + 100 ], duration: 500 };
const MAX_SIZE = 10000;

const STYLE_CACHE: { [ category: string ] : Style } = { };


export default function ProjectMap({ selectedDocument, predecessors, project, onDeselectFeature }
        : { selectedDocument: Document, predecessors: ResultDocument[], project: string,
            onDeselectFeature: () => void }): ReactElement {

    const history = useHistory();
    const searchParams = useSearchParams();
    const loginData = useContext(LoginContext);

    const [documents, setDocuments] = useState<ResultDocument[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [map, setMap] = useState<Map>(null);
    const [vectorLayer, setVectorLayer] = useState<VectorLayer>(null);
    const [select, setSelect] = useState<Select>(null);
    const [tileLayers, setTileLayers] = useState<TileLayer[]>([]);
    
    const mapClickFunction = useRef<(_: MapBrowserEvent) => void>(null);

    useEffect(() => {

        const newMap = createMap();
        setMap(newMap);
        setSelect(createSelect(newMap));
        configureCursor(newMap);

        return () => {
            if (newMap) newMap.setTarget(null);
        };
    }, []);

    useEffect(() => {

        setLoading(true);
        searchDocuments(project, loginData.token)
            .then(result => {
                setDocuments(result.documents);
                setLoading(false);
            });
    }, [project, loginData]);

    useEffect(() => {

        if (!map) return;
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
        if (mapClickFunction.current) map.un('click', mapClickFunction.current);

        mapClickFunction.current = handleMapClick(history, searchParams, onDeselectFeature, selectedDocument);
        map.on('click', mapClickFunction.current);
    }, [map, history, selectedDocument, searchParams, onDeselectFeature]);

    useEffect(() => {

        if (!map || !documents?.length) return;

        const featureCollection = createFeatureCollection(documents);

        const newVectorLayer = getGeoJSONLayer(featureCollection);
        if (newVectorLayer) map.addLayer(newVectorLayer);
        setVectorLayer(newVectorLayer);
        setUpView(map, newVectorLayer);

        return () => map.removeLayer(newVectorLayer);
    }, [map, documents]);

    useEffect(() => {

        if (!map || !vectorLayer) return;
        select.getFeatures().clear();

        if (selectedDocument?.resource?.geometry) {
            const feature = (vectorLayer.getSource())
                .getFeatureById(selectedDocument.resource.id);
            if (!feature) return;

            select.getFeatures().push(feature);
            map.getView().fit(feature.getGeometry().getExtent(), FIT_OPTIONS);
        } else if (selectedDocument === null) {
            map.getView().fit((vectorLayer.getSource()).getExtent(), FIT_OPTIONS);
        }
    }, [map, selectedDocument, vectorLayer, select]);

    return <>
        { loading &&
            <div style={ spinnerContainerStyle }>
                <Spinner animation="border" variant="secondary" />
            </div>
        }
        <div className="project-map" id="ol-project-map" style={ mapStyle } />
        <LayerControls map={ map }
                    tileLayers={ tileLayers }
                    fitOptions={ FIT_OPTIONS }
                    predecessors={ predecessors }
                    project={ project }></LayerControls>
    </>;
}


const searchDocuments = async (id: string, token: string): Promise<Result> => {

    const query = buildProjectQueryTemplate(id, 0, MAX_SIZE, EXCLUDED_TYPES_FIELD);
    return searchMap(query, token);
};


const createMap = (): Map => {

    return new Map({
        target: 'ol-project-map',
        view: new View()
    });
};


const setUpView = (map: Map, layer: VectorLayer) => {

    map.getView().fit(layer.getSource().getExtent(), { padding: FIT_OPTIONS.padding });
    map.setView(new View({ extent: map.getView().calculateExtent(map.getSize()) }));
    map.getView().fit(layer.getSource().getExtent(), { padding: FIT_OPTIONS.padding });
};


const createSelect = (map: Map): Select => {

    const select = new Select({ condition: never, style: getSelectStyle });
    map.addInteraction(select);
    return select;
};


const handleMapClick = (history: History, searchParams: URLSearchParams, onDeselectFeature: () => void,
        selectedDocument?: Document): ((_: MapBrowserEvent) => void) => {

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
            history.push({ pathname: `/project/${project}/${id}`, search: searchParams.toString() });
        } else if (selectedDocument) {
            onDeselectFeature();
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


const getTileLayerDocuments = async (project: string, loginData: LoginData): Promise<ResultDocument[]> => {

    const result = await search({
        q: '*',
        exists: ['resource.georeference'],
        filters: [{ field: 'project', value: project }]
    }, loginData.token);

    return result.documents;
};


const getTileLayer = (document: ResultDocument, loginData: LoginData): TileLayer => {

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


const createFeatureCollection = (documents: ResultDocument[]): FeatureCollection => {

    if (documents.length === 0) return undefined;

    return {
        type: 'FeatureCollection',
        features: documents
            .filter(document => document?.resource.geometry)
            .map(createFeature)
    };
};


const createFeature = (document: ResultDocument): Feature => ({
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


const spinnerContainerStyle: CSSProperties = {
    position: 'absolute',
    top: '50vh',
    left: '50vw',
    transform: `translate(calc(-50% + ${SIDEBAR_WIDTH / 2}px), -50%)`,
    zIndex: 1
};


const mapStyle: CSSProperties = {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
    backgroundColor: '#d3d3cf'
};
