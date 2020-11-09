import React, { CSSProperties, ReactElement, useRef } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Card } from 'react-bootstrap';
import DocumentTeaser from '../document/DocumentTeaser';
import { ResultDocument } from '../api/result';
import './document-hierarchy.css';


interface DocumentHierarchyProps {
    documents: ResultDocument[];
    searchParams?: string;
}


export default React.memo(function DocumentHierarchy({ documents, searchParams }
        : DocumentHierarchyProps): ReactElement {

    const parent = new URLSearchParams(searchParams).get('parent') ?? 'root';
    const prevGrandparent = useRef<string>();

    const backward = parent === prevGrandparent.current;
    prevGrandparent.current = getGrandparent(documents);
    
    const className = backward ? 'document-list-transition backward' : 'document-list-transition';

    return <>
       <Card style={ listContainerStyle }>
            <Card.Body className="px-0 py-0">
                <TransitionGroup className={ className }>
                    <CSSTransition key={ parent } timeout={ 500 }>
                        <div className="documents">
                            { documents.map((document: ResultDocument) =>
                                <div style={ documentContainerStyle } key={ document.resource.id }>
                                    <DocumentTeaser document={ document } searchParams={ searchParams }
                                                    showHierarchyButton={ true } />
                                </div>
                            ) }
                        </div>
                    </CSSTransition>
                </TransitionGroup>
            </Card.Body>
        </Card>
    </>;
}, (prevProps: DocumentHierarchyProps, nextProps: DocumentHierarchyProps) => {

    return prevProps.documents === nextProps.documents;
});


const getGrandparent = (documents: ResultDocument[]): string => {

    const grandparent = documents.length > 0 ? documents[0].resource.grandparentId : null;
    return grandparent ?? 'root';
};


const listContainerStyle: CSSProperties = {
    overflowY: 'scroll',
    overflowX: 'hidden',
    flexGrow: 1,
    flexShrink: 1
};


const documentContainerStyle: CSSProperties = {
    borderBottom: '1px solid var(--main-bg-color)'
};
