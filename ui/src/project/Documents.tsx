import React, { useState, CSSProperties, ReactElement } from 'react';
import { Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import DocumentList from './DocumentList';
import { ResultDocument } from '../api/result';
import { CHUNK_SIZE } from './Project';
import DocumentHierarchy from './DocumentHierarchy';


interface ProjectHomeProps {
    documents: ResultDocument[];
    searchParams: string;
    getChunk: (offset: number) => void;
}


export default function Documents(
    { documents, getChunk, searchParams = '' }: ProjectHomeProps)
    : ReactElement {

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

    return (
        <Card onScroll={ onScroll } style={ listContainerStyle }>
            <Card.Body className="px-0 py-1">
                { renderDocuments(documents, searchParams) }
                { (!documents || documents.length === 0) && renderEmptyResult(t) }
            </Card.Body>
        </Card>
    );
}


const renderDocuments = (documents: ResultDocument[], searchParams: string): ReactElement => {

    return searchParams && new URLSearchParams(searchParams).has('q')
            ? <DocumentList documents={ documents } searchParams={ searchParams } />
            : <DocumentHierarchy documents={ documents } searchParams={ searchParams } />;
};


const renderEmptyResult = (t: TFunction): ReactElement => (
    <div className="text-center mt-sm-5 mb-sm-5"><em>{ t('projectHome.noResults') }</em></div>
);


const listContainerStyle: CSSProperties = {
    overflowY: 'scroll',
    flexGrow: 1,
    flexShrink: 1
};
