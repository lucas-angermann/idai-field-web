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
import Documents from '../../shared/documents/Documents';
import { getUserInterfaceLanguage } from '../../shared/languages';
import LinkButton from '../../shared/linkbutton/LinkButton';
import { LoginContext } from '../../shared/login';
import NotFound from '../../shared/NotFound';
import SearchBar from '../../shared/search/SearchBar';
import { EXCLUDED_TYPES_FIELD } from '../constants';
import Filters from '../filter/Filters';
import { getContextUrl, getMapDeselectionUrl } from './navigation';
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
                        getChunk={ getChunk } />
                </>
            }
        </ProjectSidebar>
        <ProjectMap selectedDocument={ mapDocument }
            project={ projectId }
            onDeselectFeature={ () => deselectFeature(document, location.search, history) } />
    </>;
}


const deselectFeature = (document: Document, searchParams: string, history: History): void =>
    document && history.push(getMapDeselectionUrl(document.project, searchParams, document));


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


const hierarchyButtonStyle: CSSProperties = {
    position: 'absolute',
    right: '13px',
    bottom: '13px',
    width: '45px',
    height: '38px',
    paddingTop: '3px'
};
