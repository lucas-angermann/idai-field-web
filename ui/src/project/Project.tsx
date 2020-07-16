import React from 'react';
import { Switch, Route, useRouteMatch, useParams } from 'react-router-dom';
import ProjectHome from './ProjectHome';
import ProjectMap from './ProjectMap';
import DocumentInfo from './DocumentInfo';

export default function Project() {

    const { id } = useParams();
    const { path } = useRouteMatch();

    return (
        <div>
            <Switch>
                <Route path={ `${path}:project_id/document/:id` } component={ DocumentInfo } />
                <Route>
                    <ProjectHome id={ id } />
                </Route>
            </Switch>
            <div key="results">
                <ProjectMap id={ id } />
            </div>
        </div>
    );

}
