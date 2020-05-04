import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Jumbotron } from 'react-bootstrap';
import CategoryIcon from './CategoryIcon';

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


const renderDocument = (document) => {
    const resource = document.resource;
    const fieldList = renderFieldList(resource);
    return (
        <Jumbotron fluid>
            <Container>
                <h1>
                    <CategoryIcon category={ resource.type } size="40" />
                    &nbsp; { resource.identifier }
                </h1>
                { fieldList }
            </Container>
        </Jumbotron>
    );
};


const renderFieldList = (resource) => {
    const fields = Object.keys(resource)
        .filter(key => !['relations', 'geometry'].includes(key))
        .map(key => [
            <dt key={ `${resource.id}_${key}_dt`}>{ key }</dt>,
            <dd key={ `${resource.id}_${key}_dd`}>{ resource[key] }</dd>
        ]);
    return <dl>{ fields }</dl>;
};


const renderError = () => {
    return <div>Error: No matching document found.</div>;
};


const getDocument = async (id: string) => {
    const response = await fetch(`/documents/${id}`);
    return await response.json();
};
