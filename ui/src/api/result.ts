import { ChangeEvent, I18nString } from './document';

export interface Result {
    size: number;
    documents: ResultDocument[];
    filters: ResultFilter[];
}


export interface ResultDocument {
    created: ChangeEvent;
    modified: ChangeEvent[];
    project: string;
    resource: ResultResource;
}


export interface ResultResource {
    category: string;
    id: string;
    identifier: string;
    shortDescription: string;
}


export interface ResultFilter {
    name: string;
    values: FilterBucket[];
    label: I18nString;
}


export interface FilterBucket {
    value: string;
    count: number;
}
