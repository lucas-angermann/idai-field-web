import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import MapSearch from './MapSearch';
import Download from './Download';


export default () => {

    return <BrowserRouter>
        <Switch>
            <Route path="/download">
                <Download />
            </Route>
            <Route path="/">
                <MapSearch />
            </Route>
        </Switch>
    </BrowserRouter>;
};