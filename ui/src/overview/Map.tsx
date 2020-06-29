import React, { CSSProperties, useEffect, useState } from 'react';
import { Map, GeoJSON, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { Feature, FeatureCollection } from 'geojson';
import { History } from 'history';
import extent from 'turf-extent';
import { NAVBAR_HEIGHT } from '../constants';
import hash from 'object-hash';
import { useHistory } from 'react-router-dom';


const TILES_URL: string = 'https://tile.thunderforest.com/landscape/{z}/{x}/{y}.png';
const API_KEY: string = 'b47a3cf895b94aedad41e5cfb5222b87';


export default ({ documents }: { documents: any[] }) => {

    const [featureCollection, setFeatureCollection] = useState(undefined);

    const history: History = useHistory();

    useEffect(() => {
        setFeatureCollection(createFeatureCollection(documents));
    }, [documents]);

    return (
        <Map style={ mapStyle }
             bounds={ getBounds(featureCollection) }
             boundsOptions={ { padding: [10, 10] } }>
            <TileLayer url={ `${TILES_URL}?apikey=${API_KEY}` } />
            { getGeoJSONElement(featureCollection, history) }
        </Map>
    );
};


const getGeoJSONElement = (featureCollection: FeatureCollection, history: History) => {

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


const onEachFeature = (history: History) => (feature: Feature, layer: L.Layer) => {

    registerEventListeners(feature, layer, history);
    addTooltip(feature, layer);
};


const registerEventListeners = (feature: Feature, layer: L.Layer, history: History) => {

    layer.on({
        click: onClick(history)
    });
};


const addTooltip = (feature: Feature, layer: L.Layer) => {

    layer.bindTooltip(feature.properties.identifier, { direction: 'center', offset: [0, -30] } );
};


const onClick = (history: History) => (event: any) => {

    const identifier: string = event.target.feature.properties.identifier;
    history.push(`/project/${identifier}`);
};


const createFeatureCollection = (documents: any[]): FeatureCollection | undefined => {

    if (!documents || documents.length === 0) return undefined;

    return {
        type: 'FeatureCollection',
        features: documents
            .filter(document => document.resource.geometry)
            .map(createFeature)
    };
};


const createFeature = (document: any): Feature => ({
    type: 'Feature',
    geometry: document.resource.geometry,
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
