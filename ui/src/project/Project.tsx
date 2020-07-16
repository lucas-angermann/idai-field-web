import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import ProjectHome from './ProjectHome';

export default function Project() {

    const { path } = useRouteMatch();

    return (
        <Switch>
            <Route path={ `${path}/:id` } component={ ProjectHome } />
        </Switch>
    );

}
