import React, { ReactElement } from 'react';
import { ResultDocument } from '../../api/result';
import './document-hierarchy.css';
import DocumentHierarchyBody from './DocumentHierarchyBody';


export default function DocumentHierarchy(
        { documents, searchParams }
        : { documents: ResultDocument[], searchParams: string }): ReactElement {

    return documents && (documents.length > 0
        ? <DocumentHierarchyBody documents={ documents }
            searchParams={ searchParams } />
        : <></>);
}
