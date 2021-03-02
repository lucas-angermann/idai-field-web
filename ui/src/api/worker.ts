import { getHeaders } from './utils';


const PATH = '/api/worker/';


export const postReindex = async (token: string, project: string): Promise<unknown> =>
    postTask(token, 'reindex', project);


export const postConvert = async (token: string, project: string): Promise<unknown> =>
    postTask(token, 'convert', project);


export const postTiling = async (token: string, project: string): Promise<unknown> => 
    postTask(token, 'tiling', project);


export const postTask = async (token: string, endpoint: string, project: string): Promise<string[]> => {

    const uri = project === 'All projects' 
        ? PATH + '/' + endpoint
        : PATH + '/' + endpoint + '/' + project;

    const response = await fetch(uri, {
        headers: getHeaders(token),
        method: 'POST'
    });

    if (response.ok) {
        const json = await response.json();
        const msg = ['Project: ' + project, 'Task: ' + endpoint,
            'Status:', json['status'], 'Message:', json['message']];
        return msg;
    }
    else throw(await response.json());
};


export const postStopTask = async (token: string, project: string): Promise<string[]> => {

    const uri = PATH + '/tasks/stop/' + project;

    const response = await fetch(uri, {
        headers: getHeaders(token),
        method: 'POST'
    });

    if (response.ok) {
        const json = await response.json();
        return ['Project: ' + project, 'Task: Reindex',
            'Status:', json['status'], 'Message:', json['message']]
    }
    else throw(await response.json());
};


export const getShowTasks = async (token: string): Promise<string[]> => {

    const uri = PATH + '/tasks/show';

    const response = await fetch(uri, {
        headers: getHeaders(token),
        method: 'GET'
    });

    if (response.ok) {
        const json = await response.json();
        return ['Server', 'Task: Show running tasks',
            'Status:', json['status'], 'Currently running:', 
            json?.['message'].length > 0 
                ? json['message'].join(', ') 
                : 'No processes'
            ]
    }
    else throw(await response.json());
};
