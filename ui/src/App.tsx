import React, {  ReactElement, useEffect } from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import Modal from 'react-modal';
import { ANONYMOUS_USER } from './login';
import Field from './idai_field/Field';
import Shapes from './idai_shapes/Shapes';


export const LoginContext = React.createContext(ANONYMOUS_USER);


export default function App(): ReactElement {

    useEffect(() => {
        Modal.setAppElement('#root');
    });

    return (
        <div>
            <BrowserRouter>
                <Switch>
                    <Route path="/idaishapes" component={ Shapes }/>
                    <Route component={ Field} />
                </Switch>
            </BrowserRouter>
        </div>
    );
}

