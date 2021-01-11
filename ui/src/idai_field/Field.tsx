import React, { ReactElement, useEffect, useState } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { LoginContext } from '../App';
import { getPersistedLogin } from '../login';
import { doLogout } from '../logout';
import ImageView from '../shared/image/ImageView';
import LoginForm from '../shared/loginform/LoginForm';
import FieldNav from '../shared/navbar/FieldNav';
import Contact from './contact/Contact';
import Download from './download/Download';
import Manual from './manual/Manual';
import ProjectOverview from './overview/ProjectOverview';
import Project from './project/Project';
import ResourceRedirect from './ResourceRedirect';

export default function Field(): ReactElement {

    const [loginData, setLoginData] = useState(getPersistedLogin());

    useEffect(() => {

        document.title = 'iDAI.field';
    }, []);

    return (
        <BrowserRouter>
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
        </BrowserRouter>
    );
}
