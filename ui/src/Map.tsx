import React, { CSSProperties, useEffect, useState } from 'react';
import { Map, GeoJSON, TileLayer } from 'react-leaflet';
import { Feature, FeatureCollection } from 'geojson';
import { History } from 'history';
import extent from 'turf-extent';
import { NAVBAR_HEIGHT } from './constants';
import hash from 'object-hash';
import { useHistory } from 'react-router-dom';


export default ({ documents }: { documents: any[] }) => {

    const [featureCollection, setFeatureCollection] = useState(undefined);

    const history: History = useHistory();

    useEffect(() => {
        setFeatureCollection(documents.length > 0 ? createFeatureCollection(documents) : undefined);
    }, [documents]);

    return (
        <Map style={ mapStyle }
             bounds={ getBounds(featureCollection) } boundsOptions={ { padding: [10, 10] } }>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            { getGeoJSONElement(featureCollection, history) }
        </Map>
    );
};


const getGeoJSONElement = (featureCollection: FeatureCollection, history: History) => {

    if (!featureCollection) return;

    return (
        <GeoJSON key={ hash(featureCollection) }
                 data={ featureCollection }
                 onEachFeature={ onEachFeature(history) } />
    );
};


const onEachFeature = (history: History) => (feature: Feature, layer: any) => {

    registerEventListeners(feature, layer, history);
    addTooltip(feature, layer);
};


const registerEventListeners = (feature: Feature, layer: any, history: History) => {

    layer.on({
        click: onClick(history)
    });
};


const addTooltip = (feature: Feature, layer: any) => {

    layer.bindTooltip(feature.properties.identifier, { direction: 'center', offset: [0, -50] } );
};


const onClick = (history: History) => (event: any) => {

    const identifier: string = event.target.feature.properties.identifier;
    history.push(`/project/${identifier}`);
};


const createFeatureCollection = (documents: any[]): FeatureCollection => ({
    type: 'FeatureCollection',
    features: documents
    .filter(document => document.resource.geometry)
    .map(createFeature)
});


const createFeature = (document: any): Feature => ({
    type: 'Feature',
    geometry: document.resource.geometry,
    properties: {
       identifier: document.resource.identifier
    }
});


const getBounds = (featureCollection?: FeatureCollection): [number, number][] => {

    if (!featureCollection) return [[0, 0], [10, 10]];

    const extentResult: number[] = extent(featureCollection);
    return [[extentResult[1], extentResult[0]], [extentResult[3], extentResult[2]]];
};


const mapStyle: CSSProperties = {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`
};
