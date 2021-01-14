import React, { ReactElement, useEffect, useState } from 'react';
import { Route, Switch } from 'react-router';
import { BrowserRouter, useRouteMatch } from 'react-router-dom';
import { LoginContext } from '../App';
import { getPersistedLogin } from '../login';
import { doLogout } from '../logout';
import ShapesNav from '../shared/navbar/ShapesNav';
import NotFound from '../shared/NotFound';
import BrowseSelect from './browse/Browse';
import Home from './home/Home';

export default function Shapes(): ReactElement {
    
    const [loginData, setLoginData] = useState(getPersistedLogin());
    const match = useRouteMatch();


    useEffect(() => {

        document.title = 'iDAI.shapes';
    }, []);

    const baseUrl = match.path || '/';

    return (
        <BrowserRouter>
            <LoginContext.Provider value={ loginData }>
                <ShapesNav onLogout={ doLogout(setLoginData) } />
                <Switch>
                    <Route path={ baseUrl } exact component={ Home } />
                    <Route path={ `${baseUrl}document/:documentId?` } component={ BrowseSelect } />
                    <Route component={ NotFound } />
                </Switch>
            </LoginContext.Provider>
        </BrowserRouter>
    );
}
