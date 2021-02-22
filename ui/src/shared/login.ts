import React from 'react';
import { clone } from 'tsfun/struct';

const LOGIN_DATA = 'loginData';

export interface LoginData {
    user: string;
    token: string;
    admin: boolean;
    readable_projects: string[];
}


export const ANONYMOUS_USER: LoginData = {
    user: 'anonymous',
    token: '',
    admin: false,
    readable_projects: []
};


export const postLogin = async (user: string, password: string): Promise<LoginData> => {

    try {
        const sign_in_response = await fetch('/api/auth/sign_in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: user, pass: password })
        });
        const token = (await sign_in_response.json()).token;

        const info_response = await fetch('/api/auth/info', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });
        const info_json = await info_response.json();

        return {
            user,
            token: token,
            admin: info_json.admin,
            readable_projects: info_json.readable_projects
        };
    } catch (_) {
        return null;
    }
};


export const persistLogin = (loginData: LoginData): void =>
    localStorage.setItem(LOGIN_DATA, JSON.stringify(loginData));


export const forgetLogin = (): void => localStorage.removeItem(LOGIN_DATA);


export const getFallbackLoginData = (): LoginData => ANONYMOUS_USER;


export const getLoginData = async (): Promise<LoginData> => {

    const loginDataValue = localStorage.getItem(LOGIN_DATA);
    if (!loginDataValue) return await fetchAnonymousUserRights();
    return JSON.parse(loginDataValue);
};

export const doLogout = (setLoginData: (_: LoginData) => void) => (): void => {
    forgetLogin();
    setLoginData(ANONYMOUS_USER);
};


export const LoginContext = React.createContext(ANONYMOUS_USER);


const fetchAnonymousUserRights = async () => {

    const info_response = await fetch('/api/auth/info', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const info_json = await info_response.json();

    const anon = clone(ANONYMOUS_USER);
    anon.readable_projects = info_json.readable_projects;
    anon.admin = info_json.admin;
    return anon;
};
