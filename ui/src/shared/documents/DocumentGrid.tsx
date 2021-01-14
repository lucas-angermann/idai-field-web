import { TFunction } from 'i18next';
import React, { ReactElement, ReactNode } from 'react';
import { Card, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { ResultDocument } from '../../api/result';
import DocumentThumbnail from '../document/DocumentThumbnail';


interface DocumentGridProps {
    documents: ResultDocument[];
    getLinkUrl: (id: string) => string;
}


export default function DocumentGrid({ documents, getLinkUrl }: DocumentGridProps): ReactElement {
    
    const { t } = useTranslation();
    
    if (documents) {
        return (
            <Row>
                { documents.length === 0
                    ? renderEmptyResult(t)
                    : renderDocuments(documents, getLinkUrl)
                }
            </Row>
        );
    } else {
        return null;
    }
}


const renderDocuments = (documents: ResultDocument[], getLinkUrl: (id: string) => string): ReactNode =>
    documents.map((document) => renderDocument(document, getLinkUrl));


const renderDocument = (document: ResultDocument, getLinkUrl: (id: string) => string): ReactElement =>
    <div key={ document.resource.id }>
        <DocumentThumbnail
            document={ document }
            linkUrl={ getLinkUrl(document.resource.id) }
            imageUrl="" />
    </div>;


const renderEmptyResult = (t: TFunction): ReactElement =>
    <Card className="documents-card">
        <Card.Body className="px-0 py-0">
            <div className="text-center mt-sm-5 mb-sm-5"><em>{ t('project.noResults') }</em></div>
        </Card.Body>
    </Card>;
