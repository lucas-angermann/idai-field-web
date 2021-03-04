import React, { CSSProperties } from 'react';
import { ReactElement } from 'react';


export default React.memo(function Tasks({ project, exec }
    : { project: string,
        exec: (project: string, cmd: 'reindex'|'convert'|'tiling'|'stop') => void }): ReactElement {

    return (<div style={ boxStyle }>
        <div style={ buttonDivStyle(0) }>
            <span className="btn" style={ buttonSpanStyle('green') }
                onClick={ () => exec(project, 'reindex') }>Reindex</span>
        </div>
        <div style={ buttonDivStyle(1) }>
            <span className="btn" style={ buttonSpanStyle('green') }
                onClick={ () => exec(project, 'convert') }>Convert</span>
        </div>
        <div style={ buttonDivStyle(2) }>
            <span className="btn" style={ buttonSpanStyle('green') }
                onClick={ () => exec(project, 'tiling') }>Tiling</span>
        </div>
        <div style={ buttonDivStyle(3) }>
            <span className="btn" style={ buttonSpanStyle('blue') }
                onClick={ () => exec(project, 'stop') }>Stop</span>
        </div>
    </div>);
});


const boxStyle: CSSProperties = {

    left: '0px',
    top: '28px',
    position: 'absolute'
};


const buttonDivStyle = (index: number): CSSProperties => ({
    left: (index * 70) + 'px',
    position: 'absolute',
});


const buttonSpanStyle = (color: string): CSSProperties => ({
    position: 'relative',
    left: '0px',
    top: '0px',
    padding: '0px',
    color: color
});
