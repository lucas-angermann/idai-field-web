import { mdiFileTree } from '@mdi/js';
import Icon from '@mdi/react';
import { History } from 'history';
import { TFunction } from 'i18next';
import React, { CSSProperties, ReactElement, useContext, useEffect, useState } from 'react';
import { Card, Tooltip } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import { Document } from '../../api/document';
import { get, search } from '../../api/documents';
import { buildProjectQueryTemplate, parseFrontendGetParams } from '../../api/query';
import { Result, ResultDocument, ResultFilter } from '../../api/result';
import CONFIGURATION from '../../configuration.json';
import DocumentCard from '../../shared/document/DocumentCard';
import DocumentHierarchy from '../../shared/documents/DocumentHierarchy';
import DocumentList from '../../shared/documents/DocumentList';
import { getUserInterfaceLanguage } from '../../shared/languages';
import LinkButton from '../../shared/linkbutton/LinkButton';
import { useSearchParams } from '../../shared/location';
import { LoginContext } from '../../shared/login';
import NotFound from '../../shared/NotFound';
import { useGetChunkOnScroll } from '../../shared/scroll';
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
    const searchParams = useSearchParams();
    const history = useHistory();
    const loginData = useContext(LoginContext);
    const { t } = useTranslation();

    const [document, setDocument] = useState<Document>(null);
    const [documents, setDocuments] = useState<ResultDocument[]>([]);
    const [mapDocument, setMapDocument] = useState<Document>(null);
    const [notFound, setNotFound] = useState<boolean>(false);
    const [filters, setFilters] = useState<ResultFilter[]>([]);
    const [total, setTotal] = useState<number>();
    const [parent, setParent] = useState<string>('root');

    useEffect(() => {
        if(searchParams.has('q')){
            setParent('');
        }
        else if(!searchParams.has('p') && !searchParams.has('parent')){
            searchParams.append('parent','root');
            setParent('root');
        } else {
            setParent(searchParams.get('parent'));
        }
    },[searchParams]);

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

        initFilters(projectId, searchParams, loginData.token)
            .then(result => setFilters(result.filters));

        searchDocuments(projectId, searchParams, 0, loginData.token)
            .then(result => {
                setDocuments(result.documents);
                setTotal(result.size);
            });
    }, [projectId, searchParams, loginData]);

    const onScroll = useGetChunkOnScroll((newOffset: number) =>
        searchDocuments(projectId, searchParams, newOffset, loginData.token)
            .then(result => setDocuments(oldDocs => oldDocs.concat(result.documents)))
    );

    if (notFound) return <NotFound />;

    return <>
        <ProjectSidebar>
            <Card>
                <SearchBar basepath={ `/project/${projectId}` } />
            </Card>
            <Filters filters={ filters.filter(filter => filter.name !== 'project') }
                     searchParams={ searchParams }
                     projectId={ projectId } />
            { document
                ? renderDocumentDetails(document)
                : isInHierarchyMode(parent)
                    ? renderDocumentHierarchy(documents, searchParams, projectId, parent, onScroll)
                    : renderDocumentList(documents, searchParams, projectId, total, onScroll, t)
            }
        </ProjectSidebar>
        <ProjectMap selectedDocument={ mapDocument }
            project={ projectId }
            onDeselectFeature={ () => deselectFeature(document, searchParams, history) } />
    </>;
}


const deselectFeature = (document: Document, searchParams: URLSearchParams, history: History): void =>
    document && history.push(getMapDeselectionUrl(document.project, searchParams, document));


const renderDocumentDetails = (document: Document): React.ReactNode =>
    <>
        <Card className="p-2">
            <ProjectBreadcrumb documentId={ document.resource.parentId } projectId={ document.project } />
        </Card>
        <DocumentCard document={ document }
            baseUrl={ CONFIGURATION.fieldUrl }
            cardStyle={ mainSidebarCardStyle } />
    </>;


const renderDocumentHierarchy = (documents: ResultDocument[], searchParams: URLSearchParams, projectId: string,
        parent: string, onScroll: (e: React.UIEvent<Element, UIEvent>) => void) =>
    <>
        <Card className="p-2">
            <ProjectBreadcrumb documentId={ parent } projectId={ projectId } />
        </Card>
        <Card style={ mainSidebarCardStyle }>
            <DocumentHierarchy documents={ documents } searchParams={ searchParams } onScroll={ onScroll } />
        </Card>
    </>;


const renderDocumentList = (documents: ResultDocument[], searchParams: URLSearchParams, projectId: string,
        total: number, onScroll: (e: React.UIEvent<Element, UIEvent>) => void, t: TFunction) =>
    documents?.length
        ? <>
            <Card body={ true }>
                { renderTotal(total, projectId, t) }
            </Card>
            <Card onScroll={ onScroll } style={ mainSidebarCardStyle }>
                <DocumentList documents={ documents } searchParams={ searchParams } />
            </Card>
        </>
        : <Card style={ mainSidebarCardStyle } className="text-center p-5">
            <em>{ t('project.noResults') }</em>
        </Card>;


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


const initFilters = async (id: string, searchParams: URLSearchParams, token: string): Promise<Result> => {

    let query = buildProjectQueryTemplate(id, 0, 0, EXCLUDED_TYPES_FIELD);
    query = parseFrontendGetParams(searchParams, query);
    return search(query, token);
};

const searchDocuments = async (id: string, searchParams: URLSearchParams,
        from: number, token: string): Promise<Result> => {
    
    let query = buildProjectQueryTemplate(id, from, CHUNK_SIZE, EXCLUDED_TYPES_FIELD);
    query = parseFrontendGetParams(searchParams, query);
    return search(query, token);
};


const isInHierarchyMode = (parent: string): boolean => parent !== '';


const mainSidebarCardStyle: CSSProperties = {
    overflow: 'hidden auto',
    flexGrow: 1,
    flexShrink: 1
};


const hierarchyButtonStyle: CSSProperties = {
    position: 'absolute',
    right: '13px',
    bottom: '13px',
    width: '45px',
    height: '38px',
    paddingTop: '3px'
};
