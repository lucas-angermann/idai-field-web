import { TFunction } from 'i18next';
import React, { ReactElement, useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Document } from '../../api/document';
import { ResultDocument } from '../../api/result';
import { CHUNK_SIZE } from '../../idai_field/project/Project';
import DocumentHierarchy from './DocumentHierarchy';
import DocumentList from './DocumentList';
import './documents.css';


interface DocumentsProperties {
    documents: ResultDocument[] | null;
    projectDocument?: Document;
    searchParams: string;
    getChunk: (offset: number) => void;
}


export default React.memo(function Documents(
    { documents, projectDocument, getChunk,
        searchParams = '' }: DocumentsProperties): ReactElement {

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
        { documents && renderDocuments(documents, projectDocument, searchParams, onScroll) }
        { (documents && documents.length === 0) && renderEmptyResult(t) }
    </>;
});


const renderDocuments = (documents: ResultDocument[], projectDocument: Document, searchParams: string,
                         onScroll: (e: React.UIEvent<Element, UIEvent>) => void): ReactElement => {

    return <Card className="documents-card" onScroll={ onScroll }>
        { searchParams && new URLSearchParams(searchParams).has('parent')
            ? <DocumentHierarchy documents={ documents }
                                 searchParams={ searchParams } />
            : <DocumentList documents={ documents } searchParams={ searchParams } /> }
    </Card>;
};


const renderEmptyResult = (t: TFunction): ReactElement => (
    <Card className="documents-card">
        <Card.Body className="px-0 py-0">
            <div className="text-center mt-sm-5 mb-sm-5"><em>{ t('project.noResults') }</em></div>
        </Card.Body>
    </Card>
);
