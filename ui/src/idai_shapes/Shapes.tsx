import React, { ReactElement, useEffect, useState } from 'react';
import { Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { LoginContext } from '../App';
import { getPersistedLogin } from '../login';
import { doLogout } from '../logout';
import ShapesNav from '../shared/navbar/ShapesNav';
import BrowseSelect from './browseselect/BrowseSelect';

export default function Shapes({ match }: { match?: any }): ReactElement {
    
    const [loginData, setLoginData] = useState(getPersistedLogin());

    useEffect(() => {

        document.title = 'iDAI.shapes';
    }, []);

    const baseUrl = match?.url || '';

    return (
        <BrowserRouter>
            <LoginContext.Provider value={ loginData }>
                <ShapesNav onLogout={ doLogout(setLoginData) } baseUrl={ baseUrl }/>
                <Switch>
                    <Route path={ `${baseUrl}/:documentId?` } component={ BrowseSelect } />
                </Switch>
            </LoginContext.Provider>
        </BrowserRouter>
    );
}
