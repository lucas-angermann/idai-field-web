import React from 'react';
import { Switch, Route, useRouteMatch, useParams } from 'react-router-dom';
import ProjectHome from './ProjectHome';
import ProjectMap from './ProjectMap';
import Document from '../document/Document';

export default function Project() {

    const { id } = useParams();
    const { path } = useRouteMatch();

    return (
        <div>
            <Switch>
                <Route path={ `${path}/:id` }>
                    <ProjectHome id={ id } />
                </Route>
            </Switch>
            <div key="results">
                <ProjectMap id={ id } />
            </div>
        </div>
    );

}
