import { mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import { TFunction } from 'i18next';
import { Dating, Dimension, Literature, OptionalRange } from 'idai-components-2';
import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import {
    DimensionWithLabeledMeasurementPosition, Document, Field, FieldGroup, FieldValue, getDocumentImages, LabeledValue,
    OptionalRangeWithLabeledValues, Relation
} from '../../api/document';
import { ResultDocument } from '../../api/result';
import { ImageCarousel } from '../image/ImageCarousel';
import { getLabel, getNumberOfUndisplayedLabels } from '../languages';
import { getDocumentLink } from './document-utils';
import DocumentTeaser from './DocumentTeaser';

const HIDDEN_FIELDS = ['id', 'identifier', 'geometry', 'georeference', 'originalFilename'];
const HIDDEN_RELATIONS = ['isDepictedIn', 'hasMapLayer'];


interface DocumentDetailsProps {
    document: Document;
    baseUrl: string;
}


export default function DocumentDetails({ document, baseUrl } : DocumentDetailsProps): ReactElement {

    const location = useLocation();
    const { t } = useTranslation();

    const images: ResultDocument[] = getDocumentImages(document);

    return <>
        { images && <ImageCarousel
                        images={ images }
                        document={ document }
                        location={ location }
                    />}
        { renderGroups(document, t, baseUrl) }
    </>;
}


const renderGroups = (document: Document, t: TFunction, baseUrl: string): ReactNode => {

    return document.resource.groups.map(renderGroup(t, document.project, baseUrl));
};


export const renderGroup = (t: TFunction, project: string, baseUrl: string) =>
    function FieldGroupRow(group: FieldGroup): ReactNode {

    return (
        <div key={ `${group.name}_group` }>
            { renderFieldList(group.fields, t) }
            { renderRelationList(group.relations, project, t, baseUrl) }
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


const renderRelationList = (relations: Relation[], project: string, t: TFunction, baseUrl: string): ReactNode => {

    if (!relations) return null;

    const relationElements = relations
        .filter(relation => !HIDDEN_RELATIONS.includes(relation.name))
        .map(relation => [
            <dt key={ `${relation.name}_dt` }>{ renderMultiLanguageText(relation, t) }</dt>,
            <dd key={ `${relation.name}_dd` }>
                <ul className="list-unstyled" style={ listStyle }>
                    { relation.targets.map(doc => renderDocumentLink(project, doc, baseUrl)) }
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
        return renderLiterature(object as Literature, t);
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


const renderLiterature = (literature: Literature, t: TFunction): ReactNode => {

    const label: string = Literature.generateLabel(literature as Literature, t, false);

    return <>
        { label }
        { literature.zenonId &&
            <div>
                <a href={ `https://zenon.dainst.org/Record/${literature.zenonId}` }
                    target="_blank" rel="noopener noreferrer">
                    Zenon <span style={ linkIconContainerStyle }>
                        <Icon path={ mdiOpenInNew } size={ 0.8 } />
                    </span>
                </a>
            </div>
        }
    </>;
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


const renderDocumentLink = (project: string, doc: ResultDocument, baseUrl: string): ReactNode =>
    <li key={ doc.resource.id }>
        <DocumentTeaser document={ doc } linkUrl={ getDocumentLink(doc, project, baseUrl) } size="small" />
    </li>;


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


const multiLanguageTextStyle: CSSProperties = {
    display: 'inline-block',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted'
};


const listStyle: CSSProperties = {
    marginBottom: '0'
};


const linkIconContainerStyle: CSSProperties = {
    position: 'relative',
    bottom: '1px'
};
