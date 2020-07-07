import { Geometry } from 'geojson';

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
    type: string;
    id: string;
    identifier: string;
    shortDescription: string;
    groups: FieldGroup[];
    geometry: Geometry;
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


export interface I18nString {
    en: string;
    de: string;
}


export interface Relation {
    description: I18nString;
    label: I18nString;
    name: string;
    targets: string[];
}
