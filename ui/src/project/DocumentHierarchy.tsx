import React, { CSSProperties, ReactElement, useRef } from 'react';
import DocumentTeaser from '../document/DocumentTeaser';
import { ResultDocument } from '../api/result';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './document-hierarchy.css';


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
    </>;
}, (prevProps: DocumentHierarchyProps, nextProps: DocumentHierarchyProps) => {

    return prevProps.documents === nextProps.documents;
});


const documentContainerStyle: CSSProperties = {
    borderBottom: '1px solid var(--main-bg-color)'
};
