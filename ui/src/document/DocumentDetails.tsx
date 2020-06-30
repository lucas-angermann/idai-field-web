import React from 'react';
import { Container, Card } from 'react-bootstrap';
import CategoryIcon from './CategoryIcon';
import { Link } from 'react-router-dom';

export default ({ document }: { document: any }) => {

    const resource = document.resource;
    const header = renderHeader(resource);
    const fieldList = renderFieldList(resource);
    const relationList = renderRelationList(resource);
    return (
        <Container>
            <Card>
                <Card.Header>
                    { header }
                </Card.Header>
                <Card.Body>
                    { fieldList }
                    { relationList }
                </Card.Body>
            </Card>
        </Container>
    );
};


const renderHeader = (resource: any) => (
    <div>
        <h1>
            <CategoryIcon category={ resource.type } size="40" />
            &nbsp; { resource.identifier }
        </h1>
        <code>
            <Link to={ `/document/${resource.id}` }>
                { `https://field.dainst.org/document/${resource.id}` }
            </Link>
        </code>
    </div>
);


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


const renderRelationList = (resource: any) => {

    if (!resource.relations) return null;

    const relations = Object.keys(resource.relations)
        .filter(key => resource.relations[key].length > 0)
        .map(key => [
            <dt key={ `${key}_dt`}>{ key }</dt>,
            <dd key={ `${key}_dd`}>
                <ul>
                    { resource.relations[key].map(id => renderDocumentLink(id)) }
                </ul>
            </dd>
        ]);
    return <dl>{ relations }</dl>;
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


const renderDocumentLink = (id: string) => <li key={ id }><Link to={ `/document/${id}` }>{ id }</Link></li>;
