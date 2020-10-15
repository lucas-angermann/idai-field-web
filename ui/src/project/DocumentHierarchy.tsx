import React, { CSSProperties, ReactElement, useRef } from 'react';
import DocumentTeaser from '../document/DocumentTeaser';
import { ResultDocument } from '../api/result';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './document-hierarchy.css';
import { Card } from 'react-bootstrap';


interface DocumentHierarchyProps {
    documents: ResultDocument[];
    searchParams?: string;
}


export default React.memo(function DocumentHierarchy({ documents, searchParams }
        : DocumentHierarchyProps): ReactElement {

    const parent = new URLSearchParams(searchParams).get('parent') ?? 'root';
    const prevParent = useRef<string>();
    
    const docIds = documents.map(doc => doc.resource.id);
    const backward = docIds.includes(prevParent.current);
    prevParent.current = parent;
    
    const className = backward ? 'document-list-transition backward' : 'document-list-transition';

    return <>
       <Card style={ listContainerStyle }>
            <Card.Body className="px-0 py-1">
                <TransitionGroup className={ className }>
                    <CSSTransition key={ parent } timeout={ 500 }>
                        <div className="documents">
                            { documents.map((document: ResultDocument) =>
                                <div style={ documentContainerStyle } key={ document.resource.id }>
                                    <DocumentTeaser document={ document } searchParams={ searchParams }
                                                    showHierarchyButton={ true } />

                                </div>
                        )}
                        </div>
                    </CSSTransition>
                </TransitionGroup>
            </Card.Body>
        </Card>
    </>;
}, (prevProps: DocumentHierarchyProps, nextProps: DocumentHierarchyProps) => {

    return prevProps.documents === nextProps.documents;
});


const listContainerStyle: CSSProperties = {
    overflowY: 'scroll',
    overflowX: 'hidden',
    flexGrow: 1,
    flexShrink: 1
};


const documentContainerStyle: CSSProperties = {
    borderBottom: '1px solid var(--main-bg-color)'
};
