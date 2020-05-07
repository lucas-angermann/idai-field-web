export type Query = {
    q: string,
    must?: Filter[],
    not?: Filter[],
    size?: number,
    from?: number
};

export type Filter = {
    field: string,
    value: string
};

export const getQueryString = (query: Query) => {

    let queryString = `q=${query.q}`;

    if (query.must) {
        queryString += ' AND ' + query.must.map((filter: Filter) => `${filter.field}:${filter.value}`).join(' AND ');
    }
    if (query.not) {
        queryString += ' AND NOT ' + query.not.map((filter: Filter) => `${filter.field}:${filter.value}`).join(' AND NOT ');
    }

    if (query.size) queryString += `&size=${query.size}`;
    if (query.from) queryString += `&from=${query.from}`;

    return queryString;
};
