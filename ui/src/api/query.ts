const EXCLUDED_TYPES = ['Project', 'Image', 'TypeCatalog', 'Type'];


export type Query = {
    q?: string,
    filters?: Filter[],
    not?: Filter[],
    exists?: string[],
    parent?: string,
    size?: number,
    from?: number
};


export type Filter = {
    field: string,
    value: string
};


export const buildBackendGetParams = (query: Query) => {

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
        if (query.parent) {
            queryParams.push(['filters[]', `resource.relations.isChildOf.resource.id:${query.parent}`]);
        } else  {
            queryParams.push(['not_exists[]', `resource.relations.isChildOf`]);
        }
        queryParams.push(['sort', 'sort']);
    }

    if (query.size) queryParams.push(['size', query.size.toString()]);
    if (query.from) queryParams.push(['from', query.from.toString()]);

    return queryParams.map(([k, v]) => `${k}=${v}`).join('&');
};


export const buildProjectOverviewQueryTemplate = (from: number, size: number): Query => ({
    size,
    from,
    not: EXCLUDED_TYPES.map(type => ({ field: 'resource.category.name', value: type }))
});


export const buildProjectQueryTemplate = (id: string, from: number, size: number): Query => ({
    size,
    from,
    filters: [
        { field: 'project', value: id }
    ],
    not: EXCLUDED_TYPES.map(type => ({ field: 'resource.category.name', value: type }))
});


export const parseFrontendGetParams = (searchParams: string, query: Query = { q: '*', filters: [] }): Query => {

    const newQuery = JSON.parse(JSON.stringify(query));
    const params = new URLSearchParams(searchParams);

    if (params.has('q')) newQuery.q = params.get('q');
    if (params.has('parent')) newQuery.parent = params.get('parent');

    const filters = Array.from(params.entries())
        .filter(([field, _]) => field !== 'q' && field !== 'parent')
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
