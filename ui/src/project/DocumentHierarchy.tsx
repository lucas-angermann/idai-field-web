import React, { ReactElement } from 'react';
import { Card } from 'react-bootstrap';
import { ResultDocument } from '../api/result';
import { Document } from '../api/document';
import DocumentHierarchyHeader from './DocumentHierarchyHeader';
import DocumentHierarchyBody from './DocumentHierarchyBody';
import './document-hierarchy.css';


export default function DocumentHierarchy(
        { documents, projectDocument, searchParams, scrollFunction }
        : { projectDocument: Document, documents: ResultDocument[], searchParams: string,
            scrollFunction: (e: React.UIEvent<Element, UIEvent>) => void}): ReactElement {

    return (
        <Card className="documents-card">
            <DocumentHierarchyHeader projectDocument={ projectDocument }
                                     documents={ documents }
                                     searchParams={ searchParams } />
            <DocumentHierarchyBody documents={ documents }
                                   searchParams={ searchParams }
                                   scrollFunction={ scrollFunction }/>
        </Card>
    );
}
