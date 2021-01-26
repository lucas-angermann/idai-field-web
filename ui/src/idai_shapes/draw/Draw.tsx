import React, { ReactElement, useEffect, useState } from 'react';
import CanvasDraw from 'react-canvas-draw';
import { Row, Col, Button } from 'react-bootstrap';
import * as tf from '@tensorflow/tfjs';

export default function Draw(): ReactElement {

    const [model, setModel] = useState<tf.LayersModel>();

    let saveableCanvas;
    const [brushRadius, setBrushRadius] = useState<number>(10);
    const modelUrl = 'http://localhost:3000/week1/model/model.json';

    const loadModel = async (url: string) => {
    
        const model = await tf.loadLayersModel(url);
        await setModel(model);
    };

    useEffect(() => {

        tf.ready().then(() => loadModel(modelUrl));
    }, []);

    const findHandler = () => {

        if(model) {
            const canvas = saveableCanvas.canvasContainer.childNodes[1];
            const raw = tf.browser.fromPixels(canvas,3);
            const resized = tf.image.resizeBilinear(raw, [512,512]);
            const tensor = resized.expandDims(0);
            const prediction = model.predict(tensor) as tf.Tensor;
            alert(prediction.reshape([-1]));
        }


        //localStorage.setItem('savedDrawing', saveableCanvas.getSaveData());
    };

    const brushRadiusHandler = (e: React.ChangeEvent<HTMLInputElement>) => {

        setBrushRadius(parseInt(e.target.value));
    };

    return (
        <div className="ml-4">
            <h1>Draw profile</h1>
            <Row>
                <CanvasDraw
                    ref={ canvasDraw => (saveableCanvas = canvasDraw) }
                    brushRadius={ brushRadius }
                    canvasWidth={ 512 }
                    canvasHeight={ 512 }
                    brushColor="black"
                    hideGrid />
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
