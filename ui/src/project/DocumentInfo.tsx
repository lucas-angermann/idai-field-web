import React, { useState, useEffect, CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import { get } from '../api/documents';
import { Document } from '../api/document';
import DocumentDetails from '../document/DocumentDetails';
import { NAVBAR_HEIGHT } from '../constants';

export default function DocumentInfo() {

    const { id } = useParams();
    const [document, setDocument] = useState<Document>(null);

    useEffect (() => {
        get(id).then(setDocument);
    }, [id]);

    return (
        <div style={ documentContainerStyle }>
            { document && <DocumentDetails document={ document } /> }
        </div>
    );
}

const documentContainerStyle: CSSProperties = {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
    width: '500px',
    position: 'absolute',
    top: NAVBAR_HEIGHT,
    left: '10px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column'
};
