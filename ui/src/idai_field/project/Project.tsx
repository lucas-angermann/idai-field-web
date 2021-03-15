import { mdiMenuLeft } from '@mdi/js';
import Icon from '@mdi/react';
import { History } from 'history';
import { TFunction } from 'i18next';
import React, { CSSProperties, ReactElement, useContext, useEffect, useRef, useState } from 'react';
import { Card } from 'react-bootstrap';
import { unstable_batchedUpdates } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Link, useHistory, useParams } from 'react-router-dom';
import { to } from 'tsfun';
import { Document } from '../../api/document';
import { search } from '../../api/documents';
import { buildProjectQueryTemplate, parseFrontendGetParams, Query } from '../../api/query';
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
import { fetchProjectData, ProjectData } from './projectData';
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
    const [mapHighlightedIds, setMapHighlightedIds] = useState<string[]>([]);
    const [predecessors, setPredecessors] = useState<ResultDocument[]>([]);
    const [notFound, setNotFound] = useState<boolean>(false);
    const [filters, setFilters] = useState<ResultFilter[]>([]);
    const [total, setTotal] = useState<number>();

    const previousSearchParams = useRef(new URLSearchParams());

    useEffect(() => {

        const parent: string = searchParams.get('parent');
        const query: Query = (searchParams.toString() !== previousSearchParams.current.toString())
            ? buildQuery(projectId, searchParams, 0)
            : null;
        previousSearchParams.current = searchParams;
        const predecessorsId: string = isResource(parent) ? parent : documentId;

        fetchProjectData(loginData.token, query, documentId, predecessorsId).then(data => {
            const newPredecessors = getPredecessors(data, parent, documentId);
            
            unstable_batchedUpdates(() => {
                if (data.searchResult) {
                    setDocuments(data.searchResult.documents);
                    setTotal(data.searchResult.size);
                    setFilters(data.searchResult.filters);
                }
                if (data.mapSearchResult) {
                    setMapHighlightedIds(
                        data.mapSearchResult.documents
                            ? data.mapSearchResult.documents.map(to('resource.id'))
                            : []
                    );
                }
                setDocument(data.selected);
                setPredecessors(newPredecessors);
                setMapDocument(getMapDocument(data, parent, newPredecessors));
            });
            if (documentId && !data.selected) setNotFound(true);
        });
    }, [projectId, documentId, searchParams, loginData]);

    const onScroll = useGetChunkOnScroll((newOffset: number) =>
        search(buildQuery(projectId, searchParams, newOffset), loginData.token)
            .then(result => setDocuments(oldDocs => oldDocs.concat(result.documents)))
    );

    const renderSidebarContent = () => {

        const hierarchyMode = isInHierarchyMode(searchParams);
        const searchMode = isInSearchMode(searchParams);

        const breadcrumbBox = renderBreadcrumb(projectId, predecessors);
        const totalBox = renderTotal(total, searchParams, !!document, filters, projectId, t);

        return document
            ? hierarchyMode
                ? [breadcrumbBox, totalBox, renderDocumentDetails(document)]
                : [searchMode && totalBox, breadcrumbBox, renderDocumentDetails(document)]
            : hierarchyMode
                ? [breadcrumbBox, totalBox, renderDocumentHierarchy(
                    documents, predecessors, searchParams, projectId, onScroll
                )]
                : [searchMode && totalBox, renderDocumentList(documents, searchParams, projectId, total, onScroll, t)];
    };

    if (notFound) return <NotFound />;

    return <>
        <ProjectSidebar>
            <Card className="d-flex flex-row" style={ searchCardStyle }>
                <LinkButton to={ `/project/${projectId}/entry` } variant="secondary" style={ homeButtonStyle }>
                    <img src="/marker-icon.svg" alt="Home" style={ homeIconStyle } />
                </LinkButton>
                <div style={ { flexGrow: 1 } }>
                    <SearchBar basepath={ `/project/${projectId}` } />
                </div>
            </Card>
            { renderSidebarContent() }
        </ProjectSidebar>
        <ProjectMap selectedDocument={ mapDocument }
            highlightedIds={ mapHighlightedIds }
            predecessors={ predecessors }
            project={ projectId }
            onDeselectFeature={ () => deselectFeature(document, searchParams, history) }
            spinnerContainerStyle={ mapSpinnerContainerStyle }
            fitOptions={ MAP_FIT_OPTIONS }
            isMiniMap={ false } />
    </>;
}


const deselectFeature = (document: Document, searchParams: URLSearchParams, history: History): void =>
    document && history.push(getMapDeselectionUrl(document.project, searchParams, document));


