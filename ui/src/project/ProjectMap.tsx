import React, { CSSProperties, ReactElement, useEffect, useState } from 'react';
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
import { Polygon } from 'ol/geom';
import { Select } from 'ol/interaction';
import { never } from 'ol/events/condition';
import { EventsKey } from 'ol/events';


proj4.defs('EPSG:32638', '+proj=utm +zone=38 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');
register(proj4);


const padding = [ 20, 20, 20, SIDEBAR_WIDTH + 20 ];


export default function ProjectMap({ document, documents, onDocumentClick }
        : { document: Document, documents: ResultDocument[], onDocumentClick: (_: any) => void }): ReactElement {
    const { t } = useTranslation();

    const [map, setMap] = useState<Map>(null);
    const [vectorLayer, setVectorLayer] = useState<VectorLayer>(null);
    const [select, setSelect] = useState<Select>(null);

    useEffect(() => {

        const newMap = createMap();
        setMap(newMap);
        setSelect(createSelect(newMap));
    }, []);

    useEffect(() => {

        if (!map) return;

        createOnClick(map, onDocumentClick);
    }, [map, onDocumentClick]);

    useEffect(() => {

        if (!map) return;

        const featureCollection = createFeatureCollection(documents);
        
        if (vectorLayer) map.removeLayer(vectorLayer);
        const newVectorLayer = getGeoJSONLayer(featureCollection);
        if (newVectorLayer) map.addLayer(newVectorLayer);
        setVectorLayer(newVectorLayer);

        map.getView().fit(extent(featureCollection), { padding });
    }, [map, documents]);

    useEffect(() => {

        if (map && vectorLayer && document?.resource?.geometry) {

            const feature = vectorLayer.getSource().getFeatureById(document.resource.id);
            select.getFeatures().clear();
            select.getFeatures().push(feature);
            map.getView().fit(extent(document.resource.geometry), { duration: 500, padding });
        }
    }, [map, document, vectorLayer]);

    return <>
        <div id="ol-map" style={ mapStyle }/>
        { (!documents || documents.length === 0) && renderEmptyResult(t) }
    </>;
}


const createMap = (): Map => {

    const layers = [];

    const tileLayer = getTileLayer();
    if (tileLayer) layers.push(tileLayer);

    const map = new Map({
        target: 'ol-map',
        layers,
        view: new View({
            projection: getProjection('EPSG:32638')
        })
    });

    return map;
};


const createOnClick = (map: Map, onDocumentClick: any): EventsKey => map.on('click', handleMapClick(onDocumentClick));


const createSelect = (map: Map): Select => {

    const select = new Select({ condition: never, style: getSelectStyle });
    map.addInteraction(select);
    return select;
};


const handleMapClick = (onDocumentClick: (_: any) => void)
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
        style: getStyle,
        updateWhileAnimating: true
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
            .map(createFeature),
        crs: {
            'type': 'name',
            'properties': {
                'name': 'EPSG:32638'
            }
        }
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


const emptyResultStyle: CSSProperties = {
    position: 'absolute',
    top: '50vh',
    left: '50vw',
    transform: `translate(calc(-50% + ${SIDEBAR_WIDTH / 2}px), -50%)`,
    zIndex: 1
};
