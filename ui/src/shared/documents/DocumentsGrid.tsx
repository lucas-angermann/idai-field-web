import { TFunction } from 'i18next';
import React, { Fragment, ReactElement } from 'react';
import { Card, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { ResultDocument } from '../../api/result';
import DocumentThumbnail from '../document/DocumentThumbnail';

interface DocumentsGrid {
    documents: ResultDocument[];
    getLinkUrl: (id: string) => string;
}

export function DocumentsGrid({ documents, getLinkUrl }: DocumentsGrid): ReactElement {
    
    const { t } = useTranslation();
    if (documents !== null) {
        return (
            <Row>
                { documents && documents.length === 0 ?
                    renderEmptyResult(t) : renderDocuments(documents, getLinkUrl)
                }
            </Row>
        );
    } else {
        return <Fragment/>;
    }
}


const renderDocuments = (documents: ResultDocument[], getLinkUrl: (id: string) => string): ReactElement => {

    return (
        <>
        {
        documents.map((document: ResultDocument) => {
            const linkUrl = getLinkUrl(document.resource.id);
            return (
                <div key={ document.resource.id} >
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


const renderEmptyResult = (t: TFunction): ReactElement =>
    <Card className="documents-card">
        <Card.Body className="px-0 py-0">
            <div className="text-center mt-sm-5 mb-sm-5"><em>{ t('project.noResults') }</em></div>
        </Card.Body>
    </Card>;
