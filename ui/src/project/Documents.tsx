import React, { useState, CSSProperties, ReactElement, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import DocumentList from './DocumentList';
import { ResultDocument } from '../api/result';
import { CHUNK_SIZE } from './Project';
import DocumentHierarchy from './DocumentHierarchy';
import { Document } from '../api/document';
import './documents.css';


interface DocumentProperties {
    documents: ResultDocument[] | null;
    projectDocument?: Document;
    searchParams: string;
    getChunk: (offset: number) => void;
}


export default React.memo(function Documents(
    { documents, projectDocument, getChunk,
        searchParams = '' }: DocumentProperties): ReactElement {

    const [offset, setOffset] = useState(0);
    const { t } = useTranslation();

    const onScroll = (e: React.UIEvent<Element, UIEvent>) => {

        const el = e.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
            const newOffset = offset + CHUNK_SIZE;
            getChunk(newOffset);
            setOffset(newOffset);
        }
    };

    useEffect(() => {

        setOffset(0);
    }, [searchParams]);

    return <>
        <Card className="documents-card" style={ listContainerStyle }>
            <Card.Body className="px-0 py-0">
                { documents && renderDocuments(documents, projectDocument, searchParams, onScroll) }
                { (documents && documents.length === 0) && renderEmptyResult(t) }
            </Card.Body>
        </Card>
    </>;
});


const renderDocuments = (documents: ResultDocument[], projectDocument: Document, searchParams: string,
                         onScroll: (e: React.UIEvent<Element, UIEvent>) => void): ReactElement => {

    return searchParams && new URLSearchParams(searchParams).has('q')
            ? <DocumentList documents={ documents } searchParams={ searchParams } scrollFunction={ onScroll }/>
            : <DocumentHierarchy documents={ documents } projectDocument={ projectDocument }
                                 searchParams={ searchParams } scrollFunction={ onScroll }/>;
};


const renderEmptyResult = (t: TFunction): ReactElement => (
    <div className="text-center mt-sm-5 mb-sm-5"><em>{ t('project.noResults') }</em></div>
);


const listContainerStyle: CSSProperties = {
    overflowY: 'scroll',
    overflowX: 'hidden',
    flexGrow: 1,
    flexShrink: 1
};
