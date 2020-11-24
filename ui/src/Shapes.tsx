import React, { Fragment, ReactElement, useState } from 'react';
import Navbar from './shared/navbar/Navbar';

import { doLogout } from './logout';
import { getPersistedLogin } from './login';

export default function Shapes(): ReactElement {
    const [loginData, setLoginData] = useState(getPersistedLogin());

    return (
        <Fragment>
            <Navbar
                onLogout={ doLogout(setLoginData)}
                title={ <Fragment>iDAI.<strong>shapes</strong></Fragment>}/>
            <h1>iDAI Shapes</h1>
        </Fragment>
    );
}
