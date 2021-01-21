import { mdiMenuLeft } from '@mdi/js';
import Icon from '@mdi/react';
import React, { CSSProperties, ReactElement, useRef } from 'react';
import { Card } from 'react-bootstrap';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { ResultDocument } from '../../api/result';
import { getPreviousHierarchyLevelUrl } from '../../idai_field/project/navigation';
import DocumentTeaser from '../document/DocumentTeaser';
import LinkButton from '../linkbutton/LinkButton';


interface DocumentHierarchyBodyProps {
    documents: ResultDocument[];
    searchParams?: string;
}


export default React.memo(function DocumentHierarchyBody({ documents, searchParams }
        : DocumentHierarchyBodyProps): ReactElement {

    const parent = new URLSearchParams(searchParams).get('parent') ?? 'root';
    const prevGrandparent = useRef<string>();

    const backward = parent === prevGrandparent.current;
    prevGrandparent.current = getGrandparent(documents);

    const className = backward ? 'document-list-transition backward' : 'document-list-transition';


    return <Card.Body className="px-0 py-0">
        <TransitionGroup className={ className } style={ groupStyle } >
            <CSSTransition key={ parent } timeout={ 500 }>
                <div className="document-hierarchy">
                    {
                        parent !== 'root' &&
                        <LinkButton
                            to={ getPreviousHierarchyLevelUrl(getProjectId(documents), documents) }
                            style={ previousHierarchyLevelButtonStyle } variant={ 'link' }>
                            <Icon path={ mdiMenuLeft } size={ 1 } />
                        </LinkButton>
                    }
                    { parent === 'root' && <div style={ previousHierarchyLevelButtonStyle } /> }
                    <div className="documents" style={ documentsStyle }>
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
    </Card.Body>;
}, (prevProps: DocumentHierarchyBodyProps, nextProps: DocumentHierarchyBodyProps) => {

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


const groupStyle: CSSProperties = {
    height: '100%',
    position: 'relative'
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
