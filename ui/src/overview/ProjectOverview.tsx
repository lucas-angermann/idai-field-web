import React, { useEffect, useState, useContext } from 'react';
import Map from './Map';
import { search } from '../api/documents';
import { Alert } from 'react-bootstrap';
import { ResultDocument } from '../api/result';
import { LoginContext } from '../App';


export default () => {

    const [projectDocuments, setProjectDocuments] = useState<ResultDocument[]>([]);
    const [error, setError] = useState(false);
    const loginData = useContext(LoginContext);

    useEffect (() => {
        getProjectDocuments(loginData.token)
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


const getProjectDocuments = async (token: string): Promise<ResultDocument[]> =>
    (await search({ q: 'resource.category:Project' }, token)).documents;
