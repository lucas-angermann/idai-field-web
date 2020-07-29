import React, { ReactElement } from 'react';
import { Document } from '../api/document';
import DocumentDetails from '../document/DocumentDetails';
import Icon from '@mdi/react';
import { mdiArrowLeftCircle } from '@mdi/js';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function DocumentInfo({ projectId, document, searchParams }
        : { projectId: string, document: Document, searchParams: string }): ReactElement {

    return <>
        <Card>
            <Card.Body>
                <Link to={ `/project/${projectId}${searchParams}`}>
                    <Icon path={ mdiArrowLeftCircle } size={ 0.8 } /> Zurück zur Übersicht
                </Link>
            </Card.Body>
        </Card>
        { document && <DocumentDetails document={ document } /> }
    </>;
}
