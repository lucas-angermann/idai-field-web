import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { search, get } from './documents';
import DocumentTeaser from './DocumentTeaser';
import { Container, Row, Col, Card } from 'react-bootstrap';
import DocumentList from './DocumentList';
import { mdiCloseCircle } from '@mdi/js';
import Icon from '@mdi/react';
import { Query } from './query';


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
            searchDocuments(id, location, newOffset)
                .then(result => setDocuments(documents.concat(result.documents)));
            setOffset(newOffset);
        }
    };

    useEffect(() => {
        searchDocuments(id, location, 0).then(result => {
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
                    { renderFilters(filters, location) }
                </Col>
                <Col onScroll={ onScroll } style={ { height: 'calc(100vh - 56px)', overflow: 'auto' } }>
                    <DocumentList documents={ documents } />
                </Col>
            </Row>
        </Container>
    );

};


const searchDocuments = async (id: string, location: any, from: number) => {

    const query: Query = buildQueryTemplate(id, from);
    addFilters(query, location);
    return search(query);
};


const buildQueryTemplate = (id: string, from: number): Query => ({
    q: '*',
    size: CHUNK_SIZE,
    from,
    filters: [
        { field: 'project', value: id }
    ],
    not: [
        { field: 'resource.type', value: 'Project' },
        { field: 'resource.type', value: 'Image' },
        { field: 'resource.type', value: 'Photo' },
        { field: 'resource.type', value: 'Drawing' }
    ]
});


const addFilters = (query: any, location: any) => {

    const filters = Array.from(new URLSearchParams(location.search).entries())
        .map(([field, value]) => ({ field, value }));
    query.filters = query.filters.concat(filters);
};


const renderProjectTeaser = (projectDocument: any) =>
    projectDocument ? <DocumentTeaser document={ projectDocument } /> : '';


const renderFilters = (filters: any, location: any) =>
    Object.keys(filters).map((key: string) => renderFilter(key, filters[key], location));


const renderFilter = (key: string, filter: any, location: any) => (
    <Card key={ key }>
        <Card.Header>{ key }</Card.Header>
        <Card.Body>
            { filter.map((bucket: any) => renderFilterValue(key, bucket, location)) }
        </Card.Body>
    </Card>
);


const renderFilterValue = (key: string, bucket: any, location: any) => {

    const urlParams = new URLSearchParams(location.search);
    return (
        <Row key={ bucket.value }>
            <Col>
                <Link to={ `?${key}=${bucket.value}` }>
                    { bucket.value }
                </Link>
                { (urlParams.has(key) && urlParams.get(key) === bucket.value ) ? renderCloseButton(key) : '' }
            </Col>
            <Col sm={ 3 } className="text-right"><em>{ bucket.count }</em></Col>
        </Row>
    );
};


const renderCloseButton = (key: string) => <Link to="?"><Icon path={ mdiCloseCircle } size={ 0.8 }/></Link>;
