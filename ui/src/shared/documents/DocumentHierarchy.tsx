import { mdiMenuLeft, mdiMenuRight } from '@mdi/js';
import Icon from '@mdi/react';
import React, { CSSProperties, ReactElement, ReactNode, useRef } from 'react';
import { Card } from 'react-bootstrap';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { ResultDocument } from '../../api/result';
import DocumentTeaser from '../document/DocumentTeaser';
import LinkButton from '../linkbutton/LinkButton';
import './document-hierarchy.css';


interface DocumentHierarchyProps {
    documents: ResultDocument[];
    predecessors: ResultDocument[];
    project: string;
    update: Date;
    searchParams?: URLSearchParams;
    onScroll: (e: React.UIEvent<Element, UIEvent>) => void;
}


export default React.memo(function DocumentHierarchy({ documents, predecessors, project, update, searchParams,
        onScroll }: DocumentHierarchyProps): ReactElement {

    const parent = searchParams.get('parent') ?? 'root';
    const prevGrandparent = useRef<string>();

    const backward = parent === prevGrandparent.current;
    prevGrandparent.current = getGrandparent(predecessors);

    const className = backward ? 'document-list-transition backward' : 'document-list-transition';

    return <Card.Body className="px-0 py-0" style={ cardBodyStyle }>
        <TransitionGroup className={ className } style={ groupStyle } >
            <CSSTransition key={ parent } timeout={ 500 }>
                <div className="document-hierarchy">
                    {
                        parent !== 'root' &&
                        <LinkButton
                            to={ `/project/${project}?parent=${ getGrandparent(predecessors) }` }
                            className="previous-button" variant={ 'link' }>
                            <Icon path={ mdiMenuLeft } size={ 1 } />
                        </LinkButton>
                    }
                    <div className="documents" onScroll={ onScroll }>
                        { documents.map((document: ResultDocument) => {
                            return renderDocumentRow(document, searchParams);
                        }) }
                    </div>
                </div>
            </CSSTransition>
        </TransitionGroup>
    </Card.Body>;
}, (prevProps: DocumentHierarchyProps, nextProps: DocumentHierarchyProps) => {

    return prevProps.update === nextProps.update;
});


const renderDocumentRow = (document: ResultDocument, searchParams: URLSearchParams): ReactNode => {

    const linkUrl = `/project/${document.project}/${document.resource.id}?${searchParams}`;
    
    return <div style={ documentRowStyle } key={ document.resource.id }>
        <div style={ documentTeaserContainerStyle }>
            <DocumentTeaser document={ document } linkUrl={ linkUrl } />
        </div>
        { document.resource.childrenCount > 0 && <div>
            <LinkButton to={ '?' + getHierarchyButtonSearchParams(searchParams, document.resource.id) }
                style={ { height: '100%', padding: '0.375rem' } } variant={ 'link' }>
                <Icon path={ mdiMenuRight } size={ 1 }></Icon>
            </LinkButton>
        </div> }
    </div>;
};


const getHierarchyButtonSearchParams = (searchParams: URLSearchParams, documentId: string) => {

    const params = new URLSearchParams(searchParams);
    params.set('parent', documentId);

    return params.toString();
};


const getGrandparent = (predecessors: ResultDocument[]): string => {

    return predecessors.length > 1
        ? predecessors[predecessors.length - 2].resource.id
        : 'root';
};


const cardBodyStyle: CSSProperties = {
    height: '100%'
};


const documentRowStyle: CSSProperties = {
    borderBottom: '1px solid var(--main-bg-color)',
    display: 'flex'
};


const documentTeaserContainerStyle: CSSProperties = {
    flexGrow: 1
};


const groupStyle: CSSProperties = {
    height: '100%',
    position: 'relative'
};
