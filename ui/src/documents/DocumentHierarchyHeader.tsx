import React, { ReactElement } from 'react';
import { Card } from 'react-bootstrap';
import DocumentTeaser from '../document/DocumentTeaser';
import { ResultDocument } from '../api/result';
import { Document } from '../api/document';


export default function DocumentHierarchyHeader({ projectDocument, documents, searchParams }
        : { projectDocument: Document, documents: ResultDocument[], searchParams: string } ): ReactElement {

    return projectDocument
        ? <Card.Header className="hierarchy-parent">
            <DocumentTeaser document={ getParentDocument(projectDocument, searchParams, documents) }
                            project={ projectDocument.resource.id }
                            hierarchyHeader={ true } />
        </Card.Header>
        : <></>;
}


const getParentDocument = (projectDocument: Document, searchParams: string,
                           documents?: ResultDocument[]): ResultDocument | undefined => {

    if (!documents || documents.length === 0 || new URLSearchParams(searchParams).has('q')) return undefined;

    const relations = documents[0].resource.relations?.isChildOf;
    return relations?.length > 0 ? relations[0] : projectDocument;
};
