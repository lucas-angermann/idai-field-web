import React, { useState, useEffect } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { search } from './api/documents';

export default () => {

    const { project, identifier } = useParams();
    const [id, setId] = useState(null);

    useEffect (() => {
        getId(project, identifier).then(setId);
    }, [project, identifier]);

    return id
        ? <Redirect to={ `/documents/${id}` } />
        : <div>Please wait while being redirected ...</div>;
};

const getId = async (project: string, identifier: string): Promise<string> => {

    const result = await search({ q: getQueryString(project, identifier) });
    return result.documents[0].resource.id;
};

const getQueryString = (project: string, identifier: string) =>
    `resource.project:${project} and resource.identifier:${identifier}`;
