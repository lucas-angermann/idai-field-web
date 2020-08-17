import React, { CSSProperties, ReactElement } from 'react';
import { Map, GeoJSON, ZoomControl } from 'react-leaflet';
import L, { PathOptions } from 'leaflet';
import { Feature, FeatureCollection } from 'geojson';
import extent from 'turf-extent';
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from '../constants';
import hash from 'object-hash';
import { getColor } from '../categoryColors';
import { ResultDocument } from '../api/result';
import { Document } from '../api/document';


export default React.memo(function ProjectMap({ document, documents, onDocumentClick }
        : { document: Document, documents: ResultDocument[], onDocumentClick: (_: any) => void }): ReactElement {

    const featureCollection = createFeatureCollection(documents, document);

    return <>
        <Map style={ mapStyle }
            crs={ L.CRS.Simple }
            minZoom="-20"
            maxZoom="10"
            bounds={ getBounds(featureCollection, document) }
            boundsOptions={ { paddingTopLeft: [410, 10], paddingBottomRight: [10, 10] } }
            renderer={ L.canvas({ padding: 0.5 }) }
            attributionControl={ false }
            zoomControl={ false }>
            { getGeoJSONElement(featureCollection, onDocumentClick) }
            <ZoomControl position="bottomright" />
        </Map>
        { (!documents || documents.length === 0) && renderEmptyResult() }
    </>;
}, (prevProps: any, nextProps: any) => {
    if (prevProps.document === nextProps.document
        && prevProps.documents === nextProps.documents) return true;
    return false;
});


const renderEmptyResult = (): ReactElement => {

    return <div style={ emptyResultStyle }>
        Im Suchergebnis befinden sich keine Ressourcen, die mit Geodaten verknüpft sind.
    </div>;
};


const getGeoJSONElement = (featureCollection: FeatureCollection, onDocumentClick: (_: any) => void): ReactElement => {

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
            stroke: false,
            pane: 'markerPane'
        }
    );
};


const getStyle = (feature: Feature): PathOptions => ({
    color: getColor(feature.properties.category),
    weight: feature.geometry.type === 'LineString' ? 2 : 1,
    opacity: 0.5,
    fillOpacity: feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon' ? 0.2 : 1
});


const onEachFeature = (onDocumentClick: (_: any) => void) => (feature: Feature, layer: L.Layer): void => {

    registerEventListeners(feature, layer, onDocumentClick);
    addTooltip(feature, layer);

    if (feature.properties.selected) {
        // TODO Do this without the timeout
        setTimeout(() => (layer as any).bringToFront(), 100);
    }
};


const registerEventListeners = (feature: Feature, layer: L.Layer, onDocumentClick: (_: any) => void): void => {

    layer.on({
        click: onClick(onDocumentClick)
    });
};


const addTooltip = (feature: Feature, layer: L.Layer): void => {

    layer.bindTooltip(feature.properties.identifier, { direction: 'center', offset: [0, -30] } );
};


const onClick = (onDocumentClick: (_: any) => void) => (event: any): void => {

    const { id, project } = event.target.feature.properties;
    onDocumentClick(`/project/${project}/${id}`);
};


const createFeatureCollection = (documents: any[], selectedDocument: any): FeatureCollection | undefined => {

    if (documents.length === 0) return undefined;

    return {
        type: 'FeatureCollection',
        features: documents
            .filter(document => document?.resource.geometry)
            .map(document => createFeature(document, document.resource.id === selectedDocument?.resource.id))
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
