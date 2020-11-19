import React, { CSSProperties, ReactElement, useEffect, useRef, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Card } from 'react-bootstrap';
import Icon from '@mdi/react';
import { mdiMenuLeft } from '@mdi/js';
import DocumentTeaser from '../document/DocumentTeaser';
import { ResultDocument } from '../api/result';
import './document-hierarchy.css';
import LinkButton from '../LinkButton';
import { getPreviousHierarchyLevelUrl } from './navigation';
import { Document } from '../api/document';


interface DocumentHierarchyProps {
    documents: ResultDocument[];
    projectDocument: Document;
    searchParams?: string;
    scrollFunction: (e: React.UIEvent<Element, UIEvent>) => void;
}


export default React.memo(function DocumentHierarchy(
        { documents, projectDocument, searchParams, scrollFunction }
        : DocumentHierarchyProps): ReactElement {

    const parent = new URLSearchParams(searchParams).get('parent') ?? 'root';
    const [parentDocument, setParentDocument] = useState<ResultDocument>(null);
    const prevGrandparent = useRef<string>();

    const backward = parent === prevGrandparent.current;
    if (parentDocument && parentDocument.resource.id === parent) prevGrandparent.current = getGrandparent(documents);

    useEffect(() => {

        setParentDocument(getParentDocument(projectDocument, searchParams, documents));
    }, [projectDocument, searchParams, documents]);
    
    const className = backward ? 'document-list-transition backward' : 'document-list-transition';

    return projectDocument && parentDocument ? (
        <Card className="documents-card">
            <Card.Header className="hierarchy-parent">
                 <DocumentTeaser document={ parentDocument }
                                 project={ projectDocument.resource.id }
                                 hierarchyHeader={ true }/>
            </Card.Header>
            <Card.Body className="px-0 py-0">
                <TransitionGroup className={ className } style={ { height: '100%' } } >
                    <CSSTransition key={ parent } timeout={ 500 }>
                        <div className="document-hierarchy">
                            {
                                parent !== 'root' &&
                                <LinkButton
                                        to={ getPreviousHierarchyLevelUrl(projectDocument.resource.id, documents) }
                                        style={ previousHierarchyLevelButtonStyle } variant={ 'link' }>
                                    <Icon path={ mdiMenuLeft } size={ 1 } />
                                </LinkButton>
                            }
                            { parent === 'root' && <div style={ previousHierarchyLevelButtonStyle } /> }
                            <div className="documents" style={ documentsStyle } onScroll={ scrollFunction }>
                                { documents.map((document: ResultDocument) =>
                                    <div style={ documentContainerStyle } key={ document.resource.id }>
                                        <DocumentTeaser document={ document } searchParams={ searchParams }
                                                        showHierarchyButton={ true } />
                                    </div>
                            )}
                            </div>
                        </div>
                    </CSSTransition>
                </TransitionGroup>
            </Card.Body>
        </Card>
    ) : <></>;
}, (prevProps: DocumentHierarchyProps, nextProps: DocumentHierarchyProps) => {

    return prevProps.documents === nextProps.documents;
});


const getGrandparent = (documents: ResultDocument[]): string => {

    const grandparent = documents.length > 0 ? documents[0].resource.grandparentId : null;
    return grandparent ?? 'root';
};


const getParentDocument = (projectDocument: Document, searchParams: string,
                           documents?: ResultDocument[]): ResultDocument | undefined => {

    if (!documents || documents.length === 0 || new URLSearchParams(searchParams).has('q')) return undefined;

    const relations = documents[0].resource.relations?.isChildOf;
    return relations?.length > 0 ? relations[0] : projectDocument;
};


const documentContainerStyle: CSSProperties = {
    borderBottom: '1px solid var(--main-bg-color)'
};


const previousHierarchyLevelButtonStyle: CSSProperties = {
    height: '100%',
    width: '30px',
    padding: 0,
    float: 'left'
};


const documentsStyle: CSSProperties = {
    width: 'calc(100% - 30px)',
    position: 'absolute',
    left: '30px'
};
