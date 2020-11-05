import React, { useState, useEffect, CSSProperties, useContext, ReactElement, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Spinner, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import Icon from '@mdi/react';
import { mdiArrowLeftCircle, mdiInformation } from '@mdi/js';
import ProjectMap from './ProjectMap';
import { get, mapSearch, search } from '../api/documents';
import { Document } from '../api/document';
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
import LinkButton from '../LinkButton';
import { getBackUrl } from './navigation';


const MAX_SIZE = 10000;
export const CHUNK_SIZE = 50;

/* eslint-disable react-hooks/exhaustive-deps */
export default function Project(): ReactElement {

    const { projectId, documentId } = useParams<{ projectId: string, documentId: string }>();
    const location = useLocation();
    const loginData = useContext(LoginContext);
    const [document, setDocument] = useState<Document>(null);
    const [projectDocument, setProjectDocument] = useState<Document>(null);
    const [filters, setFilters] = useState<ResultFilter[]>([]);
    const [documents, setDocuments] = useState<ResultDocument[]>([]);
    const [total, setTotal] = useState<number>();
    const [mapDocuments, setMapDocuments] = useState<ResultDocument[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { t } = useTranslation();

    let parentId: string | undefined;
    let waitForDocument: Promise<any> = new Promise(resolve => resolve());

    useEffect(() => {

        get(projectId, loginData.token).then(setProjectDocument);
    }, [projectId, loginData]);

    useEffect(() => {

        if (documentId) {
            waitForDocument = get(documentId, loginData.token);
            waitForDocument.then(doc => {
                setDocument(doc);
                parentId = doc?.resource.parentId;
            });
        } else {
            setDocument(null);
        }
    }, [documentId, loginData]);

    useEffect(() => {

        initFilters(projectId, location.search, loginData.token)
            .then(result => setFilters(result.filters));
    }, [projectId, location.search, loginData]);

    useEffect(() => {

        waitForDocument.then(() => {
            searchDocuments(projectId, location.search, 0, loginData.token, parentId)
                .then(result => {
                    setDocuments(result.documents);
                    setTotal(result.size);
                });
        });
    }, [projectId, location.search, loginData]);

    useEffect(() => {

        waitForDocument.then(() => {
            setLoading(true);
            searchMapDocuments(projectId, location.search, loginData.token, parentId)
                .then(result => {
                    setMapDocuments(result.documents);
                    setLoading(false);
                });
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
                    { renderBackButton(t, projectId, location.search, documents, document) }
                    <DocumentDetails document={ document } />
                </>
                : location.search && new URLSearchParams(location.search).has('q')
                    ? <>
                        { renderTotal(total, document, projectId, location.search, t) }
                        <ScrollableDocumentList documents={ documents } getChunk={ getChunk }
                            searchParams={ location.search } />
                    </>
                    : <>
                        { new URLSearchParams(location.search).has('parent')
                            && renderBackButton(t, projectId, location.search, documents, document) }
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
/* eslint-enable react-hooks/exhaustive-deps */


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


const renderBackButton = (t: TFunction, projectId: string, locationSearch: string, documents: ResultDocument[],
                          document?: Document): ReactElement => {

    return <>
        <Card body={ true }>
            <LinkButton variant="link" to={ getBackUrl(projectId, locationSearch, documents, document) }>
                <Icon path={ mdiArrowLeftCircle } size={ 0.8 } /> { t('project.back') }
            </LinkButton>
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


const searchDocuments = async (id: string, searchParams: string, from: number, token: string,
                               parentId?: string): Promise<Result> => {

    const query = parseFrontendGetParams(searchParams, buildProjectQueryTemplate(id, from, CHUNK_SIZE), parentId);
    return search(query, token);
};


const searchMapDocuments = async (id: string, searchParams: string, token: string,
                                  parentId?: string): Promise<Result> => {

    const query = parseFrontendGetParams(searchParams, buildProjectQueryTemplate(id, 0, MAX_SIZE), parentId);
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
