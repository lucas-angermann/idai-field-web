import React, { CSSProperties, ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Button, Col } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '@mdi/react';
import { mdiMapSearch } from '@mdi/js';
import { Document } from '../../api/document';
import { search } from '../../api/documents';
import { Query } from '../../api/query';
import { Result, ResultDocument } from '../../api/result';
import DocumentGrid from '../../shared/documents/DocumentGrid';
import { LoginContext } from '../../shared/login';
import CONFIGURATION from '../../configuration.json';
import { BREADCRUMB_HEIGHT, NAVBAR_HEIGHT } from '../../constants';


const HEADER_HEIGHT = 38;
const CHUNK_SIZE = 50;


export default function LinkedFinds({ type }: { type: Document }): ReactElement {

    const loginData = useContext(LoginContext);
    const location = useLocation();
    const { t } = useTranslation();

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


    return linkedFinds && linkedFinds.length > 0
        ? <Col style={ containerStyle }>
            <div style={ headerStyle }>
                <h3>{ t('shapes.browse.linkedFinds') }</h3>
                <Link to={ { pathname: getFieldOverviewLink(type) } } target="_blank" style={ overviewButtonStyle }>
                    <Button>
                        <Icon path={ mdiMapSearch } size={ 0.8 }></Icon>
                    </Button>
                </Link>
            </div>
            <div style={ documentGridStyle } onScroll={ onScroll }>
                <DocumentGrid documents={ linkedFinds }
                              getLinkUrl={ getFieldLink } />
            </div>
        </Col>
        : <></>;
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


const getFieldOverviewLink = (type: Document): string => {
    return `${CONFIGURATION.fieldUrl}?resource.relations.isInstanceOf.resource.id=${type.resource.id}`;
};


const containerStyle: CSSProperties = {
    height: 'calc(100vh - ' + (NAVBAR_HEIGHT + BREADCRUMB_HEIGHT) + 'px)',
};


const headerStyle: CSSProperties = {
    height: HEADER_HEIGHT + 'px',
    textAlign: 'center',
    paddingTop: '7px'
};


const documentGridStyle: CSSProperties = {
    height: 'calc(100vh - ' + (NAVBAR_HEIGHT + BREADCRUMB_HEIGHT + HEADER_HEIGHT) + 'px)',
    overflowY: 'auto'
};


const overviewButtonStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0
};
