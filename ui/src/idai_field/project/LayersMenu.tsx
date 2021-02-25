import React, { ReactElement, useState, CSSProperties, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Icon from '@mdi/react';
import { mdiEye, mdiEyeOff, mdiImageFilterCenterFocus, mdiLayers } from '@mdi/js';
import Map from 'ol/Map';
import { FitOptions } from 'ol/View';
import { Tile as TileLayer } from 'ol/layer';
import { to } from 'tsfun';
import { NAVBAR_HEIGHT } from '../../constants';
import { ResultDocument } from '../../api/result';


type VisibleTileLayersSetter = React.Dispatch<React.SetStateAction<string[]>>;

type LayerGroup = { document?: ResultDocument, tileLayers: TileLayer[] };


export default function LayersMenu({ map, tileLayers, fitOptions, predecessors }
    : { map: Map, tileLayers: TileLayer[], fitOptions: FitOptions, predecessors: ResultDocument[] }): ReactElement {

        const [visibleTileLayers, setVisibleTileLayers] = useState<string[]>([]);
        const [layerControlsVisible, setLayerControlsVisible] = useState<boolean>(false);
        const [layerGroups, setLayerGroups] = useState<LayerGroup[]>([]);


        useEffect(() => {

            const layerControlsCloseClickFunction = () => getLayerControlsCloseClickFunction(setLayerControlsVisible);
            addLayerControlsCloseEventListener(layerControlsCloseClickFunction);

            return () => removeLayerControlsCloseEventListener(layerControlsCloseClickFunction);
        }, []);


        useEffect(() => {

            setLayerGroups(createLayerGroups(tileLayers, predecessors));
            setVisibleTileLayers([]);
        }, [tileLayers, predecessors]);


        return <>
            { layerControlsVisible && renderLayerControls(map, layerGroups, visibleTileLayers, fitOptions,
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
        fitOptions: FitOptions, setVisibleTileLayers: VisibleTileLayersSetter): ReactElement => {

    return <>
        <div id="layer-controls" style={ layerSelectorStyle } className="layer-controls">
            <ul className="list-group">
                { layerGroups.map(layerGroup => {
                    return renderLayerGroup(layerGroup, map, visibleTileLayers, fitOptions, setVisibleTileLayers);
                }) }
            </ul>
        </div>
    </>;
};


const renderLayerGroup = (layerGroup: LayerGroup, map: Map, visibleTileLayers: string[], fitOptions: FitOptions,
        setVisibleTileLayers: VisibleTileLayersSetter) => {

    return layerGroup.tileLayers.map(renderLayerControl(map, visibleTileLayers, fitOptions, setVisibleTileLayers));
};

/* eslint-disable react/display-name */
const renderLayerControl = (map: Map, visibleTileLayers: string[], fitOptions: FitOptions,
        setVisibleTileLayers: VisibleTileLayersSetter) => (tileLayer: TileLayer): ReactElement => {

    const resource = tileLayer.get('document').resource;
    const extent = tileLayer.getSource().getTileGrid().getExtent();

    return (
        <li style={ layerSelectorItemStyle } key={ resource.id } className="list-group-item">
                <Button variant="link" onClick={ () => toggleLayer(tileLayer, setVisibleTileLayers) }
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


const toggleLayer = (tileLayer: TileLayer,
                    setVisibleTileLayers: React.Dispatch<React.SetStateAction<string[]>>): void => {

    const docId = tileLayer.get('document').resource.id;

    tileLayer.setVisible(!tileLayer.getVisible());
    tileLayer.getVisible()
        ? setVisibleTileLayers(old => [...old, docId])
        : setVisibleTileLayers(old => old.filter(id => id !== docId));
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
    }).filter(layerGroup => layerGroup.tileLayers.length > 0);

    layerGroups.push({
        tileLayers: getLinkedTileLayers('project', tileLayers)
    });

    return layerGroups;
};


const getLinkedTileLayers = (resourceId: string, tileLayers: TileLayer[]): TileLayer[] => {
    
    return tileLayers.filter(tileLayer => {
        const relations: string[] = tileLayer.get('document').resource.relations.isMapLayerOf;
        return relations && relations.map(to('resource.id')).includes(resourceId);
    });
};


const layerControlsButtonStyle: CSSProperties = {
    position: 'absolute',
    top: `${NAVBAR_HEIGHT + 10}px`,
    right: '10px'
};


const layerSelectorStyle: CSSProperties = {
    position: 'absolute',
    top: `${NAVBAR_HEIGHT + 50}px`,
    right: '10px',
    zIndex: 1000,
    height: `calc(100vh - ${NAVBAR_HEIGHT + 60}px)`,
    overflow: 'auto'
};


const layerSelectorItemStyle: CSSProperties = {
    padding: '.375em .75em',
    fontSize: '.9em'
};


const layerSelectorButtonStyle: CSSProperties = {
    padding: '0 .375em .2em 0',
    lineHeight: 1
};
