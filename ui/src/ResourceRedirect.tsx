import React, { useState, useEffect, ReactElement, useContext } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { search } from './api/documents';
import { LoginContext } from './App';


export default function ResourceRedirect(): ReactElement {

    const { project, identifier } = useParams();
    const [id, setId] = useState(null);
    const loginData = useContext(LoginContext);
    const { t } = useTranslation();

    useEffect (() => {
        getId(project, identifier, loginData.token).then(setId);
    }, [project, identifier, loginData]);

    return id
        ? <Redirect to={ `/project/${project}/${id}` } />
        : <div>{ t('resourceRedirect.waitForRedirection')}</div>;
}


const getId = async (project: string, identifier: string, token: string): Promise<string> => {

    const result = await search({ filters: getFilters(project, identifier) }, token);
    return result.documents[0].resource.id;
};


const getFilters = (project: string, identifier: string) => [
    { field: 'project', value: project },
    { field: 'resource.identifier', value: identifier }
];
