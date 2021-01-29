import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { getPredecessors } from '../../api/documents';
import { ResultDocument } from '../../api/result';
import DocumentTeaser from '../../shared/document/DocumentTeaser';
import { LoginContext } from '../../shared/login';

export default function ProjectBreadcrumb({ documentId }: { documentId: string }): ReactElement {

    const loginData = useContext(LoginContext);

    const [predecessors, setPredecessors] = useState<ResultDocument[]>([]);

    useEffect(() => {

        getPredecessors(documentId, loginData.token)
            .then(result => setPredecessors(result.results));
    }, [documentId, loginData.token]);

    return documentId
        ? <Card>
            { predecessors.map(renderPredecessor) }
        </Card>
        : null;
}


const renderPredecessor = (predecessor: ResultDocument) =>
    <DocumentTeaser document={ predecessor } />;
