import React, { CSSProperties, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Map } from 'react-leaflet';
import L from 'leaflet';
import IiifImageLayer from './IiifImageLayer';
import { NAVBAR_HEIGHT } from '../constants';
import { LoginContext } from '../App';

export default function ImageView() {

    const { project, id } = useParams();
    const [url, setUrl] = useState<string>('');
    const loginData = useContext(LoginContext);

    useEffect (() => {
        setUrl(`/api/images/${project}/${id}.jp2/${loginData.token}/info.json`); // todo review: token not set
    }, [id, project, loginData]);

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
