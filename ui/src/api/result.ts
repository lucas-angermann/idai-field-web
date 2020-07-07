export interface Result {
    size: number;
    documents: Document[];
    filters: Filters;
}


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
}


export type Filters = { [x: string]: FilterBucket[] };


export interface FilterBucket {
    value: string;
    count: number;
}
