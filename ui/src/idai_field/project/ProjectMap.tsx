import { mdiRedo } from '@mdi/js';
import Icon from '@mdi/react';
import { Feature, FeatureCollection } from 'geojson';
import { History } from 'history';
import { Feature as OlFeature, MapBrowserEvent } from 'ol';
import { never } from 'ol/events/condition';
import { Extent } from 'ol/extent';
import GeoJSON from 'ol/format/GeoJSON';
import { Polygon } from 'ol/geom';
import { Select } from 'ol/interaction';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import XYZ from 'ol/source/XYZ';
import Map from 'ol/Map';
import { TileImage, Vector as VectorSource } from 'ol/source';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import TileGrid from 'ol/tilegrid/TileGrid';
import View, { FitOptions } from 'ol/View';
import {Control, defaults as defaultControls} from 'ol/control';
import React, { CSSProperties, ReactElement, useContext, useEffect, useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { Link, useHistory, useParams } from 'react-router-dom';
import { isUndefined, not } from 'tsfun';
import { Document, getDocumentEPSG } from '../../api/document';
import { get, search, searchMap } from '../../api/documents';
import { getImageUrl } from '../../api/image';
import { buildProjectQueryTemplate } from '../../api/query';
import { Result, ResultDocument } from '../../api/result';
import { NAVBAR_HEIGHT } from '../../constants';
import { getColor, hexToRgb } from '../../shared/categoryColors';
import { useSearchParams } from '../../shared/location';
import { LoginContext, LoginData } from '../../shared/login';
import { EXCLUDED_CATEGORIES } from '../constants';
import LayerControls from './LayerControls';
import { ProjectView } from './Project';
import './project-map.css';
import { getResolutions, getTileLayerExtent } from './tileLayer';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
import {get as getProjection, getTransform} from 'ol/proj';


const MAX_SIZE = 10000;

let epsgCode;

const STYLE_CACHE: { [ category: string ] : Style } = { };

type StyleType = 'default' | 'highlighted' | 'parent';

interface ProjectMapProps {
    selectedDocument: Document;
    hoverDocument?: ResultDocument;
    highlightedIds?: string[];
    highlightedCategories?: string[];
    predecessors: ResultDocument[];
    project: string;
    onDeselectFeature: () => void | undefined;
    fitOptions: FitOptions;
    spinnerContainerStyle: CSSProperties;
    isMiniMap: boolean;
    projectView?: ProjectView
}


export default function ProjectMap({ selectedDocument, hoverDocument, highlightedIds, predecessors,
        highlightedCategories, project, onDeselectFeature, fitOptions, spinnerContainerStyle,
        isMiniMap, projectView = 'hierarchy' }: ProjectMapProps): ReactElement {

    const history = useHistory();
    const searchParams = useSearchParams();
    const loginData = useContext(LoginContext);
    const { projectId } = useParams<{ projectId: string }>();

    const [projectDoc, setProjectDoc] = useState<Document>();
    const [documents, setDocuments] = useState<ResultDocument[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [map, setMap] = useState<Map>(null);
    const [vectorLayer, setVectorLayer] = useState<VectorLayer>(null);
    const [select, setSelect] = useState<Select>(null);
    const [tileLayers, setTileLayers] = useState<TileLayer[]>([]);

    const mapClickFunction = useRef<(_: MapBrowserEvent) => void>(null);

    useEffect(() => {
        get(projectId, loginData.token)
            .then(setProjectDoc);
    }, [projectId, loginData]);

    useEffect(() => {

        if (projectDoc) {
          epsgCode = getDocumentEPSG(projectDoc);
        }
    }, [projectDoc, projectId]);

    useEffect(() => {

        const newMap = createMap();
        setMap(newMap);
        setSelect(createSelect(newMap));
        configureCursor(newMap);

        return () => {
            if (newMap) newMap.setTarget(null);
        };
    }, []);

    useEffect(() => {

        setLoading(true);
        fetchAllDocuments(project, loginData.token)
            .then(result => {
                setDocuments(result.documents);
                setLoading(false);
            });
    }, [project, loginData]);

    useEffect(() => {

        if (!map) return;
        let mounted = true;

        getTileLayers(project, loginData).then((newTileLayers) => {
            if (mounted) {
                setTileLayers(newTileLayers);
                newTileLayers.forEach(layer => map.addLayer(layer));
            }
        });

        return () => mounted = false;
    }, [map, project, loginData]);

    useEffect(() => {

        if (!map) return;
        if (mapClickFunction.current) map.un('click', mapClickFunction.current);

        mapClickFunction.current = handleMapClick(history, searchParams, projectView, onDeselectFeature,
            selectedDocument, isMiniMap);
        map.on('click', mapClickFunction.current);
    }, [map, history, selectedDocument, searchParams, onDeselectFeature, isMiniMap, projectView]);

    useEffect(() => {

        if (!map || !documents?.length) return;

        const featureCollection = createFeatureCollection(documents);
        const newVectorLayer = getGeoJSONLayer(featureCollection);
        if (newVectorLayer) map.addLayer(newVectorLayer);
        setVectorLayer(newVectorLayer);
        setUpView(map, newVectorLayer, fitOptions);

        return () => map.removeLayer(newVectorLayer);
    }, [map, documents, fitOptions]);

    useEffect(() => {

        if (!vectorLayer) return;

        vectorLayer.getSource().getFeatures().forEach(feature => {
            const properties = feature.getProperties();
            properties.styleType = getStyleType(feature, highlightedIds, highlightedCategories, predecessors);
            feature.setProperties(properties);
        });
    }, [selectedDocument, highlightedIds, highlightedCategories, predecessors, vectorLayer, select]);

    useEffect(() => {

        if (!map || !vectorLayer) return;

        map.getView().fit(
            getExtent(vectorLayer, predecessors, selectedDocument),
            fitOptions
        );
    }, [map, selectedDocument, highlightedIds, predecessors, vectorLayer, fitOptions]);

    useEffect(() => {

        if (!select || !vectorLayer) return;

        select.getFeatures().clear();

        if (selectedDocument) addToSelect(select, selectedDocument, vectorLayer);
        if (hoverDocument) addToSelect(select, hoverDocument, vectorLayer);
    }, [selectedDocument, hoverDocument, select, vectorLayer]);

    return <>
        { loading &&
            <div style={ spinnerContainerStyle }>
                <Spinner animation="border" variant="secondary" />
            </div>
        }

        <div className="project-map" id="ol-project-map" style={ mapStyle(isMiniMap) } />

        { (isMiniMap ?
            <Link to={ `/project/${project}/hierarchy?parent=root` } className="project-link">
                <Icon path={ mdiRedo } size={ 1.0 } ></Icon>
            </Link> :
            <LayerControls map={ map }
                        tileLayers={ tileLayers }
                        fitOptions={ fitOptions }
                        predecessors={ predecessors }
                        project={ project }></LayerControls>)
        }
    </>;
}
//Set the right coordinate system, based on https://openlayers.org/en/latest/examples/reprojection-by-code.html, 17.07.2021
const defaultEPSG =  3857;
if(epsgCode === undefined){
  epsgCode = defaultEPSG;
}

let epsgProjection;
if(epsgCode == 4326 || epsgCode == 3857){ //default openlayer crs
  epsgProjection = getProjection('EPSG:'+epsgCode);
}else{
  fetch('https://epsg.io/?format=json&q=' + epsgCode)
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      const results = json['results'];
      if (results && results.length > 0) {
        for (let i = 0, ii = results.length; i < ii; i++) {
          const result = results[i];
          if (result) {
            /*var code = result['code'];
            var name = result['name'];
            var bbox = result['bbox'];*/
            const proj4def = result['proj4'];
            proj4.defs('EPSG:'+epsgCode, proj4def);
            register(proj4);
            epsgProjection = getProjection('EPSG:'+epsgCode);
          }
        }
      }
    });


}



