import { buildBackendPostParams, Query } from '../../api/query';
import { Result, ResultDocument } from '../../api/result';
import { Document } from '../../api/document';
import { getHeaders } from '../../api/utils';


export type ProjectQuery = {
    query: Query,
    selected_id: string,
    predecessors_id: string
};


export type ProjectQueryResult = {
    search: Result,
    map: Result,
    selected: Document,
    predecessors: ResultDocument[]
};


export const postProjectQuery = async (projectQuery: ProjectQuery, token: string): Promise<ProjectQueryResult> => {

    const headers = getHeaders(token);
    headers['Content-Type'] = 'application/json';
    const body = {
        query: projectQuery.query ? await buildBackendPostParams(projectQuery.query) : null,
        selected_id: projectQuery.selected_id,
        predecessors_id: projectQuery.predecessors_id
    };
    const response = await fetch('/api/documents/project', { headers, method: 'POST', body: JSON.stringify(body) });
    return response.json();
};
