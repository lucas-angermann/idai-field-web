import { mdiFileTree, mdiInformation } from '@mdi/js';
import Icon from '@mdi/react';
import { TFunction } from 'i18next';
import React, { CSSProperties, ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Card, Spinner, Tooltip } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { Document } from '../../api/document';
import { get, mapSearch, search } from '../../api/documents';
import { buildProjectQueryTemplate, parseFrontendGetParams } from '../../api/query';
import { Result, ResultDocument, ResultFilter } from '../../api/result';
import { LoginContext } from '../../App';
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from '../../constants';
import { getUserInterfaceLanguage } from '../../languages';
import DocumentDetails from '../../shared/document/DocumentDetails';
import Documents from '../../shared/documents/Documents';
import LinkButton from '../../shared/linkbutton/LinkButton';
import { NotFound } from '../../shared/NotFound';
import SearchBar from '../../shared/search/SearchBar';
import { EXCLUDED_TYPES_FIELD } from '../constants';
import Filters from '../filter/Filters';
import { getContextUrl } from './navigation';
import './project.css';
import ProjectMap from './ProjectMap';


const MAX_SIZE = 10000;
export const CHUNK_SIZE = 50;

/* eslint-disable react-hooks/exhaustive-deps */
export default function Project(): ReactElement {

    const { projectId, documentId } = useParams<{ projectId: string, documentId: string }>();
    const location = useLocation();
    const loginData = useContext(LoginContext);
    const [document, setDocument] = useState<Document>(null);
    const [notFound, setNotFound] = useState<boolean>(false);
    const [projectDocument, setProjectDocument] = useState<Document>(null);
    const [filters, setFilters] = useState<ResultFilter[]>([]);
    const [documents, setDocuments] = useState<ResultDocument[]>(null);
    const [total, setTotal] = useState<number>();
    const [mapDocuments, setMapDocuments] = useState<ResultDocument[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { t } = useTranslation();

    let parentId: string | undefined;
    let waitForDocument: Promise<Document> = new Promise<Document>(resolve => resolve(null));

    useEffect(() => {

        get(projectId, loginData.token)
            .then(setProjectDocument)
            .catch(() => setNotFound(true));
    }, [projectId, loginData]);

    useEffect(() => {

        if (documentId) {
            waitForDocument = get(documentId, loginData.token);
            waitForDocument.then(doc => {
                parentId = doc?.resource.parentId ?? 'root';
                setDocument(doc);
            }).catch(() => setNotFound(true));
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

        setLoading(true);
        waitForDocument.then(() => {
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

    if (notFound) return <NotFound />;

    return <>
        <div style={ leftSidebarStyle } className="sidebar">
            <SearchBar projectId={ projectId }
                       onSubmit={ () => { setDocuments(null); setTotal(null); } } />
            <Filters filters={ filters.filter(filter => filter.name !== 'project') }
                     searchParams={ location.search }
                     projectId={ projectId } />
            { document
                ? <DocumentDetails document={ document }
                                     searchParams={ location.search }
                                     backButtonUrl={ getContextUrl(projectId, location.search, document) } />
                : <>
                    {
                        !isInHierarchyMode(location.search) && renderTotal(total, document, projectId, t, setDocuments)
                    }
                    <Documents
                        searchParams={ location.search }
                        documents={ documents }
                        projectDocument={ projectDocument }
                        getChunk={ getChunk }/>
                </>
            }
        </div>
        <div key="results">
            { loading &&
                <div style={ spinnerContainerStyle }>
                    <Spinner animation="border" variant="secondary" />
                </div>
            }
            { !mapDocuments?.length && !loading && renderEmptyResult(t, location.search) }
            <ProjectMap
                document={ document }
                documents={ mapDocuments }
                project={ projectId } />
        </div>
    </>;
}
/* eslint-enable react-hooks/exhaustive-deps */


const renderTotal = (total: number, document: Document, projectId: string, t: TFunction,
                     setDocuments: (documents: ResultDocument[]) => void): ReactElement => {

    if (!total) return null;

    return <Card body={ true }>
        { t('project.total') }
        <b> { total.toLocaleString(getUserInterfaceLanguage()) } </b>
        { t('project.resources') }
        <div onClick={ () => setDocuments(null) }>
            <LinkButton to={ `/project/${projectId}?parent=root` } style={ hierarchyButtonStyle }
                        variant={ 'secondary' } tooltip={ renderHierarchyButtonTooltip(t) }>
                <Icon path={ mdiFileTree } size={ 0.7 } />
            </LinkButton>
        </div>
    </Card>;
};


const renderEmptyResult = (t: TFunction, searchParams: string): ReactElement => {

    return <div className="alert alert-info" style={ emptyResultStyle }>
        <Icon path={ mdiInformation } size={ 0.8 } />&nbsp;
        { t('project.noGeometries.' + (isInHierarchyMode(searchParams) ? 'hierarchy' : 'search')) }
    </div>;
};


const renderHierarchyButtonTooltip = (t: TFunction): ReactElement => {

    return <Tooltip id="hierarchy-button-tooltip">
        { t('project.hierarchyView') }
    </Tooltip>;
};


const initFilters = async (id: string, searchParams: string, token: string): Promise<Result> => {

    const query = parseFrontendGetParams(searchParams, buildProjectQueryTemplate(id, 0, 0, EXCLUDED_TYPES_FIELD));
    return search(query, token);
};


const searchDocuments = async (id: string, searchParams: string, from: number, token: string,
                               parentId?: string): Promise<Result> => {

    const query = parseFrontendGetParams(searchParams,
        buildProjectQueryTemplate(id, from, CHUNK_SIZE, EXCLUDED_TYPES_FIELD), parentId);
    return search(query, token);
};


const searchMapDocuments = async (id: string, searchParams: string, token: string,
                                  parentId?: string): Promise<Result> => {

    const query = parseFrontendGetParams(searchParams,
        buildProjectQueryTemplate(id, 0, MAX_SIZE, EXCLUDED_TYPES_FIELD), parentId);
    return mapSearch(query, token);
};


const isInHierarchyMode = (searchParams: string): boolean => {

    return searchParams && new URLSearchParams(searchParams).has('parent');
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


const hierarchyButtonStyle: CSSProperties = {
    position: 'absolute',
    right: '13px',
    bottom: '13px',
    width: '45px',
    height: '38px',
    paddingTop: '3px'
};
