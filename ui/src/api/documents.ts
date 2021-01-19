import { Document } from './document';
import { buildBackendGetParams, Query } from './query';
import { PredecessorResult, Result } from './result';
import { getHeaders } from './utils';


export const get = async (id: string, token: string): Promise<Document> => {

    const response = await fetch(`/api/documents/${id}`, { headers: getHeaders(token) });
    if (response.ok) return await response.json();
    else throw(response);
};


export const search = async (query: Query, token: string): Promise<Result> => {

    const uri = `/api/documents/?${buildBackendGetParams(query)}`;
    const response = await fetch(uri, { headers: getHeaders(token) });
    return response.json();
};


export const searchMap = async (query: Query, token: string): Promise<Result> => {

    const uri = `/api/documents/map?${buildBackendGetParams(query)}`;
    const response = await fetch(uri, { headers: getHeaders(token) });
    return response.json();
};


export const getPredecessors = async (id: string, token: string): Promise<PredecessorResult> => {
    
    const uri = `/api/documents/predecessors/${id}`;
    const response = await fetch(uri, { headers: getHeaders(token) });
    if (response.ok) return await response.json();
    else throw(await response.json());
};
