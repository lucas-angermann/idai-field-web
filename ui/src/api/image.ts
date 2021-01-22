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

    const token_ = token === undefined || token === "" ? 'anonymous' : token;
    return `/api/images/${project}/${encodeURIComponent(path)}/${token_}/full/!${maxWidth},${maxHeight}/0/default.${format}`;
}


export const makeUrl = (project: string, id: string, token?: string) => {

    const token_ = token === undefined || token === "" ? 'anonymous' : token;
    return `/api/images/${project}/${id}.jp2/${token_}/info.json`;
};