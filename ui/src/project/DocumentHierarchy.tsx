import React, { CSSProperties, ReactElement, useRef } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Icon from '@mdi/react';
import { mdiMenuLeft } from '@mdi/js';
import DocumentTeaser from '../document/DocumentTeaser';
import { ResultDocument } from '../api/result';
import './document-hierarchy.css';
import LinkButton from '../LinkButton';
import { getPreviousHierarchyLevelUrl } from './NavigationButtons';


interface DocumentHierarchyProps {
    documents: ResultDocument[];
    searchParams?: string;
    scrollFunction: (e: React.UIEvent<Element, UIEvent>) => void;
}


export default React.memo(function DocumentHierarchy(
        { documents, searchParams, scrollFunction }
        : DocumentHierarchyProps): ReactElement {

    const parent = new URLSearchParams(searchParams).get('parent') ?? 'root';
    const prevGrandparent = useRef<string>();

    const backward = parent === prevGrandparent.current;
    prevGrandparent.current = getGrandparent(documents);
    
    const className = backward ? 'document-list-transition backward' : 'document-list-transition';

    return <>
        <TransitionGroup className={ className } style={ { height: '100%' } } >
            <CSSTransition key={ parent } timeout={ 500 }>
                <div style={ { height: '100%', position: 'absolute', width: '100%' } }>
                    <LinkButton to={ getPreviousHierarchyLevelUrl(getProjectId(documents), searchParams, documents) }
                                style={ previousHierarchyLevelButtonStyle } variant={ 'link' }>
                        <Icon path={ mdiMenuLeft } size={ 1 }></Icon>
                    </LinkButton>
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
    </>;
}, (prevProps: DocumentHierarchyProps, nextProps: DocumentHierarchyProps) => {

    return prevProps.documents === nextProps.documents;
});


const getGrandparent = (documents: ResultDocument[]): string => {

    const grandparent = documents.length > 0 ? documents[0].resource.grandparentId : null;
    return grandparent ?? 'root';
};


const getProjectId = (documents: ResultDocument[]): string => {

    return documents.length > 0 ? documents[0].project : null;
};


const documentContainerStyle: CSSProperties = {
    borderBottom: '1px solid var(--main-bg-color)'
};


const previousHierarchyLevelButtonStyle: CSSProperties = {
    height: '100%',
    width: '50px',
    float: 'left'
};


const documentsStyle: CSSProperties = {
    width: 'calc(100% - 50px)',
    position: 'absolute',
    left: '50px'
};
