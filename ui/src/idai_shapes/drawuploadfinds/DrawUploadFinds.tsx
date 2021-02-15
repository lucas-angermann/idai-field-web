import React, { ReactElement, useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { ResultDocument } from '../../api/result';
import DocumentGrid from '../../shared/documents/DocumentGrid';
import { getFromVector } from '../../api/documents';
import { Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import './drawuploadfinds.css';
import { useParams } from 'react-router-dom';
import { RESNET_MODEL_PATH, SEG_MODEL_PATH } from '../constants';

export default function DrawUploadFinds (): ReactElement {

    const [documents, setDocuments] = useState<ResultDocument[]>(null);
    const [dataUrl, setDataUrl] = useState<string>(null);
    const { isDrawing, data } = useParams<{ isDrawing: string ,data: string }>();
    const { t } = useTranslation();

    const segmentedImage = useRef<tf.Tensor3D>(null);
    const image = useRef<HTMLImageElement>(null);

    const predict = async (raw: tf.Tensor3D, model: tf.LayersModel) => {
  
        const resized = tf.image.resizeBilinear(raw, [512,512]);
        const tensor = resized.expandDims(0);
        const prediction = (model.predict(tensor) as tf.Tensor).reshape([-1]);

        getFromVector(Array.from(prediction.dataSync())).then((res) => {
             setDocuments(res.documents);
        });
    };

    const segmentImage = async (model: tf.LayersModel) => {
        const raw = tf.browser.fromPixels(image.current,3);
        const resized = tf.image.resizeBilinear(raw, [512,512]);
        const tensor = resized.expandDims(0);
        const segmented = model.predict(tensor) as tf.Tensor;
        segmentedImage.current = postProcessSegmentedImage(segmented);

    };

    useEffect(() => {

        setDataUrl(decodeURIComponent(data));
    },[data]);

    useEffect(() => {

        if( isDrawing === 'true'){
            tf.ready()
                .then(() => tf.loadLayersModel(RESNET_MODEL_PATH))
                .then((model) => predict(tf.browser.fromPixels(image.current,3), model));
        }
        else {
            tf.ready()
                .then(() => tf.loadLayersModel(SEG_MODEL_PATH))
                .then((model) => segmentImage(model))
                .then(() => tf.loadLayersModel(RESNET_MODEL_PATH))
                .then((model) => predict(segmentedImage.current, model));
        }
    }, [dataUrl, isDrawing]);
    
    return (
        <div className="m-2">
            <img src={ dataUrl } ref={ image } alt="no dataUrl" className="mx-auto d-block" />
            <h1 className="mt-3">{ t('shapes.browse.similarTypes') }</h1>
            {documents?
                <DocumentGrid documents={ documents }
                    getLinkUrl={ (doc: ResultDocument): string => `document/${doc.resource.id}` } /> :
                renderLoadingSpinner(t)
            }
        </div>
    );
}

const renderLoadingSpinner = (t: TFunction): ReactElement => (
    <div>
        <Spinner animation="border" className="spinner-blue" />
        {' '}{ t('shapes.drawfinds.searching') }...
    </div>
);

const postProcessSegmentedImage = (image: tf.Tensor): tf.Tensor3D => {
    const classes = tf.argMax(image,3);
    const scaled = classes.mul(tf.scalar(255)).reshape([512,512]);
    return tf.stack([scaled,scaled,scaled],2) as tf.Tensor3D;
};