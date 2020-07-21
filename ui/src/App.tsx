import React, { useState } from 'react';
import { Switch, Route, BrowserRouter, Redirect } from 'react-router-dom';
import ProjectOverview from './overview/ProjectOverview';
import Download from './download/Download';
import Document from './document/Document';
import Project from './project/Project';
import ResourceRedirect from './ResourceRedirect';
import Manual from './manual/Manual';
import Navbar from './Navbar';
import Login from './Login';


const anonymousUser = {
    user: 'anonymous',
    token: ''
};


export const JwtContext = React.createContext(anonymousUser);


export default () => {

    const [jwtToken, setJwtToken] = useState(anonymousUser);

    return (
        <JwtContext.Provider value={ jwtToken }>
            <div>
                <BrowserRouter>
                    <Navbar />
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
                            <Login onLogin={ setJwtToken } />
                        </Route>

                        <Route path="/" component={ ProjectOverview } />

                    </Switch>
                </BrowserRouter>
            </div>
        </JwtContext.Provider>
    );
};
