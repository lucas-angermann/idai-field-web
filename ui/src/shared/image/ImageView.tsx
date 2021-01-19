import L from 'leaflet';
import React, { CSSProperties, ReactElement, useContext, useEffect, useState } from 'react';
import { Map, ZoomControl } from 'react-leaflet';
import { useLocation, useParams } from 'react-router-dom';
import { Document } from '../../api/document';
import { get } from '../../api/documents';
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from '../../constants';
import DocumentDetails from '../document/DocumentDetails';
import { LoginContext } from '../login';
import IiifImageLayer from './IiifImageLayer';


export default function ImageView(): ReactElement {

    const { project, id } = useParams<{ project: string, id: string }>();
    const location = useLocation();
    const [url, setUrl] = useState<string>(makeUrl(project, id));
    const [document, setDocument] = useState<Document>(null);
    const [comingFrom, setComingFrom] = useState<string>(null);
    const loginData = useContext(LoginContext);

    useEffect(() => {
        setUrl(makeUrl(project, id, loginData.token));
        get(id, loginData.token).then(doc => setDocument(doc));
    }, [id, project, loginData]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setComingFrom(params.get('r'));
    }, [location.search]);

    return (
        <>
            <div style={ leftSidebarStyle } className="sidebar">
                { document &&
                    <DocumentDetails document={ document }
                                     searchParams={ location.search }
                                     isImageDocument={ true }
                                     backButtonUrl={ comingFrom ? `/project/${project}/${comingFrom}` : undefined } /> }
            </div>
            <div style={ containerStyle }>
                <Map style={ mapStyle }
                        center={ [0, 0] }
                        crs={ L.CRS.Simple }
                        zoom={ 0 }
                        zoomControl={ false }
                        attributionControl={ false }>
                    <ZoomControl position="bottomright" />
                    <IiifImageLayer url={ url } />
                </Map>
            </div>
        </>
    );
}


const makeUrl = (project: string, id: string, token?: string) => {
    return `/api/images/${project}/${id}.jp2/${token !== undefined ? token : 'anonymous' }/info.json`;
};


const containerStyle: CSSProperties = {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
    width: `calc(100vw - ${SIDEBAR_WIDTH + 20}px)`,
    display: 'flex',
    position: 'absolute',
    left: `${SIDEBAR_WIDTH + 20}px`,
    flexDirection: 'column',
    alignItems: 'center'
};


const mapStyle: CSSProperties = {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
    width: '100%',
    backgroundColor: '#d3d3cf'
};


const leftSidebarStyle: CSSProperties = {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
    width: `${SIDEBAR_WIDTH + 20}px`,
    position: 'absolute',
    top: NAVBAR_HEIGHT,
    padding: '0 10px 0 10px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#d3d3cf'
};
