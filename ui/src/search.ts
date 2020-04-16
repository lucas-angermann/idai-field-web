export const search = async (query: String): Promise<any> => {

    const response = await fetch(`/resources/?q=${query}`);
    return await response.json();
}