const fetchAllDocuments = async (projectId: string, token: string): Promise<Result> => {

    const query = buildProjectQueryTemplate(projectId, 0, MAX_SIZE, EXCLUDED_CATEGORIES);
    return searchMap(query, token);
};

//Custom toggle control, based on https://openlayers.org/en/latest/examples/custom-controls.html, 17.07.2021
const ToggleControl = /*@__PURE__*/(function (Control) {
  function ToggleControl(opt_options) {
    const options = opt_options || {};

    const button = document.createElement('button');
    //SVG source: https://www.visualpharm.com/free-icons/, 17.07.2021
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path style="text-indent:0;text-align:start;line-height:normal;text-transform:none;block-progression:tb;-inkscape-font-specification:Bitstream Vera Sans" d="M 28 4.46875 L 26.59375 5.09375 L 19.96875 7.9375 L 12.34375 5.0625 L 11.96875 4.9375 L 11.59375 5.09375 L 4.59375 8.09375 L 4 8.34375 L 4 9 L 4 26 L 4 27.53125 L 5.40625 26.90625 L 12.03125 24.0625 L 19.65625 26.9375 L 20.03125 27.0625 L 20.40625 26.90625 L 27.40625 23.90625 L 28 23.65625 L 28 23 L 28 6 L 28 4.46875 z M 13 7.4375 L 19 9.6875 L 19 24.5625 L 13 22.3125 L 13 7.4375 z M 11 7.5 L 11 22.34375 L 6 24.5 L 6 9.65625 L 11 7.5 z M 26 7.5 L 26 22.34375 L 21 24.5 L 21 9.65625 L 26 7.5 z" overflow="visible" font-family="Bitstream Vera Sans"/></svg><span class="toggle-tooltip">Toggle background map</span>';

    const element = document.createElement('div');
    element.className = 'toggle-control ol-unselectable ol-control';
    element.appendChild(button);

    Control.call(this, {
      element: element,
      target: options.target,
    });

    button.addEventListener('click', this.handleToggleControl.bind(this), false);
  }

  if ( Control )ToggleControl.__proto__ = Control;
  ToggleControl.prototype = Object.create( Control && Control.prototype );
  ToggleControl.prototype.constructor = ToggleControl;

  ToggleControl.prototype.handleToggleControl = function handleToggleControl () {
    const mapVisibility = this.getMap().getLayers().getArray().find(layer => layer.className_ == 'osm-map').getVisible();
    if(mapVisibility){
    this.getMap().getLayers().getArray().find(layer => layer.className_ == 'osm-map').setVisible(false);
  }else{
    this.getMap().getLayers().getArray().find(layer => layer.className_ == 'osm-map').setVisible(true);
  }
  };

  return ToggleControl;
}(Control));

