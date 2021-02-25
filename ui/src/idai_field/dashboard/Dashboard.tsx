import React, { CSSProperties, ReactElement, useContext, useEffect, useState } from 'react';
import { getReadableProjects } from '../../api/documents';
import { NAVBAR_HEIGHT } from '../../constants';
import { LoginContext } from '../../shared/login';


export default function Dashboard(): ReactElement {

    const loginData = useContext(LoginContext);
    const [projects, setProjects] = useState<string[]>([]);
    
    useEffect(() => {

        getReadableProjects(loginData.token).then(setProjects);
    }, [loginData]);

    return (<div>
        { loginData.isAdmin === true &&
            <div style={ pageStyle }>
                <h3 style={ headingStyle }>{ 'Dashboard' }</h3>
                <p style={ paragraphStyle }>{ 'Projects'}</p>
                <ul>
                    { projects.map((project, index) => {
                        return <li key={ index }>{ project }</li>;
                    })}
                </ul>
            </div>
        } </div>);
}


const pageStyle: CSSProperties = {
    height: 'calc(100vh - ' + NAVBAR_HEIGHT + 'px)',
    overflowY: 'scroll',
    padding: '15px'
};


const headingStyle: CSSProperties = {
    textAlign: 'center',
    marginBottom: '15px'
};


const paragraphStyle: CSSProperties = {
    width: '1000px',
    marginRight: 'auto',
    marginLeft: 'auto'
};
