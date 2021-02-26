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


export const postStopReindex = async (token: string, project: string): Promise<unknown> => {

    const uri = PATH + '/reindex/' + project + '/stop';

    const response = await fetch(uri, {
        headers: getHeaders(token),
        method: 'POST'
    });

    if (response.ok) return (await response.json());
    else throw(await response.json());
};


export const getShowInfo = async (token: string): Promise<unknown> => {

    const uri = PATH + '/reindex';

    const response = await fetch(uri, {
        headers: getHeaders(token),
        method: 'GET'
    });

    if (response.ok) return (await response.json());
    else throw(await response.json());
};
