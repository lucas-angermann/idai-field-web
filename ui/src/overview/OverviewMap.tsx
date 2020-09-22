import React, { CSSProperties, useEffect, ReactElement } from 'react';
import { Feature, FeatureCollection } from 'geojson';
import { History } from 'history';
import { NAVBAR_HEIGHT } from '../constants';
import { useHistory } from 'react-router-dom';
import Map from 'ol/Map';
import View from 'ol/View';
import { Layer, Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { ResultDocument } from '../api/result';
import GeoJSON from 'ol/format/GeoJSON';
import { Fill, Icon, Stroke, Style, Text }  from 'ol/style';
import { Feature as OlFeature, MapBrowserEvent } from 'ol';
import { Attribution, defaults as defaultControls } from 'ol/control';
import './overview-map.css';
import olms from 'ol-mapbox-style';


const MAPBOX_KEY = 'pk.eyJ1Ijoic2ViYXN0aWFuY3V5IiwiYSI6ImNrOTQxZjA4MzAxaGIzZnBwZzZ4c21idHIifQ._2-exYw4CZRjn9WoLx8i1A';


export default function OverviewMap({ documents }: { documents: ResultDocument[] }): ReactElement {

    const history: History = useHistory();

    useEffect(() => {

        if (!documents?.length) return;

        const map = createMap(documents, history);
        return () => map ?? map.setTarget(null);
    }, [documents, history]);

    return <div className="overview-map" id="ol-overview-map" style={ mapStyle } />;
}


const createMap = (documents: ResultDocument[], history: History): Map => {

    const map = new Map({
        target: 'ol-overview-map',
        controls: defaultControls({ attribution: false }).extend([ new Attribution({ collapsible: false })]),
        view: new View({
            center: [0, 0],
            zoom: 0
        })
    });

    olms(map, 'https://api.mapbox.com/styles/v1/mapbox/outdoors-v11?access_token=' + MAPBOX_KEY);

    const featureCollection = createFeatureCollection(documents);
    const vectorLayer = getGeoJSONLayer(featureCollection);
    map.addLayer(vectorLayer);

    map.on('click', (e: MapBrowserEvent) => {
        e.preventDefault();
        map.forEachFeatureAtPixel(e.pixel, feature => {
            if (feature.getProperties().identifier) {
                // this causes openlayers to throw an error, presumably because
                // the map element does not exist when some event listener fires
                // history.push(`/project/${feature.getProperties().identifier}`);

                // so instead reload the application when selecting a project
                window.location.href = `/project/${feature.getProperties().identifier}`;
            }
        });
    });

    map.on('pointermove', (e: MapBrowserEvent) => {
        const pixel = map.getEventPixel(e.originalEvent);
        const hit = map.hasFeatureAtPixel(pixel, { layerFilter: (layer) => layer === vectorLayer });
        map.getViewport().style.cursor = hit ? 'pointer' : '';
    });

    if (vectorLayer?.getSource().getExtent())
        map.getView().fit(vectorLayer.getSource().getExtent(), { padding: [40, 80, 40, 80] });

    return map;
};


const getGeoJSONLayer = (featureCollection: FeatureCollection): VectorLayer => {

    if (!featureCollection) return;

    const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(featureCollection, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' })
    });

    const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: getStyle,
        updateWhileAnimating: true,
        zIndex: Number.MAX_SAFE_INTEGER
    });

    return vectorLayer;
};


const getStyle = (feature: OlFeature): Style => {

    return new Style({
        image: new Icon({
            src: '/marker-icon.svg',
            scale: 1.5
        }),
        text: new Text({
            text: feature.get('identifier'),
            fill: new Fill({ color: 'black' }),
            stroke: new Stroke({ color: 'white', width: 3, }),
            offsetY: 23,
            font: 'normal 15px Cargan',
            backgroundFill: new Fill({ color: [255, 255, 255, 0.01] }),
        })
    });
};

const createFeatureCollection = (documents: any[]): any => {

    if (!documents || documents.length === 0) return undefined;

    return {
        type: 'FeatureCollection',
        features: documents
            .filter(document => document.resource.geometry_wgs84)
            .map(createFeature)
    };
};


const createFeature = (document: any): Feature => ({
    type: 'Feature',
    geometry: document.resource.geometry_wgs84,
    properties: {
       identifier: document.resource.identifier
    }
});


const mapStyle: CSSProperties = {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`
};
