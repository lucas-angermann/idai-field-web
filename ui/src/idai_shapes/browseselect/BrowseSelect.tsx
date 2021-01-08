import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Document } from '../../api/document';
import { get, search, predecessors } from '../../api/documents';
import { buildProjectQueryTemplate, parseFrontendGetParams } from '../../api/query';
import { Result, ResultDocument } from '../../api/result';
import { LoginContext } from '../../App';
import DocumentDetails from '../../shared/document/DocumentDetails';
import DocumentBreadcrumb, { BreadcrumbItem } from '../../shared/documents/DocumentBreadcrumb';
import { ShapesHierarchy } from '../../shared/documents/ShapesHierarchy';
import { EXCLUDED_TYPES_SHAPES } from '../constants';
import { Predecessor } from '../../api/result';
import { Row, Col } from 'react-bootstrap';

const CHUNK_SIZE = 50;


export default function BrowseSelect(): ReactElement {

    const {  documentId } = useParams<{ documentId: string }>();
    const [document, setDocument] = useState<Document>(null);
    const loginData = useContext(LoginContext);
    const [documents, setDocuments] = useState<ResultDocument[]>(null);
    const location = useLocation();
    const projectId = 'idaishapes';

    const root = 'Catalogs';
    const [breadcrumbs, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
    
 
    const selectedItemHandler = (id: string, identifier: string, url: string): void =>
        setBreadcrumb(breadcrumbs.concat({ url, id, identifier }));

    
    useEffect(() => {
        const parentId = documentId === undefined ? 'root' : documentId;
        if (documentId) {
            get(documentId, loginData.token)
                .then(doc => setDocument(doc))
                .then(() => searchDocuments(projectId, '', 0, loginData.token, parentId))
                .then(result => setDocuments(result.documents))
                .then(() => predecessors(documentId, loginData.token))
                .then(result => setBreadcrumb(predecessorsToBreadcrumbItems(result.results)));
        } else {
            setDocument(null);
            setBreadcrumb([]);
            searchDocuments(projectId, '', 0, loginData.token, parentId)
                .then(res => setDocuments(res.documents));
        }
    }, [documentId, loginData]);


    return (
        <Row>
            <Col>
                { document
                    && <DocumentDetails document={ document }
                                        searchParams={ location.search }
                                        />
                }
            </Col>
            <Col>
                <DocumentBreadcrumb breadcrumbs={ [{ identifier: root, url: './' }, ...breadcrumbs]}/>
                    <ShapesHierarchy
                        documents={ documents}
                        searchParams={ location.search}
                        selectedItem={ selectedItemHandler}
                    />
            </Col>
        </Row>
    
    );
}
  

const searchDocuments = async (id: string, searchParams: string, from: number, token: string,
                               parentId?: string): Promise<Result> => {

    const query = parseFrontendGetParams(searchParams,
        buildProjectQueryTemplate(id, from, CHUNK_SIZE, EXCLUDED_TYPES_SHAPES), parentId);
    return search(query, token);
};


const predecessorsToBreadcrumbItems = (predecessors: Predecessor[]): BreadcrumbItem[] => predecessors.map(predec => {
    return {
        identifier: predec.identifier,
        id: predec.id,
        url: predec.id,
    };
});

