import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { search } from './search';
import DocumentTeaser from './DocumentTeaser';
import { Container, Row, Col } from 'react-bootstrap';
import DocumentDetails from './DocumentDetails';

export default () => {

    const { id } = useParams();
    const [documents, setDocuments] = useState([]);
    const [projectDocument, setProjectDocument] = useState(null);

    useEffect(() => {
        const query = { q: `project:${id}`, skipTypes: ['Project', 'Image', 'Photo', 'Drawing'] };
        search(query).then(setDocuments);
        getProjectDocument(id).then(setProjectDocument);
    }, [id]);

    return (
        <Container fluid>
            <Row>
                <Col sm={ 4 }>
                    { renderProjectDocument(projectDocument) }
                </Col>
                <Col>
                    { renderResultList(documents) }
                </Col>
            </Row>
        </Container>
    );

};

const renderProjectDocument = (projectDocument: any) =>
    projectDocument ? <DocumentDetails document={ projectDocument } /> : '';

const renderResultList = (documents: any) =>
    documents.map(document => <DocumentTeaser document={ document } key={ document.resource.id } />);

const getProjectDocument = async (id: string): Promise<any> => {

    const response = await fetch(`/documents/${id}`);
    return await response.json();
};
