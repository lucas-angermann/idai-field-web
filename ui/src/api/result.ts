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
    values: (FilterBucket | FilterBucketTreeNode)[];
    label: I18nString;
}


export interface FilterBucket {
    value: {
        name: string;
        label: I18nString
    };
    count: number;
}


export interface FilterBucketTreeNode {
    item: FilterBucket;
    trees: FilterBucketTreeNode[];
}
