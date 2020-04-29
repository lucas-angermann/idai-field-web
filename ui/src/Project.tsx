import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { search } from './search';
import DocumentTeaser from './DocumentTeaser';

export default () => {

    const { id } = useParams();
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        const query = { q: `project:${id}`, skipTypes: ['Project', 'Image', 'Photo', 'Drawing'] };
        search(query).then(setDocuments);
    }, [id]);

    return documents.map(document => <DocumentTeaser document={ document } key={ document.resource.id } />);

};
