import { getHeaders } from './utils';


export const getReadableProjects = async (token: string): Promise<string[]> => {

    const response = await fetch('/api/auth/info', { headers: getHeaders(token) });
    if (response.ok) return (await response.json())['readable_projects'];
    else throw(await response.json());
};