//Fetching default base map in humanitarian style from OSM France, based on https://openlayers.org/en/latest/examples/xyz.html, 17.07.2021
const createMap = (): Map => {

    const map = new Map({
      controls: defaultControls().extend([new ToggleControl(0)]),
      layers: [
        new TileLayer({
          className: 'osm-map',
          source: new XYZ({
            url:'http://{a-b}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
            attributions:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.',

          }),
        })
      ],
  target: 'ol-project-map',
  view: new View({
    projection: epsgProjection,
    center: [0, 0],
    zoom: 17,
    minZoom: 10,
  }),
});
    return map;
};


const setUpView = (map: Map, layer: VectorLayer, fitOptions: FitOptions) => {

    map.getView().fit(layer.getSource().getExtent(), { padding: fitOptions.padding });
    /*map.setView(new View({ extent: map.getView().calculateExtent(map.getSize()) }));*/
    map.getView().fit(layer.getSource().getExtent(), { padding: fitOptions.padding });
};


const createSelect = (map: Map): Select => {

    const select = new Select({ condition: never, style: getSelectStyle });
    map.addInteraction(select);
    return select;
};


const addToSelect = (select: Select, document: Document|ResultDocument, layer: VectorLayer) => {

    if (document.resource?.geometry) {
        const feature = (layer.getSource())
            .getFeatureById(document.resource.id);
        if (!feature) return;
        select.getFeatures().push(feature);
    }
};


