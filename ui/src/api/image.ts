import { getHeaders } from './utils';

export const fetchImage = async (project: string,
                                 id: string,
                                 maxWidth: number,
                                 maxHeight: number,
                                 token: string): Promise<string> => {

    const response = await fetch(getImageUrl(project, id, maxWidth, maxHeight), { headers: getHeaders(token) });
    if (response.ok) return URL.createObjectURL(await response.blob());
    else throw (await response.json());
};


const getImageUrl = (project: string, id: string, maxWidth: number, maxHeight: number) =>
    `/api/images/${project}/${id}${true /* if production */ ? '.jp2' : ''}/full%2F!${maxWidth},${maxHeight}%2F0%2Fdefault.jpg`;
