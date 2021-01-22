import React, { ReactElement } from 'react';
import { ResultDocument } from '../../api/result';
import './document-hierarchy.css';
import DocumentHierarchyBody from './DocumentHierarchyBody';
import DocumentHierarchyHeader from './DocumentHierarchyHeader';


export default function DocumentHierarchy(
        { documents, searchParams }
        : { documents: ResultDocument[], searchParams: string }): ReactElement {

    return documents && (documents.length > 0
        ? <>
            <DocumentHierarchyHeader documents={ documents }
                                     searchParams={ searchParams } />
            <DocumentHierarchyBody documents={ documents }
                                   searchParams={ searchParams } />
        </>
        : <></>);
}
