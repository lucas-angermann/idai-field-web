import React, { ReactElement, useEffect, useState } from 'react';
import { Route, Switch } from 'react-router';
import { BrowserRouter, useRouteMatch } from 'react-router-dom';
import { getPersistedLogin, LoginContext } from '../login';
import { doLogout } from '../logout';
import LoginForm from '../shared/loginform/LoginForm';
import NotFound from '../shared/NotFound';
import Browse from './browse/Browse';
import Home from './home/Home';
import ShapesNav from './navbar/ShapesNav';


export default function Shapes(): ReactElement {
    
    const [loginData, setLoginData] = useState(getPersistedLogin());

    useEffect(() => {

        document.title = 'iDAI.shapes';
    }, []);

    let baseUrl = '/';
    try {
        const match = useRouteMatch();
        baseUrl = match.path;
    } catch(e) {
        // component is root component -> eat error
    }

    return (
        <BrowserRouter>
            <LoginContext.Provider value={ loginData }>
                <ShapesNav onLogout={ doLogout(setLoginData) } />
                <Switch>
                    <Route path={ baseUrl } exact component={ Home } />
                    <Route path={ `${baseUrl}document/:documentId?` } component={ Browse } />
                    <Route path={ '/login' }>
                        <LoginForm onLogin={ setLoginData } />
                    </Route>
                    <Route component={ NotFound } />
                </Switch>
            </LoginContext.Provider>
        </BrowserRouter>
    );
}
