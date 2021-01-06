import React, { ReactElement } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Field from './idai_field/Field';
import Shapes from './idai_shapes/Shapes';
import { ANONYMOUS_USER } from './login';


export const LoginContext = React.createContext(ANONYMOUS_USER);


export default function App(): ReactElement {

    return (
        <div>
            <BrowserRouter>
                <Switch>
                    <Route path="/idaishapes" component={ Shapes }/>
                    <Route component={ Field } />
                </Switch>
            </BrowserRouter>
        </div>
    );
}
