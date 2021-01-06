import React, { useState, ReactElement } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import ProjectOverview from './overview/ProjectOverview';
import Download from './download/Download';
import Project from './project/Project';
import ResourceRedirect from '../ResourceRedirect';
import Manual from './manual/Manual';
import FieldNav from '../shared/navbar/FieldNav';
import LoginForm from '../shared/loginform/LoginForm';
import ImageView from '../shared/image/ImageView';
import Contact from './contact/Contact';
import { doLogout } from '../logout';
import { getPersistedLogin } from '../login';
import { LoginContext } from '../App';

export default function Field(): ReactElement {

    const [loginData, setLoginData] = useState(getPersistedLogin());

    return (
        <LoginContext.Provider value={ loginData}>
            <FieldNav onLogout={ doLogout(setLoginData)}/>
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
        </LoginContext.Provider>
    );
}
