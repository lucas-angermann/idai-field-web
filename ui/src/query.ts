export type Query = {
    q: string,
    filters?: Filter[],
    size?: number,
    from?: number
};

export type Filter = {
    not?: boolean,
    field: string,
    value: string
};

export const getQueryString = (query: Query) => {

    let queryString = `q=${query.q}`;

    if (query.filters) {
        queryString += ' ' + query.filters
            .map((filter: Filter) => `${filter.not ? 'NOT ' : ''}${filter.field}:${filter.value}`)
            .join(' AND ');
    }

    if (query.size) queryString += `&size=${query.size}`;
    if (query.from) queryString += `&from=${query.from}`;

    return queryString;
};
