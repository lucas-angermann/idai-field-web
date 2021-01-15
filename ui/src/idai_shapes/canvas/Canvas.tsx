import React, { ReactElement, useState } from 'react';
import CanvasDraw from 'react-canvas-draw';
import { Button, Row, Col } from 'react-bootstrap';

export default function Canvas():ReactElement {

    let saveableCanvas;
    const [brushRadius, setBrushRadius] = useState<number>(10);

    const findHandler = () => {

        localStorage.setItem('savedDrawing', saveableCanvas.getSaveData());
    };

    const brushRadiusHandler = (e: React.ChangeEvent<HTMLInputElement>) => {

        setBrushRadius(parseInt(e.target.value));
    };

    return (
        <div>
            <Row>
                <CanvasDraw
                    ref={ canvasDraw => (saveableCanvas = canvasDraw) }
                    brushRadius={ brushRadius }
                    canvasWidth={ 512 }
                    canvasHeight={ 512 }
                    brushColor="black" />
            </Row>
            <Row>
                <Button variant="primary" size="lg" className="mr-2 mt-2" onClick={ findHandler } >
                    Find
                </Button>
                <Button
                    variant="primary"
                    size="lg" className="mt-2"
                    onClick={ () => saveableCanvas.clear() } >
                    Clear
                </Button>
                <Col>
                    <input type="number" className="mt-2" value={ brushRadius } onChange={ brushRadiusHandler } />
                    <p>Brush radius</p>
                </Col>
            </Row>
        </div>
    );
}
