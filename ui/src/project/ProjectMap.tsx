import React, { CSSProperties } from 'react';
import { Map, GeoJSON, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Feature, FeatureCollection } from 'geojson';
import extent from 'turf-extent';
import { NAVBAR_HEIGHT } from '../constants';
import hash from 'object-hash';
import { getColor } from '../categoryColors';
import { ResultDocument } from '../api/result';
import { Document } from '../api/document';


export default React.memo(function ProjectMap({
    id,
    document,
    documents,
    searchParams,
    onDocumentClick
}: {
    id: string,
    document: Document,
    documents: ResultDocument[],
    searchParams: string,
    onDocumentClick: (_: any) => void
}) {

    const featureCollection = createFeatureCollection(documents);

    return (
        <Map style={ mapStyle }
            crs={ L.CRS.Simple }
            minZoom="-20"
            maxZoom="10"
            bounds={ getBounds(featureCollection, document) }
            boundsOptions={ { padding: [410, 10] } }
            renderer={ L.canvas({ padding: 0.5 }) }
            attributionControl={ false }
            zoomControl={ false }>
            { getGeoJSONElement(featureCollection, onDocumentClick) }
            <ZoomControl position="bottomright" />
        </Map>
    );
}, (prevProps: any, nextProps: any) => {
    if (prevProps.id === nextProps.id
        && prevProps.document === nextProps.document
        && prevProps.documents === nextProps.documents
        && prevProps.searchParams === nextProps.searchParams) return true;
    return false;
});


const getGeoJSONElement = (featureCollection: FeatureCollection, onDocumentClick: (_: any) => void) => {

    if (!featureCollection) return;

    return (
        <GeoJSON key={ hash(featureCollection) }
                 data={ featureCollection }
                 pointToLayer={ pointToLayer }
                 style={ getStyle }
                 onEachFeature={ onEachFeature(onDocumentClick) } />
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


const onEachFeature = (onDocumentClick: (_: any) => void) => (feature: Feature, layer: L.Layer) => {

    registerEventListeners(feature, layer, onDocumentClick);
    addTooltip(feature, layer);
};


const registerEventListeners = (feature: Feature, layer: L.Layer, onDocumentClick: (_: any) => void) => {

    layer.on({
        click: onClick(onDocumentClick)
    });
};


const addTooltip = (feature: Feature, layer: L.Layer) => {

    layer.bindTooltip(feature.properties.identifier, { direction: 'center', offset: [0, -30] } );
};


const onClick = (onDocumentClick: (_: any) => void) => (event: any) => {

    const { id, project } = event.target.feature.properties;
    onDocumentClick(`/project/${project}/${id}`);
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
        category: document.resource.category,
        project: document.project
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
