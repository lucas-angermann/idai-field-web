import { ChangeEvent } from './document';

export interface Result {
    size: number;
    documents: ResultDocument[];
    filters: Filters;
}


export interface ResultDocument {
    created: ChangeEvent;
    modified: ChangeEvent[];
    project: string;
    resource: ResultResource;
}


export interface ResultResource {
    type: string;
    id: string;
    identifier: string;
    shortDescription: string;
}


export type Filters = { [x: string]: FilterBucket[] };


export interface FilterBucket {
    value: string;
    count: number;
}
