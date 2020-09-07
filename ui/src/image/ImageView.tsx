import React, { CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import { Map } from 'react-leaflet';
import L from 'leaflet';
import IiifImageLayer from './IiifImageLayer';
import { NAVBAR_HEIGHT } from '../constants';

export default function ImageView() {

    const { project, id } = useParams();

    const url = `/api/images/${project}%2F${id}/info.json`; // TODO info.json would not work

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
