import React, { useState, ReactElement, useEffect } from 'react';
import { Switch, Route, BrowserRouter, Redirect } from 'react-router-dom';
import Modal from 'react-modal';
import ProjectOverview from './overview/ProjectOverview';
import Download from './download/Download';
import Project from './project/Project';
import ResourceRedirect from './ResourceRedirect';
import Manual from './manual/Manual';
import Navbar from './Navbar';
import LoginForm from './LoginForm';
import ImageView from './image/ImageView';
import { ANONYMOUS_USER, getPersistedLogin, forgetLogin, LoginData } from './login';
import Contact from './Contact';


export const LoginContext = React.createContext(ANONYMOUS_USER);


export default function App(): ReactElement {

    const [loginData, setLoginData] = useState(getPersistedLogin());

    useEffect(() => {
        Modal.setAppElement('#root');
    });

    return (
        <LoginContext.Provider value={ loginData }>
            <div>
                <BrowserRouter>
                    <Navbar onLogout={ doLogout(setLoginData) } />
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
                </BrowserRouter>
            </div>
        </LoginContext.Provider>
    );
}

const doLogout = (setLoginData: (_: LoginData) => void) => (): void => {

    forgetLogin();
    setLoginData(ANONYMOUS_USER);
};
