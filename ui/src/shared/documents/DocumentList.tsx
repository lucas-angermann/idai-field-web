import React, { CSSProperties, ReactElement } from 'react';
import { ResultDocument } from '../../api/result';
import DocumentTeaser from '../document/DocumentTeaser';


export default function DocumentList({ documents, searchParams = '' }
        : { documents: ResultDocument[], searchParams: string }): ReactElement {

    return documents.length > 0 ? (
        <div className="documents">
            { documents.map((document: ResultDocument) => {
                const linkUrl = `/project/${document.project}/${document.resource.id}${searchParams}`;
                return <div style={ documentContainerStyle } key={ document.resource.id }>
                    <DocumentTeaser document={ document } linkUrl={ linkUrl }
                        searchParams={ searchParams } />
                </div>;
            }
            )}
        </div>
    ) : <></>;
}


const documentContainerStyle: CSSProperties = {
    borderBottom: '1px solid var(--main-bg-color)'
};
