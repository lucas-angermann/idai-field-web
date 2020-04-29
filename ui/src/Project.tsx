import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { search } from './search';

export default () => {

    const { id } = useParams();
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        search(`project:${id}`).then(setDocuments);
    }, [id]);

    return documents.map(document => <h1>{ document.resource.identifier }</h1>);

};
