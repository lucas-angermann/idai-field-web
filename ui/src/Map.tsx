import React, { useRef, useState, useEffect, CSSProperties } from 'react';
import mapboxgl, { Map, LngLatBounds, Layer, GeoJSONSourceRaw } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {Feature, FeatureCollection} from 'geojson';

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


const pointLayer: Layer = {
    id: 'point-layer',
    type: 'circle',
    source: SOURCE_ID,
    paint: {
        'circle-radius': 6,
        'circle-color': '#B42222'
    },
    filter: ['==', '$type', 'Point']
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
            map.getSource(SOURCE_ID).setData(getFeatureCollection(resources));
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
        map.addSource(SOURCE_ID, getGeoJSONSource())
            .addLayer(polygonLayer)
            .addLayer(pointLayer);
        setReady(true);
    });
};


const getGeoJSONSource = (): GeoJSONSourceRaw => ({
    type: 'geojson',
    data: getFeatureCollection([])
});


const getFeatureCollection = (resources: any[]): FeatureCollection => ({
    type: 'FeatureCollection',
    features: resources.map(getFeature)
});


const getFeature = (resource: any): Feature => ({
    type: 'Feature',
    geometry: resource.geometry,
    properties: {
        resource: resource
    }
});


const getBounds = (resources: any[]) => 
    resources.reduce((bounds, resource) =>
        bounds.extend(resource.geometry.coordinates), new LngLatBounds());
