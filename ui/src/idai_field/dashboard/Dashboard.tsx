import React, { CSSProperties, ReactElement, useContext, useEffect, useState } from 'react';
import { getReadableProjects } from '../../api/auth';
import { getShowTasks, postConvert, postReindex, postStopTask, postTiling } from '../../api/worker';
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
                                    onClick={ () => (postReindex(loginData.token, project) as any).then(setStat) }>Reindex</span>
                            </div>
                            <div style={ projectButtonsStyle0 }>
                                <span className="btn" style={ rStyle }
                                    onClick={ () => (postConvert(loginData.token, project) as any).then(setStat) }>Convert</span>
                            </div>
                            <div style={ projectButtonsStyle1 }>
                                <span className="btn" style={ rStyle }
                                    onClick={ () => (postTiling(loginData.token, project) as any).then(setStat) }>Tiling</span>
                            </div>
                            { project !== 'All projects' ? <div style={ projectButtonsStyle2 }>
                                <span className="btn" style={ rStyle }
                                    onClick={ () => (postStopTask(loginData.token, project) as any).then(setStat) }>Stop</span>
                            </div> : 
                            <div style={ projectButtonsStyle2 }>
                                <span className="btn" style={ rStyle }
                                    onClick={ () => (getShowTasks(loginData.token) as any).then(setStat) }>Info</span>
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
    left: '140px',
    top: '0px',
    height: '44px',
    width: '100px',
    position: 'absolute',
};


const projectButtonsStyle0: CSSProperties = {
    left: '210px',
    top: '0px',
    height: '44px',
    width: '100px',
    position: 'absolute',
};


const projectButtonsStyle1: CSSProperties = {
    left: '280px',
    top: '0px',
    height: '44px',
    width: '100px',
    position: 'absolute',
};


const projectButtonsStyle2: CSSProperties = {
    left: '350px',
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
