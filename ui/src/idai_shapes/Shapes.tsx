import React, { ReactElement, useEffect, useState } from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { LoginContext } from '../App';
import { shapesBasepath } from '../constants';
import { getPersistedLogin } from '../login';
import { doLogout } from '../logout';
import ShapesNav from '../shared/navbar/ShapesNav';
import BrowseSelect from './browseselect/BrowseSelect';

export default function Shapes(): ReactElement {
    
    const [loginData, setLoginData] = useState(getPersistedLogin());

    useEffect(() => {

        document.title = 'iDAI.shapes'
    }, []);

    return (
        <BrowserRouter>
            <LoginContext.Provider value={ loginData}>
                <ShapesNav onLogout={ doLogout(setLoginData)} />
                <Switch>
                    <Route path={ `${shapesBasepath}/browseSelect/:documentId?`} component={ BrowseSelect} />
                    <Redirect from={ `${shapesBasepath}`} exact to={ `${shapesBasepath}/browseSelect` } />
                    <Route render={ () => <p>Nobody here</p>} />
                </Switch>
            </LoginContext.Provider>
        </BrowserRouter>
    );
}
