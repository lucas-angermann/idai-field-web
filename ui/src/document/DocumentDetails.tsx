import React, { CSSProperties, ReactNode, ReactElement } from 'react';
import { Card, Carousel, OverlayTrigger, Popover } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { Dating, Dimension, Literature, OptionalRange } from 'idai-components-2';
import { Document, Resource, FieldGroup, Field, Relation, getImages } from '../api/document';
import DocumentTeaser from './DocumentTeaser';
import Image from '../image/Image';
import { ResultDocument } from '../api/result';
import { getLabel } from '../languages';


export default function DocumentDetails({ document }: { document: Document }): ReactElement {

    const { t } = useTranslation();

    return (
        <Card style={ cardStyle }>
            <Card.Header className="px-2 py-3">
                { renderHeader(document) }
            </Card.Header>
            <Card.Body>
                { renderImages(getImages(document), document.project)}
                { renderGroups(document.resource, t) }
            </Card.Body>
        </Card>
    );
}


const renderHeader = (document: Document): ReactElement => (
    <div>
        <DocumentTeaser document={ document }/>
    </div>
);


const renderImages = (images: ResultDocument[], project: string): ReactNode =>
    <Carousel interval={ null }>
        { images?.map(renderImage(project)) }
    </Carousel>;


const renderImage = (project: string) => (imageDoc: ResultDocument): ReactNode => {

    return (
        <Carousel.Item key={ imageDoc.resource.id }>
            <Link to={ `/image/${project}/${imageDoc.resource.id}` }
                    className="d-block mb-2">
                <Image project={ project } id={ imageDoc.resource.id }  maxWidth={ 380 } maxHeight={ 350 }/>
            </Link>
        </Carousel.Item>
    );
};


const renderGroups = (resource: Resource, t: TFunction): ReactNode => {

    return resource.groups.map(renderGroup(t));
};


const renderGroup = (t: TFunction) => (group: FieldGroup): ReactNode => {

    return (
        <div key={ `${group.name}_group` }>
            { renderFieldList(group.fields, t) }
            { renderRelationList(group.relations) }
        </div>
    );
};


const renderFieldList = (fields: Field[], t: TFunction): ReactNode => {

    const fieldElements = fields
        .filter(field => field.name !== 'geometry')
        .map(field => [
            <dt key={ `${field.name}_dt`}>{ getLabel(field.name, field.label) }</dt>,
            <dd key={ `${field.name}_dd`}>{ renderFieldValue(field.value, t) }</dd>
        ]);
    return <dl>{ fieldElements }</dl>;
};


const renderRelationList = (relations: Relation[]): ReactNode => {

    if (!relations) return null;

    const relationElements = relations
        .map(relation => [
            <dt key={ `${relation.name}_dt`}>{ getLabel(relation.name, relation.label) }</dt>,
            <dd key={ `${relation.name}_dd`}>
                <ul className="list-unstyled">
                    { relation.targets.map(doc => renderDocumentLink(doc)) }
                </ul>
            </dd>
        ]);
    return <dl>{ relationElements }</dl>;
};


const renderFieldValue = (value: any, t: TFunction): ReactNode => {

    if (Array.isArray(value)) return renderFieldValueArray(value, t);
    if (typeof value === 'object') return renderFieldValueObject(value, t);
    if (typeof value === 'boolean') return renderFieldValueBoolean(value);
    return value;
};


const renderFieldValueArray = (values: any[], t: TFunction): ReactNode =>
    values.length > 1
        ? <ul>{ values.map((value, i) => <li key={ `${value}_${i}` }>{ renderFieldValue(value, t) }</li>) }</ul>
        : renderFieldValue(values[0], t);


const renderFieldValueObject = (object: any, t: TFunction): ReactNode => {

    if (object.label && object.name) {
        return renderMultiLanguageValue(object, t);
    } else if (object.label) {
      return object.label;
    } else if (Dating.isValid(object, { permissive: true })) {
        return Dating.generateLabel(object, t);
    } else if (Dimension.isValid(object)) {
        return Dimension.generateLabel(
            object, getDecimalValue, t, getLabel(object.measurementPosition.name, object.measurementPosition.label)
        );
    } else if (Literature.isValid(object)) {
        return Literature.generateLabel(object, t);
    } else if (OptionalRange.isValid(object)) {
        return OptionalRange.generateLabel(object, t);
    } else {
        return renderObjectFields(object, t);
    }
};


const renderMultiLanguageValue = (object: any, t: TFunction): ReactNode => {

    const label: string = getLabel(object.name, object.label);

    return object.label && Object.keys(object.label).length > 0
        ? <OverlayTrigger trigger={ ['hover', 'focus'] } placement="right" overlay={ renderPopover(object, t) }>
            <div style={ multiLanguageValueStyle }>{ label }</div>
          </OverlayTrigger>
        : label;
};


const renderFieldValueBoolean = (value: boolean): ReactNode => value ? 'yes' : 'no';


const renderDocumentLink = (doc: ResultDocument): ReactNode =>
    <li key={ doc.resource.id }><DocumentTeaser document={ doc } size="small"/></li>;


const renderObjectFields = (object: any, t: TFunction): ReactNode => {

    const listItems = Object.keys(object).map(key =>
        <li key={ key }><strong>{ key }:</strong> { renderFieldValue(object[key], t) }</li>
    );

    return <ul>{ listItems }</ul>;
};


const renderPopover = (object: any, t: TFunction): any => {

    return (
        <Popover id={ 'popover-' + object.name }>
            <Popover.Content>
                { Object.keys(object.label).map(language => (
                        <div key={ language }>
                            <em>{ t('languages.' + language) }: </em>
                            { object.label[language] }
                        </div>
                    ))
                }
            </Popover.Content>
        </Popover>
    );
};


const getDecimalValue = (value: number): string => {

    return value.toString().replace('.', ',');
};


const cardStyle: CSSProperties = {
    overflow: 'auto',
    flexGrow: 1,
    flexShrink: 1
};


const multiLanguageValueStyle: CSSProperties = {
    display: 'inline-block'
};
