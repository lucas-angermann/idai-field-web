import React, { ReactElement, useState } from 'react';
import { Redirect, Route, Switch } from 'react-router';
import Navbar from './shared/navbar/Navbar';
import { doLogout } from './logout';
import { getPersistedLogin } from './login';
import { shapesBasepath } from './constants';
import BrowseSelect from './idai_shapes/browseselect/BrowseSelect';
import { LoginContext } from './App';

export default function Shapes(): ReactElement {
    const [loginData, setLoginData] = useState(getPersistedLogin());

    return (
        <LoginContext.Provider value={ loginData}>
            <Navbar onLogout={ doLogout(setLoginData)} />
            <Switch>
                <Route path={ `${shapesBasepath}/browseSelect/:documentId?`} component={ BrowseSelect} />
                <Redirect from={ `${shapesBasepath}`} exact to={ `${shapesBasepath}/browseSelect` } />
                <Route render={ () => <p>Nobody here</p>} />
            </Switch>
        </LoginContext.Provider>
    );
}
