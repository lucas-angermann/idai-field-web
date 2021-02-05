import React, { ReactElement, useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { ResultDocument } from '../../api/result';
import DocumentGrid from '../../shared/documents/DocumentGrid';
import { getFromVector } from '../../api/documents';
import { Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import './drawfinds.css';
import { useParams } from 'react-router-dom';

export default function DrawFinds (): ReactElement {

    const [documents, setDocuments] = useState<ResultDocument[]>(null);
    const [dataUrl, setDataUrl] = useState<string>(null);
    const { data } = useParams<{ data: string }>();
    const { t } = useTranslation();

    const image = useRef<HTMLImageElement>(null);
    const modelUrl = RESNET_MODEL_PATH;

    const predict = async (model: tf.LayersModel) => {
  
        const raw = tf.browser.fromPixels(image.current,3);
        const resized = tf.image.resizeBilinear(raw, [512,512]);
        const tensor = resized.expandDims(0);
        const prediction = (model.predict(tensor) as tf.Tensor).reshape([-1]);

        getFromVector(Array.from(prediction.dataSync())).then((res) => {
             setDocuments(res.documents);
        });
    };

    useEffect(() => {

        setDataUrl(decodeURIComponent(data));
    },[data]);

    useEffect(() => {

        tf.ready().then(() => tf.loadLayersModel(modelUrl)).then((model) => predict(model));
    }, [dataUrl]);
    
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