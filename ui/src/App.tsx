import React, { useState, ReactElement, useEffect } from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import Modal from 'react-modal';
import { ANONYMOUS_USER, getPersistedLogin } from './login';
import Field from './Field';
import Shapes from './Shapes';


export const LoginContext = React.createContext(ANONYMOUS_USER);


export default function App(): ReactElement {

    const [loginData, setLoginData] = useState(getPersistedLogin());

    useEffect(() => {
        Modal.setAppElement('#root');
    });

    return (
        <LoginContext.Provider value={ loginData }>
            <div>
                <BrowserRouter>
                    <Switch>
                        <Route path="/idaishapes" component={ Shapes }/>
                        <Route component={ Field} />
                    </Switch>
                </BrowserRouter>
            </div>
        </LoginContext.Provider>
    );
}

