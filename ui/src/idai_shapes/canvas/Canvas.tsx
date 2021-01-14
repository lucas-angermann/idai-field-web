import React, { ReactElement } from 'react';
import CanvasDraw from 'react-canvas-draw';
import { Button } from 'react-bootstrap';

export default function Canvas():ReactElement {

    let saveableCanvas;

    const findHandler = () => {

        localStorage.setItem('savedDrawing', saveableCanvas.getSaveData());
    };

    return (
        <div>
            <CanvasDraw
                ref={ canvasDraw => (saveableCanvas = canvasDraw) } />
            <Button variant="primary" size="lg" className="mr-2 mt-2" onClick={ findHandler } >
                Find
            </Button>
            <Button
                variant="primary"
                size="lg" className="mt-2"
                onClick={ () => saveableCanvas.clear() } >
                Clear
            </Button>

        </div>
    );
}