const handleMapClick = (history: History, searchParams: URLSearchParams, projectView: ProjectView,
        onDeselectFeature: () => void, selectedDocument?: Document, reload?: boolean)
        : ((_: MapBrowserEvent) => void) => {

    return async (e: MapBrowserEvent) => {

        const features = e.map.getFeaturesAtPixel(e.pixel)
            .filter(feature => feature.getProperties().styleType === 'highlighted');

        if (features.length) {
            let smallestFeature = features[0];
            let smallestArea = 0;
            for (const feature of features) {
                if (feature.getGeometry().getType() === 'Polygon'
                        || feature.getGeometry().getType() === 'MultiPolygon') {
                    const featureArea = (feature.getGeometry() as Polygon).getArea();
                    if (!smallestArea || featureArea < smallestArea) {
                        smallestFeature = feature;
                        smallestArea = featureArea;
                    }
                } else {
                    smallestFeature = feature;
                    break;
                }
            }
            const { id, project } = smallestFeature.getProperties();
            if (reload) {
                let href = `/project/${project}/${projectView}/${id}`;
                if (searchParams.toString()) href += `?${searchParams}`;
                window.location.href = href;
            } else {
                history.push({ pathname: `/project/${project}/${projectView}/${id}`, search: searchParams.toString() });
            }
        } else if (selectedDocument && onDeselectFeature) {
            onDeselectFeature();
        }
    };
};


const configureCursor = (map: Map) => {

    map.on('pointermove', event => {
        map.getTargetElement().style.cursor = map.getFeaturesAtPixel(event.pixel)
            .filter(feature => feature.getProperties().styleType === 'highlighted')
            .length > 0
                ? 'pointer'
                : '';
    });
};

const getGeoJSONLayer = (featureCollection: FeatureCollection): VectorLayer => {

    if (!featureCollection) return;
    const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(featureCollection, {
            dataProjection: epsgProjection,
            featureProjection: epsgProjection
        })
    });

    return new VectorLayer({
        source: vectorSource,
        style: getStyle,
        updateWhileAnimating: true,
        zIndex: 1000
    });
};


const getTileLayers = async (project: string, loginData: LoginData): Promise<TileLayer[]> =>
    (await getTileLayerDocuments(project, loginData)).map(doc => getTileLayer(doc, loginData));


const getTileLayerDocuments = async (project: string, loginData: LoginData): Promise<ResultDocument[]> => {

    const result = await search({
        q: '*',
        exists: ['resource.georeference'],
        filters: [{ field: 'project', value: project }]
    }, loginData.token);

    return result.documents;
};


const getTileLayer = (document: ResultDocument, loginData: LoginData): TileLayer => {

    const tileSize: [number, number] = [256, 256];
    const pathTemplate = `${document.resource.id}/{z}/{x}/{y}.png`;
    const extent = getTileLayerExtent(document);
    const resolutions = getResolutions(extent, tileSize[0], document);

    const layer = new TileLayer({
        source: new TileImage({
            tileGrid: new TileGrid({
                extent,
                origin: [ extent[0], extent[3] ],
                resolutions,
                tileSize
            }),
            tileUrlFunction: (tileCoord) => {
                const path = pathTemplate
                    .replace('{z}', String(tileCoord[0]))
                    .replace('{x}', String(tileCoord[1]))
                    .replace('{y}', String(tileCoord[2]));
                return getImageUrl(document.project, path , tileSize[0], tileSize[1], loginData.token, 'png');
            }
        }),
        visible: false,
        extent
    });

    layer.set('document', document);

    return layer;
};


const getStyle = (feature: OlFeature): Style => {

    const category: string = feature.getProperties().category;
    const styleType: StyleType = feature.getProperties().styleType;
    const styleId: string = `${category}_${styleType}`;

    if (STYLE_CACHE[styleId]) return STYLE_CACHE[styleId];

    const transparentColor = getColorForCategory(category, 0.3);
    const color = getColorForCategory(category, 1);

    let style;
    switch (styleType) {
        case 'default':
            style = getDefaultStyle(transparentColor);
            break;
        case 'highlighted':
            style = getHighlightedStyle(color, transparentColor);
            break;
        case 'parent':
            style = getParentStyle(color);
            break;
    }

    STYLE_CACHE[styleId] = style;

    return style;
};


const getDefaultStyle = (transparentColor: string) => {

    return new Style({
        image: new CircleStyle({
            radius: 4,
            fill: new Fill({ color: 'transparent' }),
            stroke: new Stroke({ color: 'transparent', width: 1 }),
        }),
        stroke: new Stroke({ color: transparentColor }),
        fill: new Fill({ color: 'transparent' })
    });
};


