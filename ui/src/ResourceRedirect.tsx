import React, { useState, useEffect, ReactElement } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { search } from './api/documents';

export default function ResourceRedirect(): ReactElement {

    const { project, identifier } = useParams();
    const [id, setId] = useState(null);
    const { t } = useTranslation();

    useEffect (() => {
        getId(project, identifier).then(setId);
    }, [project, identifier]);

    return id
        ? <Redirect to={ `/project/${project}/${id}` } />
        : <div>{ t('resourceRedirect.waitForRedirection')}</div>;
}

const getId = async (project: string, identifier: string): Promise<string> => {

    // TODO: get token
    const result = await search({ filters: getFilters(project, identifier) }, '');
    return result.documents[0].resource.id;
};

const getFilters = (project: string, identifier: string) => [
    { field: 'project', value: project },
    { field: 'resource.identifier', value: identifier }
];
