export const search = async (query: String): Promise<any> => {

    const response = await fetch(`/resources/?q=${query}&size=2000`);
    return await response.json();
};
