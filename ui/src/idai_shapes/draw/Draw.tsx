import React, { ReactElement, useEffect, useState, useRef, CSSProperties } from 'react';
import { Col, Button, Form } from 'react-bootstrap';
import * as tf from '@tensorflow/tfjs';
import { getFromVector } from '../../api/documents';
import { ResultDocument } from '../../api/result';
import CanvasDraw, { DrawCanvasObject } from '../drawcanvas/DrawCanvas';
import { useTranslation } from 'react-i18next';

export default function Draw(): ReactElement {

    const [model, setModel] = useState<tf.LayersModel>();
    const [brushRadius, setBrushRadius] = useState<number>(10);
    const [documents, setDocuments] = useState<ResultDocument[]>(null);
    const { t } = useTranslation();

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
        <>
            <CanvasDraw brushRadius={ brushRadius } ref={ canvas } />
            <Button
                variant="primary"
                className="mx-1 mt-1"
                style={ buttonStyle }
                onClick={ findHandler } >
            { t('shapes.draw.search') }
            </Button>
            <Button
                variant="primary"
                className="mt-1"
                style={ buttonStyle }
                onClick={ clearHandler } >
                { t('shapes.draw.clear') }
            </Button>
            <Col>
                <Form.Control type="range" min="5" max="30" custom
                    className="mt-2 w-25" value={ brushRadius }
                    onChange={ brushRadiusHandler } />
                <p>{ t('shapes.draw.brushRadius') }</p>
            </Col>
        </>
    );
}

const buttonStyle: CSSProperties = {
    borderColor: 'white',
    borderStyle: 'solid',
    borderRadius: '5px'
};