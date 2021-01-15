import React, { CSSProperties, ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useLocation, useParams } from 'react-router-dom';
import { Document } from '../../api/document';
import { get, getPredecessors, searchDocuments } from '../../api/documents';
import { Predecessor, ResultDocument } from '../../api/result';
import { LoginContext } from '../../App';
import { BREADCRUMB_HEIGHT, NAVBAR_HEIGHT } from '../../constants';
import DocumentDetails from '../../shared/document/DocumentDetails';
import DocumentBreadcrumb, { BreadcrumbItem } from '../../shared/documents/DocumentBreadcrumb';
import DocumentGrid from '../../shared/documents/DocumentGrid';
import { EXCLUDED_TYPES_SHAPES } from '../constants';
import './browse.css';


const CHUNK_SIZE = 50;
const SHAPES_PROJECT_ID = 'idaishapes';


export default function Browse(): ReactElement {

    const { documentId } = useParams<{ documentId: string }>();
    const loginData = useContext(LoginContext);
    const location = useLocation();

    const [document, setDocument] = useState<Document>(null);
    const [documents, setDocuments] = useState<ResultDocument[]>(null);
    const [breadcrumbs, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
    const [offset, setOffset] = useState<number>(0);
    

    useEffect(() => {
        
        const parentId = documentId === undefined ? 'root' : documentId;
        if (documentId) {
            get(documentId, loginData.token)
                .then(doc => setDocument(doc))
                .then(() => searchDocuments(
                    SHAPES_PROJECT_ID, location.search, 0, loginData.token,
                    CHUNK_SIZE, EXCLUDED_TYPES_SHAPES,parentId))
                .then(result => setDocuments(result.documents))
                .then(() => getPredecessors(documentId, loginData.token))
                .then(result => setBreadcrumb(predecessorsToBreadcrumbItems(result.results)));
        } else {
            setDocument(null);
            setBreadcrumb([]);
            searchDocuments(
                SHAPES_PROJECT_ID, location.search, 0, loginData.token,
                CHUNK_SIZE, EXCLUDED_TYPES_SHAPES, parentId
            ).then(res => setDocuments(res.documents));
        }
    }, [documentId, loginData, location.search]);

    const onScroll = (e: React.UIEvent<Element, UIEvent>) => {

        const el = e.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
            const newOffset = offset + CHUNK_SIZE;
            getChunk(newOffset);
            setOffset(newOffset);
        }
    };

    const getChunk = useCallback((newOffset: number): void => {

            searchDocuments(
                SHAPES_PROJECT_ID, location.search, newOffset, loginData.token,
                CHUNK_SIZE, EXCLUDED_TYPES_SHAPES
            ).then(result => setDocuments(oldDocs => oldDocs.concat(result.documents)));
        },
        [location.search, loginData]
    );


    return (
        <Container fluid className="browse-select">
            <DocumentBreadcrumb breadcrumbs={ breadcrumbs } />
            <Row>
                { document &&
                    <Col className="col-4 sidebar">
                        <DocumentDetails
                            document={ document }
                            searchParams={ location.search }
                            skipRelations={ true } />
                    </Col>
                }
                <Col style={ documentGridStyle } onScroll={ onScroll }>
                    <DocumentGrid documents={ documents }
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


const documentGridStyle: CSSProperties = {
    height: 'calc(100vh - ' + (NAVBAR_HEIGHT + BREADCRUMB_HEIGHT) + 'px)',
    overflowY: 'auto'
};
