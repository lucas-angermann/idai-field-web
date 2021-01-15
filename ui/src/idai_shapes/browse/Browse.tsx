import React, { CSSProperties, ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useLocation, useParams } from 'react-router-dom';
import { Document } from '../../api/document';
import { get, getPredecessors, search } from '../../api/documents';
import { parseFrontendGetParams, Query } from '../../api/query';
import { Predecessor, Result, ResultDocument } from '../../api/result';
import { LoginContext } from '../../App';
import { BREADCRUMB_HEIGHT, NAVBAR_HEIGHT } from '../../constants';
import DocumentDetails from '../../shared/document/DocumentDetails';
import DocumentBreadcrumb, { BreadcrumbItem } from '../../shared/documents/DocumentBreadcrumb';
import DocumentGrid from '../../shared/documents/DocumentGrid';
import { SHAPES_PROJECT_ID } from '../constants';
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
                .then(doc => setDocument(doc))
                .then(() => searchDocuments(location.search, 0, loginData.token, documentId))
                .then(result => setDocuments(result.documents))
                .then(() => getPredecessors(documentId, loginData.token))
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

        searchDocuments(location.search, newOffset, loginData.token, documentId)
            .then(result => setDocuments(oldDocs => oldDocs.concat(result.documents)));
        },
        [documentId, location.search, loginData]
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


const searchDocuments = async (
        searchParams: string,
        from: number,
        token: string,
        parentId?: string): Promise<Result> => {
    
    let query: Query = {
        size: CHUNK_SIZE,
        from,
        filters: [
            { field: 'project', value: SHAPES_PROJECT_ID },
            { field: 'resource.category.name', value: 'Type' }
        ]
    };

    query = parseFrontendGetParams(searchParams, query);
    
    if (parentId) {
        query.q = undefined;
        query.parent = parentId;
        query.sort = 'sort';
    }

    return search(query, token);
};
  

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
