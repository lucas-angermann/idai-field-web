import { Query, buildBackendGetParams } from './query';
import { Result, PredecessorResult } from './result';
import { Document } from './document';
import { getHeaders } from './utils';


export const get = async (id: string, token: string): Promise<Document> => {

    const response = await fetch(`/api/documents/${id}`, { headers: getHeaders(token) });
    if (response.ok) return await response.json();
    else throw(await response.json());
};


export const search = async (query: Query, token: string): Promise<Result> => {

    const uri = `/api/documents/?${buildBackendGetParams(query)}`;
    const response = await fetch(uri, { headers: getHeaders(token) });
    return response.json();
};


export const mapSearch = async (query: Query, token: string): Promise<Result> => {

    const uri = `/api/documents/map?${buildBackendGetParams(query)}`;
    const response = await fetch(uri, { headers: getHeaders(token) });
    return response.json();
};

export const predecessors = async (id: string, token: string): Promise<PredecessorResult> => {
    
    const uri = `/api/documents/predecessors/${id}`;
    const response = await fetch(uri, { headers: getHeaders(token) });
    if (response.ok) return await response.json();
    else throw(await response.json());
};