import React, { useState, useEffect, CSSProperties, useContext } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import ProjectHome from './ProjectHome';
import ProjectMap from './ProjectMap';
import DocumentInfo from './DocumentInfo';
import { get, mapSearch } from '../api/documents';
import { Document } from '../api/document';
import { Spinner } from 'react-bootstrap';
import { ResultDocument, Result } from '../api/result';
import { buildProjectQueryTemplate, addFilters } from '../api/query';
import { History } from 'history';
import { LoginContext } from '../App';


const MAX_SIZE = 10000;


export default function Project() {

    const { projectId, documentId } = useParams();
    const location = useLocation();
    const history = useHistory();
    const loginData = useContext(LoginContext);
    const [document, setDocument] = useState<Document>(null);
    const [documents, setDocuments] = useState<ResultDocument[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        documentId ? get(documentId, loginData.token)
            .then(setDocument) : setDocument(null);
    }, [documentId, loginData]);

    useEffect(() => {
        setLoading(true);
        searchMapDocuments(projectId, location.search, loginData.token)
            .then(result => {
                setDocuments(result.documents);
                setLoading(false);
            });
    }, [projectId, location.search, loginData]);

    return (
        <div>
            { document
                ? <DocumentInfo document={ document } />
                : <ProjectHome id={ projectId } searchParams={ location.search } />
            }
            <div key="results">
                { loading &&
                    <Spinner animation="border"
                        variant="secondary"
                        style={ spinnerStyle } />
                }
                <ProjectMap
                    document={ document }
                    documents={ documents }
                    onDocumentClick={ onDocumentClick(history, location.search) }/>
            </div>
        </div>
    );

}


const searchMapDocuments = async (id: string, searchParams: string, token: string): Promise<Result> => {

    const query = buildProjectQueryTemplate(id, 0, MAX_SIZE);
    addFilters(query, searchParams);
    return mapSearch(query, token);
};


const onDocumentClick = (history: History, searchParams: string) => {
    return (path: string) => {
        history.push(path + searchParams);
    };
};


const spinnerStyle: CSSProperties = {
    position: 'absolute',
    top: '50vh',
    left: '50vw',
    zIndex: 1
};
