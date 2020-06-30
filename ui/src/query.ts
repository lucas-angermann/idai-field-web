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
