import React, { ReactElement, useEffect, useState, useRef } from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import * as tf from '@tensorflow/tfjs';
import { getFromVector } from '../../api/documents';
import { ResultDocument } from '../../api/result';
import DocumentGrid from '../../shared/documents/DocumentGrid';
import CanvasDraw, { DrawCanvasObject } from '../drawcanvas/DrawCanvas';

export default function Draw(): ReactElement {

    const [model, setModel] = useState<tf.LayersModel>();
    const [brushRadius, setBrushRadius] = useState<number>(10);
    const [documents, setDocuments] = useState<ResultDocument[]>(null);

    const canvas = useRef<DrawCanvasObject>();
    const modelUrl = 'model/model.json';

    const loadModel = async (url: string) => {
        try {
            const model = await tf.loadLayersModel(url);
            await setModel(model);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {

        tf.ready().then(() => loadModel(modelUrl));
    }, []);

    const findHandler = () => {

        if(model) {
            const raw = tf.browser.fromPixels(canvas.current.getCanvas(),3);
            const resized = tf.image.resizeBilinear(raw, [512,512]);
            const tensor = resized.expandDims(0);
            const prediction = (model.predict(tensor) as tf.Tensor).reshape([-1]);

            getFromVector(Array.from(prediction.dataSync())).then((res) => {
                setDocuments(res.documents);
            });
        }
    };

    const brushRadiusHandler = (e: React.ChangeEvent<HTMLInputElement>) => {

        setBrushRadius(parseInt(e.target.value));
    };

    const clearHandler = () => {

        canvas.current && canvas.current.clear();
        setDocuments(null);
    };

    return (
        <div className="ml-4">
            <Row>
                <Col>
                    <h1>Draw profile</h1>
                    <CanvasDraw brushRadius={ brushRadius } ref={ canvas } />
                    <Row>
                        <Button variant="primary" size="lg" className="mx-3 mt-2" onClick={ findHandler } >
                        Find
                        </Button>
                        <Button
                            variant="primary"
                            size="lg" className="mt-2"
                            onClick={ clearHandler } >
                            Clear
                        </Button>
                        <Col>
                            <Form.Control type="range" min="5" max="30" custom
                                className="mt-2 w-25" value={ brushRadius }
                                onChange={ brushRadiusHandler } />
                            <p>Brush radius</p>
                        </Col>
                    </Row>
                </Col>
                <Col>
                    {documents &&
                    <>
                        <h1>10 closest shapes</h1>
                        <DocumentGrid documents={ documents }
                            getLinkUrl={ (doc: ResultDocument): string => `document/${doc.resource.id}` } />
                    </>
                    }
                </Col>
            </Row>
        </div>
    );
}

