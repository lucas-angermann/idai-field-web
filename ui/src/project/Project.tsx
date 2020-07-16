import React, { useState, useEffect } from 'react';
import { Switch, Route, useRouteMatch, useParams } from 'react-router-dom';
import ProjectHome from './ProjectHome';
import ProjectMap from './ProjectMap';
import DocumentInfo from './DocumentInfo';
import { get } from '../api/documents';
import { Document } from '../api/document';

export default function Project() {

    const { projectId, documentId } = useParams();
    const { path } = useRouteMatch();
    const [document, setDocument] = useState<Document>(null);

    useEffect (() => {
        get(documentId).then(setDocument);
    }, [documentId]);

    return (
        <div>
            { document ? <DocumentInfo document={ document } /> : <ProjectHome id={ projectId } /> }
            <div key="results">
                <ProjectMap id={ projectId } />
            </div>
        </div>
    );

}
