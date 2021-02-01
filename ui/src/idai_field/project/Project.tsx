import { mdiFileTree } from '@mdi/js';
import Icon from '@mdi/react';
import { History } from 'history';
import { TFunction } from 'i18next';
import React, { CSSProperties, ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Card, Tooltip } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { Document } from '../../api/document';
import { get, search } from '../../api/documents';
import { buildProjectQueryTemplate, parseFrontendGetParams } from '../../api/query';
import { Result, ResultDocument, ResultFilter } from '../../api/result';
import DocumentDetails from '../../shared/document/DocumentDetails';
import DocumentTeaser from '../../shared/document/DocumentTeaser';
import DocumentHierarchy from '../../shared/documents/DocumentHierarchy';
import DocumentList from '../../shared/documents/DocumentList';
import { getUserInterfaceLanguage } from '../../shared/languages';
import LinkButton from '../../shared/linkbutton/LinkButton';
import { LoginContext } from '../../shared/login';
import NotFound from '../../shared/NotFound';
import SearchBar from '../../shared/search/SearchBar';
import { EXCLUDED_TYPES_FIELD } from '../constants';
import Filters from '../filter/Filters';
import { getMapDeselectionUrl } from './navigation';
import ProjectBreadcrumb from './ProjectBreadcrumb';
import ProjectMap from './ProjectMap';
import ProjectSidebar from './ProjectSidebar';


export const CHUNK_SIZE = 50;


export default function Project(): ReactElement {

    const { projectId, documentId } = useParams<{ projectId: string, documentId: string }>();
    const location = useLocation();
    const history = useHistory();
    const loginData = useContext(LoginContext);
    const { t } = useTranslation();

    const [document, setDocument] = useState<Document>(null);
    const [documents, setDocuments] = useState<ResultDocument[]>([]);
    const [mapDocument, setMapDocument] = useState<Document>(null);
    const [notFound, setNotFound] = useState<boolean>(false);
    const [filters, setFilters] = useState<ResultFilter[]>([]);
    const [total, setTotal] = useState<number>();
    const [offset, setOffset] = useState<number>(0);

    const parent = new URLSearchParams(location.search).get('parent');

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

        if (document) {
            setMapDocument(document);
        } else if (parent && parent !== 'root') {
            get(parent, loginData.token).then(setMapDocument);
        } else {
            setMapDocument(null);
        }
    }, [parent, document, loginData]);

    useEffect(() => {

        initFilters(projectId, location.search, loginData.token)
            .then(result => setFilters(result.filters));

        searchDocuments(projectId, location.search, 0, loginData.token)
            .then(result => {
                setOffset(0);
                setDocuments(result.documents);
                setTotal(result.size);
            });
    }, [projectId, location.search, loginData]);

    const onScroll = (e: React.UIEvent<Element, UIEvent>) => {

        const el = e.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
            const newOffset = offset + CHUNK_SIZE;
            getChunk(newOffset);
            setOffset(newOffset);
        }
    };

    const getChunk = useCallback(
        (newOffset: number): void => {
            searchDocuments(projectId, location.search, newOffset, loginData.token)
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
                ? renderDocumentDetails(document, location.search)
                : isInHierarchyMode(location.search)
                    ? renderDocumentHierarchy(documents, location.search, projectId, parent, onScroll)
                    : renderDocumentList(documents, location.search, projectId, total, onScroll, t)
            }
        </ProjectSidebar>
        <ProjectMap selectedDocument={ mapDocument }
            project={ projectId }
            onDeselectFeature={ () => deselectFeature(document, location.search, history) } />
    </>;
}


const deselectFeature = (document: Document, searchParams: string, history: History): void =>
    document && history.push(getMapDeselectionUrl(document.project, searchParams, document));


const renderDocumentDetails = (document: Document, searchParams: string): React.ReactNode =>
    <>
        <Card>
            <ProjectBreadcrumb documentId={ document.resource.parentId } projectId={ document.project } />
        </Card>
        <Card style={ cardStyle }>
            <Card.Header style={ cardHeaderStyle }>
                <DocumentTeaser document={ document } searchParams={ searchParams } />
            </Card.Header>
            <Card.Body style={ cardBodyStyle }>
                <DocumentDetails document={ document } searchParams={ searchParams } />
            </Card.Body>
        </Card>
    </>;


const renderDocumentHierarchy = (documents: ResultDocument[], searchParams: string, projectId: string, parent: string,
        onScroll: (e: React.UIEvent<Element, UIEvent>) => void) =>
    <>
        <Card>
            <ProjectBreadcrumb documentId={ parent } projectId={ projectId } />
        </Card>
        <Card style={ cardStyle }>
            <DocumentHierarchy documents={ documents } searchParams={ searchParams } onScroll={ onScroll } />
        </Card>
    </>;


const renderDocumentList = (documents: ResultDocument[], searchParams: string, projectId: string, total: number,
        onScroll: (e: React.UIEvent<Element, UIEvent>) => void, t: TFunction) =>
    <>
        <Card body={ true }>
            { renderTotal(total, projectId, t) }
        </Card>
        <Card onScroll={ onScroll } style={ cardStyle }>
            <DocumentList documents={ documents } searchParams={ searchParams } />
        </Card>
    </>;


const renderTotal = (total: number, projectId: string, t: TFunction): ReactElement => {

    if (!total) return null;

    return <div>
        { t('project.total') }
        <b> { total.toLocaleString(getUserInterfaceLanguage()) } </b>
        { t('project.resources') }
        <div>
            <LinkButton to={ `/project/${projectId}?parent=root` } style={ hierarchyButtonStyle }
                        variant={ 'secondary' } tooltip={ renderHierarchyButtonTooltip(t) }>
                <Icon path={ mdiFileTree } size={ 0.7 } />
            </LinkButton>
        </div>
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


const isInHierarchyMode = (searchParams: string): boolean => {

    return searchParams && new URLSearchParams(searchParams).has('parent');
};


const cardStyle: CSSProperties = {
    overflow: 'hidden auto',
    flexGrow: 1,
    flexShrink: 1
};


const cardHeaderStyle: CSSProperties = {
    padding: '12px'
};


const cardBodyStyle: CSSProperties = {
    height: 'calc(100% - 94px)',
    overflow: 'auto'
};


const hierarchyButtonStyle: CSSProperties = {
    position: 'absolute',
    right: '13px',
    bottom: '13px',
    width: '45px',
    height: '38px',
    paddingTop: '3px'
};
