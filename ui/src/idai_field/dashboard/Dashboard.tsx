import React, { CSSProperties, ReactElement, useContext, useEffect, useState } from 'react';
import { getReadableProjects, postReindex } from '../../api/documents';
import { NAVBAR_HEIGHT } from '../../constants';
import { LoginContext } from '../../shared/login';


export default function Dashboard(): ReactElement {

    const loginData = useContext(LoginContext);
    const [projects, setProjects] = useState<string[]>([]);
    const [stat, setStat] = useState<string>('');
    
    useEffect(() => {

        getReadableProjects(loginData.token).then(setProjects);
    }, [loginData]);

    return (<div>
        { stat !== '' && <div>{ stat }</div> }
        { loginData.isAdmin === true &&
            <div style={ pageStyle }>
                <h3 style={ headingStyle }>{ 'Dashboard' }</h3>
                <p style={ paragraphStyle }>{ 'Projects'}
                    <span className="btn"
                    onClick={ () => triggerReindex(loginData.token, setStat, '') }>Reindex all</span>
                </p>
                <ul>
                    { projects.map((project, index) => {
                        return <li key={ index }>{ project }
                            <span className="btn"
                            onClick={ () => triggerReindex(loginData.token, setStat, project) }>Reindex</span>
                        </li>;
                    })}
                </ul>
            </div>
        } </div>);
}


const triggerReindex = async (token: string,
    setStat: (s: string) => void, project: string): Promise<void> => {

    const response = await postReindex(token, project);
    setStat('response: ' + JSON.stringify(response));
};


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
