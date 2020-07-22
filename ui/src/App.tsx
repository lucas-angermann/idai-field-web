import React, { useState } from 'react';
import { Switch, Route, BrowserRouter, Redirect } from 'react-router-dom';
import ProjectOverview from './overview/ProjectOverview';
import Download from './download/Download';
import Document from './document/Document';
import Project from './project/Project';
import ResourceRedirect from './ResourceRedirect';
import Manual from './manual/Manual';
import Navbar from './Navbar';
import LoginForm from './LoginForm';
import { ANONYMOUS_USER, getPersistedLogin, forgetLogin, LoginData } from './login';


export const LoginContext = React.createContext(ANONYMOUS_USER);


export default function App() {

    const [loginData, setLoginData] = useState(getPersistedLogin());

    return (
        <LoginContext.Provider value={ loginData }>
            <div>
                <BrowserRouter>
                    <Navbar onLogout={ doLogout(setLoginData) } />
                    <Switch>

                        <Route path="/resource/:project/:identifier" component={ ResourceRedirect } />
                        <Redirect from="/resources/:project/:identifier" to="/resource/:project/:identifier" />

                        <Route path="/document/:id" component={ Document } />
                        <Redirect from="/documents/:id" to="/document/:id" />

                        <Route path="/project/:projectId/:documentId?" component={ Project } />
                        <Redirect from="/projects/:id" to="/project/:id" />

                        <Route path="/download" component={ Download } />

                        <Route path="/manual" component={ Manual } />

                        <Route path="/login">
                            <LoginForm onLogin={ setLoginData } />
                        </Route>

                        <Route path="/" component={ ProjectOverview } />

                    </Switch>
                </BrowserRouter>
            </div>
        </LoginContext.Provider>
    );
}

const doLogout = (setLoginData: (_: LoginData) => void) => () : void => {

    forgetLogin();
    setLoginData(ANONYMOUS_USER);
};
