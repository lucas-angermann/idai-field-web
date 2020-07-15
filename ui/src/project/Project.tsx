import React, { useState, useEffect, CSSProperties } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Location } from 'history';
import { search, get, mapSearch } from '../api/documents';
import DocumentTeaser from '../document/DocumentTeaser';
import { Row, Col, Card, Alert } from 'react-bootstrap';
import DocumentList from './DocumentList';
import { mdiCloseCircle } from '@mdi/js';
import Icon from '@mdi/react';
import { Query } from '../api/query';
import ProjectMap from './ProjectMap';
import { ResultFilter, FilterBucket, Result, ResultDocument } from '../api/result';
import { NAVBAR_HEIGHT } from '../constants';
import { Document } from '../api/document';


const CHUNK_SIZE = 50;


export default () => {

    const { id } = useParams();
    const location = useLocation();
    const [documents, setDocuments] = useState<ResultDocument[]>([]);
    const [mapDocuments, setMapDocuments] = useState<ResultDocument[]>([]);
    const [filters, setFilters] = useState<ResultFilter[]>([]);
    const [offset, setOffset] = useState(0);
    const [projectDocument, setProjectDocument] = useState<Document>(null);
    const [error, setError] = useState(false);

    const onScroll = (e: React.UIEvent<Element, UIEvent>) => {

        const el = e.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
            const newOffset = offset + CHUNK_SIZE;
            searchDocuments(id, location, newOffset)
                .then(result => setDocuments(documents.concat(result.documents)))
                .catch(err => setError(err));
            setOffset(newOffset);
        }
    };

    useEffect(() => {

        setMapDocuments([]);

        searchDocuments(id, location, 0).then(result => {
            setDocuments(result.documents);
            setFilters(result.filters);
        }).catch(err => setError(err));

        searchMapDocuments(id, location)
            .then(result => setMapDocuments(result.documents))
            .catch((err: any) => setError(err));

        get(id).then(setProjectDocument);
    }, [id, location]);

    const renderResult = () => {
        return [
            <div style={ leftOverlayStyle } key="left-overlay">
                { renderProjectTeaser(projectDocument) }
                <Card onScroll={ onScroll } style={ listContainerStyle }>
                    <Card.Body style={ { padding: '.5rem 1.5rem' } }>
                        <DocumentList documents={ documents } />
                    </Card.Body>
                </Card>
            </div>,
            <div key="filters" style={ filtersContainerStyle }>
                { renderFilters(filters, location) }
            </div>,
            <div key="results">
                <ProjectMap documents={ mapDocuments } />
            </div>
        ];
    };

    return (
        <div>
            { error ? renderError(error) : renderResult() }
        </div>
    );

};


const searchDocuments = async (id: string, location: Location, from: number): Promise<Result> => {

    const query = buildQueryTemplate(id, from);
    addFilters(query, location);
    return search(query);
};


const searchMapDocuments = async (id: string, location: Location): Promise<Result> => {

    const query = buildQueryTemplate(id, 0);
    addFilters(query, location);
    return mapSearch(query);
};


const buildQueryTemplate = (id: string, from: number): Query => {

    const query: Query = {
        q: '*',
        size: CHUNK_SIZE,
        from,
        filters: [
            { field: 'project', value: id }
        ],
        not: [
            { field: 'resource.category', value: 'Project' },
            { field: 'resource.category', value: 'Image' },
            { field: 'resource.category', value: 'Photo' },
            { field: 'resource.category', value: 'Drawing' }
        ]
    };

    return query;
};


const addFilters = (query: Query, location: Location) => {

    const filters = Array.from(new URLSearchParams(location.search).entries())
        .map(([field, value]) => ({ field, value }));
    query.filters = query.filters.concat(filters);
};


const renderProjectTeaser = (projectDocument: Document) =>
    projectDocument ? <Card><Card.Body><DocumentTeaser document={ projectDocument } /></Card.Body></Card> : '';


const renderFilters = (filters: ResultFilter[], location: Location) =>
    filters.map((filter: ResultFilter) => renderFilter(filter, location));


const renderFilter = (filter: ResultFilter, location: Location) => (

    <Card key={ filter.name }>
        <Card.Header><h3>{ filter.label.de }</h3></Card.Header>
        <Card.Body>
            { filter.values.map((bucket: FilterBucket) => renderFilterValue(filter.name, bucket, location)) }
        </Card.Body>
    </Card>
);


const renderFilterValue = (key: string, bucket: FilterBucket, location: Location) => {

    return (
        <Row key={ bucket.value }>
            <Col>
                <Link to={ addFilterToLocation(location, key, bucket.value) }>
                    { bucket.value }
                </Link>
                { renderCloseButton(location, key, bucket.value) }
            </Col>
            <Col sm={ 3 } className="text-right"><em>{ bucket.count }</em></Col>
        </Row>
    );
};


const addFilterToLocation = (location: Location, key: string, value: string): Location => {

    const urlParams = new URLSearchParams(location.search);
    urlParams.append(key, value);
    return addParamsToLocation(location, urlParams);
};


const renderCloseButton = (location: Location, key: string, value: string) => {

    const urlParams = new URLSearchParams(location.search);
    if ( (urlParams.has(key) && urlParams.getAll(key).includes(value) ) ) {
        const newParams = urlParams.getAll(key).filter(v => v !== value);
        urlParams.delete(key);
        newParams.forEach(v => urlParams.append(key, v));
        return <Link to={ addParamsToLocation(location, urlParams) }>
            <Icon path={ mdiCloseCircle } size={ 0.8 }/>
        </Link>;
    }
    return '';
};


const addParamsToLocation = (location: Location, urlParams: URLSearchParams): Location =>
    ({ search: `?${urlParams.toString()}`, pathname: location.pathname, state: null, hash: null });


const renderError = (error: any) => {

    console.error(error);
    return <Col><Alert variant="danger">Backend not available!</Alert></Col>;
};


const leftOverlayStyle: CSSProperties = {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
    width: '400px',
    position: 'absolute',
    top: NAVBAR_HEIGHT,
    left: '10px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column'
};


const listContainerStyle: CSSProperties = {
    marginTop: '0',
    overflow: 'auto',
    flexGrow: 1
};


const filtersContainerStyle: CSSProperties = {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
    width: '400px',
    position: 'absolute',
    top: NAVBAR_HEIGHT,
    right: '10px',
    overflow: 'auto',
    zIndex: 1000
};
