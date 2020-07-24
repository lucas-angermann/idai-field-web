import React, { useState, useEffect, CSSProperties, useContext } from 'react';
import { useParams, useLocation, useHistory, Link } from 'react-router-dom';
import ProjectHome from './ProjectHome';
import ProjectMap from './ProjectMap';
import DocumentInfo from './DocumentInfo';
import { get, mapSearch, search } from '../api/documents';
import { Document } from '../api/document';
import { Spinner, Card, Dropdown, ButtonGroup, Button } from 'react-bootstrap';
import { ResultDocument, Result, FilterBucket, ResultFilter } from '../api/result';
import { buildProjectQueryTemplate, parseParams } from '../api/query';
import { History } from 'history';
import { LoginContext } from '../App';
import Icon from '@mdi/react';
import { mdiCloseCircle } from '@mdi/js';
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from '../constants';
import SearchBar from './SearchBar';
import './project.css';
import DocumentTeaser from '../document/DocumentTeaser';


const MAX_SIZE = 10000;


export default function Project() {

    const { projectId, documentId } = useParams();
    const location = useLocation();
    const history = useHistory();
    const loginData = useContext(LoginContext);
    const [document, setDocument] = useState<Document>(null);
    const [projectDocument, setProjectDocument] = useState<Document>(null);
    const [filters, setFilters] = useState<ResultFilter[]>([]);
    const [documents, setDocuments] = useState<ResultDocument[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {

        get(projectId, loginData.token).then(setProjectDocument);
    }, [projectId]);

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

    return <>
        <div style={ leftSidebarStyle } className="sidebar">
            { renderProjectTeaser(projectDocument) }
            <SearchBar projectId={ projectId } />
            { renderFilters(filters, location.search) }
            { document
                ? <DocumentInfo projectId={ projectId } searchParams={ location.search } document={ document } />
                : <ProjectHome id={ projectId } searchParams={ location.search } />
            }
        </div>
        <div key="results">
            { loading
                ? <div style={ spinnerContainerStyle }>
                    <Spinner animation="border" variant="secondary" />
                  </div>
                : <ProjectMap
                    document={ document }
                    documents={ documents }
                    onDocumentClick={ onDocumentClick(history, location.search) }/>
            }
        </div>
    </>;

}


const initFilters = async (id: string, searchParams: string, token: string): Promise<Result> => {

    const query = parseParams(searchParams, buildProjectQueryTemplate(id, 0, 0));
    return search(query, token);
};


const searchMapDocuments = async (id: string, searchParams: string, token: string): Promise<Result> => {

    const query = parseParams(searchParams, buildProjectQueryTemplate(id, 0, MAX_SIZE));
    return mapSearch(query, token);
};


const onDocumentClick = (history: History, searchParams: string) => {
    return (path: string) => {
        history.push(path + searchParams);
    };
};


const renderProjectTeaser = (projectDocument: Document) =>
    projectDocument ? <Card><Card.Body><DocumentTeaser document={ projectDocument } /></Card.Body></Card> : '';


const renderFilters = (filters: ResultFilter[], searchParams: string) =>
    <Card>
        <Card.Body className="d-flex py-2 pl-1 pr-2 align-self-stretch">
            { filters.map((filter: ResultFilter) => renderFilter(filter, searchParams)) }
        </Card.Body>
    </Card>;


const renderFilter = (filter: ResultFilter, searchParams: string) => {

    if (!filter.values.length) return null;

    const urlParams = new URLSearchParams(searchParams);

    return <Dropdown
                as={ ButtonGroup }
                key={ filter.name }
                size="sm pl-2"
                style={ { flexGrow: 1 } }>
            {
                urlParams.has(filter.name)
                    ? <>
                        <Link to={ getLinkWithoutFilter(searchParams, filter.name) } component={ Button }>
                            { filter.label.de }: <em>{ urlParams.getAll(filter.name).join(', ') }</em>
                            &nbsp; <Icon path={ mdiCloseCircle } style={ { verticalAlign: 'sub' } } size={ 0.7 } />
                        </Link>
                        <Dropdown.Toggle split id={ `filter-dropdown-${filter.name}` } />
                      </>
                    : <Dropdown.Toggle id={ `filter-dropdown-${filter.name}` }>{ filter.label.de }</Dropdown.Toggle>
            }
            <Dropdown.Menu>
                <Dropdown.Header><h3>{ filter.label.de }</h3></Dropdown.Header>
                { filter.values.map((bucket: FilterBucket) => renderFilterValue(filter.name, bucket, searchParams)) }
            </Dropdown.Menu>
    </Dropdown>;
};


const renderFilterValue = (key: string, bucket: FilterBucket, searchParams: string) => {

    return (
        <Dropdown.Item
                as={ Link }
                key={ bucket.value }
                style={ filterValueStyle }
                to={ addFilterToLocation(searchParams, key, bucket.value) }>
            { bucket.value }
            { renderCloseButton(searchParams, key, bucket.value) }
            <span className="float-right"><em>{ bucket.count }</em></span>
        </Dropdown.Item>
    );
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


const addFilterToLocation = (searchParams: string, key: string, value: string): string => {

    const urlParams = new URLSearchParams(searchParams);
    urlParams.append(key, value);
    return `?${urlParams.toString()}`;
};


const getLinkWithoutFilter = (searchParams: string, key: string): string => {

    const urlParams = new URLSearchParams(searchParams);
    urlParams.delete(key);
    return '?' + urlParams.toString();
};


const leftSidebarStyle: CSSProperties = {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
    width: `${SIDEBAR_WIDTH}px`,
    position: 'absolute',
    top: NAVBAR_HEIGHT,
    left: '10px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column'
};


const filterContainerStyle: CSSProperties = {
    padding: '.75rem',
    display: 'flex'
};


const spinnerContainerStyle: CSSProperties = {
    position: 'absolute',
    top: '50vh',
    left: '50vw',
    transform: `translate(calc(-50% + ${SIDEBAR_WIDTH / 2}px), -50%)`,
    zIndex: 1
};


const filterValueStyle: CSSProperties = {
    width: '350px'
};
