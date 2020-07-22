import { Query, getQueryString } from './query';
import { Result } from './result';
import { Document } from './document';


export const get = async (id: string, token: string): Promise<Document> => {

    const response = await fetch(`/documents/${id}`, { headers: getHeaders(token) });
    if (response.ok) return await response.json();
    else throw(await response.json());
};


export const search = async (query: Query, token: string): Promise<Result> => {

    const uri = `/documents/?${getQueryString(query)}`;
    const response = await fetch(uri, { headers: getHeaders(token) });
    return response.json();
};


export const mapSearch = async (query: Query): Promise<Result> => {

    const uri = `/documents/map?${getQueryString(query)}`;
    const response = await fetch(uri);
    return response.json();
};


const getHeaders = (token: string) => {
    if (token) return { 'Authorization': `Bearer ${token}`};
    else return { };
};
