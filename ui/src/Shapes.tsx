import React, { Fragment, ReactElement, useState } from 'react';
import Navbar from './shared/navbar/Navbar';

import { doLogout } from './logout';
import { getPersistedLogin } from './login';
import { AppNames } from './apps';

export default function Shapes(): ReactElement {
    const [loginData, setLoginData] = useState(getPersistedLogin());

    return (
        <Fragment>
            <Navbar
                onLogout={ doLogout(setLoginData)}
                app={ AppNames.iDAIShapes}/>
            <h1>iDAI Shapes</h1>
        </Fragment>
    );
}
