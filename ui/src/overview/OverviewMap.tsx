import React, { CSSProperties, useEffect, ReactElement } from 'react';
import L from 'leaflet';
import { Feature, FeatureCollection } from 'geojson';
import { History } from 'history';
import extent from 'turf-extent';
import { NAVBAR_HEIGHT } from '../constants';
import { useHistory } from 'react-router-dom';
import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { ResultDocument } from '../api/result';
import GeoJSON from 'ol/format/GeoJSON';
import { Circle as CircleStyle, Fill, Stroke, Style }  from 'ol/style';
import { Feature as OlFeature } from 'ol';


export default function OverviewMap({ documents }: { documents: ResultDocument[] }): ReactElement {

    const history: History = useHistory();

    useEffect(() => {

        if (!documents?.length) return;

        const map = createMap(documents);
        return () => map ?? map.setTarget(null);
    }, [documents]);

    return <div className="overview-map" id="ol-map" style={ mapStyle } />;
}


const createMap = (documents: ResultDocument[]): Map => {

    const featureColletion = createFeatureCollection(documents);

    return new Map({
        target: 'ol-map',
        layers: [
            new TileLayer({ source: new OSM() }),
            getGeoJSONLayer(featureColletion)
        ],
        view: new View({
            center: [0, 0],
            zoom: 0
        })
    });
};


const getGeoJSONLayer = (featureCollection: FeatureCollection): VectorLayer => {

    if (!featureCollection) return;

    const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(featureCollection, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' })
    });

    const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: getStyle,
        updateWhileAnimating: true
    });

    return vectorLayer;
};


const getStyle = (feature: OlFeature): Style => {

    return new Style({
        image: new CircleStyle({
            radius: 4,
            fill: new Fill({ color: 'white' }),
            stroke: new Stroke({ color: 'black', width: 5 }),
        })
    });
};

const createFeatureCollection = (documents: any[]): any => {

    if (!documents || documents.length === 0) return undefined;

    return {
        type: 'FeatureCollection',
        features: documents
            .filter(document => document.resource.geometry_wgs84)
            .map(createFeature)
    };
};


const createFeature = (document: any): Feature => ({
    type: 'Feature',
    geometry: document.resource.geometry_wgs84,
    properties: {
       identifier: document.resource.identifier
    }
});


const getBounds = (featureCollection?: FeatureCollection): [number, number][] => {

    if (!featureCollection) return [[-90, 180], [90, 180]];

    const extentResult: number[] = extent(featureCollection);
    return [[extentResult[1], extentResult[0]], [extentResult[3], extentResult[2]]];
};


const mapStyle: CSSProperties = {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`
};


const MarkerIcon = L.icon({
    iconUrl: 'marker-icon.svg',
    iconSize: [25, 25],
    iconAnchor: [13, 13]
});
