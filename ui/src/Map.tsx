import React, { useRef, useState, useEffect, CSSProperties } from 'react';
import mapboxgl, { Map, LngLatBounds, Layer, GeoJSONSourceRaw } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {Feature, FeatureCollection} from 'geojson';
import extent from 'turf-extent';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2ViYXN0aWFuY3V5IiwiYSI6ImNrOTQxZjA4MzAxaGIzZnBwZzZ4c21idHIifQ._2-exYw4CZRjn9WoLx8i1A';


const SOURCE_ID = 'geojson-source';


const mapContainerStyle: CSSProperties = {
    position: 'absolute',
    top: '0',
    right: '0',
    left: '0',
    bottom: '0'
};


const polygonLayer: Layer = {
    id: 'polygon-layer',
    type: 'fill',
    source: SOURCE_ID,
    paint: {
        'fill-color': '#888888',
        'fill-opacity': 0.4
    },
    filter: ['==', '$type', 'Polygon']
};


const pointLayer: any = {
    id: 'point-layer',
    type: 'symbol',
    source: SOURCE_ID,
    layout: {
        'text-field': ['get', 'identifier'],
        'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
        'text-radial-offset': 0.5,
        'text-justify': 'auto',
        'icon-image': 'marker-15',
        'text-size': 14
    },
    paint: {
        'text-color': '#660004',
        'text-halo-color': '#fff',
        'text-halo-width': 2
    },
    filter: ['==', '$type', 'Point']
};


const polygonLabelLayer: Layer = {
    id: 'polygon-label-layer',
    type: 'symbol',
    source: SOURCE_ID,
    layout: {
        'text-field': ['get', 'identifier'],
        'text-size': 12,
        'symbol-placement': 'point'
    },
    paint: {
        'text-color': '#660004',
        'text-halo-color': '#fff',
        'text-halo-width': 2
    },
    filter: ['==', '$type', 'Polygon']
};


type MapOptions = { zoom: number, center: [number, number]};


export default ({ resources }: { resources: any[] }) => {

    const [map, setMap] = useState(null);
    const [ready, setReady] = useState(false);
    const mapOptions: MapOptions = { zoom: 2, center: [0, 0] };
    const mapContainer = useRef(null);

    useEffect(() => {
        if (!map) setMap(initializeMap(mapOptions, mapContainer.current, setReady));
    }, [map, mapOptions]);

    useEffect(() => {
        if (map && map.getSource(SOURCE_ID)) {
            const featureCollection: FeatureCollection = getFeatureCollection(resources);
            map.getSource(SOURCE_ID).setData(featureCollection);
            fitBounds(map, featureCollection);
        }
    }, [map, resources, ready]);

    return <div ref={mapContainer} style={mapContainerStyle}/>;
}


const initializeMap = (mapOptions: MapOptions, containerEl: HTMLElement, setReady: Function) => {

    const map = new Map({
        container: containerEl,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: mapOptions.center,
        zoom: mapOptions.zoom
    });

    return map.on('load', () => {
        map.addSource(SOURCE_ID, getInitialGeoJSONSource())
            .addLayer(polygonLayer)
            .addLayer(pointLayer)
            .addLayer(polygonLabelLayer);
        setReady(true);
    });
};


const getInitialGeoJSONSource = (): GeoJSONSourceRaw => ({
    type: 'geojson',
    data: getFeatureCollection([])
});


const getFeatureCollection = (resources: any[]): FeatureCollection => ({
    type: 'FeatureCollection',
    features: resources
        .filter(resource => resource.geometry)
        .map(getFeature)
});


const getFeature = (resource: any): Feature => ({
    type: 'Feature',
    geometry: resource.geometry,
    properties: {
        identifier: resource.identifier
    }
});


const fitBounds = (map: any, featureCollection: FeatureCollection) => {

    if (featureCollection.features.length > 0) {
        map.fitBounds(extent(featureCollection), { padding: 25 });
    }
};