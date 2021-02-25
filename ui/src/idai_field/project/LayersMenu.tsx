import React, { ReactElement, useState, CSSProperties, useEffect } from 'react';
import { Button, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import Icon from '@mdi/react';
import { mdiEye, mdiEyeOff, mdiImageFilterCenterFocus, mdiLayers } from '@mdi/js';
import Map from 'ol/Map';
import { FitOptions } from 'ol/View';
import { Tile as TileLayer } from 'ol/layer';
import { flatten, to } from 'tsfun';
import { NAVBAR_HEIGHT } from '../../constants';
import { ResultDocument } from '../../api/result';


type VisibleTileLayersSetter = React.Dispatch<React.SetStateAction<string[]>>;

type LayerGroup = { document?: ResultDocument, tileLayers: TileLayer[] };


export default function LayersMenu({ map, tileLayers, fitOptions, predecessors }
    : { map: Map, tileLayers: TileLayer[], fitOptions: FitOptions, predecessors: ResultDocument[] }): ReactElement {

        const [visibleTileLayers, setVisibleTileLayers] = useState<string[]>([]);
        const [layerControlsVisible, setLayerControlsVisible] = useState<boolean>(false);
        const [layerGroups, setLayerGroups] = useState<LayerGroup[]>([]);
        const { t } = useTranslation();

        useEffect(() => {

            const layerControlsCloseClickFunction = () => getLayerControlsCloseClickFunction(setLayerControlsVisible);
            addLayerControlsCloseEventListener(layerControlsCloseClickFunction);

            setVisibleTileLayers(restoreVisibleTileLayers());

            return () => removeLayerControlsCloseEventListener(layerControlsCloseClickFunction);
        }, []);


        useEffect(() => {
            const newLayerGroups: LayerGroup[] = createLayerGroups(tileLayers, predecessors);
            setLayerGroups(newLayerGroups);
            updateTileLayerVisibility(tileLayers, newLayerGroups, visibleTileLayers);
        }, [tileLayers, predecessors, visibleTileLayers]);


        return <>
            { layerControlsVisible && renderLayerControls(map, layerGroups, visibleTileLayers, fitOptions, t,
                setVisibleTileLayers) }
            { layerGroups.length > 0 && renderLayerControlsButton(layerControlsVisible, setLayerControlsVisible) }
        </>;
}


const renderLayerControlsButton = (layerControlsVisible: boolean,
        setLayerControlsVisible: React.Dispatch<React.SetStateAction<boolean>>): ReactElement => <>
    <Button id="layer-controls-button" variant="primary" style={ layerControlsButtonStyle }
            onClick={ () => setLayerControlsVisible(!layerControlsVisible) }>
        <Icon path={ mdiLayers } size={ 0.8 } />
    </Button>
</>;


const renderLayerControls = (map: Map, layerGroups: LayerGroup[], visibleTileLayers: string[],
        fitOptions: FitOptions, t: TFunction, setVisibleTileLayers: VisibleTileLayersSetter): ReactElement => {

    return <Card id="layer-controls" style={ cardStyle } className="layer-controls">
        <Card.Body style={ cardBodyStyle }>
            { layerGroups.map(layerGroup => {
                return renderLayerGroup(layerGroup, map, visibleTileLayers, fitOptions, t, setVisibleTileLayers);
            }) }
        </Card.Body>
    </Card>;
};


const renderLayerGroup = (layerGroup: LayerGroup, map: Map, visibleTileLayers: string[], fitOptions: FitOptions,
        t: TFunction, setVisibleTileLayers: VisibleTileLayersSetter) => {

    return <>
        <div style={ layerGroupHeadingStyle }>
            { layerGroup.document ? layerGroup.document.resource.identifier : t('project.map.layersMenu.project') }
        </div>
        <ul className="list-group" style={ layerGroupStyle }>
            { layerGroup.tileLayers.map(renderLayerControl(map, visibleTileLayers, fitOptions, setVisibleTileLayers)) }
        </ul>
    </>;
};

/* eslint-disable react/display-name */
const renderLayerControl = (map: Map, visibleTileLayers: string[], fitOptions: FitOptions,
        setVisibleTileLayers: VisibleTileLayersSetter) => (tileLayer: TileLayer): ReactElement => {

    const resource = tileLayer.get('document').resource;
    const extent = tileLayer.getSource().getTileGrid().getExtent();

    return (
        <li style={ layerControlStyle } key={ resource.id } className="list-group-item">
                <Button variant="link" onClick={ () => toggleLayer(tileLayer, visibleTileLayers, setVisibleTileLayers) }
                        style={ layerSelectorButtonStyle }
                        className={ visibleTileLayers.includes(resource.id) && 'active' }>
                    <Icon path={ visibleTileLayers.includes(resource.id) ? mdiEye : mdiEyeOff } size={ 0.7 } />
                </Button>
                <Button variant="link" onClick={ () => map.getView().fit(extent, fitOptions) }
                        style={ layerSelectorButtonStyle }>
                    <Icon path={ mdiImageFilterCenterFocus } size={ 0.7 } />
                </Button>
            { resource.identifier }
        </li>
    );
};
/* eslint-enable react/display-name */


const toggleLayer = (tileLayer: TileLayer, visibleTileLayers: string[],
                    setVisibleTileLayers: React.Dispatch<React.SetStateAction<string[]>>): void => {

    const docId = tileLayer.get('document').resource.id;

    tileLayer.setVisible(!tileLayer.getVisible());
    const newVisibleTileLayers: string[] = tileLayer.getVisible()
        ? [...visibleTileLayers, docId]
        : visibleTileLayers.filter(id => id !== docId);

    setVisibleTileLayers(newVisibleTileLayers);
    saveVisibleTileLayers(newVisibleTileLayers);
};


const updateTileLayerVisibility = (tileLayers: TileLayer[], layerGroups: LayerGroup[], visibleTileLayers: string[]) => {

    const groupLayers: TileLayer[] = flatten(layerGroups.map(to('tileLayers')));
    
    tileLayers.forEach(tileLayer => {
        tileLayer.setVisible(groupLayers.includes(tileLayer)
            && visibleTileLayers.includes(tileLayer.get('document').resource.id)
        );
    });
};


const addLayerControlsCloseEventListener = (eventListener: EventListener) => {

    document.addEventListener('click', eventListener);
};


const removeLayerControlsCloseEventListener = (eventListener: EventListener) => {

    document.removeEventListener('click', eventListener);
};


const getLayerControlsCloseClickFunction = (setLayerControlsVisible: (visible: boolean) => void) => {

    return (event: MouseEvent) => {

        let element = event.target as Element;
        let insideLayerControls: boolean = false;
        while (element) {
            if (element.id.startsWith('layer-controls')) {
                insideLayerControls = true;
                break;
            } else {
                element = element.parentElement;
            }
        }
        if (!insideLayerControls) setLayerControlsVisible(false);
    };
};


const createLayerGroups = (tileLayers: TileLayer[], predecessors: ResultDocument[]): LayerGroup[] => {

    const layerGroups: LayerGroup[] = predecessors.map(predecessor => {
        return {
            document: predecessor,
            tileLayers: getLinkedTileLayers(predecessor.resource.id, tileLayers)
        };
    });

    layerGroups.push({
        tileLayers: getLinkedTileLayers('project', tileLayers)
    });

    return layerGroups.filter(layerGroup => layerGroup.tileLayers.length > 0);
};


const getLinkedTileLayers = (resourceId: string, tileLayers: TileLayer[]): TileLayer[] => {
    
    return tileLayers.filter(tileLayer => {
        const relations: string[] = tileLayer.get('document').resource.relations.isMapLayerOf;
        return relations && relations.map(to('resource.id')).includes(resourceId);
    });
};


const saveVisibleTileLayers = (visibleTileLayers: string[]) => {

    try {
        localStorage.setItem('visibleTileLayers', JSON.stringify(visibleTileLayers));
    } catch (err) {
        console.warn('Failed to save list of visible tile layers to local storage', err);
    }
};


const restoreVisibleTileLayers = (): string[] => {

    try {
        return JSON.parse(localStorage.getItem('visibleTileLayers')) || [];
    } catch (err) {
        console.warn('Failed to restore list of visible tile layers from local storage', err);
        return [];
    }
};


const layerControlsButtonStyle: CSSProperties = {
    position: 'absolute',
    top: `${NAVBAR_HEIGHT + 10}px`,
    right: '10px'
};


const cardStyle: CSSProperties = {
    position: 'absolute',
    top: `${NAVBAR_HEIGHT + 50}px`,
    right: '10px',
    zIndex: 1000,
    border: '1px solid rgba(0, 0, 0, .125)',
    borderRadius: '.25rem',
    marginTop: '-1px'
};


const cardBodyStyle: CSSProperties = {
    maxHeight: `calc(100vh - ${NAVBAR_HEIGHT + 60}px)`,
    padding: 0,
    overflowY: 'auto',
    overflowX: 'hidden'
};


const layerGroupHeadingStyle: CSSProperties = {
    padding: '7px'
};


const layerGroupStyle: CSSProperties = {
    marginRight: '-1px',
    marginLeft: '-1px',
    marginBottom: '-1px',
    borderRadius: 0
};


const layerControlStyle: CSSProperties = {
    padding: '.375em .75em',
    fontSize: '.9em'
};


const layerSelectorButtonStyle: CSSProperties = {
    padding: '0 .375em .2em 0',
    lineHeight: 1
};
