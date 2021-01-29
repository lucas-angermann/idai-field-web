import React, { ReactElement } from 'react';
import { Card } from 'react-bootstrap';
import { ResultDocument } from '../../api/result';
import DocumentTeaser from '../document/DocumentTeaser';


export default function DocumentHierarchyHeader({ documents, searchParams }
        : { documents: ResultDocument[], searchParams: string } ): ReactElement {

    const firstDoc = documents?.[0];
    const project = firstDoc?.project;
    const parentDoc = getParentDocument(firstDoc);

    const params = new URLSearchParams(searchParams);
    params.set('r', 'children');
    const linkUrl = `/project/${parentDoc.project}/${parentDoc.resource.id}${params.toString()}`;

    return documents.length && parentDoc
        ? <Card.Header className="hierarchy-parent">
            <DocumentTeaser searchParams={ searchParams }
                document={ parentDoc } linkUrl={ linkUrl }
                hierarchyHeader={ true } />
        </Card.Header>
        : <></>;
}


const getParentDocument = (doc: ResultDocument): ResultDocument | undefined =>
    doc.resource.relations?.isChildOf?.[0];
