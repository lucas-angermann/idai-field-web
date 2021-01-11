import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useParams } from 'react-router-dom';
import { search } from '../api/documents';
import { LoginContext } from '../App';
import { NotFound } from '../shared/NotFound';


export default function ResourceRedirect(): ReactElement {

    const { project, identifier } = useParams<{ project: string, identifier: string }>();
    const [id, setId] = useState<string>(null);
    const [error, setError] = useState<string>(null);
    const loginData = useContext(LoginContext);
    const { t } = useTranslation();

    useEffect (() => {
        
        getId(project, identifier, loginData.token)
            .then((resultId: string) => resultId ? setId(resultId) : setError('Not found'))
            .catch(setError);
    }, [project, identifier, loginData]);

    return error
        ? <NotFound />
        : id
            ? <Redirect to={ `/project/${project}/${id}` } />
            : <div>{ t('resourceRedirect.waitForRedirection')}</div>;
}


const getId = async (project: string, identifier: string, token: string): Promise<string> => {

    const result = await search({ filters: getFilters(project, identifier), q: '' }, token);

    if (result.documents.length > 0) {
        return result.documents[0].resource.id;
    } else {
        throw 'Not found';
    }
};


const getFilters = (project: string, identifier: string) => [
    { field: 'project', value: project },
    { field: 'resource.identifier', value: identifier }
];
