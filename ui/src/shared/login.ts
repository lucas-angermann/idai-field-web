import React from 'react';

export interface LoginData {
    user: string;
    token: string;
    admin: boolean;
}


export const ANONYMOUS_USER: LoginData = {
    user: 'anonymous',
    token: '',
    admin: false
};


export const postLogin = async (user: string, password: string): Promise<LoginData> => {

    try {
        const response = await fetch('/api/auth/sign_in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: user, pass: password })
        });
        const json = await response.json();
        return {
            user,
            token: json.token,
            admin: json.admin
        };
    } catch (_) {
        return null;
    }
};


export const persistLogin = (loginData: LoginData): void =>
    localStorage.setItem('loginData', JSON.stringify(loginData));


export const forgetLogin = (): void => localStorage.removeItem('loginData');


export const getPersistedLogin = (): LoginData => {

    const loginDataValue = localStorage.getItem('loginData');
    if (!loginDataValue) return ANONYMOUS_USER;
    return JSON.parse(loginDataValue);
};

export const doLogout = (setLoginData: (_: LoginData) => void) => (): void => {
    forgetLogin();
    setLoginData(ANONYMOUS_USER);
};


export const LoginContext = React.createContext(ANONYMOUS_USER);
