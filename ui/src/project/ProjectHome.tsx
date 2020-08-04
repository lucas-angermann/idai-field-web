import React, { useState, useEffect, CSSProperties, useContext, ReactElement } from 'react';
import { search } from '../api/documents';
import { Col, Card, Alert } from 'react-bootstrap';
import DocumentList from './DocumentList';
import { buildProjectQueryTemplate, parseFrontendGetParams } from '../api/query';
import { Result, ResultDocument } from '../api/result';
import { LoginContext } from '../App';


const CHUNK_SIZE = 50;


export default function ProjectHome({ id, searchParams = '' }: { id: string, searchParams?: string }): ReactElement {

    const loginData = useContext(LoginContext);
    const [documents, setDocuments] = useState<ResultDocument[]>([]);
    const [offset, setOffset] = useState(0);
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
    }, [id, searchParams, loginData]);

    const renderResult = (): ReactElement => {
        
        return (
            <Card onScroll={ onScroll } style={ listContainerStyle }>
                <Card.Body className="px-0 py-1">
                    <DocumentList documents={ documents } searchParams={ searchParams } />
                    { (!documents || documents.length === 0) && renderEmptyResult()}
                </Card.Body>
            </Card>
        );
    };

    return error ? renderError(error) : renderResult();
}


const searchDocuments = async (id: string, searchParams: string, from: number, token: string): Promise<Result> => {

    const query = parseFrontendGetParams(searchParams, buildProjectQueryTemplate(id, from, CHUNK_SIZE));
    return search(query, token);
};


const renderEmptyResult = (): ReactElement => <div className="text-center mt-sm-5"><em>Keine Ergebnisse</em></div>;


const renderError = (error: any): ReactElement => {

    console.error(error);
    return <Col><Alert variant="danger">Backend not available!</Alert></Col>;
};


const listContainerStyle: CSSProperties = {
    overflow: 'auto',
    flexGrow: 1,
    flexShrink: 1
};
