import React, { useRef, useState, useEffect, useReducer, CSSProperties } from 'react';
import mapboxgl, { LngLatLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2ViYXN0aWFuY3V5IiwiYSI6ImNrOTQxZjA4MzAxaGIzZnBwZzZ4c21idHIifQ._2-exYw4CZRjn9WoLx8i1A';


const mapContainerStyle: CSSProperties = {
    position: 'absolute',
    top: '0',
    right: '0',
    left: '0',
    bottom: '0'
}

export default (props: { results: Array<any> }) => {

    const [map, setMap] = useState(null);
    const [, setMarkers] = useReducer(reduceMarkers, []);
    const mapOptions = { zoom: 2, center: [50, 50] };
    const mapContainer = useRef(null);

    useEffect(() => { map ?? setMap(initializeMap(mapOptions, mapContainer.current)) }, [map, mapOptions])

    useEffect(() => setMarkers({ map, results: props.results }), [map, props.results]);

    return <div ref={mapContainer} style={mapContainerStyle}/>;

}

const initializeMap = (mapOptions, containerEl) => new mapboxgl.Map({
    container: containerEl,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: mapOptions.center as LngLatLike,
    zoom: mapOptions.zoom
});

const reduceMarkers = (markers, params) => {
    markers.forEach(marker => marker.remove());
    return params.results.map(result => new mapboxgl.Marker()
        .setLngLat(result.geometry.coordinates)
        .addTo(params.map)
    );
}