import React, { ReactElement } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import Field from './idai_field/Field';
import Shapes from './idai_shapes/Shapes';
import { ANONYMOUS_USER } from './login';


export const LoginContext = React.createContext(ANONYMOUS_USER);


export default function App(): ReactElement {

    return (
        <div>
            <BrowserRouter>
                <Switch>
                    <Redirect from="/idaishapes" to="/idaishapes/" exact strict />
                    <Route path="/idaishapes/" component={ Shapes } strict />
                    <Route component={ Field } />
                </Switch>
            </BrowserRouter>
        </div>
    );
}
