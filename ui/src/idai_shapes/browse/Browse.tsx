import React, { CSSProperties, ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useLocation, useParams } from 'react-router-dom';
import { Document } from '../../api/document';
import { get, getPredecessors, search } from '../../api/documents';
import { parseFrontendGetParams, Query } from '../../api/query';
import { Predecessor, Result, ResultDocument } from '../../api/result';
import { BREADCRUMB_HEIGHT, NAVBAR_HEIGHT } from '../../constants';
import DocumentDetails from '../../shared/document/DocumentDetails';
import DocumentBreadcrumb, { BreadcrumbItem } from '../../shared/documents/DocumentBreadcrumb';
import DocumentGrid from '../../shared/documents/DocumentGrid';
import { LoginContext } from '../../shared/login';
import { SHAPES_PROJECT_ID } from '../constants';
import LinkedFinds from './LinkedFinds';
import './browse.css';


const CHUNK_SIZE = 50;


export default function Browse(): ReactElement {

    const { documentId } = useParams<{ documentId: string }>();
    const loginData = useContext(LoginContext);
    const location = useLocation();

    const [document, setDocument] = useState<Document>(null);
    const [documents, setDocuments] = useState<ResultDocument[]>(null);
    const [breadcrumbs, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
    const [offset, setOffset] = useState<number>(0);

    useEffect(() => {

        if (documentId) {
            get(documentId, loginData.token)
                .then(doc => setDocument(doc));
            getChildren(documentId, 0, loginData.token)
                .then(result => setDocuments(result.documents));
            getPredecessors(documentId, loginData.token)
                .then(result => setBreadcrumb(predecessorsToBreadcrumbItems(result.results)));
        } else {
            setDocument(null);
            setBreadcrumb([]);
            searchDocuments(location.search, 0, loginData.token)
                .then(res => setDocuments(res.documents));
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

        const promise = documentId
            ? getChildren(documentId, newOffset, loginData.token)
            : searchDocuments(location.search, newOffset, loginData.token);
        promise.then(result => setDocuments(oldDocs => oldDocs.concat(result.documents)));
    }, [documentId, location.search, loginData]);


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
                        getLinkUrl={ (document: ResultDocument): string => document.resource.id } />
                </Col>
                { document && document.resource.category.name === 'Type' &&
                    <LinkedFinds type={ document } />
                }
            </Row>
        </Container>
    );
}


const getChildren = async (parentId: string, from: number, token: string) => {

    const query: Query = getQueryTemplate(from);
    query.parent = parentId;
    query.sort = 'sort';
    return search(query, token);
};


const searchDocuments = async (searchParams: string, from: number, token: string): Promise<Result> => {
    
    let query: Query = getQueryTemplate(from);
    query = parseFrontendGetParams(searchParams, query);
    return search(query, token);
};


const getQueryTemplate = (from: number): Query => ({
    size: CHUNK_SIZE,
    from,
    filters: [
        { field: 'project', value: SHAPES_PROJECT_ID },
        { field: 'resource.category.name', value: 'Type' }
    ]
});
  

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
