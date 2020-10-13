import React, { CSSProperties, ReactElement } from 'react';
import DocumentTeaser from '../document/DocumentTeaser';
import { ResultDocument } from '../api/result';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './document-hierarchy.css';


export default function DocumentHierarchy({ documents, searchParams }
        : { documents: ResultDocument[], searchParams?: string }): ReactElement {

    const parentId = new URLSearchParams(searchParams).get('parent') ?? 'root';

    return <>
        <TransitionGroup component={ null }>
            <CSSTransition key={ parentId } timeout={ 500 } className="document-list-transition">
                <div>
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
}


const documentContainerStyle: CSSProperties = {
    borderBottom: '1px solid var(--main-bg-color)'
};
