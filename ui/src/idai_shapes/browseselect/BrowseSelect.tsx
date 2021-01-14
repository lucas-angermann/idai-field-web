import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useLocation, useParams } from 'react-router-dom';
import { Document } from '../../api/document';
import { get, predecessors, searchDocuments } from '../../api/documents';
import { Predecessor, ResultDocument } from '../../api/result';
import { LoginContext } from '../../App';
import DocumentDetails from '../../shared/document/DocumentDetails';
import DocumentBreadcrumb, { BreadcrumbItem } from '../../shared/documents/DocumentBreadcrumb';
import { DocumentsGrid } from '../../shared/documents/DocumentsGrid';
import { EXCLUDED_TYPES_SHAPES } from '../constants';
import './browse-select.css';

const CHUNK_SIZE = 50;


export default function BrowseSelect(): ReactElement {

    const { documentId } = useParams<{ documentId: string }>();
    const [document, setDocument] = useState<Document>(null);
    const loginData = useContext(LoginContext);
    const [documents, setDocuments] = useState<ResultDocument[]>(null);
    const location = useLocation();
    const projectId = 'idaishapes';

    const [breadcrumbs, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
    

    useEffect(() => {
        const parentId = documentId === undefined ? 'root' : documentId;
        if (documentId) {
            get(documentId, loginData.token)
                .then(doc => setDocument(doc))
                .then(() => searchDocuments(
                    projectId, location.search, 0, loginData.token,
                    CHUNK_SIZE, EXCLUDED_TYPES_SHAPES,parentId))
                .then(result => setDocuments(result.documents))
                .then(() => predecessors(documentId, loginData.token))
                .then(result => setBreadcrumb(predecessorsToBreadcrumbItems(result.results)));
        } else {
            setDocument(null);
            setBreadcrumb([]);
            searchDocuments(
                projectId, location.search, 0, loginData.token,
                CHUNK_SIZE, EXCLUDED_TYPES_SHAPES, parentId)
                .then(res => setDocuments(res.documents));
        }
    }, [documentId, loginData, location.search]);


    return (
        <Container fluid className="browse-select">
            <DocumentBreadcrumb breadcrumbs={ breadcrumbs } />
            <Row>
                { document &&
                <Col className="col-4 sidebar">
                     <DocumentDetails document={ document } searchParams={ location.search } />
                </Col>
                }
                <Col>
                    <DocumentsGrid documents={ documents}
                        getLinkUrl={ (id: string): string => id } />
                </Col>
            </Row>
        </Container>
    );
}
  

const predecessorsToBreadcrumbItems = (predecessors: Predecessor[]): BreadcrumbItem[] => predecessors.map(predec => {
    return {
        identifier: predec.identifier,
        id: predec.id,
        url: predec.id,
    };
});
