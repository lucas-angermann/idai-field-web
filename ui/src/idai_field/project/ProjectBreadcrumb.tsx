import React, { CSSProperties, ReactElement, ReactNode, useContext, useEffect, useState } from 'react';
import { mdiSubdirectoryArrowRight } from '@mdi/js';
import Icon from '@mdi/react';
import { clone } from 'tsfun/struct';
import { Document } from '../../api/document';
import { ResultDocument } from '../../api/result';
import { getHierarchyLink } from '../../shared/document/document-utils';
import DocumentTeaser from '../../shared/document/DocumentTeaser';
import ProjectHomeButton from './ProjectHomeButton';
import { get } from '../../api/documents';
import { LoginContext } from '../../shared/login';


const MAX_BREADCRUMB_ITEMS: number = 3;


interface ProjectBreadcrumbProps {
    projectId: string;
    predecessors: ResultDocument[];
}


export default function ProjectBreadcrumb({ projectId, predecessors }: ProjectBreadcrumbProps): ReactElement {

    const [projectDocument, setProjectDocument] = useState<Document>();
    const loginData = useContext(LoginContext);

    useEffect(() => {

        get(projectId, loginData.token).then(setProjectDocument);
    }, [projectId]);

    return <>
        { projectDocument && <ProjectHomeButton projectDocument={ projectDocument } /> }
        { limitPredecessors(predecessors).map(renderPredecessor) }
    </>;
}


const renderPredecessor = (predecessor: ResultDocument|null, i: number): ReactNode =>
    <div style={ predecessorContainerStyle(i) }
            key={ predecessor ? predecessor.resource.id : 'breadcrumb-placeholder' }
            className="d-flex">
        <div style={ iconContainerStyle }><Icon path={ mdiSubdirectoryArrowRight } size={ 1 } color="grey" /></div>
        <div style={ { flexGrow: 1 } }>
            { predecessor
                ? <DocumentTeaser document={ predecessor }
                    linkUrl={ getHierarchyLink(predecessor) }
                    fullShortDescriptions={ false }
                    size="small" />
                : <div style={ placeholderStyle }>...</div>
            }
        </div>
    </div>;


const limitPredecessors = (predecessors: ResultDocument[]): (ResultDocument|null)[] => {

    const result = clone(predecessors);
    
    if (predecessors.length > MAX_BREADCRUMB_ITEMS) {
        result.splice(0, predecessors.length - MAX_BREADCRUMB_ITEMS + 1);
        result.unshift(null);
    }

    return result;
};


const predecessorContainerStyle = (i: number): CSSProperties => ({
    position: 'relative',
    marginLeft: `${(i+1) * 35}px`
});


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
