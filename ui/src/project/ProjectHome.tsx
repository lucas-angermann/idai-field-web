import React, { useState, useEffect, CSSProperties, useContext } from 'react';
import { search, get } from '../api/documents';
import DocumentTeaser from '../document/DocumentTeaser';
import { Col, Card, Alert } from 'react-bootstrap';
import DocumentList from './DocumentList';
import { buildProjectQueryTemplate, addFilters } from '../api/query';
import { Result, ResultDocument } from '../api/result';
import { NAVBAR_HEIGHT } from '../constants';
import { Document } from '../api/document';
import { LoginContext } from '../App';


const CHUNK_SIZE = 50;


export default function ProjectHome({ id, searchParams = '' }: { id: string, searchParams?: string }) {

    const loginData = useContext(LoginContext);
    const [documents, setDocuments] = useState<ResultDocument[]>([]);
    const [offset, setOffset] = useState(0);
    const [projectDocument, setProjectDocument] = useState<Document>(null);
    const [error, setError] = useState(false);

    const onScroll = (e: React.UIEvent<Element, UIEvent>) => {

        const el = e.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
            const newOffset = offset + CHUNK_SIZE;
            searchDocuments(id, searchParams, newOffset, loginData.token)
                .then(result => setDocuments(documents.concat(result.documents)))
                .catch(err => setError(err));
            setOffset(newOffset);
        }
    };

    useEffect(() => {

        searchDocuments(id, searchParams, 0, loginData.token).then(result => {
            setDocuments(result.documents);
        }).catch(err => setError(err));

        get(id, loginData.token).then(setProjectDocument);
    }, [id, searchParams, loginData]);

    const renderResult = () => {
        
        return (
            <div style={ leftOverlayStyle } key="left-overlay">
                { renderProjectTeaser(projectDocument) }
                <Card onScroll={ onScroll } style={ listContainerStyle }>
                    <Card.Body style={ { padding: '.5rem 1.5rem' } }>
                        <DocumentList documents={ documents } searchParams={ searchParams } />
                    </Card.Body>
                </Card>
            </div>
        );
    };

    return (
        <div>
            { error ? renderError(error) : renderResult() }
        </div>
    );
}


const searchDocuments = async (id: string, searchParams: string, from: number, token: string): Promise<Result> => {

    const query = buildProjectQueryTemplate(id, from, CHUNK_SIZE);
    addFilters(query, searchParams);
    return search(query, token);
};


const renderProjectTeaser = (projectDocument: Document) =>
    projectDocument ? <Card><Card.Body><DocumentTeaser document={ projectDocument } /></Card.Body></Card> : '';


const renderError = (error: any) => {

    console.error(error);
    return <Col><Alert variant="danger">Backend not available!</Alert></Col>;
};


const leftOverlayStyle: CSSProperties = {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
    width: '400px',
    position: 'absolute',
    top: NAVBAR_HEIGHT,
    left: '10px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column'
};


const listContainerStyle: CSSProperties = {
    marginTop: '0',
    overflow: 'auto',
    flexGrow: 1
};
