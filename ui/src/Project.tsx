import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { search, get } from './documents';
import DocumentTeaser from './DocumentTeaser';
import { Container, Row, Col, Card } from 'react-bootstrap';
import DocumentList from './DocumentList';


const CHUNK_SIZE = 50;


export default () => {

    const { id } = useParams();
    const [documents, setDocuments] = useState([]);
    const [aggregations, setAggregations] = useState([]);
    const [offset, setOffset] = useState(0);
    const [projectDocument, setProjectDocument] = useState(null);

    const onScroll = (e: React.UIEvent<Element, UIEvent>) => {

        const el = e.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
            const newOffset = offset + CHUNK_SIZE;
            searchDocuments(id, newOffset).then(result => setDocuments(documents.concat(result.hits)));
            setOffset(newOffset);
        }
    };

    useEffect(() => {
        searchDocuments(id, 0).then(result => {
            setDocuments(result.hits);
            setAggregations(result.aggregations);
        });
        get(id).then(setProjectDocument);
    }, [id]);

    return (
        <Container fluid>
            <Row>
                <Col sm={ 3 }>
                    { renderProjectTeaser(projectDocument) }
                    { renderAggregations(aggregations) }
                </Col>
                <Col onScroll={ onScroll } style={ { height: 'calc(100vh - 56px)', overflow: 'auto' } }>
                    <DocumentList documents={ documents } />
                </Col>
            </Row>
        </Container>
    );

};

const searchDocuments = async (id: string, from: number) => {

    const query = {
        q: `project:${id}`,
        size: CHUNK_SIZE,
        from,
        skipTypes: ['Project', 'Image', 'Photo', 'Drawing']
    };
    return search(query);
};

const renderProjectTeaser = (projectDocument: any) =>
    projectDocument ? <DocumentTeaser document={ projectDocument } /> : '';

const renderAggregations = (aggregations: any) =>
    Object.keys(aggregations).map((key: string) => renderAggregation(key, aggregations[key]));

const renderAggregation = (key: string, aggregation: any) => (
    <Card key={ key }>
        <Card.Header>{ key }</Card.Header>
        <Card.Body>
            { aggregation.buckets.map(renderBucket) }
        </Card.Body>
    </Card>
);

const renderBucket = (bucket: any) => (
    <Row key={ bucket.key }>
        <Col>{ bucket.key }</Col>
        <Col><em>{ bucket.doc_count }</em></Col>
    </Row>
);