const renderDocumentDetails = (document: Document): React.ReactNode =>
    <DocumentCard document={ document }
        baseUrl={ CONFIGURATION.fieldUrl }
        cardStyle={ mainSidebarCardStyle } />;


const renderDocumentHierarchy = (documents: ResultDocument[], predecessors: ResultDocument[],
        searchParams: URLSearchParams, projectId: string, onScroll: (e: React.UIEvent<Element, UIEvent>) => void) =>
    <Card style={ mainSidebarCardStyle }>
        <DocumentHierarchy documents={ documents } predecessors={ predecessors } project={ projectId }
            searchParams={ searchParams } onScroll={ onScroll } />
    </Card>;


const renderBreadcrumb = (projectId: string, predecessors: ResultDocument[]) =>
    <Card className="p-2">
        <ProjectBreadcrumb projectId={ projectId } predecessors={ predecessors } />
    </Card>;


const renderDocumentList = (documents: ResultDocument[], searchParams: URLSearchParams, projectId: string,
        total: number, onScroll: (e: React.UIEvent<Element, UIEvent>) => void, t: TFunction) =>
    documents?.length
        ? <>
            <Card onScroll={ onScroll } style={ mainSidebarCardStyle }>
                <DocumentList documents={ documents } searchParams={ searchParams } />
            </Card>
        </>
        : <Card style={ mainSidebarCardStyle } className="text-center p-5">
            <em>{ t('project.noResults') }</em>
        </Card>;


const renderTotal = (total: number, searchParams: URLSearchParams, asLink: boolean, filters: ResultFilter[],
        projectId: string, t: TFunction): ReactElement => {

    if (!total) return null;

    const children = <>
        { t('project.total') }
        <b key="project-total"> { total.toLocaleString(getUserInterfaceLanguage()) } </b>
        { t('project.resources') }
    </>;

    return <Card className="d-flex flex-row">
        { asLink
            ? <div style={ totalTextStyle } className="py-2 px-3">
                <Link to={ `/project/${projectId}?${searchParams}` }>
                    <Icon path={ mdiMenuLeft } size={ 0.8 }></Icon>
                    { children }
                </Link>
            </div>
            : <>
                <div style={ totalTextStyle } className="py-2 px-3">
                    { children }
                </div>
                    <Filters filters={ filters.filter(filter => filter.name !== 'project') }
                            searchParams={ searchParams }
                            projectId={ projectId } />
            </>
        }
    </Card>;
};


export const initFilters = async (id: string, searchParams: URLSearchParams, token: string): Promise<Result> => {

    let query = buildProjectQueryTemplate(id, 0, 0, EXCLUDED_TYPES_FIELD);
    query = parseFrontendGetParams(searchParams, query);
    return search(query, token);
};


const buildQuery = (id: string, searchParams: URLSearchParams, from: number): Query => {

    const query = buildProjectQueryTemplate(id, from, CHUNK_SIZE, EXCLUDED_TYPES_FIELD);
    return parseFrontendGetParams(searchParams, query);
}


const getPredecessors = (data: ProjectData, parent: string, documentId: string): ResultDocument[] => {
    
    const predecessors = data.predecessors;
    if (!isResource(parent) && documentId && predecessors.length > 0) {
        predecessors.pop();
    }
    return predecessors;
};


const getMapDocument = (data: ProjectData, parent: string, predecessors: ResultDocument[]): Document => {

    return data.selected
        ? data.selected
        : (isResource(parent) && predecessors.length > 0)
            ? (predecessors[predecessors.length - 1] as Document)
            : null;
};


const isInHierarchyMode = (searchParams: URLSearchParams): boolean => searchParams.has('parent');


const isInSearchMode = (searchParams: URLSearchParams): boolean => searchParams.has('q');


const isResource = (parent: string) => parent && parent !== 'root';


const mainSidebarCardStyle: CSSProperties = {
    overflow: 'hidden auto',
    flex: '1 1'
};

const mapSpinnerContainerStyle: CSSProperties = {
    position: 'absolute',
    top: '50vh',
    left: '50vw',
    transform: `translate(calc(-50% + ${SIDEBAR_WIDTH / 2}px), -50%)`,
    zIndex: 1
};

const searchCardStyle: CSSProperties = {
    backgroundColor: 'transparent'
};

const homeButtonStyle: CSSProperties = {
    border: 0,
    marginRight: '2px'
};

const homeIconStyle: CSSProperties = {
    height: '20px',
    width: '20px',
    fill: 'black',
    verticalAlign: 'sub'
};

const totalTextStyle: CSSProperties = {
    flexGrow: 1
};
