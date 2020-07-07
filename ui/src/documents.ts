import { Query, getQueryString } from './api/query';
import { Result } from './api/result';

export const get = async (id: string): Promise<any> => {

    const response = await fetch(`/documents/${id}`);
    if (response.ok) return await response.json();
    else throw(await response.json());
};


export const search = async (query: Query): Promise<Result> => {

    const uri = `/documents/?${getQueryString(query)}`;
    const response = await fetch(uri);
    return response.json();
};
