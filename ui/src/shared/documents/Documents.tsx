import { TFunction } from 'i18next';
import React, { ReactElement } from 'react';
import { Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { ResultDocument } from '../../api/result';
import DocumentHierarchy from './DocumentHierarchy';
import DocumentList from './DocumentList';
import './documents.css';


interface DocumentsProperties {
    documents: ResultDocument[] | null;
    searchParams: string;
    onScroll: (e: React.UIEvent<Element, UIEvent>) => void;
}


export default React.memo(function Documents(
    { documents, onScroll, searchParams = '' }: DocumentsProperties): ReactElement {

    const { t } = useTranslation();

    return <>
        { (documents && documents.length > 0)
            ? renderDocuments(documents, searchParams, onScroll)
            : renderEmptyResult(t) }
    </>;
});


const renderDocuments = (documents: ResultDocument[], searchParams: string,
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
