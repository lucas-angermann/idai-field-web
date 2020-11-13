import React, { useState, CSSProperties, ReactElement, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import DocumentList from './DocumentList';
import { ResultDocument } from '../api/result';
import { CHUNK_SIZE } from './Project';
import DocumentHierarchy from './DocumentHierarchy';
import DocumentTeaser from '../document/DocumentTeaser';
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
    const [parentDocument, setParentDocument] = useState<ResultDocument>(null);
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

    useEffect(() => {

        setParentDocument(getParentDocument(projectDocument, searchParams, documents));
    }, [projectDocument, searchParams, documents]);

    return <>
        { parentDocument && !new URLSearchParams(searchParams).has('q')
            && <Card body={ true } className="hierarchy-parent">
                <DocumentTeaser document={ parentDocument }
                                project={ projectDocument.resource.id }
                                hierarchyHeader={ true }/>
            </Card>
        }
        <Card className="documents-card" style={ listContainerStyle }>
            <Card.Body className="px-0 py-0">
                { documents && renderDocuments(documents, searchParams, onScroll) }
                { (documents && documents.length === 0) && renderEmptyResult(t) }
            </Card.Body>
        </Card>
    </>;
});


const renderDocuments = (documents: ResultDocument[], searchParams: string,
                         onScroll: (e: React.UIEvent<Element, UIEvent>) => void): ReactElement => {

    return searchParams && new URLSearchParams(searchParams).has('q')
            ? <DocumentList documents={ documents } searchParams={ searchParams } scrollFunction={ onScroll }/>
            : <DocumentHierarchy documents={ documents } searchParams={ searchParams } scrollFunction={ onScroll }/>;
};


const renderEmptyResult = (t: TFunction): ReactElement => (
    <div className="text-center mt-sm-5 mb-sm-5"><em>{ t('project.noResults') }</em></div>
);


const getParentDocument = (projectDocument: Document, searchParams: string,
                           documents?: ResultDocument[]): ResultDocument | undefined => {

    if (!documents || documents.length === 0 || new URLSearchParams(searchParams).has('q')) return undefined;

    const relations = documents[0].resource.relations?.isChildOf;
    return relations?.length > 0 ? relations[0] : projectDocument;
};


const listContainerStyle: CSSProperties = {
    overflowY: 'scroll',
    overflowX: 'hidden',
    flexGrow: 1,
    flexShrink: 1
};
