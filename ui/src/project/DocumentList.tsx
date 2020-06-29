import React from 'react';
import DocumentTeaser from '../document/DocumentTeaser';


export default ({ documents } : { documents: any }) =>
    documents.map((document: any) => <DocumentTeaser document={ document } key={ document.resource.id } />);
