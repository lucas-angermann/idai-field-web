import { Geometry } from 'geojson';
import Document from '../document/Document';

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
    category: string;
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

export function getImages(document: Document): string[] {

    return document.resource.groups.find((group: FieldGroup) => group.name === 'stem')
        .relations.find((rel: Relation) => rel.name === 'isDepictedIn')?.targets;
}
