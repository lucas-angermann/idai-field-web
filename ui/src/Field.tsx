import React, { useState, Fragment, ReactElement } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import ProjectOverview from './idai_field/overview/ProjectOverview';
import Download from './idai_field/download/Download';
import Project from './idai_field/project/Project';
import ResourceRedirect from './ResourceRedirect';
import Manual from './idai_field/manual/Manual';
import Navbar from './shared/navbar/Navbar';
import LoginForm from './shared/loginform/LoginForm';
import ImageView from './shared/image/ImageView';
import Contact from './idai_field/contact/Contact';

import { doLogout } from './logout';
import { getPersistedLogin } from './login';

export default function Field(): ReactElement {

    const [loginData, setLoginData] = useState(getPersistedLogin());

    return (
        <Fragment>
            <Navbar onLogout={ doLogout(setLoginData)}/>
            <Switch>
                <Route path="/resource/:project/:identifier" component={ ResourceRedirect } />
                <Redirect from="/resources/:project/:identifier" to="/resource/:project/:identifier" />

                <Route path="/project/:projectId/:documentId?" component={ Project } />
                <Redirect from="/projects/:id" to="/project/:id" />

                <Route path="/download" component={ Download } />

                <Route path="/manual" component={ Manual } />

                <Route path="/contact" component={ Contact } />

                <Route path="/login">
                    <LoginForm onLogin={ setLoginData } />
                </Route>

                <Route path="/image/:project/:id" component={ ImageView } />

                <Route path="/" component={ ProjectOverview } />
            </Switch>
        </Fragment>
    );
}
