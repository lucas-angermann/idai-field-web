import React from 'react';
import DocumentTeaser from './DocumentTeaser';


export default ({ documents } : { documents: any }) =>
    documents.map((document: any) => <DocumentTeaser document={ document } key={ document.resource.id } />);
