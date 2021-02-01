import { mdiMapSearch } from '@mdi/js';
import Icon from '@mdi/react';
import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Tooltip } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Document } from '../../api/document';
import { search } from '../../api/documents';
import { Query } from '../../api/query';
import { Result, ResultDocument } from '../../api/result';
import CONFIGURATION from '../../configuration.json';
import DocumentGrid from '../../shared/documents/DocumentGrid';
import LinkButton from '../../shared/linkbutton/LinkButton';
import { LoginContext } from '../../shared/login';


const CHUNK_SIZE = 50;


export default function LinkedFinds({ type }: { type: Document }): ReactElement {

    const loginData = useContext(LoginContext);
    const { t } = useTranslation();

    const [linkedFinds, setLinkedFinds] = useState<ResultDocument[]>(null);
    const [offset, setOffset] = useState<number>(0);

    useEffect(() => {

        getLinkedFinds(type, 0, loginData.token).then(result => setLinkedFinds(result.documents));
    }, [type, loginData]);

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
    }, [type, loginData]);

    const mapTooltip = <Tooltip id="map-tooltip">{ t('shapes.browse.linkedFinds.showOnMap') }</Tooltip>;

    return <>
            { linkedFinds && linkedFinds.length > 0
                && <div className="my-3 text-right">
                    <LinkButton to={ getFieldOverviewLink(type) } target="_blank" tooltip={ mapTooltip }>
                        <Icon path={ mdiMapSearch } size={ 0.8 }></Icon>
                    </LinkButton>
                </div>
            }
            <div onScroll={ onScroll }>
                <DocumentGrid documents={ linkedFinds }
                            getLinkUrl={ getFieldLink } />
            </div>
        </>;
}


const getLinkedFinds = async (type: Document, from: number, token: string): Promise<Result> =>
    search(getQuery(type.resource.id, from), token);


const getQuery = (typeId: string, from: number): Query => ({
    size: CHUNK_SIZE,
    from,
    filters: [
        { field: 'resource.relations.isInstanceOf.resource.id', value: typeId }
    ]
});


const getFieldLink = (document: Document): string =>
    `${CONFIGURATION.fieldUrl}/project/${document.project}/${document.resource.id}`;


const getFieldOverviewLink = (type: Document): string =>
    `${CONFIGURATION.fieldUrl}?resource.relations.isInstanceOf.resource.id=${type.resource.id}`;
