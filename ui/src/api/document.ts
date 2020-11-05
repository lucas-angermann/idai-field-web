import { Geometry } from 'geojson';
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
}


export interface FieldGroup {
    name: string;
    fields: Field[];
    relations: Relation[];
}


export interface Field {
    description: I18nString;
    label: I18nString;
    name: string;
    value: any;
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

export function getImages(document: Document): ResultDocument[] {

    return document.resource.groups.find((group: FieldGroup) => group.name === 'stem')
        .relations.find((rel: Relation) => rel.name === 'isDepictedIn')?.targets;
}
