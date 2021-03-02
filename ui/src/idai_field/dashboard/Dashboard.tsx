import React, { CSSProperties, ReactElement, useContext, useEffect, useState } from 'react';
import { getReadableProjects } from '../../api/auth';
import { getShowTasks, postStopTask } from '../../api/worker';
import { LoginContext } from '../../shared/login';
import Tasks from './Tasks';


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
        <div className="col-md-6">
            <p style={ paragraphStyle }>{ 'Projects'}
            </p>
            <div>
                { projects.map((project, index) =>
                    (<div key={ index } style={ projectRowStyle }>
                        <div style={ projectNameStyle }>
                            { project }</div>
                        <Tasks project={ project }
                            token={ loginData.token }
                            setStat={ setStat }></Tasks>
                        { project !== 'All projects'
                            ? <div style={ projectButtonsStyle2 }>
                                <span className="btn"
                                    style={ rStyle }
                                    onClick={
                                        () => (postStopTask(loginData.token, project)).then(setStat)
                                    }>
                                    Stop
                                </span>
                            </div>
                            : <div style={ projectButtonsStyle2 }>
                                <span className="btn"
                                    style={ rStyle }
                                    onClick={
                                        () => (getShowTasks(loginData.token)).then(setStat)
                                    }>
                                    Info
                                </span>
                            </div>
                        }
                    </div>)
                )}
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


const projectRowStyle: CSSProperties = {
    height: '96px',
    position: 'relative'
};


const projectNameStyle: CSSProperties = {
    width: '200px',
    left: '0px',
    top: '0px',
    height: '44px',
    position: 'relative'
};


const projectButtonsStyle2: CSSProperties = {
    left: '140px',
    top: '0px',
    height: '22px',
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


const headingStyle: CSSProperties = {
    paddingTop: '10px',
    paddingBottom: '13px',
    textAlign: 'center',
    marginBottom: '15px'
};


const paragraphStyle: CSSProperties = {
    height: '64px',
    width: '1000px',
    marginRight: 'auto',
    marginLeft: 'auto'
};
