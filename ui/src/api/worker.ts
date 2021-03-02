import { getHeaders } from './utils';


const PATH = '/api/worker/';


export const postReindex = async (token: string, project: string): Promise<unknown> =>
    postTask(token, 'reindex', project);


export const postConvert = async (token: string, project: string): Promise<unknown> =>
    postTask(token, 'convert', project);


export const postTiling = async (token: string, project: string): Promise<unknown> => 
    postTask(token, 'tiling', project);


export const postTask = async (token: string, endpoint: string, project: string): Promise<unknown> => {

    const uri = project === '' 
        ? PATH + '/' + endpoint
        : PATH + '/' + endpoint + '/' + project;

    const response = await fetch(uri, {
        headers: getHeaders(token),
        method: 'POST'
    });

    if (response.ok) return (await response.json());
    else throw(await response.json());
};


export const postStopProcess = async (token: string, project: string): Promise<unknown> => {

    const uri = PATH + '/tasks/stop/' + project;

    const response = await fetch(uri, {
        headers: getHeaders(token),
        method: 'POST'
    });

    if (response.ok) return (await response.json());
    else throw(await response.json());
};


export const getShowProcesses = async (token: string): Promise<unknown> => {

    const uri = PATH + '/tasks/show';

    const response = await fetch(uri, {
        headers: getHeaders(token),
        method: 'GET'
    });

    if (response.ok) return (await response.json());
    else throw(await response.json());
};
