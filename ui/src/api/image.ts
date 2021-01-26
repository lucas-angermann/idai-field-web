import { Result } from './result';
import { getHeaders } from './utils';

export const fetchImage = async (project: string,
                                 id: string,
                                 maxWidth: number,
                                 maxHeight: number,
                                 token: string): Promise<string> => {

    const imageUrl = getImageUrl(project, `${id}.jp2`, maxWidth, maxHeight, token);
    const response = await fetch(imageUrl);
    if (response.ok) return URL.createObjectURL(await response.blob());
    else throw (await response.json());
};


export const getImageUrl = (project: string, path: string, maxWidth: number,
        maxHeight: number, token: string, format = 'jpg'): string => {

    const token_ = token === undefined || token === '' ? 'anonymous' : token;
    return `/api/images/${project}/${encodeURIComponent(path)}/`
        + `${token_}/full/!${maxWidth},${maxHeight}/0/default.${format}`;
};


export const makeUrl = (project: string, id: string, token?: string): string => {

    const token_ = token === undefined || token === '' ? 'anonymous' : token;
    return `/api/images/${project}/${id}.jp2/${token_}/info.json`;
};


export const getSimilar = async (id: string, token: string, size: number = 20): Promise<Result> => {
    
    const uri = `/api/images/similar/resnet/${id}?size=${size}`;
    const response = await fetch(uri, { headers: getHeaders(token) });
    if (response.ok) return await response.json();
    else throw(await response.json());
};
