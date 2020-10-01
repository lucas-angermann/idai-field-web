import React, { useEffect, useState, useContext, ReactElement, CSSProperties } from 'react';
import { Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import OverviewMap from './OverviewMap';
import { search } from '../api/documents';
import { Result, ResultDocument, ResultFilter } from '../api/result';
import { LoginContext } from '../App';
import SearchBar from '../project/SearchBar';
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from '../constants';
import { useLocation } from 'react-router-dom';
import { buildProjectOverviewQueryTemplate, parseFrontendGetParams } from '../api/query';
import { CHUNK_SIZE } from '../project/Project';


export default function ProjectOverview(): ReactElement {

    const [projectDocuments, setProjectDocuments] = useState<ResultDocument[]>([]);
    const [projectFilter, setProjectFilter] = useState<ResultFilter>(undefined);
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
            });
        }
    }, [location.search, loginData]);

    return <>
        <div style={ leftSidebarStyle } className="sidebar">
            <SearchBar />
        </div>
        <div>
            { error ? renderError(t) : renderMap(projectDocuments, projectFilter)}
        </div>
    </>;
}


const renderError = (t: TFunction): ReactElement => (
    <Alert variant="danger">
        { t('projectOverview.backendNotAvailable') }
    </Alert>
);


const renderMap = (projectDocuments: ResultDocument[], projectFilter: ResultFilter): ReactElement =>
    <OverviewMap documents={ projectDocuments } filter={ projectFilter }></OverviewMap>;


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
