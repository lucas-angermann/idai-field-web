import React, { CSSProperties } from 'react';
import { ReactElement } from 'react';
import { postConvert, postReindex, postTiling } from '../../api/worker';


export default function Tasks({ project, token, setStat }
    : { project: string, token: string, setStat: (s: string[]) => void }): ReactElement {

    return (<div style={ boxStyle }>
        <div style={ projectButtonsStyle }>
            <span className="btn" style={ rStyle }
                onClick={ () => (postReindex(token, project)).then(setStat) }>Reindex</span>
        </div>
        <div style={ projectButtonsStyle0 }>
            <span className="btn" style={ rStyle }
                onClick={ () => (postConvert(token, project)).then(setStat) }>Convert</span>
        </div>
        <div style={ projectButtonsStyle1 }>
            <span className="btn" style={ rStyle }
                onClick={ () => (postTiling(token, project)).then(setStat) }>Tiling</span>
        </div>
    </div>);
}


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


const rStyle: CSSProperties = {
    position: 'relative',
    left: '0px',
    top: '0px',
    padding: '0',
    color: 'green'
};
