import React, { CSSProperties, ReactElement, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { Feature, FeatureCollection } from 'geojson';
import extent from 'turf-extent';
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
import { get as getProjection } from 'ol/proj';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';


proj4.defs('EPSG:32638', '+proj=utm +zone=38 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');
register(proj4);


export default React.memo(function ProjectMap({ document, documents, onDocumentClick }
        : { document: Document, documents: ResultDocument[], onDocumentClick: (_: any) => void }): ReactElement {

    const featureCollection = createFeatureCollection(documents, document);
    const { t } = useTranslation();

    useEffect(() => {
        createMap(featureCollection, onDocumentClick);
    });

    return <>
        <div id="ol-map" style={ mapStyle }/>
        { (!documents || documents.length === 0) && renderEmptyResult(t) }
    </>;
}, (prevProps: any, nextProps: any) => {
    if (prevProps.document === nextProps.document
        && prevProps.documents === nextProps.documents) return true;
    return false;
});


const createMap = (featureCollection: FeatureCollection, onDocumentClick: (_: any) => void) => {

    const layers = [];

    const tileLayer = getTileLayer();
    if (tileLayer) layers.push(tileLayer);
    const vectorLayer = getGeoJSONLayer(featureCollection);
    if (vectorLayer) layers.push(vectorLayer);

    const map = new Map({
        target: 'ol-map',
        layers,
        view: new View({
            projection: getProjection('EPSG:32638'),
            center: [563249.985350, 3466750.014550],
            resolution: 2.012063
        })
    });

    map.on('click', handleMapClick(vectorLayer, onDocumentClick));

    return map;
};


const handleMapClick = (vectorLayer: VectorLayer, onDocumentClick: (_: any) => void)
        : ((_: MapBrowserEvent) => void) => {

    return async (e: MapBrowserEvent) => {

        const features = await vectorLayer.getFeatures(e.pixel);
        if (features.length) {
            const { id, project } = features[0].getProperties();
            onDocumentClick(`/project/${project}/${id}`);
        }
    };
};


const renderEmptyResult = (t: TFunction): ReactElement => {

    return <div style={ emptyResultStyle }>{ t('projectMap.noResources') }</div>;
};


const getGeoJSONLayer = (featureCollection: FeatureCollection): VectorLayer => {

    if (!featureCollection) return;

    const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(featureCollection),
    });

    const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: getStyle
    });

    return vectorLayer;
};


const getTileLayer = (): TileLayer => {

    const url = '/0127b1ce-696b-591d-a77a-3f22fa54432a_32638/{z}/{x}/{y}.png';

    return new TileLayer({
        source: new TileImage({
            tileGrid: new TileGrid({
                extent: [ 562998.477499999804, 3466498.50669999979, 563501.493200000143, 3467001.52240000013 ],
                origin: [ 562998.477499999804, 3467001.52240000013 ],
                resolutions: [ 2.0120628000014551, 1.00603140000072755, 0.503015700000363775, 0.251507850000181887,
                    0.125753925000090944, 0.0628769625000454718],
                tileSize: [256, 256]
            }),
            tileUrlFunction: (tileCoord) =>
                url
                    .replace('{z}', String(tileCoord[0]))
                    .replace('{x}', String(tileCoord[1]))
                    .replace('{y}', String(tileCoord[2]))
            ,
        })
    });
};


const getStyle = (feature: OlFeature): Style => {

    const fill = new Fill({ color: getColorForCategory(feature.getProperties().category, 0.2) });
    const stroke = new Stroke({ color: getColorForCategory(feature.getProperties().category, 1) });

    return new Style({
        image: new CircleStyle({
            radius: 5,
            fill,
            stroke,
        }),
        stroke,
        fill
    });
};


const getColorForCategory = (category: string, opacity: number): string => {
    const rgb = hexToRgb(getColor(category));
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
};


const createFeatureCollection = (documents: any[], selectedDocument: any): any => {

    if (documents.length === 0) return undefined;

    return {
        type: 'FeatureCollection',
        features: documents
            .filter(document => document?.resource.geometry)
            .map(document => createFeature(document, document.resource.id === selectedDocument?.resource.id)),
        crs: {
            'type': 'name',
            'properties': {
                'name': 'EPSG:32638'
            }
        }
    };
};


const createFeature = (document: any, selected: boolean): Feature => ({
    type: 'Feature',
    geometry: document.resource.geometry,
    properties: {
        id: document.resource.id,
        identifier: document.resource.identifier,
        category: document.resource.category,
        project: document.project,
        selected
    }
});


const getBounds = (featureCollection?: FeatureCollection, document?: Document): [number, number][] => {

    if (document?.resource?.geometry) {
        const extentResult: number[] = extent(document.resource.geometry);
        return [[extentResult[1], extentResult[0]], [extentResult[3], extentResult[2]]];
    }

    if (featureCollection) {
        const extentResult: number[] = extent(featureCollection);
        return [[extentResult[1], extentResult[0]], [extentResult[3], extentResult[2]]];
    }

    return [[-10, -10], [10, 10]];
};


const mapStyle: CSSProperties = {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`
};


const emptyResultStyle: CSSProperties = {
    position: 'absolute',
    top: '50vh',
    left: '50vw',
    transform: `translate(calc(-50% + ${SIDEBAR_WIDTH / 2}px), -50%)`,
    zIndex: 1
};

const geoJSONStyles = {
    'Point': new Style({
        image: new CircleStyle({
            radius: 5,
            fill: null,
            stroke: new Stroke({
                color: 'red',
                width: 1
            }),
        }),
    }),
    'LineString': new Style({
        stroke: new Stroke({
            color: 'green',
            width: 1,
        }),
    }),
    'MultiLineString': new Style({
        stroke: new Stroke({
            color: 'green',
            width: 1,
        }),
    }),
    'MultiPoint': new Style({
        image: new CircleStyle({
            radius: 5,
            fill: null,
            stroke: new Stroke({
                color: 'red',
                width: 1
            }),
        }),
    }),
    'MultiPolygon': new Style({
        stroke: new Stroke({
            color: 'yellow',
            width: 1,
        }),
        fill: new Fill({
            color: 'rgba(255, 255, 0, 0.1)',
        }),
    }),
    'Polygon': new Style({
        stroke: new Stroke({
            color: 'blue',
            lineDash: [4],
            width: 3,
        }),
        fill: new Fill({
            color: 'rgba(0, 0, 255, 0.1)',
        }),
    }),
    'GeometryCollection': new Style({
        stroke: new Stroke({
            color: 'magenta',
            width: 2,
        }),
        fill: new Fill({
            color: 'magenta',
        }),
        image: new CircleStyle({
            radius: 10,
            fill: null,
            stroke: new Stroke({
                color: 'magenta',
            }),
        }),
    }),
    'Circle': new Style({
        stroke: new Stroke({
            color: 'red',
            width: 2,
        }),
        fill: new Fill({
            color: 'rgba(255,0,0,0.2)',
        }),
    }),
};
