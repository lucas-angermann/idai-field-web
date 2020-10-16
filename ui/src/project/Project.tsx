import React, { useState, useEffect, CSSProperties, useContext, ReactElement, useCallback } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { History } from 'history';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import Icon from '@mdi/react';
import { mdiArrowLeftCircle, mdiInformation } from '@mdi/js';
import ProjectMap from './ProjectMap';
import { get, mapSearch, search } from '../api/documents';
import { Document } from '../api/document';
import { Spinner, Card, Button } from 'react-bootstrap';
import { ResultDocument, Result, ResultFilter } from '../api/result';
import { buildProjectQueryTemplate, parseFrontendGetParams } from '../api/query';
import { LoginContext } from '../App';
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from '../constants';
import SearchBar from './SearchBar';
import './project.css';
import DocumentTeaser from '../document/DocumentTeaser';
import Filters from '../filter/Filters';
import DocumentDetails from '../document/DocumentDetails';
import { getUserInterfaceLanguage } from '../languages';
import ScrollableDocumentList from './ScrollableDocumentList';
import DocumentHierarchy from './DocumentHierarchy';


const MAX_SIZE = 10000;
export const CHUNK_SIZE = 50;


export default function Project(): ReactElement {

    const { projectId, documentId } = useParams<{ projectId: string, documentId: string }>();
    const location = useLocation();
    const history = useHistory();
    const loginData = useContext(LoginContext);
    const [document, setDocument] = useState<Document>(null);
    const [projectDocument, setProjectDocument] = useState<Document>(null);
    const [filters, setFilters] = useState<ResultFilter[]>([]);
    const [documents, setDocuments] = useState<ResultDocument[]>([]);
    const [total, setTotal] = useState<number>();
    const [mapDocuments, setMapDocuments] = useState<ResultDocument[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { t } = useTranslation();

    useEffect(() => {

        get(projectId, loginData.token).then(setProjectDocument);
    }, [projectId, loginData]);

    useEffect(() => {

        documentId ? get(documentId, loginData.token)
            .then(setDocument) : setDocument(null);
    }, [documentId, loginData]);

    useEffect(() => {

        initFilters(projectId, location.search, loginData.token)
            .then(result => setFilters(result.filters));
    }, [projectId, location.search, loginData]);

    useEffect(() => {

        searchDocuments(projectId, location.search, 0, loginData.token).then(result => {
            setDocuments(result.documents);
            setTotal(result.size);
        });
    }, [projectId, location.search, loginData]);

    useEffect(() => {

        setLoading(true);
        searchMapDocuments(projectId, location.search, loginData.token)
            .then(result => {
                setMapDocuments(result.documents);
                setLoading(false);
            });
    }, [projectId, location.search, loginData]);

    const getChunk = useCallback(
        (offset: number): void => {
            searchDocuments(projectId, location.search, offset, loginData.token).then(result => {
                setDocuments((oldDocs) => oldDocs.concat(result.documents));
            });
        },
        [projectId, location.search, loginData]
    );

    return <>
        <div style={ leftSidebarStyle } className="sidebar">
            { projectDocument
                && <Card><Card.Body><DocumentTeaser document={ projectDocument } /></Card.Body></Card>
            }
            <SearchBar />
            <Filters filters={ filters.filter(filter => filter.name !== 'project') } searchParams={ location.search } />
            { document
                ? <>
                    { renderBackButton(history, t) }
                    <DocumentDetails document={ document } />
                </>
                : location.search && new URLSearchParams(location.search).has('q')
                    ? <>
                        { renderTotal(total, document, projectId, location.search, t) }
                        <ScrollableDocumentList documents={ documents } getChunk={ getChunk }
                            searchParams={ location.search } />
                    </>
                    : <>
                        { new URLSearchParams(location.search).has('parent') && renderBackButton(history, t) }
                        <DocumentHierarchy documents={ documents } searchParams={ location.search } />
                    </>
            }
        </div>
        <div key="results">
            { loading &&
                <div style={ spinnerContainerStyle }>
                    <Spinner animation="border" variant="secondary" />
                </div>
            }
            { !mapDocuments?.length && !loading && renderEmptyResult(t) }
            <ProjectMap
                document={ document }
                documents={ mapDocuments }
                project={ projectId } />
        </div>
    </>;

}


const renderTotal = (total: number, document: Document, projectId: string, searchParams, t: TFunction)
        : ReactElement => {

    if (!total) return null;

    return <>
        <Card body={ true }>
            { t('project.total') }
            <b> { total.toLocaleString(getUserInterfaceLanguage()) } </b>
            { t('project.resources') }
        </Card>
    </>;
};


const renderBackButton = (history: History, t: TFunction): ReactElement => {

    return <>
        <Card body={ true }>
            <Button variant="link" className="p-0" onClick={ () => history.goBack() }>
                <Icon path={ mdiArrowLeftCircle } size={ 0.8 } /> { t('project.back') }
            </Button>
        </Card>
    </>;
};


const renderEmptyResult = (t: TFunction): ReactElement => {

    return <>
        <div className="alert alert-info" style={ emptyResultStyle }>
            <Icon path={ mdiInformation } size={ 0.8 } />&nbsp;
            { t('projectMap.noResources') }
        </div>
    </>;
};


const initFilters = async (id: string, searchParams: string, token: string): Promise<Result> => {

    const query = parseFrontendGetParams(searchParams, buildProjectQueryTemplate(id, 0, 0));
    return search(query, token);
};


const searchDocuments = async (id: string, searchParams: string, from: number, token: string): Promise<Result> => {

    const query = parseFrontendGetParams(searchParams, buildProjectQueryTemplate(id, from, CHUNK_SIZE));
    return search(query, token);
};


const searchMapDocuments = async (id: string, searchParams: string, token: string): Promise<Result> => {

    const query = parseFrontendGetParams(searchParams, buildProjectQueryTemplate(id, 0, MAX_SIZE));
    return mapSearch(query, token);
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


const spinnerContainerStyle: CSSProperties = {
    position: 'absolute',
    top: '50vh',
    left: '50vw',
    transform: `translate(calc(-50% + ${SIDEBAR_WIDTH / 2}px), -50%)`,
    zIndex: 1
};


const emptyResultStyle: CSSProperties = {
    position: 'absolute',
    top: NAVBAR_HEIGHT,
    left: '50vw',
    transform: `translate(calc(-50% + ${SIDEBAR_WIDTH / 2}px), 10px)`,
    zIndex: 1
};
