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
import { Icon, Style }  from 'ol/style';
import { Feature as OlFeature, MapBrowserEvent } from 'ol';


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

    const layers: Layer[] = [ new TileLayer({ source: new OSM() }) ];

    const featureCollection = createFeatureCollection(documents);
    const vectorLayer = getGeoJSONLayer(featureCollection);
    if (vectorLayer) layers.push(vectorLayer);

    const map = new Map({
        target: 'ol-overview-map',
        layers,
        view: new View({
            center: [0, 0],
            zoom: 0
        })
    });

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

    if (vectorLayer?.getSource().getExtent())
        map.getView().fit(vectorLayer.getSource().getExtent(), { padding: [40, 40, 40, 40] });

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
        updateWhileAnimating: true
    });

    return vectorLayer;
};


const getStyle = (_: OlFeature): Style => {

    return new Style({
        image: new Icon({
            src: '/marker-icon.svg'
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
