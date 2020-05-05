import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DocumentDetails from './DocumentDetails';
import { Container } from 'react-bootstrap';

export default () => {

    const { id } = useParams();
    const [document, setDocument] = useState(null);
    const [error, setError] = useState(null);

    useEffect (() => {
        getDocument(id)
            .then(setDocument)
            .catch(setError);
    }, [id]);

    return (document && document.resource)
        ? renderDocument(document)
        : error
            ? renderError(error)
            : null;
};


const renderDocument = (document: any) => <DocumentDetails document={ document } />;


const renderError = (error: any) => <Container fluid>Error: { error.error }</Container>;


const getDocument = async (id: string) => {

    const response = await fetch(`/documents/${id}`);
    if (response.ok) return await response.json();
    else throw(await response.json());
};
