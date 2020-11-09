import React, { useEffect, useState, useContext, ReactElement, CSSProperties } from 'react';
import { Alert } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import OverviewMap from './OverviewMap';
import { search } from '../api/documents';
import { Result, ResultDocument, ResultFilter } from '../api/result';
import { LoginContext } from '../App';
import SearchBar from '../project/SearchBar';
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from '../constants';
import { buildProjectOverviewQueryTemplate, parseFrontendGetParams } from '../api/query';
import { CHUNK_SIZE } from '../project/Project';
import Filters from '../filter/Filters';
import Documents from '../project/Documents';
import './project-overview.css';


export default function ProjectOverview(): ReactElement {

    const [projectDocuments, setProjectDocuments] = useState<ResultDocument[]>([]);
    const [documents, setDocuments] = useState<ResultDocument[]>(undefined);
    const [projectFilter, setProjectFilter] = useState<ResultFilter>(undefined);
    const [filters, setFilters] = useState<ResultFilter[]>([]);
    const [error, setError] = useState(false);
    const location = useLocation();
    const loginData = useContext(LoginContext);
    const { t } = useTranslation();

    useEffect (() => {
        getProjectDocuments(loginData.token)
            .then(setProjectDocuments)
            .catch(err => setError(err));
    }, [loginData]);

    useEffect (() => {
        if (location.search.length > 0) {
            searchDocuments(location.search, 0, loginData.token).then(result => {
                setProjectFilter(result.filters.find(filter => filter.name === 'project'));
                setFilters(result.filters.filter(filter => filter.name !== 'project'));
                setDocuments(result.documents);
            });
        } else {
            setProjectFilter(undefined);
            setFilters([]);
            setDocuments([]);
        }
    }, [location.search, loginData]);

    const getChunk = (offset: number): void => {

        searchDocuments(location.search, offset, loginData.token).then(result => {
            setDocuments(documents.concat(result.documents));
        });
    };

    return <>
        <div style={ leftSidebarStyle } className="sidebar">
            <SearchBar />
            { location.search.length > 0 && documents && renderSidebar(filters, location, documents, getChunk) }
        </div>
        <div>
            { error ? renderError(t) : renderMap(projectDocuments, projectFilter)}
        </div>
    </>;
}


const renderSidebar = (filters: ResultFilter[], location: any, documents: ResultDocument[],
                       getChunk: (offset: number) => void): ReactElement => (
    <div className="project-overview-sidebar">
        <Filters filters={ filters } searchParams={ location.search } />
        <Documents searchParams={ location.search }
            documents={ documents }
            getChunk={ getChunk } />
    </div>
);


const renderError = (t: TFunction): ReactElement => (
    <Alert variant="danger">
        { t('projectOverview.backendNotAvailable') }
    </Alert>
);


const renderMap = (projectDocuments: ResultDocument[], projectFilter: ResultFilter): ReactElement =>
    <OverviewMap documents={ projectDocuments } filter={ projectFilter } />;


const getProjectDocuments = async (token: string): Promise<ResultDocument[]> =>
    (await search({ q: 'resource.category.name:Project' }, token)).documents;


const searchDocuments = async (searchParams: string, from: number, token: string): Promise<Result> => {

    const query = parseFrontendGetParams(searchParams, buildProjectOverviewQueryTemplate(from, CHUNK_SIZE));
    return search(query, token);
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
