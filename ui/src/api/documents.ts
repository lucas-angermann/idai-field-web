import { Query, getQueryString } from './query';
import { Result } from './result';
import { Document } from './document';


export const get = async (id: string): Promise<Document> => {

    const response = await fetch(`/documents/${id}`);
    if (response.ok) return await response.json();
    else throw(await response.json());
};


export const search = async (query: Query): Promise<Result> => {

    const uri = `/documents/?${getQueryString(query)}`;
    const response = await fetch(uri);
    return response.json();
};


export const mapSearch = async (query: Query): Promise<Result> => {

    const uri = `/documents/map?${getQueryString(query)}`;
    const response = await fetch(uri);
    return response.json();
};
