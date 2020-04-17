import React, { useRef, useEffect, CSSProperties } from 'react';
import mapboxgl, { LngLatLike } from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2ViYXN0aWFuY3V5IiwiYSI6ImNrOTQxZjA4MzAxaGIzZnBwZzZ4c21idHIifQ._2-exYw4CZRjn9WoLx8i1A';


const mapContainerStyle: CSSProperties = {
    position: 'absolute',
    top: '0',
    right: '0',
    left: '0',
    bottom: '0'
}

export default (props: { results: Array<any> }) => {

    const mapOptions = { zoom: 2, center: [50, 50] };
    const mapContainer = useRef(null);
    let map: mapboxgl.Map;

    useEffect(() => {
        map = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: mapOptions.center as LngLatLike,
            zoom: mapOptions.zoom
        });
    }, []);

    useEffect(() => {
        props.results.forEach(result => {
            new mapboxgl.Marker()
                .setLngLat(result.geometry.coordinates)
                .addTo(map);
        });
    }, [props.results])

    return <div ref={mapContainer} style={mapContainerStyle}/>;

}