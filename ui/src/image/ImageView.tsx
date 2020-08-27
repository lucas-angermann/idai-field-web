import React, { CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import { NAVBAR_HEIGHT } from '../constants';
import { Map } from 'react-leaflet';
import IiifImageLayer from './IiifImageLayer';
import L from 'leaflet';

export default function ImageView() {

    const { project, id } = useParams();

    const url = `https://images.idai.world/iiif/2/${project}%2F${id}.jp2/info.json`;
    
    return (
        <div style={ containerStyle }>
            <Map style={ mapStyle }
                    center={ [0, 0] }
                    crs={ L.CRS.Simple }
                    zoom={ 0 }>
                <IiifImageLayer url={ url } />
            </Map>
        </div>
    );
}

const containerStyle: CSSProperties = {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
};


const mapStyle: CSSProperties = {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
    width: '100%'
};
