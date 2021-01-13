import { Document } from './document';
import { buildBackendGetParams, Query, parseFrontendGetParams, buildProjectQueryTemplate } from './query';
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

export const searchDocuments = async (
    id: string,
    searchParams: string,
    from: number,
    token: string,
    chunkSize: number,
    exluded_types: string[],
    parentId?: string): Promise<Result> => {
    
    let query = buildProjectQueryTemplate(id, from, chunkSize, exluded_types);
    query = parseFrontendGetParams(searchParams,query, parentId);
    return search(query, token);
};