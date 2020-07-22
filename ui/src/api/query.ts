export type Query = {
    q: string,
    filters?: Filter[],
    not?: Filter[],
    exists?: string[],
    size?: number,
    from?: number
};


export type Filter = {
    field: string,
    value: string
};


export const getQueryString = (query: Query) => {

    const queryParams = [['q', query.q]];

    if (query.filters) {
        queryParams.push(...query.filters.map((filter: Filter) => ['filters[]', `${filter.field}:${filter.value}`]));
    }
    if (query.not) {
        queryParams.push(...query.not.map((filter: Filter) => ['not[]', `${filter.field}:${filter.value}`]));
    }
    if (query.exists) {
        queryParams.push(...query.exists.map((fieldName: string) => ['exists[]', `${fieldName}`]));
    }

    if (query.size) queryParams.push(['size', query.size.toString()]);
    if (query.from) queryParams.push(['from', query.from.toString()]);

    return queryParams.map(([k, v]) => `${k}=${v}`).join('&');
};


export const buildProjectQueryTemplate = (id: string, from: number, size: number): Query => {

    const query: Query = {
        q: '*',
        size,
        from,
        filters: [
            { field: 'project', value: id }
        ],
        not: [
            { field: 'resource.category', value: 'Project' },
            { field: 'resource.category', value: 'Image' },
            { field: 'resource.category', value: 'Photo' },
            { field: 'resource.category', value: 'Drawing' }
        ]
    };

    return query;
};


export const addFilters = (query: Query, searchParams: string) => {

    const filters = Array.from(new URLSearchParams(searchParams).entries())
        .map(([field, value]) => ({ field, value }));
    query.filters = query.filters.concat(filters);
};
