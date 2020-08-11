export const fetchImage = async (project: string, id: string, maxWidth: number, maxHeight: number): Promise<string> => {

    const response = await fetch(getImageUrl(project, id, maxWidth, maxHeight));
    if (response.ok) return URL.createObjectURL(await response.blob());
    else throw (await response.json());
};


const getImageUrl = (project: string, id: string, maxWidth: number, maxHeight: number) =>
    `https://images.idai.world/iiif/2/${project}%2F${id}.jp2/full/!${maxWidth},${maxHeight}/0/default.jpg`;
