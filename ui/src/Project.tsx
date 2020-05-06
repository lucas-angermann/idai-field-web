import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { search, get } from './documents';
import DocumentTeaser from './DocumentTeaser';
import { Container, Row, Col, Card } from 'react-bootstrap';
import DocumentList from './DocumentList';


const CHUNK_SIZE = 50;


export default () => {

    const { id } = useParams();
    const location = useLocation();
    const [documents, setDocuments] = useState([]);
    const [aggregations, setAggregations] = useState([]);
    const [offset, setOffset] = useState(0);
    const [projectDocument, setProjectDocument] = useState(null);

    const onScroll = (e: React.UIEvent<Element, UIEvent>) => {

        const el = e.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
            const newOffset = offset + CHUNK_SIZE;
            searchDocuments(id, getQueryParam(location, 'types'), newOffset)
                .then(result => setDocuments(documents.concat(result.hits)));
            setOffset(newOffset);
        }
    };

    useEffect(() => {
        searchDocuments(id, getQueryParam(location, 'types'), 0).then(result => {
            setDocuments(result.hits);
            setAggregations(result.aggregations);
        });
        get(id).then(setProjectDocument);
    }, [id, location]);

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

const searchDocuments = async (id: string, types: string, from: number) => {

    const query = {
        q: `project:${id}`,
        size: CHUNK_SIZE,
        from,
        skipTypes: ['Project', 'Image', 'Photo', 'Drawing']
    };
    if (types) query.q += ` resource.type:${types}`;
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
            { aggregation.buckets.map((bucket: any) => renderBucket(key, bucket)) }
        </Card.Body>
    </Card>
);

const renderBucket = (key: string, bucket: any) => (
    <Row key={ bucket.key }>
        <Col>
            <Link to={ `?${key}=${bucket.key}` }>
                { bucket.key }
            </Link>
        </Col>
        <Col><em>{ bucket.doc_count }</em></Col>
    </Row>
);

const getQueryParam = (location: any, key: string) => {

    return new URLSearchParams(location.search).get(key);
};
