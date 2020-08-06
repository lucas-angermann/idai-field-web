import React, { useState, CSSProperties, ReactElement } from 'react';
import { Card } from 'react-bootstrap';
import DocumentList from './DocumentList';
import { ResultDocument } from '../api/result';
import { CHUNK_SIZE } from './Project';


interface ProjectHomeProps {
    id: string;
    documents: ResultDocument[];
    searchParams: string;
    getChunk: (offset: number) => void;
}


export default function ProjectHome({ id, documents, getChunk, searchParams = '' }: ProjectHomeProps): ReactElement {

    const [offset, setOffset] = useState(0);

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
                <DocumentList documents={ documents } searchParams={ searchParams } />
                { (!documents || documents.length === 0) && renderEmptyResult()}
            </Card.Body>
        </Card>
    );
}


const renderEmptyResult = (): ReactElement => <div className="text-center mt-sm-5"><em>Keine Ergebnisse</em></div>;


const listContainerStyle: CSSProperties = {
    overflow: 'auto',
    flexGrow: 1,
    flexShrink: 1
};
