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


export const buildBackendGetParams = (query: Query) => {

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


export const buildProjectOverviewQueryTemplate = (from: number, size: number): Query => {

    const query: Query = {
        q: '*',
        size,
        from,
        not: [
            { field: 'resource.category.name', value: 'Project' },
            { field: 'resource.category.name', value: 'Image' },
            { field: 'resource.category.name', value: 'Photo' },
            { field: 'resource.category.name', value: 'Drawing' }
        ]
    };

    return query;
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
            { field: 'resource.category.name', value: 'Project' },
            { field: 'resource.category.name', value: 'Image' },
            { field: 'resource.category.name', value: 'Photo' },
            { field: 'resource.category.name', value: 'Drawing' }
        ]
    };

    return query;
};


export const parseFrontendGetParams = (searchParams: string, query: Query = { q: '*', filters: [] }): Query => {

    const newQuery = JSON.parse(JSON.stringify(query));
    const params = new URLSearchParams(searchParams);

    if (params.has('q') && params.get('q')) newQuery.q = params.get('q');

    const filters = Array.from(params.entries())
        .filter(([field, _]) => field !== 'q')
        .map(([field, value]) => ({ field, value }));
    
    if (!newQuery.filters) newQuery.filters = [];
    newQuery.filters = newQuery.filters.concat(filters);

    return newQuery;
};


export const addFilterToParams = (params: URLSearchParams, key: string, value: string): URLSearchParams => {

    const newParams = new URLSearchParams(params);
    newParams.append(key, value);
    return newParams;
};


export const deleteFilterFromParams = (params: URLSearchParams, key: string, value?: string): URLSearchParams => {

    const newParams = new URLSearchParams(params);
    if (value) {
        const newValues = params.getAll(key).filter(v => v !== value);
        newParams.delete(key);
        newValues.forEach(v => newParams.append(key, v));
    } else newParams.delete(key);
    return newParams;
};
