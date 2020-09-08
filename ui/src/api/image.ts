export const fetchImage = async (project: string,
                                 id: string,
                                 maxWidth: number,
                                 maxHeight: number,
                                 token: string): Promise<string> => {

    const imageUrl = getImageUrl(project, id, maxWidth, maxHeight, token);
    const response = await fetch(imageUrl);
    if (response.ok) return URL.createObjectURL(await response.blob());
    else throw (await response.json());
};


const getImageUrl = (project: string, id: string, maxWidth: number, maxHeight: number, token: string) =>
    `/api/images/${project}/${id}${false /* if production */ ? '.jp2' : ''}/${token}/full/!${maxWidth},${maxHeight}/0/default.jpg`;
