import React, { CSSProperties, useEffect, useState } from 'react';
import { Map, GeoJSON, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Feature, FeatureCollection } from 'geojson';
import { History } from 'history';
import extent from 'turf-extent';
import { NAVBAR_HEIGHT } from '../constants';
import hash from 'object-hash';
import { useHistory } from 'react-router-dom';
import { getColor } from '../categoryColors';


export default ({ documents }: { documents: any[] }) => {

    const [featureCollection, setFeatureCollection] = useState(undefined);

    const history: History = useHistory();

    useEffect(() => {
        setFeatureCollection(createFeatureCollection(documents));
    }, [documents]);

    return (
        <Map style={ mapStyle }
             crs={ L.CRS.Simple }
             minZoom="-20"
             maxZoom="30"
             bounds={ getBounds(featureCollection) }
             boundsOptions={ { padding: [10, 200] } }
             renderer={ L.canvas({ padding: 0.5 }) }
             attributionControl={ false }
             zoomControl={ false }>
            { getGeoJSONElement(featureCollection, history) }
            <ZoomControl position="bottomright" />
        </Map>
    );
};


const getGeoJSONElement = (featureCollection: FeatureCollection, history: History) => {

    if (!featureCollection) return;

    return (
        <GeoJSON key={ hash(featureCollection) }
                 data={ featureCollection }
                 pointToLayer={ pointToLayer }
                 style={ getStyle }
                 onEachFeature={ onEachFeature(history) } />
    );
};


const pointToLayer = (feature: Feature, latLng: L.LatLng): L.CircleMarker => {

    return L.circleMarker(
        latLng,
        {
            fillColor: getColor(feature.properties.category),
            fillOpacity: 1,
            radius: 5,
            stroke: false
        }
    );
};


const getStyle = (feature: Feature) => ({
    color: getColor(feature.properties.category),
    weight: feature.geometry.type === 'LineString' ? 2 : 1,
    opacity: 0.5,
    fillOpacity: feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon' ? 0.2 : 1
});


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

    const id: string = event.target.feature.properties.id;
    history.push(`/document/${id}`);
};


const createFeatureCollection = (documents: any[]): FeatureCollection | undefined => {

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
    geometry: document.resource.geometry,
    properties: {
        id: document.resource.id,
        identifier: document.resource.identifier,
        category: document.resource.type
    }
});


const getBounds = (featureCollection?: FeatureCollection): [number, number][] => {

    if (!featureCollection) return [[-10, -10], [10, 10]];

    const extentResult: number[] = extent(featureCollection);
    return [[extentResult[1], extentResult[0]], [extentResult[3], extentResult[2]]];
};


const mapStyle: CSSProperties = {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`
};
