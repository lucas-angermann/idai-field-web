import { TFunction } from 'i18next';
import React, { Fragment, ReactElement } from 'react';
import { Card, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { ResultDocument } from '../../api/result';
import DocumentThumbnail from '../document/DocumentThumbnail';

interface ShapesHierarchy {
    documents: ResultDocument[];
    searchParams?: string;
    selectedItem: (id: string, identifier: string, url: string, parentId: string | null) => void;
}

export function ShapesHierarchy({ documents, searchParams, selectedItem }: ShapesHierarchy): ReactElement {
    const { t } = useTranslation();
    if (documents !== null) {
        return (
            <Row className="mx-1">
                { documents && documents.length === 0 ?
                    renderEmptyResult(t) : renderDocuments(documents, searchParams, selectedItem)
                }
            </Row>
        );
    } else {
        return <Fragment/>;
    }
}

const getLinkUrl = (document: ResultDocument): string => `${document.resource.id}`;


const renderDocuments = (documents: ResultDocument[], searchParams: string,
        selectedItem: (id: string, identifier: string, url: string, parentId: string | null) => void): ReactElement => {
    return (
        <>
        {
        documents.map((document: ResultDocument) => {
            const linkUrl = getLinkUrl(document);
            return (
                <div onClick={ () => selectedItem(
                    document.resource.id,
                    document.resource.identifier,
                    linkUrl,
                    document.resource.parentId)}
                    key={ document.resource.id} >
                    <DocumentThumbnail
                        document={ document}
                        linkUrl={ linkUrl}
                        imageUrl="" />
                </div>
            );
            }
        )
        }
        </>
    );
};


const renderEmptyResult = (t: TFunction): ReactElement => (
    <Card className="documents-card">
        <Card.Body className="px-0 py-0">
            <div className="text-center mt-sm-5 mb-sm-5"><em>{ t('project.noResults') }</em></div>
        </Card.Body>
    </Card>
);