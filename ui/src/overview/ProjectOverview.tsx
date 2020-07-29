import React, { useEffect, useState, useContext, ReactElement } from 'react';
import Map from './Map';
import { search } from '../api/documents';
import { Alert } from 'react-bootstrap';
import { ResultDocument } from '../api/result';
import { LoginContext } from '../App';


export default function ProjectOverview(): ReactElement {

    const [projectDocuments, setProjectDocuments] = useState<ResultDocument[]>([]);
    const [error, setError] = useState(false);
    const loginData = useContext(LoginContext);

    useEffect (() => {
        getProjectDocuments(loginData.token)
            .then(setProjectDocuments)
            .catch(err => setError(err));
    }, [loginData]);

    return (
        <div>
            { error ? renderError(error) : renderMap(projectDocuments)}
        </div>
    );
}


const renderError = (error: any): ReactElement => <Alert variant="danger">Backend not available!</Alert>;


const renderMap = (projectDocuments: ResultDocument[]): ReactElement => <Map documents={ projectDocuments }></Map>;


const getProjectDocuments = async (token: string): Promise<ResultDocument[]> =>
    (await search({ q: 'resource.category:Project' }, token)).documents;
