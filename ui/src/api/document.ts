import { Geometry } from 'geojson';
import { Dating, Dimension, Literature, OptionalRange } from 'idai-components-2';
import { ResultDocument } from './result';


export interface Document {
    created: ChangeEvent;
    modified: ChangeEvent[];
    project: string;
    resource: Resource;
}


export interface ChangeEvent {
    user: string;
    date: string;
}


export interface Resource {
    category: LabeledValue;
    id: string;
    identifier: string;
    shortDescription: string;
    groups: FieldGroup[];
    geometry: Geometry;
    childrenCount: number;
    parentId: string;
    grandparentId: string;
}


export interface FieldGroup {
    name: string;
    fields: Field[];
    relations: Relation[];
}


export interface DimensionWithLabeledMeasurementPosition extends Omit<Dimension, 'measurementPosition'> {
    measurementPosition?: LabeledValue;
}


export interface OptionalRangeWithLabeledValues extends Omit<Dimension, 'value' | 'endValue'> {
    value: LabeledValue;
    endValue?: LabeledValue;
}


export type FieldValue =
    string
    | LabeledValue
    | Dimension
    | DimensionWithLabeledMeasurementPosition
    | Dating
    | Literature
    | OptionalRange
    | OptionalRangeWithLabeledValues
    | FieldValue[];


export interface Field {
    description: I18nString;
    label: I18nString;
    name: string;
    value: FieldValue;
}


export interface LabeledValue {
    name: string;
    label: I18nString;
}


export type I18nString = { [languageCode: string]: string };


export interface Relation {
    description: I18nString;
    label: I18nString;
    name: string;
    targets: ResultDocument[];
}

export const getDocumentImages = (document: Document): ResultDocument[] =>
    document.resource.groups.find((group: FieldGroup) => group.name === 'stem')
        .relations.find((rel: Relation) => rel.name === 'isDepictedIn')?.targets;

export const getDocumentDescription = (doc: Document): FieldValue => getFieldValue(doc, 'parent', 'description');

export const getFieldValue = (document: Document, groupName: string, fieldName: string): FieldValue =>
    document.resource.groups.find((group: FieldGroup) => group.name === groupName)
        .fields.find((field: Field) => field.name === fieldName)?.value;
