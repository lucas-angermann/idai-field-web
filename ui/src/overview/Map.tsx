import React, { CSSProperties, useEffect, useState, ReactElement } from 'react';
import { Map as ReactLeafletMap, GeoJSON, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { Feature, FeatureCollection } from 'geojson';
import { History } from 'history';
import extent from 'turf-extent';
import { NAVBAR_HEIGHT } from '../constants';
import hash from 'object-hash';
import { useHistory } from 'react-router-dom';


const TILES_URL: string = 'https://tile.thunderforest.com/landscape/{z}/{x}/{y}.png';
const API_KEY: string = 'b47a3cf895b94aedad41e5cfb5222b87';


export default function Map({ documents }: { documents: any[] }): ReactElement {

    const [featureCollection, setFeatureCollection] = useState(undefined);

    const history: History = useHistory();

    useEffect(() => {
        setFeatureCollection(createFeatureCollection(documents));
    }, [documents]);

    return (
        <ReactLeafletMap style={ mapStyle }
                bounds={ getBounds(featureCollection) }
                boundsOptions={ { padding: [10, 10] } }>
            <TileLayer url={ `${TILES_URL}?apikey=${API_KEY}` } />
            { getGeoJSONElement(featureCollection, history) }
        </ReactLeafletMap>
    );
}


const getGeoJSONElement = (featureCollection: FeatureCollection, history: History): ReactElement => {

    if (!featureCollection) return;

    return (
        <GeoJSON key={ hash(featureCollection) }
                 data={ featureCollection }
                 pointToLayer={ pointToLayer }
                 onEachFeature={ onEachFeature(history) } />
    );
};


const pointToLayer = (feature: Feature, latLng: L.LatLng): L.Marker => {

    return L.marker(latLng, { icon: MarkerIcon });
};


const onEachFeature = (history: History) => (feature: Feature, layer: L.Layer): void => {

    registerEventListeners(feature, layer, history);
    addTooltip(feature, layer);
};


const registerEventListeners = (feature: Feature, layer: L.Layer, history: History): void => {

    layer.on({
        click: onClick(history)
    });
};


const addTooltip = (feature: Feature, layer: L.Layer): void => {

    layer.bindTooltip(feature.properties.identifier, { direction: 'center', offset: [0, -30] } );
};


const onClick = (history: History) => (event: any): void => {

    const identifier: string = event.target.feature.properties.identifier;
    history.push(`/project/${identifier}`);
};


const createFeatureCollection = (documents: any[]): FeatureCollection | undefined => {

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
