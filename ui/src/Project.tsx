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
    const [filters, setFilters] = useState([]);
    const [offset, setOffset] = useState(0);
    const [projectDocument, setProjectDocument] = useState(null);

    const onScroll = (e: React.UIEvent<Element, UIEvent>) => {

        const el = e.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
            const newOffset = offset + CHUNK_SIZE;
            searchDocuments(id, getQueryParam(location, 'type'), newOffset)
                .then(result => setDocuments(documents.concat(result.documents)));
            setOffset(newOffset);
        }
    };

    useEffect(() => {
        searchDocuments(id, getQueryParam(location, 'type'), 0).then(result => {
            setDocuments(result.documents);
            setFilters(result.filters);
        });
        get(id).then(setProjectDocument);
    }, [id, location]);

    return (
        <Container fluid>
            <Row>
                <Col sm={ 3 }>
                    { renderProjectTeaser(projectDocument) }
                    { renderFilters(filters) }
                </Col>
                <Col onScroll={ onScroll } style={ { height: 'calc(100vh - 56px)', overflow: 'auto' } }>
                    <DocumentList documents={ documents } />
                </Col>
            </Row>
        </Container>
    );

};

const searchDocuments = async (id: string, type: string, from: number) => {

    const query = {
        q: `project:${id}`,
        size: CHUNK_SIZE,
        from,
        skipTypes: ['Project', 'Image', 'Photo', 'Drawing']
    };
    if (type) query.q += ` AND resource.type:${type}`;
    return search(query);
};

const renderProjectTeaser = (projectDocument: any) =>
    projectDocument ? <DocumentTeaser document={ projectDocument } /> : '';

const renderFilters = (filters: any) =>
    Object.keys(filters).map((key: string) => renderFilter(key, filters[key]));

const renderFilter = (key: string, filter: any) => (
    <Card key={ key }>
        <Card.Header>{ key }</Card.Header>
        <Card.Body>
            { filter.map((bucket: any) => renderFilterValue(key, bucket)) }
        </Card.Body>
    </Card>
);

const renderFilterValue = (key: string, bucket: any) => (
    <Row key={ bucket.value }>
        <Col>
            <Link to={ `?${key}=${bucket.value}` }>
                { bucket.value }
            </Link>
        </Col>
        <Col><em>{ bucket.count }</em></Col>
    </Row>
);

const getQueryParam = (location: any, key: string) => {

    return new URLSearchParams(location.search).get(key);
};
