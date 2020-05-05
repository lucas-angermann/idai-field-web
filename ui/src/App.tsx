import React from 'react';
import { Switch, Route, BrowserRouter, Redirect } from 'react-router-dom';
import ProjectOverview from './ProjectOverview';
import Download from './Download';
import Document from './Document';
import Project from './Project';
import ResourceRedirect from './ResourceRedirect';
import Manual from './Manual';


export default () => {

    return <BrowserRouter>
        <Switch>

            <Route path="/resource/:project/:identifier" component={ ResourceRedirect } />
            <Redirect from="/resources/:project/:identifier" to="/resource/:project/:identifier" />

            <Route path="/document/:id" component={ Document } />
            <Redirect from="/documents/:id" to="/document/:id" />

            <Route path="/project/:id" component={ Project } />
            <Redirect from="/projects/:id" to="/project/:id" />

            <Route path="/download" component={ Download } />

            <Route path="/manual" component={ Manual } />

            <Route path="/" component={ ProjectOverview } />

        </Switch>
    </BrowserRouter>;
};
