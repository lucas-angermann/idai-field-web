import React, { useState, useEffect } from 'react';
import { Redirect, useParams } from 'react-router-dom';

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

    const response = await fetch(`/documents?q=${getQueryString(project, identifier)}`);
    const result = await response.json();
    return result[0].resource.id;
};

const getQueryString = (project: string, identifier: string) =>
    `resource.project:${project} and resource.identifier:${identifier}`;
