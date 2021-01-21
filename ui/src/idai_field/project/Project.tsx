import { mdiFileTree, mdiInformation } from '@mdi/js';
import Icon from '@mdi/react';
import { TFunction } from 'i18next';
import React, { CSSProperties, ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Card, Spinner, Tooltip } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { Document } from '../../api/document';
import { get, search, searchMap } from '../../api/documents';
import { buildProjectQueryTemplate, parseFrontendGetParams } from '../../api/query';
import { Result, ResultDocument, ResultFilter } from '../../api/result';
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from '../../constants';
import DocumentDetails from '../../shared/document/DocumentDetails';
import Documents from '../../shared/documents/Documents';
import { getUserInterfaceLanguage } from '../../shared/languages';
import LinkButton from '../../shared/linkbutton/LinkButton';
import { LoginContext } from '../../shared/login';
import NotFound from '../../shared/NotFound';
import SearchBar from '../../shared/search/SearchBar';
import { EXCLUDED_TYPES_FIELD } from '../constants';
import Filters from '../filter/Filters';
import { getContextUrl } from './navigation';
import ProjectMap from './ProjectMap';
import ProjectSidebar from './ProjectSidebar';


const MAX_SIZE = 10000;
export const CHUNK_SIZE = 50;


export default function Project(): ReactElement {

    const { projectId, documentId } = useParams<{ projectId: string, documentId: string }>();
    const location = useLocation();
    const loginData = useContext(LoginContext);
    const { t } = useTranslation();

    const [projectDocument, setProjectDocument] = useState<Document>(null);
    const [document, setDocument] = useState<Document>(null);
    const [documents, setDocuments] = useState<ResultDocument[]>([]);
    const [mapDocument, setMapDocument] = useState<Document>(null);
    const [mapDocuments, setMapDocuments] = useState<ResultDocument[]>([]);
    const [notFound, setNotFound] = useState<boolean>(false);
    const [filters, setFilters] = useState<ResultFilter[]>([]);
    const [total, setTotal] = useState<number>();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {

        get(projectId, loginData.token)
            .then(setProjectDocument)
            .catch(() => setNotFound(true));
    }, [projectId, loginData]);

    useEffect(() => {

        if (documentId) {
            get(documentId, loginData.token)
                .then(setDocument)
                .catch(() => setNotFound(true));
        } else {
            setDocument(null);
        }
    }, [documentId, loginData]);

    useEffect(() => {

        const parent = new URLSearchParams(location.search).get('parent');

        if (document) {
            setMapDocument(document);
        } else if (parent && parent !== 'root') {
            get(parent, loginData.token).then(setMapDocument);
        } else {
            setMapDocument(null);
        }
    }, [location.search, document, loginData]);

    useEffect(() => {

        initFilters(projectId, location.search, loginData.token)
            .then(result => setFilters(result.filters));

        searchDocuments(projectId, location.search, 0, loginData.token)
            .then(result => {
                setDocuments(result.documents);
                setTotal(result.size);
            });
    }, [projectId, location.search, loginData]);

    useEffect(() => {

        setLoading(true);
        searchMapDocuments(projectId, loginData.token)
            .then(result => {
                setMapDocuments(result.documents);
                setLoading(false);
            });
    }, [projectId, loginData]);

    const getChunk = useCallback(
        (offset: number): void => {
            searchDocuments(projectId, location.search, offset, loginData.token)
            .then(result => setDocuments(oldDocs => oldDocs.concat(result.documents)));
        },
        [projectId, location.search, loginData]
    );

    if (notFound) return <NotFound />;

    return <>
        <ProjectSidebar>
            <Card>
                <SearchBar onSubmit={ () => { setDocuments(null); setTotal(null); } }
                       basepath={ `/project/${projectId}` } />
            </Card>
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
                        getChunk={ getChunk } />
                </>
            }
        </ProjectSidebar>
        <div key="results">
            { loading &&
                <div style={ spinnerContainerStyle }>
                    <Spinner animation="border" variant="secondary" />
                </div>
            }
            { !mapDocuments?.length && !loading && renderEmptyResult(t, location.search) }
            <ProjectMap
                document={ mapDocument }
                documents={ mapDocuments }
                project={ projectId } />
        </div>
    </>;
}


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

    let query = buildProjectQueryTemplate(id, 0, 0, EXCLUDED_TYPES_FIELD);
    query = parseFrontendGetParams(searchParams, query);
    return search(query, token);
};

const searchDocuments = async (id: string, searchParams: string, from: number, token: string): Promise<Result> => {
    
    let query = buildProjectQueryTemplate(id, from, CHUNK_SIZE, EXCLUDED_TYPES_FIELD);
    query = parseFrontendGetParams(searchParams, query);
    return search(query, token);
};


const searchMapDocuments = async (id: string, token: string): Promise<Result> => {

    const query = buildProjectQueryTemplate(id, 0, MAX_SIZE, EXCLUDED_TYPES_FIELD);
    console.log({ query });
    return searchMap(query, token);
};


const isInHierarchyMode = (searchParams: string): boolean => {

    return searchParams && new URLSearchParams(searchParams).has('parent');
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
