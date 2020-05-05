import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DocumentDetails from './DocumentDetails';

export default () => {

    const { id } = useParams();
    const [document, setDocument] = useState(null);

    useEffect (() => {
        getDocument(id).then(setDocument);
    }, [id]);

    return (document && document.resource)
        ? renderDocument(document)
        : renderError();
};


const renderDocument = (document: any) => <DocumentDetails document={ document } />


const renderError = () => <div>Error: No matching document found.</div>;


const getDocument = async (id: string) => {

    const response = await fetch(`/documents/${id}`);
    return await response.json();
};
