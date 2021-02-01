import { TFunction } from 'i18next';
import React, { CSSProperties, ReactElement, useContext, useEffect, useState } from 'react';
import { Alert, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { search } from '../../api/documents';
import { buildProjectOverviewQueryTemplate, parseFrontendGetParams } from '../../api/query';
import { Result, ResultDocument, ResultFilter } from '../../api/result';
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from '../../constants';
import DocumentList from '../../shared/documents/DocumentList';
import { useSearchParams } from '../../shared/location';
import { LoginContext } from '../../shared/login';
import SearchBar from '../../shared/search/SearchBar';
import { EXCLUDED_TYPES_FIELD } from '../constants';
import Filters from '../filter/Filters';
import { CHUNK_SIZE } from '../project/Project';
import OverviewMap from './OverviewMap';
import './project-overview.css';


export default function ProjectOverview(): ReactElement {
    
    const searchParams = useSearchParams();
    const loginData = useContext(LoginContext);
    const { t } = useTranslation();

    const [projectDocuments, setProjectDocuments] = useState<ResultDocument[]>([]);
    const [documents, setDocuments] = useState<ResultDocument[]>(null);
    const [projectFilter, setProjectFilter] = useState<ResultFilter>(undefined);
    const [filters, setFilters] = useState<ResultFilter[]>([]);
    const [error, setError] = useState(false);
    const [offset, setOffset] = useState<number>(0);

    useEffect (() => {
        
        getProjectDocuments(loginData.token)
            .then(setProjectDocuments)
            .catch(err => setError(err));
    }, [loginData]);

    useEffect (() => {

        if (searchParams.entries.length > 0) {
            searchDocuments(searchParams, 0, loginData.token).then(result => {
                setProjectFilter(result.filters.find(filter => filter.name === 'project'));
                setFilters(result.filters.filter(filter => filter.name !== 'project'));
                setDocuments(result.documents);
            });
        } else {
            setProjectFilter(undefined);
            setFilters([]);
            setDocuments(null);
        }
    }, [searchParams, loginData]);

    const onScroll = (e: React.UIEvent<Element, UIEvent>) => {

        const el = e.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
            const newOffset = offset + CHUNK_SIZE;
            getChunk(newOffset);
            setOffset(newOffset);
        }
    };

    const getChunk = (newOffset: number): void => {

        searchDocuments(searchParams, newOffset, loginData.token).then(result => {
            setDocuments(oldDocuments => oldDocuments.concat(result.documents));
        });
    };

    return <>
        <div style={ leftSidebarStyle } className="sidebar">
            <Card>
                <SearchBar basepath="/" />
            </Card>
            { searchParams.entries.length > 0
                && documents && renderSidebar(filters, searchParams, documents, onScroll) }
        </div>
        <div>
            { error ? renderError(t) : renderMap(projectDocuments, projectFilter)}
        </div>
    </>;
}


const renderSidebar = (filters: ResultFilter[], searchParams: URLSearchParams, documents: ResultDocument[],
                       onScroll: (e: React.UIEvent<Element, UIEvent>) => void): ReactElement => {

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('r', 'overview');

    return <div className="project-overview-sidebar">
        <Filters filters={ filters } searchParams={ searchParams } />
        <Card style={ documentListContainerStyle } onScroll={ onScroll }>
            <DocumentList searchParams={ newSearchParams } documents={ documents } />
        </Card>
    </div>;
};


const renderError = (t: TFunction): ReactElement => (
    <Alert variant="danger">
        { t('projectOverview.backendNotAvailable') }
    </Alert>
);


const renderMap = (projectDocuments: ResultDocument[], projectFilter: ResultFilter): ReactElement =>
    <OverviewMap documents={ projectDocuments } filter={ projectFilter } />;


const getProjectDocuments = async (token: string): Promise<ResultDocument[]> =>
    (await search({ q: 'resource.category.name:Project' }, token)).documents;


const searchDocuments = async (searchParams: URLSearchParams, from: number, token: string): Promise<Result> => {

    const query = parseFrontendGetParams(searchParams,
        buildProjectOverviewQueryTemplate(from, CHUNK_SIZE, EXCLUDED_TYPES_FIELD));
    return search(query, token);
};


const documentListContainerStyle: CSSProperties = {
    overflow: 'hidden scroll'
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
