import { getHeaders } from './utils';

export const fetchImage = async (id: string, token: string): Promise<string> => {

    const response = await fetch(`/api/images/${id}`, { headers: getHeaders(token) });
    if (response.ok) return URL.createObjectURL(await response.blob());
    else throw (await response.json());
};
