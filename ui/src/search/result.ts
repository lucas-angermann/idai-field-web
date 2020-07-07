export interface Result {
    size: number;
    documents: Document[];
    filters: Filters;
}


interface Document {
    created: ChangeEvent;
    modified: ChangeEvent[];
    project: string;
    resource: Resource;
}


interface ChangeEvent {
    user: string;
    date: string;
}


interface Resource {
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
