import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useParams } from 'react-router-dom';
import { get } from '../api/documents';
import { LoginContext } from '../shared/login';
import NotFound from '../shared/NotFound';


export default function DocumentRedirect(): ReactElement {

    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<string>(null);
    const [error, setError] = useState<string>(null);
    const loginData = useContext(LoginContext);
    const { t } = useTranslation();

    useEffect (() => {
        
        getDocument(id, loginData.token)
            .then((project: string) => project ? setProject(project) : setError('Not found'))
            .catch(setError);
    }, [id, loginData]);

    return error
        ? <NotFound />
        : project
            ? <Redirect to={ `/project/${project}/${id}` } />
            : <div>{ t('redirect.waitForRedirection')}</div>;
}


const getDocument = async (id: string, token: string): Promise<string> => {

    try {
        return (await get(id, token))?.project;
    } catch (error) {
        throw new Error('Not found');
    }
};
