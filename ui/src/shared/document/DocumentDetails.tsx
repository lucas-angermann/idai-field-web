import { TFunction } from 'i18next';
import { Dating, Dimension, Literature, OptionalRange } from 'idai-components-2';
import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import { Card, Carousel, OverlayTrigger, Popover } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DimensionWithLabeledMeasurementPosition, Document, Field, FieldGroup, FieldValue, getImages, LabeledValue,
    OptionalRangeWithLabeledValues, Relation } from '../../api/document';
import { ResultDocument } from '../../api/result';
import Image from '../image/Image';
import { getLabel, getNumberOfUndisplayedLabels } from '../languages';
import './document-details.css';
import DocumentTeaser from './DocumentTeaser';

const HIDDEN_FIELDS = ['id', 'identifier', 'shortDescription', 'geometry', 'georeference', 'originalFilename'];


export default function DocumentDetails({ document, searchParams, isImageDocument=false,
                                          backButtonUrl, skipRelations=false }
        : { document: Document, searchParams: string, isImageDocument?: boolean,
            backButtonUrl?: string, skipRelations?: boolean }): ReactElement {

    const { t } = useTranslation();

    const images: ResultDocument[] = getImages(document);

    return (
        <Card style={ cardStyle }>
            <Card.Header style={ cardHeaderStyle }>
                { renderHeader(document, searchParams, isImageDocument, backButtonUrl) }
            </Card.Header>
            <Card.Body style={ cardBodyStyle }>
                { images && renderImages(images, document) }
                { renderGroups(document, t, skipRelations) }
            </Card.Body>
        </Card>
    );
}


const renderHeader = (document: Document, searchParams: string, isImageDocument: boolean,
                      backButtonUrl?: string): ReactElement => (
    <div>
        <DocumentTeaser project={ document.project } document={ document } searchParams={ searchParams }
                        backButtonUrl={ backButtonUrl } asLink={ false } imageHeader={ isImageDocument } />
    </div>
);


const renderImages = (images: ResultDocument[], document: Document): ReactNode =>
    <Carousel className="document-details-carousel" interval={ null }>
        { images?.map(renderImage(document)) }
    </Carousel>;


const renderImage = (document: Document) => function CarouselImage(imageDoc: ResultDocument): ReactNode {

    return (
        <Carousel.Item key={ imageDoc.resource.id }>
            <Link to={ `/image/${document.project}/${imageDoc.resource.id}?r=${document.resource.id}` }
                    className="d-block mb-2">
                <Image project={ document.project } id={ imageDoc.resource.id } maxWidth={ 380 } maxHeight={ 350 } />
            </Link>
        </Carousel.Item>
    );
};


const renderGroups = (document: Document, t: TFunction, skipRelations: boolean): ReactNode => {

    return document.resource.groups.map(renderGroup(t, document.project, skipRelations));
};


const renderGroup = (t: TFunction, project: string, skipRelations: boolean) =>
    function FieldGroupRow(group: FieldGroup): ReactNode {

    return (
        <div key={ `${group.name}_group` }>
            { renderFieldList(group.fields, t) }
            { skipRelations || renderRelationList(group.relations, project, t) }
        </div>
    );
};


const renderFieldList = (fields: Field[], t: TFunction): ReactNode => {

    const fieldElements = fields
        .filter(field => !HIDDEN_FIELDS.includes(field.name))
        .map(field => {
            const valueElements = renderFieldValue(field.value, t);
            return valueElements ? [
                <dt key={ `${field.name}_dt` }>{ renderMultiLanguageText(field, t) }</dt>,
                <dd key={ `${field.name}_dd` }>{ valueElements }</dd>
            ] : undefined;
        });
    return fieldElements ? <dl style={ listStyle }>{ fieldElements }</dl> : <></>;
};


