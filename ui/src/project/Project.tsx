import React, { useState, useEffect, CSSProperties, useContext } from 'react';
import { useParams, useLocation, useHistory, Link } from 'react-router-dom';
import ProjectHome from './ProjectHome';
import ProjectMap from './ProjectMap';
import DocumentInfo from './DocumentInfo';
import { get, mapSearch, search } from '../api/documents';
import { Document } from '../api/document';
import { Spinner, Card, Row, Col, Nav, Dropdown, DropdownButton, ButtonGroup, Button } from 'react-bootstrap';
import { ResultDocument, Result, FilterBucket, ResultFilter } from '../api/result';
import { buildProjectQueryTemplate, parseParams } from '../api/query';
import { History } from 'history';
import { LoginContext } from '../App';
import Icon from '@mdi/react';
import { mdiCloseCircle } from '@mdi/js';
import { NAVBAR_HEIGHT } from '../constants';
import SearchBar from './SearchBar';
import './project.css';


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

    return <>
        <div style={ leftSidebarStyle } className="sidebar">
            <SearchBar projectId={ projectId } />
            { renderFilters(filters, location.search) }
            { document
                ? <DocumentInfo projectId={ projectId } searchParams={ location.search } document={ document } />
                : <ProjectHome id={ projectId } searchParams={ location.search } />
            }
        </div>
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
    </>;

}


const initFilters = async (id: string, searchParams: string, token: string): Promise<Result> => {

    const query = buildProjectQueryTemplate(id, 0, 0);
    parseParams(searchParams, query);
    return search(query, token);
};


const searchMapDocuments = async (id: string, searchParams: string, token: string): Promise<Result> => {

    const query = buildProjectQueryTemplate(id, 0, MAX_SIZE);
    parseParams(searchParams, query);
    return mapSearch(query, token);
};


const onDocumentClick = (history: History, searchParams: string) => {
    return (path: string) => {
        history.push(path + searchParams);
    };
};


const renderFilters = (filters: ResultFilter[], searchParams: string) =>
    <Card body>
        <h4 className="d-inline">Filter:</h4>
        { filters.map((filter: ResultFilter) => renderFilter(filter, searchParams)) }
    </Card>;


const renderFilter = (filter: ResultFilter, searchParams: string) => (

    filter.values.length
        ? <DropdownButton
                as={ ButtonGroup }
                id={ `filter-dropdown-${filter.name}` }
                title={ filter.label.de  }
                key={ filter.name }
                size="sm ml-sm-2">
            <Dropdown.Header><h3>{ filter.label.de }</h3></Dropdown.Header>
            { filter.values.map((bucket: FilterBucket) => renderFilterValue(filter.name, bucket, searchParams)) }
        </DropdownButton>
        : null
);


const renderFilterValue = (key: string, bucket: FilterBucket, searchParams: string) => {

    return (
        <Dropdown.Item
                as={ Link }
                key={ bucket.value }
                style={ filterValueStyle }
                to={ addFilterToLocation(searchParams, key, bucket.value) }>
            { bucket.value }
            <span className="float-right"><em>{ bucket.count }</em></span>
        </Dropdown.Item>
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


const leftSidebarStyle: CSSProperties = {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
    width: '500px',
    position: 'absolute',
    top: NAVBAR_HEIGHT,
    left: '10px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column'
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

const filterValueStyle: CSSProperties = {
    width: '350px'
};
