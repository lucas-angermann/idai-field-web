import { mdiSubdirectoryArrowRight } from '@mdi/js';
import Icon from '@mdi/react';
import React, { CSSProperties, ReactElement, ReactNode, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPredecessors } from '../../api/documents';
import { ResultDocument } from '../../api/result';
import { getHierarchyLink } from '../../shared/document/document-utils';
import DocumentTeaser from '../../shared/document/DocumentTeaser';
import { LoginContext } from '../../shared/login';

interface ProjectBreadcrumbProps {
    documentId: string;
    projectId: string;
}

export default function ProjectBreadcrumb({ documentId, projectId }: ProjectBreadcrumbProps): ReactElement {

    const loginData = useContext(LoginContext);

    const [predecessors, setPredecessors] = useState<ResultDocument[]>([]);

    useEffect(() => {

        if (!documentId || documentId === 'root') {
            setPredecessors([]);
            return;
        }

        getPredecessors(documentId, loginData.token)
            .then(result => setPredecessors(result.results));
    }, [documentId, loginData.token]);

    return <>
        { renderProject(projectId) }
        { predecessors.map(renderPredecessor) }
    </>;
}


const renderProject = (projectId: string): ReactNode =>
    <Link to={ `/project/${projectId}?parent=root` } className="document-teaser">
        <div className="p-2 d-flex teaser-container link">
            <div>
                <img src="/marker-icon.svg" alt="Home" style={ homeIconStyle } />
            </div>
            <div>
                <h3 className="mx-2 my-1" style={ homeHeadingStyle }>{ projectId }</h3>
            </div>
        </div>
    </Link>;


const renderPredecessor = (predecessor: ResultDocument, i: number): ReactNode =>
    <div style={ predecessorContainerStyle(i) } key={ predecessor.resource.id } className="d-flex">
        <div style={ iconContainerStyle }><Icon path={ mdiSubdirectoryArrowRight } size={ 1 } /></div>
        <div style={ { flexGrow: 1 } }>
            <DocumentTeaser document={ predecessor } linkUrl={ getHierarchyLink(predecessor) } size="small" />
        </div>
    </div>;


const homeHeadingStyle: CSSProperties = {
    fontSize: '18px',
    color: 'black'
};


const predecessorContainerStyle = (i: number): CSSProperties => ({
    position: 'relative',
    marginLeft: `${(i+1) * 35}px`
});


const homeIconStyle: CSSProperties = {
    height: '26px',
    width: '26px',
    fill: 'black'
};


const iconContainerStyle: CSSProperties = {
    position: 'absolute',
    left: '-20px',
    top: '3px',
    zIndex: 10
};
