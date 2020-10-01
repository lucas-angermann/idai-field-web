import React, { CSSProperties, useEffect, ReactElement, useState } from 'react';
import { Feature, FeatureCollection } from 'geojson';
import { History } from 'history';
import { NAVBAR_HEIGHT } from '../constants';
import { useHistory } from 'react-router-dom';
import Map from 'ol/Map';
import View from 'ol/View';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { ResultDocument, ResultFilter } from '../api/result';
import GeoJSON from 'ol/format/GeoJSON';
import { Fill, Icon, Stroke, Style, Text }  from 'ol/style';
import { Feature as OlFeature, MapBrowserEvent } from 'ol';
import { Attribution, defaults as defaultControls } from 'ol/control';
import './overview-map.css';
import olms from 'ol-mapbox-style';
import { Geometry } from 'ol/geom';
import { FIT_OPTIONS } from '../project/ProjectMap';


const MAPBOX_KEY = 'pk.eyJ1Ijoic2ViYXN0aWFuY3V5IiwiYSI6ImNrOTQxZjA4MzAxaGIzZnBwZzZ4c21idHIifQ._2-exYw4CZRjn9WoLx8i1A';


export default function OverviewMap({ documents, filter }
        : { documents: ResultDocument[], filter?: ResultFilter }): ReactElement {

    const history: History = useHistory();
    const [map, setMap] = useState<Map>(null);

    useEffect(() => {

        if (!documents?.length) return;

        const newMap = createMap(documents, history);
        setMap(newMap);

        return () => newMap ?? newMap.setTarget(null);
    }, [documents, history]);

    useEffect(() => {

        if (!map || !documents?.length) return;

        const featureCollection = createFeatureCollection(documents, filter);
        const vectorLayer = getGeoJSONLayer(featureCollection);
        map.addLayer(vectorLayer);

        map.getView().fit((vectorLayer.getSource() as VectorSource<Geometry>).getExtent(),
            { padding: FIT_OPTIONS.padding });

        const onPointerMove = (e: MapBrowserEvent) => {
            const pixel = map.getEventPixel(e.originalEvent);
            const hit = map.hasFeatureAtPixel(pixel,
                { layerFilter: (layer) => layer === vectorLayer }
            );
            map.getViewport().style.cursor = hit ? 'pointer' : '';
        };
        map.on('pointermove', onPointerMove);

        return () => {
            map.removeLayer(vectorLayer);
            map.un('pointermove', onPointerMove);
        };
    }, [map, documents, filter]);

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

    olms(map, 'https://api.mapbox.com/styles/v1/sebastiancuy/ckff2undp0v1o19mhucq9oycb?access_token=' + MAPBOX_KEY);

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
            text: feature.get('label'),
            fill: new Fill({ color: 'black' }),
            stroke: new Stroke({ color: 'white', width: 3 }),
            offsetY: 23,
            font: 'normal 15px Cargan',
            backgroundFill: new Fill({ color: [255, 255, 255, 0.01] }),
        })
    });
};

const createFeatureCollection = (documents: any[], filter: ResultFilter): any => {

    if (!documents || documents.length === 0) return undefined;

    return {
        type: 'FeatureCollection',
        features: filterDocuments(documents, filter)
            .filter(document => document.resource.geometry_wgs84)
            .map(document => createFeature(document, filter))
    };
};


const createFeature = (document: any, filter: ResultFilter): Feature => ({
    type: 'Feature',
    geometry: document.resource.geometry_wgs84,
    properties: {
       identifier: document.resource.identifier,
       label: createFeatureLabel(document, filter)
    }
});


const createFeatureLabel = (document: any, filter?: ResultFilter): string => {

    const projectBucket = filter?.values.find(bucket => bucket.value.name === document.project);

    return document.resource.identifier + (
        projectBucket && projectBucket.count > 0
            ? ` (${projectBucket.count})`
            : ''
    );
};


const filterDocuments = (documents: ResultDocument[], filter?: ResultFilter): any[] => {

    if (!filter) return documents;

    return documents.filter(document => filter.values.map(bucket => bucket.value.name).includes(document.project));
};


const mapStyle: CSSProperties = {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`
};
