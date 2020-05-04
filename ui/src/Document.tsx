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


const renderDocument = (document: any) => {

    console.log(document);

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


const renderFieldList = (resource: any) => {

    const fields = Object.keys(resource)
        .filter(key => !['relations', 'geometry', 'id'].includes(key))
        .map(key => [
            <dt key={ `${key}_dt`}>{ key }</dt>,
            <dd key={ `${key}_dd`}>{ renderFieldValue(resource[key]) }</dd>
        ]);
    return <dl>{ fields }</dl>;
};


const renderFieldValue = (value: any) => {

    if (Array.isArray(value)) return renderFieldValueArray(value);
    if (typeof value === 'object') return renderFieldValueObject(value);
    return value;
};


const renderFieldValueArray = (values: any[]) =>
    values.length > 1
        ? values.map((value, i) => <li key={ `${value}_${i}` }>{ renderFieldValue(value) }</li>)
        : renderFieldValue(values[0]);


const renderFieldValueObject = (object: any) => {

    if (object.label) return object.label;

    const listItems = Object.keys(object).map(key => <li key={ key }><strong>{ key }:</strong> { object[key] }</li>);
    return <ul>{ listItems }</ul>;
};


const renderError = () => {
    return <div>Error: No matching document found.</div>;
};


const getDocument = async (id: string) => {
    const response = await fetch(`/documents/${id}`);
    return await response.json();
};
