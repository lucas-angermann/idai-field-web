import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { getPredecessors } from '../../api/documents';
import { ResultDocument } from '../../api/result';
import DocumentTeaser from '../../shared/document/DocumentTeaser';
import { LoginContext } from '../../shared/login';

export default function ProjectBreadcrumb(): ReactElement {

    const loginData = useContext(LoginContext);
    const location = useLocation();

    const [predecessors, setPredecessors] = useState<ResultDocument[]>([]);

    const parent = new URLSearchParams(location.search).get('parent');

    useEffect(() => {

        getPredecessors(parent, loginData.token)
            .then(result => setPredecessors(result.results));
    }, [parent, loginData.token]);

    console.log({ predecessors });

    return parent && parent !== 'root'
        ? <Card>
            { predecessors.map(renderPredecessor) }
        </Card>
        : null;
}


const renderPredecessor = (predecessor: ResultDocument) =>
    <DocumentTeaser document={ predecessor } project={ predecessor.project } />;
