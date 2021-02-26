import React, { CSSProperties, ReactElement, useContext, useEffect, useState } from 'react';
import { getReadableProjects } from '../../api/auth';
import { getShowInfo, postReindex, postStopReindex } from '../../api/worker';
import { LoginContext } from '../../shared/login';


export default function Dashboard(): ReactElement {

    const loginData = useContext(LoginContext);
    const [projects, setProjects] = useState<string[]>([]);
    const [stat, setStat] = useState<string[]>([]);
    
    useEffect(() => {

        getReadableProjects(loginData.token).then(projects => {

            const allProjects = ['All projects'].concat(projects);
            setProjects(allProjects);
        });
    }, [loginData]);

    return (<div className="container">
        <h3 style={ headingStyle }>{ 'Dashboard' }</h3>
        <div className="row">
        { loginData.isAdmin === true &&
            <div style={ pageStyle } className="col-md-6">
                <p style={ paragraphStyle }>{ 'Projects'}
                </p>
                <div>
                    { projects.map((project, index) => {
                        return <div key={ index } style={ projectRowStyle }>
                            <div style={ projectNameStyle }>
                                { project }</div>
                            <div style={ projectButtonsStyle }>
                                <span className="btn" style={ rStyle }
                                    onClick={ () => triggerReindex(loginData.token, setStat, project) }>Reindex</span>
                            </div>
                            { project !== 'All projects' ? <div style={ projectButtonsStyle2 }>
                                <span className="btn" style={ rStyle }
                                    onClick={ () => triggerStopReindex(loginData.token, setStat, project) }>Stop</span>
                            </div> : 
                            <div style={ projectButtonsStyle2 }>
                                <span className="btn" style={ rStyle }
                                    onClick={ () => triggerShowInfo(loginData.token, setStat) }>Info</span>
                            </div>
                        }
                        </div>;
                    })}
                </div>
            </div>
        }
        <div className="col-md-6" style={ sideStyle }>
            { stat.length === 0 && 'idle...' }
            { stat.length !== 0 && stat.map((line, index) => {

                return <p key={ index }>{ line }</p>;

            }) }
        </div>
        </div></div>);
}


const triggerReindex = async (token: string,
    setStat: (s: string[]) => void, project: string): Promise<void> => {

    const response = await postReindex(token, project === 'All projects' ? '' : project);
    setStat(['Project: ' + project, 'Task: Reindex',
        'Status:', response['status'], 'Message:', response['message']]);
};


const triggerStopReindex = async (token: string,
    setStat: (s: string[]) => void, project: string): Promise<void> => {

    const response = await postStopReindex(token, project === 'All projects' ? '' : project);
    setStat(['Project: ' + project, 'Task: Reindex',
        'Status:', response['status'], 'Message:', response['message']]);
};


const triggerShowInfo = async (token: string, setStat: (s: string[]) => void): Promise<void> => {

    const response = await getShowInfo(token);
    setStat(['Server', 'Task: Show running reindex procecces',
        'Status:', response['status'], 'Currently running:', 
        response?.['message'].length > 0 
            ? response['message'].join(', ') 
            : 'No processes'
        ]);
}


const projectRowStyle: CSSProperties = {
    height: '44px',
    position: 'relative'
};


const projectNameStyle: CSSProperties = {
    width: '200px',
    left: '0px',
    top: '0px',
    height: '44px',
    position: 'relative'
};


const projectButtonsStyle: CSSProperties = {
    left: '200px',
    top: '0px',
    height: '44px',
    width: '100px',
    position: 'absolute',
};


const projectButtonsStyle2: CSSProperties = {
    left: '300px',
    top: '0px',
    height: '44px',
    width: 'calc(100vh - 200px)',
    position: 'absolute',
};



const rStyle: CSSProperties = {
    position: 'relative',
    left: '0px',
    top: '0px',
    padding: '0',
    color: 'green'
};


const sideStyle: CSSProperties = {

    paddingTop: '20px',
    fontFamily: 'monospace',
    color: 'white',
    backgroundColor: 'black',
    height: 'calc(100vh - 138px)'
};


const pageStyle: CSSProperties = {
};


const headingStyle: CSSProperties = {
    paddingTop: '10px',
    paddingBottom: '13px',
    textAlign: 'center',
    marginBottom: '15px'
};


const paragraphStyle: CSSProperties = {
    height: '100px',
    width: '1000px',
    marginRight: 'auto',
    marginLeft: 'auto'
};
