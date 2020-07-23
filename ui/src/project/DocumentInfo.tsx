import React, { CSSProperties } from 'react';
import { Document } from '../api/document';
import DocumentDetails from '../document/DocumentDetails';
import { NAVBAR_HEIGHT } from '../constants';
import Icon from '@mdi/react';
import { mdiArrowLeftCircle } from '@mdi/js';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function DocumentInfo({ projectId, document, searchParams }
        : { projectId: string, document: Document, searchParams: string }) {

    return (
        <div style={ documentContainerStyle }>
            <Card>
                <Card.Body>
                    <Link to={ `/project/${projectId}${searchParams}`}>
                        <Icon path={ mdiArrowLeftCircle } size={ 0.8 } /> Zurück zur Übersicht
                    </Link>
                </Card.Body>
            </Card>
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
