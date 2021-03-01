import { getHeaders } from './utils';


const PATH = '/api/worker/';


export const postReindex = async (token: string, project: string): Promise<unknown> => {

    const uri = project === ''
        ? PATH + '/reindex'
        : PATH + '/reindex/' + project;

    const response = await fetch(uri, {
        headers: getHeaders(token),
        method: 'POST'
    });

    if (response.ok) return (await response.json());
    else throw(await response.json());
};


// TODO remove duplication
export const postConvert = async (token: string, project: string): Promise<unknown> => {
    
    const uri = project === '' 
    ? PATH + '/convert'
    : PATH + '/convert/' + project;
    
    const response = await fetch(uri, {
        headers: getHeaders(token),
        method: 'POST'
    });
    
    if (response.ok) return (await response.json());
    else throw(await response.json());
};


// TODO remove duplication
export const postTilegen = async (token: string, project: string): Promise<unknown> => {

    const uri = project === '' 
        ? PATH + '/tilegen'
        : PATH + '/tilegen/' + project;

    const response = await fetch(uri, {
        headers: getHeaders(token),
        method: 'POST'
    });

    if (response.ok) return (await response.json());
    else throw(await response.json());
};


export const postStopProcess = async (token: string, project: string): Promise<unknown> => {

    const uri = PATH + '/processes/stop/' + project;

    const response = await fetch(uri, {
        headers: getHeaders(token),
        method: 'POST'
    });

    if (response.ok) return (await response.json());
    else throw(await response.json());
};


export const getShowProcesses = async (token: string): Promise<unknown> => {

    const uri = PATH + '/processes/show';

    const response = await fetch(uri, {
        headers: getHeaders(token),
        method: 'GET'
    });

    if (response.ok) return (await response.json());
    else throw(await response.json());
};
