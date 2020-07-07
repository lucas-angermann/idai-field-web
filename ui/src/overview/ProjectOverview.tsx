import React, { useEffect, useState } from 'react';
import Map from './Map';
import { search } from '../api/documents';
import { Alert } from 'react-bootstrap';
import { ResultDocument } from '../api/result';


export default () => {

    const [projectDocuments, setProjectDocuments] = useState<ResultDocument[]>([]);
    const [error, setError] = useState(false);

    useEffect (() => {
        getProjectDocuments()
            .then(setProjectDocuments)
            .catch(err => setError(err));
    }, []);

    return (
        <div>
            { error ? renderError(error) : renderMap(projectDocuments)}
        </div>
    );
};


const renderError = (error: any) => <Alert variant="danger">Backend not available!</Alert>;


const renderMap = (projectDocuments: any) => <Map documents={ projectDocuments }></Map>;


const getProjectDocuments = async (): Promise<ResultDocument[]> =>
    (await search({ q: 'resource.type:Project' })).documents;
