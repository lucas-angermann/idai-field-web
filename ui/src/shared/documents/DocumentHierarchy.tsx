import React, { ReactElement } from 'react';
import { Card } from 'react-bootstrap';
import { ResultDocument } from '../../api/result';
import './document-hierarchy.css';
import DocumentHierarchyBody from './DocumentHierarchyBody';
import DocumentHierarchyHeader from './DocumentHierarchyHeader';


export default function DocumentHierarchy(
        { documents, searchParams, scrollFunction }
        : { documents: ResultDocument[], searchParams: string,
            scrollFunction: (e: React.UIEvent<Element, UIEvent>) => void}): ReactElement {

    return documents && (documents.length > 0
        ? <Card className="documents-card">
            <DocumentHierarchyHeader documents={ documents }
                                     searchParams={ searchParams } />
            <DocumentHierarchyBody documents={ documents }
                                   searchParams={ searchParams }
                                   scrollFunction={ scrollFunction } />
        </Card>
        : <></>);
}
