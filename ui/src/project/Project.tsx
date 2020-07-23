import React, { useState, useEffect, CSSProperties, useContext } from 'react';
import { useParams, useLocation, useHistory, Link } from 'react-router-dom';
import ProjectHome from './ProjectHome';
import ProjectMap from './ProjectMap';
import DocumentInfo from './DocumentInfo';
import { get, mapSearch, search } from '../api/documents';
import { Document } from '../api/document';
import { Spinner, Card, Row, Col } from 'react-bootstrap';
import { ResultDocument, Result, FilterBucket, ResultFilter } from '../api/result';
import { buildProjectQueryTemplate, addFilters } from '../api/query';
import { History } from 'history';
import { LoginContext } from '../App';
import Icon from '@mdi/react';
import { mdiCloseCircle } from '@mdi/js';
import { NAVBAR_HEIGHT } from '../constants';


const MAX_SIZE = 10000;


export default function Project() {

    const { projectId, documentId } = useParams();
    const location = useLocation();
    const history = useHistory();
    const loginData = useContext(LoginContext);
    const [document, setDocument] = useState<Document>(null);
    const [filters, setFilters] = useState<ResultFilter[]>([]);
    const [documents, setDocuments] = useState<ResultDocument[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        documentId ? get(documentId, loginData.token)
            .then(setDocument) : setDocument(null);
    }, [documentId, loginData]);

    useEffect(() => {
        initFilters(projectId, location.search, loginData.token)
            .then(result => setFilters(result.filters));
    }, [projectId, location.search, loginData]);

    useEffect(() => {
        setLoading(true);
        searchMapDocuments(projectId, location.search, loginData.token)
            .then(result => {
                setDocuments(result.documents);
                setLoading(false);
            });
    }, [projectId, location.search, loginData]);

    return (
        <div>
            { document
                ? <DocumentInfo document={ document } />
                : <ProjectHome id={ projectId } searchParams={ location.search } />
            }
            <div key="results">
                { loading &&
                    <Spinner animation="border"
                        variant="secondary"
                        style={ spinnerStyle } />
                }
                <ProjectMap
                    document={ document }
                    documents={ documents }
                    onDocumentClick={ onDocumentClick(history, location.search) }/>
            </div>
            <div key="filters" style={ filtersContainerStyle }>
                { renderFilters(filters, location.search) }
            </div>
        </div>
    );

}


const initFilters = async (id: string, searchParams: string, token: string): Promise<Result> => {

    const query = buildProjectQueryTemplate(id, 0, 0);
    addFilters(query, searchParams);
    return search(query, token);
};


const searchMapDocuments = async (id: string, searchParams: string, token: string): Promise<Result> => {

    const query = buildProjectQueryTemplate(id, 0, MAX_SIZE);
    addFilters(query, searchParams);
    return mapSearch(query, token);
};


const onDocumentClick = (history: History, searchParams: string) => {
    return (path: string) => {
        history.push(path + searchParams);
    };
};


const renderFilters = (filters: ResultFilter[], searchParams: string) =>
    filters.map((filter: ResultFilter) => renderFilter(filter, searchParams));


const renderFilter = (filter: ResultFilter, searchParams: string) => (

    <Card key={ filter.name }>
        <Card.Header><h3>{ filter.label.de }</h3></Card.Header>
        <Card.Body>
            { filter.values.map((bucket: FilterBucket) => renderFilterValue(filter.name, bucket, searchParams)) }
        </Card.Body>
    </Card>
);


const renderFilterValue = (key: string, bucket: FilterBucket, searchParams: string) => {

    return (
        <Row key={ bucket.value }>
            <Col>
                <Link to={ addFilterToLocation(searchParams, key, bucket.value) }>
                    { bucket.value }
                </Link>
                { renderCloseButton(searchParams, key, bucket.value) }
            </Col>
            <Col sm={ 3 } className="text-right"><em>{ bucket.count }</em></Col>
        </Row>
    );
};


const addFilterToLocation = (searchParams: string, key: string, value: string): string => {

    const urlParams = new URLSearchParams(searchParams);
    urlParams.append(key, value);
    return `?${urlParams.toString()}`;
};


const renderCloseButton = (searchParams: string, key: string, value: string) => {

    const urlParams = new URLSearchParams(searchParams);
    if ( (urlParams.has(key) && urlParams.getAll(key).includes(value) ) ) {
        const newParams = urlParams.getAll(key).filter(v => v !== value);
        urlParams.delete(key);
        newParams.forEach(v => urlParams.append(key, v));
        return <Link to={ `?${urlParams.toString()}` }>
            <Icon path={ mdiCloseCircle } size={ 0.8 }/>
        </Link>;
    }
    return '';
};


const spinnerStyle: CSSProperties = {
    position: 'absolute',
    top: '50vh',
    left: '50vw',
    zIndex: 1
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
