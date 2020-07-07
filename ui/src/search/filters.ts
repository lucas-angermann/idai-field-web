export interface FilterBucket {
    value: string;
    count: number;
}


export type Filters = { [x: string]: FilterBucket[] };