const renderRelationList = (relations: Relation[], project: string, t: TFunction): ReactNode => {

    if (!relations) return null;

    const relationElements = relations
        .filter(relation => relation.name !== 'isDepictedIn')
        .map(relation => [
            <dt key={ `${relation.name}_dt` }>{ renderMultiLanguageText(relation, t) }</dt>,
            <dd key={ `${relation.name}_dd` }>
                <ul className="list-unstyled" style={ listStyle }>
                    { relation.targets.map(doc => renderDocumentLink(project, doc)) }
                </ul>
            </dd>
        ]);
    return <dl style={ listStyle }>{ relationElements }</dl>;
};


const renderFieldValue = (value: FieldValue, t: TFunction): ReactNode => {

    if (Array.isArray(value)) return renderFieldValueArray(value, t);
    if (typeof value === 'object') return renderFieldValueObject(value, t);
    if (typeof value === 'boolean') return renderFieldValueBoolean(value);
    return value;
};


const renderFieldValueArray = (values: FieldValue[], t: TFunction): ReactNode =>
    values.length > 1
        ? <ul>{ values.map((value, i) => <li key={ `${value}_${i}` }>{ renderFieldValue(value, t) }</li>) }</ul>
        : renderFieldValue(values[0], t);


const renderFieldValueObject = (object: FieldValue, t: TFunction): ReactNode | undefined => {

    if ((object as LabeledValue).label && (object as LabeledValue).name) {
        return renderMultiLanguageText(object as LabeledValue, t);
    } else if ((object as LabeledValue).label) {
      return (object as LabeledValue).label;
    } else if (Dating.isValid(object as Dating, { permissive: true })) {
        return Dating.generateLabel(object as Dating, t);
    } else if (Dimension.isValid(object as Dimension)) {
        const labeledPosition = (object as DimensionWithLabeledMeasurementPosition).measurementPosition;
        return Dimension.generateLabel(
            object as Dimension, getDecimalValue, t,
            labeledPosition ? getLabel(labeledPosition) : undefined
        );
    } else if (Literature.isValid(object as Literature)) {
        return Literature.generateLabel(object as Literature, t);
    } else if (OptionalRange.isValid(object as OptionalRange)) {
        return renderOptionalRange(object as OptionalRangeWithLabeledValues, t);
    } else {
        console.warn('Failed to render field value:', object);
        return undefined;
    }
};


const renderMultiLanguageText = (object: LabeledValue, t: TFunction): ReactNode => {

    const label: string = getLabel(object);

    return object.label && getNumberOfUndisplayedLabels(object.label) > 0
        ? <OverlayTrigger trigger={ ['hover', 'focus'] } placement="right" overlay={ renderPopover(object, t) }>
            <div style={ multiLanguageTextStyle }>{ label }</div>
          </OverlayTrigger>
        : label;
};


const renderOptionalRange = (optionalRange: OptionalRangeWithLabeledValues, t: TFunction): ReactNode => {

    return optionalRange.endValue
        ? <div>
            { t('from') }
            { renderMultiLanguageText(optionalRange.value, t) }
            { t('to') }
            { renderMultiLanguageText(optionalRange.endValue, t) }
        </div>
        : renderMultiLanguageText(optionalRange.value, t);
};


const renderFieldValueBoolean = (value: boolean): ReactNode => value ? 'yes' : 'no';


const renderDocumentLink = (project: string, doc: ResultDocument): ReactNode =>
    <li key={ doc.resource.id }><DocumentTeaser document={ doc } project={ project } size="small" /></li>;


const renderPopover = (object: LabeledValue, t: TFunction): ReactElement => {

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
    overflow: 'hidden',
    flexGrow: 1,
    flexShrink: 1
};


const cardHeaderStyle: CSSProperties = {
    padding: '12px'
};


const cardBodyStyle: CSSProperties = {
    height: 'calc(100% - 94px)',
    overflow: 'auto'
};


const multiLanguageTextStyle: CSSProperties = {
    display: 'inline-block',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted'
};


const listStyle: CSSProperties = {
    marginBottom: '0'
};
