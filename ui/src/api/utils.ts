export const getHeaders = (token: string) => {
    if (token) return { 'Authorization': `Bearer ${token}`};
    else return { };
};
