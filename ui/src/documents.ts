type Query = {
    q: string,
    size?: number,
    from?: number,
    skipTypes?: string[]
};

export const get = async (id: string): Promise<any> => {

    const response = await fetch(`/documents/${id}`);
    if (response.ok) return await response.json();
    else throw(await response.json());
};


export const search = async (query: Query): Promise<any> => {

    let uri = `/documents/?q=${getQueryString(query)}`;
    if (query.size) uri += `&size=${query.size}`;
    if (query.from) uri += `&from=${query.from}`;

    const response = await fetch(uri);
    return (await response.json()).hits;
};

const getQueryString = (query: Query) =>
    `${query.q} ${query.skipTypes
        ? query.skipTypes.map(type => `-resource.type:${type}`).join(' ')
        : ''
    }`;
