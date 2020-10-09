import React, { CSSProperties, ReactElement } from 'react';
import DocumentTeaser from '../document/DocumentTeaser';
import { ResultDocument } from '../api/result';


export default function DocumentHierarchy({ documents, searchParams }
        : { documents: ResultDocument[], searchParams?: string }): ReactElement {

    return (
        <div>
            { documents.map((document: ResultDocument) =>
                <div style={ documentContainerStyle } key={ document.resource.id }>
                    <DocumentTeaser document={ document } searchParams={ searchParams }
                                    showHierarchyButton={ true } />

                </div>
            )}
        </div>
    );
}


const documentContainerStyle: CSSProperties = {
    borderBottom: '1px solid var(--main-bg-color)'
};
