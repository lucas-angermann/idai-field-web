import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import DocumentDetails from './DocumentDetails';
import { Container } from 'react-bootstrap';
import { get } from '../api/documents';
import { Document } from '../api/document';
import { LoginContext } from '../App';

export default () => {

    const { id } = useParams();
    const loginData = useContext(LoginContext);
    const [document, setDocument] = useState<Document>(null);
    const [error, setError] = useState(null);

    useEffect (() => {
        get(id, loginData.token)
            .then(setDocument)
            .catch(setError);
    }, [id, loginData]);

    return (document && document.resource)
        ? <Container>{ renderDocument(document) }</Container>
        : error
            ? renderError(error)
            : null;
};


const renderDocument = (document: any) => <DocumentDetails document={ document } />;


const renderError = (error: any) => <Container fluid>Error: { error.error }</Container>;
