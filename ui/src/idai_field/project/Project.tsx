import { mdiFileTree } from '@mdi/js';
import Icon from '@mdi/react';
import { History } from 'history';
import { TFunction } from 'i18next';
import React, { CSSProperties, ReactElement, useContext, useEffect, useState } from 'react';
import { Card, Tooltip } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import { Document } from '../../api/document';
import { get, getPredecessors, search } from '../../api/documents';
import { buildProjectQueryTemplate, parseFrontendGetParams } from '../../api/query';
import { Result, ResultDocument, ResultFilter } from '../../api/result';
import CONFIGURATION from '../../configuration.json';
import { SIDEBAR_WIDTH } from '../../constants';
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
const MAP_FIT_OPTIONS = { padding : [ 100, 100, 100, SIDEBAR_WIDTH + 100 ], duration: 500 };


export default function Project(): ReactElement {

    const { projectId, documentId } = useParams<{ projectId: string, documentId: string }>();
    const searchParams = useSearchParams();
    const history = useHistory();
    const loginData = useContext(LoginContext);
    const { t } = useTranslation();

    const [document, setDocument] = useState<Document>(null);
    const [documents, setDocuments] = useState<ResultDocument[]>([]);
    const [mapDocument, setMapDocument] = useState<Document>(null);
    const [predecessors, setPredecessors] = useState<ResultDocument[]>([]);
    const [notFound, setNotFound] = useState<boolean>(false);
    const [filters, setFilters] = useState<ResultFilter[]>([]);
    const [total, setTotal] = useState<number>();
    const [documentsLoaded, setDocumentsLoaded] = useState<boolean>(false);
    const [predecessorsLoaded, setPredecessorsLoaded] = useState<boolean>(false);
    const [hierarchyUpdate, setHierarchyUpdate] = useState<Date>();

    const parent = searchParams.get('parent');

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

        setPredecessorsLoaded(false);

        if (document) {
            if (document.resource.id !== documentId) return;
            setMapDocument(document);
            if (document.resource.parentId) {
                getPredecessors(document.resource.parentId, loginData.token)
                    .then(result => {
                        setPredecessors(result.results);
                        setPredecessorsLoaded(true);
                    });
            } else {
                setPredecessors([]);
            }
        } else if (parent && parent !== 'root') {
            get(parent, loginData.token).then(setMapDocument);
            getPredecessors(parent, loginData.token)
                .then(result => {
                    setPredecessors(result.results);
                    setPredecessorsLoaded(true);
                });
        } else {
            setMapDocument(null);
            setPredecessors([]);
            setPredecessorsLoaded(true);
        }
    }, [parent, document, documentId, loginData]);

    useEffect(() => {

        setDocumentsLoaded(false);

        initFilters(projectId, searchParams, loginData.token)
            .then(result => setFilters(result.filters));

        searchDocuments(projectId, searchParams, 0, loginData.token)
            .then(result => {
                setDocuments(result.documents);
                setTotal(result.size);
                setDocumentsLoaded(true);
            });
    }, [projectId, searchParams, loginData]);

    useEffect(() => {
        if (documentsLoaded && predecessorsLoaded) setHierarchyUpdate(new Date());
    }, [documentsLoaded, predecessorsLoaded]);

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
                ? renderDocumentDetails(document, predecessors)
                : isInHierarchyMode(searchParams)
                    ? renderDocumentHierarchy(documents, searchParams, projectId, predecessors, hierarchyUpdate,
                        onScroll)
                    : renderDocumentList(documents, searchParams, projectId, total, onScroll, t)
            }
        </ProjectSidebar>
        <ProjectMap selectedDocument={ mapDocument }
            predecessors={ predecessors }
            project={ projectId }
            onDeselectFeature={ () => deselectFeature(document, searchParams, history) }
            fitOptions={ MAP_FIT_OPTIONS } />
    </>;
}


export const deselectFeature = (document: Document, searchParams: URLSearchParams, history: History): void =>
    document && history.push(getMapDeselectionUrl(document.project, searchParams, document));


const renderDocumentDetails = (document: Document, predecessors: ResultDocument[]): React.ReactNode =>
    <>
        <Card className="p-2">
            <ProjectBreadcrumb projectId={ document.project } predecessors={ predecessors } />
        </Card>
        <DocumentCard document={ document }
            baseUrl={ CONFIGURATION.fieldUrl }
            cardStyle={ mainSidebarCardStyle } />
    </>;


const renderDocumentHierarchy = (documents: ResultDocument[], searchParams: URLSearchParams, projectId: string,
        predecessors: ResultDocument[], update: Date, onScroll: (e: React.UIEvent<Element, UIEvent>) => void) =>
    <>
        <Card className="p-2">
            <ProjectBreadcrumb projectId={ projectId } predecessors={ predecessors } />
        </Card>
        <Card style={ mainSidebarCardStyle }>
            <DocumentHierarchy documents={ documents } predecessors={ predecessors } project={ projectId }
                searchParams={ searchParams } update={ update } onScroll={ onScroll } />
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


export const initFilters = async (id: string, searchParams: URLSearchParams, token: string): Promise<Result> => {

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


const isInHierarchyMode = (searchParams: URLSearchParams): boolean => searchParams.has('parent');


const mainSidebarCardStyle: CSSProperties = {
    overflow: 'hidden auto',
    flex: '1 1'
};


const hierarchyButtonStyle: CSSProperties = {
    position: 'absolute',
    right: '13px',
    bottom: '13px',
    width: '45px',
    height: '38px',
    paddingTop: '3px'
};
