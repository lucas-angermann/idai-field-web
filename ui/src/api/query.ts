export type Query = {
    q?: string,
    filters?: Filter[],
    not?: Filter[],
    exists?: string[],
    parent?: string,
    size?: number,
    from?: number,
    sort?: string
};


export type Filter = {
    field: string,
    value: string
};


export const buildBackendGetParams = (query: Query): string => {

    const queryParams = [['q', query.q && query.q.length > 0 ? query.q : '*']];

    if (query.filters) {
        queryParams.push(...query.filters.map((filter: Filter) => ['filters[]', `${filter.field}:${filter.value}`]));
    }
    if (query.not) {
        queryParams.push(...query.not.map((filter: Filter) => ['not[]', `${filter.field}:${filter.value}`]));
    }
    if (query.exists) {
        queryParams.push(...query.exists.map((fieldName: string) => ['exists[]', `${fieldName}`]));
    }
    if (query.q === undefined) {
        if (query.parent && query.parent !== 'root') {
            queryParams.push(['filters[]', `resource.relations.isChildOf.resource.id:${query.parent}`]);
        } else {
            queryParams.push(['not_exists[]', 'resource.relations.isChildOf']);
        }
    }

    if (query.size) queryParams.push(['size', query.size.toString()]);
    if (query.from) queryParams.push(['from', query.from.toString()]);
    if (query.sort) queryParams.push(['sort', query.sort]);

    return queryParams.map(([k, v]) => `${k}=${v}`).join('&');
};


export const buildProjectOverviewQueryTemplate = (from: number, size: number, excludedTypes: string[]): Query => ({
    size,
    from,
    not: excludedTypes.map(type => ({ field: 'resource.category.name', value: type }))
});


export const buildProjectQueryTemplate = (id: string, from: number, size: number, excludedTypes: string[]): Query => ({
    size,
    from,
    filters: [
        { field: 'project', value: id }
    ],
    not: excludedTypes.map(type => ({ field: 'resource.category.name', value: type }))
});


export const parseFrontendGetParams = (searchParams: string, query: Query = { filters: [] }): Query => {

    const newQuery = JSON.parse(JSON.stringify(query));
    const params = new URLSearchParams(searchParams);

    if (params.has('q')) {
        newQuery.q = params.get('q');
    } else if (!params.has('parent')) {
        newQuery.q = '*';
    }

    if (params.has('parent')) {
        newQuery.parent = params.get('parent');
        newQuery.sort = 'sort';
    }

    const filters = Array.from(params.entries())
        .filter(([field]) => field !== 'q' && field !== 'r' && field !== 'parent' && field !== 'sort')
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
