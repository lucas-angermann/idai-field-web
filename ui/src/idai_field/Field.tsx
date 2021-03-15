import React, { ReactElement, useEffect, useState } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import ImageView from '../shared/image/ImageView';
import { doLogout, getLoginData, LoginContext } from '../shared/login';
import LoginForm from '../shared/loginform/LoginForm';
import Contact from './contact/Contact';
import Dashboard from './dashboard/Dashboard';
import DocumentRedirect from './DocumentRedirect';
import Download from './download/Download';
import Manual from './manual/Manual';
import FieldNav from './navbar/FieldNav';
import ProjectOverview from './overview/ProjectOverview';
import Project from './project/Project';
import ProjectHome from './project/ProjectHome';
import ResourceRedirect from './ResourceRedirect';


export default function Field(): ReactElement {

    const [loginData, setLoginData] = useState(getLoginData());

    useEffect(() => {

        document.title = 'iDAI.field';
    }, []);

    return (
        <BrowserRouter>
            <LoginContext.Provider value={ loginData }>
                <FieldNav onLogout={ doLogout(setLoginData) } />
                <Switch>
                    <Route path="/resource/:project/:identifier" component={ ResourceRedirect } />
                    <Redirect from="/resources/:project/:identifier" to="/resource/:project/:identifier" />

                    <Route path="/project/:projectId/entry" exact component={ ProjectHome } />
                    <Route path="/project/:projectId/:documentId?" component={ Project } />
                    <Redirect from="/projects/:projectId/:documentId" to="/project/:projectId/:documentId" />

                    <Route path="/document/:id" component={ DocumentRedirect } />
                    <Redirect from="/documents/:id" to="/document/:id" />

                    <Route path="/download" component={ Download } />

                    <Route path="/manual" component={ Manual } />

                    <Route path="/contact" component={ Contact } />

                    <Route path="/dashboard" component={ Dashboard } />

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