const getHighlightedStyle = (color: string, transparentColor: string) => {

    return new Style({
        image: new CircleStyle({
            radius: 4,
            fill: new Fill({ color: 'white' }),
            stroke: new Stroke({ color: color, width: 5 }),
        }),
        stroke: new Stroke({ color: color }),
        fill: new Fill({ color: transparentColor })
    });
};


const getParentStyle = (color: string) => {

    return new Style({
        image: new CircleStyle({
            radius: 4,
            fill: new Fill({ color: 'transparent' }),
            stroke: new Stroke({ color: 'transparent', width: 1 }),
        }),
        stroke: new Stroke({ color: color, width: 2, lineDash: [4, 7] }),
        fill: new Fill({ color: 'transparent' })
    });
};


const getSelectStyle = (feature: OlFeature) => {

    const transparentColor = getColorForCategory(feature.getProperties().category, 0.3);
    const color = getColorForCategory(feature.getProperties().category, 1);

    return new Style({
        image: new CircleStyle({
            radius: 4,
            fill: new Fill({ color }),
            stroke: new Stroke({ color: 'white', width: 5 }),
        }),
        stroke: new Stroke({ color: 'white' }),
        fill: new Fill({ color: transparentColor }),
        zIndex: 100
    });
};


const getColorForCategory = (category: string, opacity: number): string => {

    const rgb = hexToRgb(getColor(category));
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
};


const createFeatureCollection = (documents: ResultDocument[]): FeatureCollection => {

    if (documents.length === 0) return undefined;

    return {
        type: 'FeatureCollection',
        features: documents
            .filter(document => document?.resource.geometry)
            .map(document => createFeature(document))
    };
};


const createFeature = (document: ResultDocument): Feature => ({
    type: 'Feature',
    id: document.resource.id,
    geometry: document.resource.geometry,
    properties: {
        id: document.resource.id,
        identifier: document.resource.identifier,
        category: document.resource.category.name,
        project: document.project
    }
});


const getExtent = (layer: VectorLayer, predecessors: ResultDocument[], selectedDocument?: ResultDocument): Extent => {

    if (predecessors.length === 0 && !selectedDocument) return getExtentOfHighlightedGeometries(layer);

    const predecessorFeatures = predecessors.map(predecessor => getFeature(predecessor, layer))
        .filter(not(isUndefined));

    const feature = predecessorFeatures.find(predecessorFeature => {
        return ['Trench', 'Building', 'Survey'].includes(predecessorFeature.getProperties().category);
    }) || (selectedDocument && getFeature(selectedDocument, layer));

    return feature ? feature.getGeometry().getExtent() : layer.getSource().getExtent();
};


const getFeature = (document: ResultDocument, layer: VectorLayer): OlFeature => {

    return layer.getSource().getFeatures().find(feature => {
        return feature.getProperties().id === document.resource.id;
    });
};


const getExtentOfHighlightedGeometries = (layer: VectorLayer): Extent => {

    const highlightedFeatures = layer.getSource().getFeatures()
        .filter(feature => feature.getProperties().highlighted);

    return highlightedFeatures.length > 0
        ? new VectorSource({ features: highlightedFeatures }).getExtent()
        : layer.getSource().getExtent();
};


const getStyleType = (feature: OlFeature, highlightedIds: string[], highlightedCategories: string[],
        predecessors: ResultDocument[]): StyleType => {

    const properties = feature.getProperties();
    if ((!highlightedIds || highlightedIds.includes(properties.id))
           && (!highlightedCategories || highlightedCategories.includes(properties.category))) {
        return 'highlighted';
    } else if (predecessors && predecessors.length > 0
            && predecessors[predecessors.length - 1].resource.id === properties.id) {
        return 'parent';
    } else {
        return 'default';
    }
};


const mapStyle = (isMiniMap: boolean): CSSProperties => {

    const height = isMiniMap ? '100%' : `calc(100vh - ${NAVBAR_HEIGHT}px)`;

    return {
        height,
        backgroundColor: '#d3d3cf'
    };
};
