import React, { Fragment, ReactElement, useState } from 'react';
import { Redirect, Route, Switch } from 'react-router';
import Navbar from './shared/navbar/Navbar';
import { doLogout } from './logout';
import { getPersistedLogin } from './login';
import { AppNames } from './apps';
import { shapesBasepath } from './constants';

export default function Shapes(): ReactElement {
    const [loginData, setLoginData] = useState(getPersistedLogin());

    return (
        <Fragment>
            <Navbar onLogout={ doLogout(setLoginData)} />
            <Switch>
                <Route path={ `${shapesBasepath}/browseSelect`} render ={ () => <h1>Browse and Select</h1>} />
                <Redirect from={ `${shapesBasepath}`} exact to={ `${shapesBasepath}/browseSelect` } />
                <Route render={ () => <p>Nobody here</p>} />
            </Switch>
        </Fragment >
    );
}
