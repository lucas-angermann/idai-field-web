import React, { CSSProperties, ReactNode, ReactElement } from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Document, Resource, FieldGroup, Field, Relation, getImages } from '../api/document';
import DocumentTeaser from './DocumentTeaser';
import Image from '../image/Image';

export default function DocumentDetails({ document }: { document: Document }): ReactElement {

    return (
        <Card style={ cardStyle }>
            <Card.Header className="px-2 py-3">
                { renderHeader(document) }
            </Card.Header>
            <Card.Body>
                { renderImages(getImages(document))}
                { renderGroups(document.resource) }
            </Card.Body>
        </Card>
    );
}


const renderHeader = (document: Document): ReactElement => (
    <div>
        <DocumentTeaser document={ document }/>
    </div>
);


const renderImages = (images: string[]): ReactNode => images?.map(renderImage);


const renderImage = (id: string): ReactNode => {

    return (
        <Link to={ `/image/${id}` } key={ `image-${id}` } className="d-block mb-2">
            <Image id={ id } />
        </Link>
    );
};


const renderGroups = (resource: Resource): ReactNode => {

    return resource.groups.map(renderGroup);
};


const renderGroup = (group: FieldGroup): ReactNode => {

    return (
        <div key={ `${group.name}_group` }>
            { renderFieldList(group.fields) }
            { renderRelationList(group.relations) }
        </div>
    );
};


const renderFieldList = (fields: Field[]): ReactNode => {

    const fieldElements = fields
        .map(field => [
            <dt key={ `${field.name}_dt`}>{ field.label.de }</dt>,
            <dd key={ `${field.name}_dd`}>{ renderFieldValue(field.value) }</dd>
        ]);
    return <dl>{ fieldElements }</dl>;
};


const renderRelationList = (relations: Relation[]): ReactNode => {

    if (!relations) return null;

    const relationElements = relations
        .map(relation => [
            <dt key={ `${relation.name}_dt`}>{ relation.label.de }</dt>,
            <dd key={ `${relation.name}_dd`}>
                <ul>
                    { relation.targets.map(id => renderDocumentLink(id)) }
                </ul>
            </dd>
        ]);
    return <dl>{ relationElements }</dl>;
};


const renderFieldValue = (value: any): ReactNode => {

    if (Array.isArray(value)) return renderFieldValueArray(value);
    if (typeof value === 'object') return renderFieldValueObject(value);
    if (typeof value === 'boolean') return renderFieldValueBoolean(value);
    return value;
};


const renderFieldValueArray = (values: any[]): ReactNode =>
    values.length > 1
        ? <ul>{ values.map((value, i) => <li key={ `${value}_${i}` }>{ renderFieldValue(value) }</li>) }</ul>
        : renderFieldValue(values[0]);


const renderFieldValueObject = (object: any): ReactNode => {

    if (object.label) return object.label;

    const listItems = Object.keys(object).map(key =>
        <li key={ key }><strong>{ key }:</strong> { renderFieldValue(object[key]) }</li>);
    return <ul>{ listItems }</ul>;
};


const renderFieldValueBoolean = (value: boolean): ReactNode => value ? 'yes' : 'no';


const renderDocumentLink = (id: string): ReactNode => <li key={ id }><Link to={ `/document/${id}` }>{ id }</Link></li>;


const cardStyle: CSSProperties = {
    overflow: 'auto',
    flexGrow: 1,
    flexShrink: 1
};
