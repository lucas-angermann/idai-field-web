import { mdiSubdirectoryArrowRight } from '@mdi/js';
import Icon from '@mdi/react';
import React, { CSSProperties, ReactElement, useContext, useEffect, useState } from 'react';
import { getPredecessors } from '../../api/documents';
import { ResultDocument } from '../../api/result';
import { getHierarchyLink } from '../../shared/document/document-utils';
import DocumentTeaser from '../../shared/document/DocumentTeaser';
import { LoginContext } from '../../shared/login';

export default function ProjectBreadcrumb({ documentId }: { documentId: string }): ReactElement {

    const loginData = useContext(LoginContext);

    const [predecessors, setPredecessors] = useState<ResultDocument[]>([]);

    useEffect(() => {

        getPredecessors(documentId, loginData.token)
            .then(result => setPredecessors(result.results));
    }, [documentId, loginData.token]);

    return documentId
        ? <>
            { predecessors.map(renderPredecessor) }
        </>
        : null;
}
const renderPredecessor = (predecessor: ResultDocument, i: number) =>
    <div style={ predecessorContainerStyle(i) } key={ predecessor.resource.id } className="d-flex">
        { (i > 0) && <div style={ iconContainerStyle }><Icon path={ mdiSubdirectoryArrowRight } size={ 1 } /></div> }
        <div style={ { flexGrow: 1 } }>
            <DocumentTeaser document={ predecessor } linkUrl={ getHierarchyLink(predecessor) } size="small" />
        </div>
    </div>;


const predecessorContainerStyle = (i: number): CSSProperties => ({
    position: 'relative',
    marginLeft: `${i * 35}px`
});


const iconContainerStyle: CSSProperties = {
    position: 'absolute',
    left: '-20px',
    top: '3px',
    zIndex: 10
};
