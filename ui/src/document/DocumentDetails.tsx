import React, { CSSProperties, ReactNode, ReactElement } from 'react';
import { Card, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Dating, Dimension, Literature, OptionalRange } from 'idai-components-2';
import { Document, Resource, FieldGroup, Field, Relation, getImages } from '../api/document';
import DocumentTeaser from './DocumentTeaser';
import Image from '../image/Image';
import { ResultDocument } from '../api/result';

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


const renderImages = (images: ResultDocument[]): ReactNode =>
    <Carousel interval={ null }>
        { images?.map(renderImage) }
    </Carousel>;


const renderImage = (imageDoc: ResultDocument): ReactNode => {

    return (
        <Carousel.Item key={ imageDoc.resource.id }>
            <Link to={ `/image/${imageDoc.project}/${imageDoc.resource.id}` }
                    className="d-block mb-2">
                <Image project={ imageDoc.project} id={ imageDoc.resource.id }  maxWidth={ 380 } maxHeight={ 350 }/>
            </Link>
        </Carousel.Item>
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
        .filter(field => field.name !== 'geometry')
        .map(field => [
            <dt key={ `${field.name}_dt`}>{ field.label.de ?? field.label.en ?? field.name }</dt>,
            <dd key={ `${field.name}_dd`}>{ renderFieldValue(field.value) }</dd>
        ]);
    return <dl>{ fieldElements }</dl>;
};


const renderRelationList = (relations: Relation[]): ReactNode => {

    if (!relations) return null;

    const relationElements = relations
        .map(relation => [
            <dt key={ `${relation.name}_dt`}>{ relation.label.de ?? relation.label.en ?? relation.name }</dt>,
            <dd key={ `${relation.name}_dd`}>
                <ul className="list-unstyled">
                    { relation.targets.map(doc => renderDocumentLink(doc)) }
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

    if (object.label) {
        return object.label;
    } else if (Dating.isValid(object, { permissive: true })) {
        return Dating.generateLabel(object, getTranslation);
    } else if (Dimension.isValid(object)) {
        // TODO Get translated label for measurement position from value list
        return Dimension.generateLabel(object, getDecimalValue, getTranslation, object.measurementPosition);
    } else if (Literature.isValid(object)) {
        return Literature.generateLabel(object, getTranslation);
    } else if (OptionalRange.isValid(object)) {
        return OptionalRange.generateLabel(object, getTranslation);
    } else {
        return renderObjectFields(object);
    }
};


const renderFieldValueBoolean = (value: boolean): ReactNode => value ? 'yes' : 'no';


const renderDocumentLink = (doc: ResultDocument): ReactNode =>
    <li key={ doc.resource.id }><DocumentTeaser document={ doc } size="small"/></li>;


const renderObjectFields = (object: any): ReactNode => {

    const listItems = Object.keys(object).map(key =>
        <li key={ key }><strong>{ key }:</strong> { renderFieldValue(object[key]) }</li>
    );

    return <ul>{ listItems }</ul>;
};


// TODO Replace with proper i18n solution
const getTranslation = (key: string): string | undefined => {

    const translations = {
        'bce': 'v. Chr.',
        'ce': 'n. Chr.',
        'bp': 'BP',
        'before': 'Vor',
        'after': 'Nach',
        'asMeasuredBy': 'gemessen an',
        'zenonId': 'Zenon-ID',
        'from': 'Von: ',
        'to': ', bis: '
    };

    return translations[key];
};


const getDecimalValue = (value: number): string => {

    return value.toString().replace('.', ',');
};


const cardStyle: CSSProperties = {
    overflow: 'auto',
    flexGrow: 1,
    flexShrink: 1
};
