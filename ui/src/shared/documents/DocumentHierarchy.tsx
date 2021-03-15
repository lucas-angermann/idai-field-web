import { mdiMenuLeft, mdiMenuRight } from '@mdi/js';
import Icon from '@mdi/react';
import React, { CSSProperties, ReactElement, ReactNode, useRef } from 'react';
import { Card } from 'react-bootstrap';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { to } from 'tsfun';
import { ResultDocument } from '../../api/result';
import DocumentTeaser from '../document/DocumentTeaser';
import LinkButton from '../linkbutton/LinkButton';
import './document-hierarchy.css';


interface DocumentHierarchyProps {
    data: HierarchyData;
    project: string;
    searchParams?: URLSearchParams;
    onScroll: (e: React.UIEvent<Element, UIEvent>) => void;
}


export interface HierarchyData {
    documents: ResultDocument[];
    predecessors: ResultDocument[];
}


export default React.memo(function DocumentHierarchy({ data, project, searchParams,
        onScroll }: DocumentHierarchyProps): ReactElement {

    const parent: string = searchParams.get('parent') ?? 'root';
    const previousPredecessors = useRef<ResultDocument[]>([]);

    const className: string = getTransitionClassname(previousPredecessors.current, parent);
    previousPredecessors.current = data ? data.predecessors : [];

    if (!data) return <></>;

    return <Card.Body className="px-0 py-0" style={ cardBodyStyle }>
        <TransitionGroup className={ className } style={ groupStyle } >
            <CSSTransition key={ parent } timeout={ 500 }>
                <div className="document-hierarchy">
                    {
                        parent !== 'root' &&
                        <LinkButton
                            to={ `/project/${project}?parent=${ getGrandparent(data.predecessors) }` }
                            className="previous-button" variant={ 'link' }>
                            <Icon path={ mdiMenuLeft } size={ 1 } />
                        </LinkButton>
                    }
                    <div className="documents" onScroll={ onScroll }>
                        { data.documents.map((document: ResultDocument) => {
                            return renderDocumentRow(document, searchParams);
                        }) }
                    </div>
                </div>
            </CSSTransition>
        </TransitionGroup>
    </Card.Body>;
}, (prevProps: DocumentHierarchyProps, nextProps: DocumentHierarchyProps) => {

    return prevProps.data === nextProps.data;
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


const getTransitionClassname = (previousPredecessors: ResultDocument[], parent: string): string => {

    return isBackwardsTransition(previousPredecessors, parent)
        ? 'document-list-transition backward'
        : 'document-list-transition';
};


const isBackwardsTransition = (previousPredecessors: ResultDocument[], parent: string): boolean => {

    return previousPredecessors.map(to('resource.id')).includes(parent) || parent === 'root';
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
