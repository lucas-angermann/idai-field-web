import React, { CSSProperties } from 'react';
import DocumentTeaser from '../document/DocumentTeaser';


export default ({ documents } : { documents: any }) =>
    documents.map((document: any) => (
        <div style={ documentContainerStyle } key={ document.resource.id }>
            <DocumentTeaser document={ document }/>
        </div>
    ));


const documentContainerStyle: CSSProperties = {
    borderBottom: '1px solid var(--main-bg-color)',
    padding: '.7rem 0'
};
