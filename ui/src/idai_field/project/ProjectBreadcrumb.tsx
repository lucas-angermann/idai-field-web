import { mdiSubdirectoryArrowRight } from '@mdi/js';
import Icon from '@mdi/react';
import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { clone } from 'tsfun/struct';
import { ResultDocument } from '../../api/result';
import { getHierarchyLink } from '../../shared/document/document-utils';
import DocumentTeaser from '../../shared/document/DocumentTeaser';


const MAX_BREADCRUMB_ITEMS: number = 3;


interface ProjectBreadcrumbProps {
    projectId: string;
    predecessors: ResultDocument[];
}


export default function ProjectBreadcrumb({ projectId, predecessors }: ProjectBreadcrumbProps): ReactElement {

    return <>
        { renderProject(projectId) }
        { limitPredecessors(predecessors).map(renderPredecessor) }
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


const renderPredecessor = (predecessor: ResultDocument|null, i: number): ReactNode =>
    <div style={ predecessorContainerStyle(i) }
            key={ predecessor ? predecessor.resource.id : 'breadcrumb-placeholder' }
            className="d-flex">
        <div style={ iconContainerStyle }><Icon path={ mdiSubdirectoryArrowRight } size={ 1 } color="grey" /></div>
        <div style={ { flexGrow: 1 } }>
            { predecessor
                ? <DocumentTeaser document={ predecessor } linkUrl={ getHierarchyLink(predecessor) } size="small" />
                : <div style={ placeholderStyle }>...</div>
            }
        </div>
    </div>;


const limitPredecessors = (predecessors: ResultDocument[]): (ResultDocument|null)[] => {

    const result = clone(predecessors);
    
    if (predecessors.length > MAX_BREADCRUMB_ITEMS) {
        result.splice(0, predecessors.length - MAX_BREADCRUMB_ITEMS);
        result.unshift(null);
    }

    return result;
}


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


const placeholderStyle: CSSProperties = {
    position: 'relative',
    left: '10px',
    height: '28px',
    paddingTop: '2px',
    cursor: 'default'
};
