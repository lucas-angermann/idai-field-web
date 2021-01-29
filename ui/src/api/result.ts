import { Geometry } from 'geojson';
import { ImageGeoreference } from 'idai-components-2';
import { ChangeEvent, I18nString, LabeledValue } from './document';

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
    deleted?: boolean;
}


export interface ResultResource {
    category: LabeledValue;
    id: string;
    identifier: string;
    shortDescription: string;
    childrenCount: number;
    parentId: string;
    grandparentId: string;
    relations?: { [relationName: string]: ResultDocument[] };
    georeference?: ImageGeoreference;
    geometry: Geometry;
    geometry_wgs84?: Geometry;
    width?: number;
}


export interface ResultFilter {
    name: string;
    values: (FilterBucket | FilterBucketTreeNode)[];
    label: I18nString;
}


export interface FilterBucket {
    value: LabeledValue;
    count: number;
}


export interface FilterBucketTreeNode {
    item: FilterBucket;
    trees: FilterBucketTreeNode[];
}

export interface PredecessorResult {
    results: ResultDocument[];
}