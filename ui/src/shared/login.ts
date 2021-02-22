import React from 'react';
import { clone } from 'tsfun/struct';

const LOGIN_DATA = 'loginData';

export interface LoginData {
    user: string;
    token: string;
    isAdmin: boolean;
    readableProjects: string[];
}


export const ANONYMOUS_USER: LoginData = {
    user: 'anonymous',
    token: '',
    isAdmin: false,
    readableProjects: []
};


export const postLogin = async (user: string, password: string): Promise<LoginData> => {

    try {
        const signInResponse = await fetch('/api/auth/sign_in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: user, pass: password })
        });
        const token = (await signInResponse.json()).token;

        const infoResponse = await fetch('/api/auth/info', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });
        const infoJson = await infoResponse.json();

        return {
            user,
            token: token,
            isAdmin: infoJson.is_admin,
            readableProjects: infoJson.readable_projects
        };
    } catch (_) {
        return null;
    }
};


export const persistLogin = (loginData: LoginData): void =>
    localStorage.setItem(LOGIN_DATA, JSON.stringify(loginData));


export const forgetLogin = (): void => localStorage.removeItem(LOGIN_DATA);


export const getLoginData = (): LoginData => {

    const loginDataValue = localStorage.getItem(LOGIN_DATA);
    if (!loginDataValue) return ANONYMOUS_USER;
    return JSON.parse(loginDataValue);
};

export const doLogout = (setLoginData: (_: LoginData) => void) => (): void => {
    forgetLogin();
    setLoginData(ANONYMOUS_USER); 
    // TODO use opportunity to refresh anonymous users rights; supposedly this has to be then asynchronous
};


export const LoginContext = React.createContext(ANONYMOUS_USER);


export const setAnonymousUserRights = async (): Promise<void> => {

    const loginDataValue = localStorage.getItem(LOGIN_DATA);
    if (loginDataValue) return;

    const response = await fetch('/api/auth/info', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.status !== 200) return;

    const infoJson = await response.json();

    const anonymous = clone(ANONYMOUS_USER);
    anonymous.readableProjects = infoJson.readable_projects;
    anonymous.isAdmin = infoJson.is_admin;
    
    persistLogin(anonymous);
};
