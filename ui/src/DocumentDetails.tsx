import React, { useState, useEffect } from 'react';
import { Container, Jumbotron } from 'react-bootstrap';
import CategoryIcon from './CategoryIcon';

export default ({ document }: { document: any }) => {

    const resource = document.resource;
    const fieldList = renderFieldList(resource);
    return (
        <Container>
            <Jumbotron>
                <h1>
                    <CategoryIcon category={ resource.type } size="40" />
                    &nbsp; { resource.identifier }
                </h1>
                { fieldList }
            </Jumbotron>
        </Container>
    );
};


const renderFieldList = (resource: any) => {

    const fields = Object.keys(resource)
        .filter(key => !['relations', 'geometry', 'id'].includes(key))
        .filter(key => resource[key])
        .map(key => [
            <dt key={ `${key}_dt`}>{ key }</dt>,
            <dd key={ `${key}_dd`}>{ renderFieldValue(resource[key]) }</dd>
        ]);
    return <dl>{ fields }</dl>;
};


const renderFieldValue = (value: any) => {

    if (Array.isArray(value)) return renderFieldValueArray(value);
    if (typeof value === 'object') return renderFieldValueObject(value);
    if (typeof value === 'boolean') return renderFieldValueBoolean(value);
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


const renderFieldValueBoolean = (value: boolean) => value ? 'yes' : 'no';
