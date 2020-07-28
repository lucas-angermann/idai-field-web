import React, { useState, useEffect, CSSProperties, useContext } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import ProjectHome from './ProjectHome';
import ProjectMap from './ProjectMap';
import DocumentInfo from './DocumentInfo';
import { get, mapSearch, search } from '../api/documents';
import { Document } from '../api/document';
import { Spinner, Card } from 'react-bootstrap';
import { ResultDocument, Result, ResultFilter } from '../api/result';
import { buildProjectQueryTemplate, parseFrontendGetParams } from '../api/query';
import { History } from 'history';
import { LoginContext } from '../App';
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from '../constants';
import SearchBar from './SearchBar';
import './project.css';
import DocumentTeaser from '../document/DocumentTeaser';
import Filters from './Filters';


const MAX_SIZE = 10000;


export default function Project() {

    const { projectId, documentId } = useParams();
    const location = useLocation();
    const history = useHistory();
    const loginData = useContext(LoginContext);
    const [document, setDocument] = useState<Document>(null);
    const [projectDocument, setProjectDocument] = useState<Document>(null);
    const [filters, setFilters] = useState<ResultFilter[]>([]);
    const [documents, setDocuments] = useState<ResultDocument[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

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

        setLoading(true);
        searchMapDocuments(projectId, location.search, loginData.token)
            .then(result => {
                setDocuments(result.documents);
                setLoading(false);
            });
    }, [projectId, location.search, loginData]);

    return <>
        <div style={ leftSidebarStyle } className="sidebar">
            { projectDocument
                && <Card><Card.Body><DocumentTeaser document={ projectDocument } /></Card.Body></Card>
            }
            <SearchBar projectId={ projectId } />
            <Filters filters={ filters } searchParams={ location.search } />
            { document
                ? <DocumentInfo projectId={ projectId } searchParams={ location.search } document={ document } />
                : <ProjectHome id={ projectId } searchParams={ location.search } />
            }
        </div>
        <div key="results">
            { loading
                ? <div style={ spinnerContainerStyle }>
                    <Spinner animation="border" variant="secondary" />
                  </div>
                : <ProjectMap
                    document={ document }
                    documents={ documents }
                    onDocumentClick={ onDocumentClick(history, location.search) }/>
            }
        </div>
    </>;

}


const initFilters = async (id: string, searchParams: string, token: string): Promise<Result> => {

    const query = parseFrontendGetParams(searchParams, buildProjectQueryTemplate(id, 0, 0));
    return search(query, token);
};


const searchMapDocuments = async (id: string, searchParams: string, token: string): Promise<Result> => {

    const query = parseFrontendGetParams(searchParams, buildProjectQueryTemplate(id, 0, MAX_SIZE));
    return mapSearch(query, token);
};


const onDocumentClick = (history: History, searchParams: string) => {
    return (path: string) => {
        history.push(path + searchParams);
    };
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
