import React, { CSSProperties, ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Col } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { Document } from '../../api/document';
import { search } from '../../api/documents';
import { Query } from '../../api/query';
import { Result, ResultDocument } from '../../api/result';
import DocumentGrid from '../../shared/documents/DocumentGrid';
import { LoginContext } from '../../shared/login';
import CONFIGURATION from '../../configuration.json';
import { BREADCRUMB_HEIGHT, NAVBAR_HEIGHT } from '../../constants';


const CHUNK_SIZE = 50;


export default function LinkedFinds({ type }: { type: Document }): ReactElement {

    const loginData = useContext(LoginContext);
    const location = useLocation();

    const [linkedFinds, setLinkedFinds] = useState<ResultDocument[]>(null);
    const [offset, setOffset] = useState<number>(0);

    useEffect(() => {

        getLinkedFinds(type, 0, loginData.token).then(result => setLinkedFinds(result.documents));
    }, [type, loginData, location.search]);

    const onScroll = (e: React.UIEvent<Element, UIEvent>) => {

        const el = e.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
            const newOffset = offset + CHUNK_SIZE;
            getChunk(newOffset);
            setOffset(newOffset);
        }
    };

    const getChunk = useCallback((newOffset: number): void => {

        getLinkedFinds(type, newOffset, loginData.token)
            .then(result => setLinkedFinds(oldLinkedFinds => oldLinkedFinds.concat(result.documents)));
    }, [type, location.search, loginData]);


    return (
        <Col style={ documentGridStyle } onScroll={ onScroll }>
            <DocumentGrid documents={ linkedFinds }
                          getLinkUrl={ getFieldLink } />
        </Col>
    );
}


const getLinkedFinds = async (type: Document, from: number, token: string): Promise<Result> => {

    return search(getQuery(type.resource.id, from), token);
};


const getQuery = (typeId: string, from: number): Query => ({
    size: CHUNK_SIZE,
    from,
    filters: [
        { field: 'resource.relations.isInstanceOf.resource.id', value: typeId }
    ]
});


const getFieldLink = (document: Document): string => {

    return `${CONFIGURATION.fieldUrl}/project/${document.project}/${document.resource.id}`;
};


const documentGridStyle: CSSProperties = {
    height: 'calc(100vh - ' + (NAVBAR_HEIGHT + BREADCRUMB_HEIGHT) + 'px)',
    overflowY: 'auto'
};
