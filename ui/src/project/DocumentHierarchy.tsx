import React, { CSSProperties, ReactElement } from 'react';
import DocumentTeaser from '../document/DocumentTeaser';
import { ResultDocument } from '../api/result';


export default function DocumentHierarchy({ documents }
        : { documents: ResultDocument[], searchParams?: string }): ReactElement {

    return (
        <div>
            { documents.map((document: ResultDocument) =>
                <div style={ documentContainerStyle } key={ document.resource.id }>
                    <DocumentTeaser document={ document } />
                </div>
            )}
        </div>
    );
}


const documentContainerStyle: CSSProperties = {
    borderBottom: '1px solid var(--main-bg-color)'
};
