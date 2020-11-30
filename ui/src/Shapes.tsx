import React, { Fragment, ReactElement, useState } from 'react';
import { Redirect, Route, Switch } from 'react-router';
import Navbar from './shared/navbar/Navbar';
import { doLogout } from './logout';
import { getPersistedLogin } from './login';
import { shapesBasepath } from './constants';
import BrowseSelect from './idai_shapes/browseselect/BrowseSelect';

export default function Shapes(): ReactElement {
    const [loginData, setLoginData] = useState(getPersistedLogin());

    return (
        <Fragment>
            <Navbar onLogout={ doLogout(setLoginData)} />
            <Switch>
                <Route path={ `${shapesBasepath}/browseSelect/:documentId?`} component={ BrowseSelect} />
                <Redirect from={ `${shapesBasepath}`} exact to={ `${shapesBasepath}/browseSelect` } />
                <Route render={ () => <p>Nobody here</p>} />
            </Switch>
        </Fragment >
    );
}
