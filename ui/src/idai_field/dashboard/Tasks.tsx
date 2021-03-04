import React, { CSSProperties } from 'react';
import { ReactElement } from 'react';


export default React.memo(function Tasks({ project, exec }
    : { project: string,
        exec: (project: string, cmd: 'reindex'|'convert'|'tiling'|'stop') => void }): ReactElement {

    return (<div style={ boxStyle }>
        <div style={ projectButtonsStyle }>
            <span className="btn" style={ rStyle }
                onClick={ () => exec(project, 'reindex') }>Reindex</span>
        </div>
        <div style={ projectButtonsStyle0 }>
            <span className="btn" style={ rStyle }
                onClick={ () => exec(project, 'convert') }>Convert</span>
        </div>
        <div style={ projectButtonsStyle1 }>
            <span className="btn" style={ rStyle }
                onClick={ () => exec(project, 'tiling') }>Tiling</span>
        </div>
        <div style={ projectButtonsStyle2 }>
            <span className="btn" style={ rStyle2 }
                onClick={ () => exec(project, 'stop') }>Stop</span>
        </div>
    </div>);
});


const boxStyle: CSSProperties = {

    left: '0px',
    top: '28px',
    position: 'absolute'
};


const projectButtonsStyle: CSSProperties = {
    left: '0px',
    top: '0px',
    height: '44px',
    width: '100px',
    position: 'absolute',
};


const projectButtonsStyle0: CSSProperties = {
    left: '70px',
    top: '0px',
    height: '44px',
    width: '100px',
    position: 'absolute',
};


const projectButtonsStyle1: CSSProperties = {
    left: '140px',
    top: '0px',
    height: '44px',
    width: '100px',
    position: 'absolute',
};


const projectButtonsStyle2: CSSProperties = {
    left: '210px',
    top: '0px',
    height: '44px',
    width: '100px',
    position: 'absolute',
};


const rStyle: CSSProperties = {
    position: 'relative',
    left: '0px',
    top: '0px',
    padding: '0',
    color: 'green'
};


const rStyle2: CSSProperties = {
    position: 'relative',
    left: '0px',
    top: '0px',
    padding: '0',
    color: 'blue'
};
