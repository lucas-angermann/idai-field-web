import React, { CSSProperties } from 'react';
import { ReactElement } from 'react';


export type TaskType = 'reindex'|'convert'|'tiling'|'stop';


const WIDTH = 70;


type TasksProps = { project: string, exec: (project: string, cmd: TaskType) => void };


const BUTTONS = [['reindex', 'Reindex', 'green'],
    ['convert', 'Convert', 'green'],
    ['tiling', 'Tiling', 'green'],
    ['stop', 'Stop', 'blue']];


export default React.memo(function Tasks({ project, exec }: TasksProps): ReactElement {

    return (<div style={ boxStyle }>

        { BUTTONS.map(([type, Title, color]: [TaskType, string, string], i) => (

            <div style={ buttonDivStyle(i, WIDTH) } key={ i }>
                <span className="btn" style={ buttonSpanStyle(color) }
                    onClick={ () => exec(project, type) }>{ Title }</span>
            </div>
           )) }
    </div>);
});


const boxStyle: CSSProperties = {
    left: '0px',
    top: '28px',
    position: 'absolute'
};


const buttonDivStyle = (index: number, width: number): CSSProperties => ({
    left: (index * width) + 'px',
    position: 'absolute',
});


const buttonSpanStyle = (color: string): CSSProperties => ({
    padding: '0px',
    color: color
});
