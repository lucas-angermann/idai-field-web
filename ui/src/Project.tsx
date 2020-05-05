import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { search } from './search';
import DocumentTeaser from './DocumentTeaser';
import { Container, Row, Col } from 'react-bootstrap';
import DocumentList from './DocumentList';

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
                <Col sm={ 3 }>
                    { renderProjectTeaser(projectDocument) }
                </Col>
                <Col>
                    <DocumentList documents={ documents } />
                </Col>
            </Row>
        </Container>
    );

};

const renderProjectTeaser = (projectDocument: any) =>
    projectDocument ? <DocumentTeaser document={ projectDocument } /> : '';

const getProjectDocument = async (id: string): Promise<any> => {

    const response = await fetch(`/documents/${id}`);
    return await response.json();
};
