import React, { CSSProperties, useState, useEffect } from 'react';
import { Map, GeoJSON, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Feature, FeatureCollection } from 'geojson';
import { History, Location } from 'history';
import extent from 'turf-extent';
import { NAVBAR_HEIGHT } from '../constants';
import hash from 'object-hash';
import { useHistory, useLocation } from 'react-router-dom';
import { getColor } from '../categoryColors';
import { Spinner } from 'react-bootstrap';
import { ResultDocument, Result } from '../api/result';
import { buildProjectQueryTemplate, addFilters } from '../api/query';
import { mapSearch } from '../api/documents';
import { Document } from '../api/document';


const MAX_SIZE = 10000;


export default React.memo(function ProjectMap({ id, document }: { id: string, document: Document }) {

    const history: History = useHistory();
    const location = useLocation();
    const [loading, setLoading] = useState<boolean>(true);
    const [featureCollection, setFeatureCollection] = useState<FeatureCollection>();

    useEffect(() => {

        setLoading(true);
        setFeatureCollection(null);

        searchMapDocuments(id, location)
            .then(result => createFeatureCollection(result.documents))
            .then(features => setFeatureCollection(features))
            .then(() => setLoading(false));

    }, [id, location]);

    return (
        <div>
            <Map style={ mapStyle }
                crs={ L.CRS.Simple }
                minZoom="-20"
                maxZoom="10"
                bounds={ getBounds(featureCollection, document) }
                boundsOptions={ { padding: [410, 10] } }
                renderer={ L.canvas({ padding: 0.5 }) }
                attributionControl={ false }
                zoomControl={ false }>
                { getGeoJSONElement(featureCollection, history) }
                <ZoomControl position="bottomright" />
            </Map>
            { loading &&
                <Spinner animation="border"
                    variant="secondary"
                    style={ spinnerStyle } />
            }
        </div>
    );
});


const searchMapDocuments = async (id: string, location: Location): Promise<Result> => {

    const query = buildProjectQueryTemplate(id, 0, MAX_SIZE);
    addFilters(query, location);
    return mapSearch(query);
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

    const { id, project } = event.target.feature.properties;
    history.push(`/project/${project}/${id}`);
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


const spinnerStyle: CSSProperties = {
    position: 'absolute',
    top: '50vh',
    left: '50vw'
};
