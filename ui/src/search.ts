type Query = {
    q: string,
    skipTypes: string[]
};

export const search = async (query: Query): Promise<any> => {

    const response = await fetch(`/documents/?q=${getQueryString(query)}`);
    return await response.json();
};

const getQueryString = (query: Query) =>
    `${query.q} ${query.skipTypes.map(type => `-resource.type:${type}`).join(' ')}`;
