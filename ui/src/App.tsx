import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import ProjectOverview from './ProjectOverview';
import Download from './Download';
import Document from './Document';
import Project from './Project';


export default () => {

    return <BrowserRouter>
        <Switch>
            <Route path="/documents/:id" component={ Document } />
            <Route path="/projects/:id" component={ Project } />
            <Route path="/download" component={ Download } />
            <Route path="/" component={ ProjectOverview } />
        </Switch>
    </BrowserRouter>;
};
