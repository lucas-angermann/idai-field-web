import React, { useEffect, useState, useContext, ReactElement } from 'react';
import { Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import OverviewMap from './OverviewMap';
import { search } from '../api/documents';
import { ResultDocument } from '../api/result';
import { LoginContext } from '../App';


export default function ProjectOverview(): ReactElement {

    const [projectDocuments, setProjectDocuments] = useState<ResultDocument[]>([]);
    const [error, setError] = useState(false);
    const loginData = useContext(LoginContext);
    const { t } = useTranslation();

    useEffect (() => {
        getProjectDocuments(loginData.token)
            .then(setProjectDocuments)
            .catch(err => setError(err));
    }, [loginData]);

    return (
        <div>
            { error ? renderError(t) : renderMap(projectDocuments)}
        </div>
    );
}


const renderError = (t: TFunction): ReactElement => (
    <Alert variant="danger">
        { t('projectOverview.backendNotAvailable') }
    </Alert>
);


const renderMap = (projectDocuments: ResultDocument[]): ReactElement =>
    <OverviewMap documents={ projectDocuments }></OverviewMap>;


const getProjectDocuments = async (token: string): Promise<ResultDocument[]> =>
    (await search({ q: 'resource.category.name:Project' }, token)).documents;
