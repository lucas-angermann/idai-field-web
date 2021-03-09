import { mdiDotsVertical, mdiSubdirectoryArrowRight } from '@mdi/js';
import Icon from '@mdi/react';
import React, { CSSProperties, ReactElement, ReactNode, useContext, useEffect, useState } from 'react';
import { clone } from 'tsfun/struct';
import { Document } from '../../api/document';
import { get } from '../../api/documents';
import { ResultDocument } from '../../api/result';
import { getHierarchyLink } from '../../shared/document/document-utils';
import DocumentTeaser from '../../shared/document/DocumentTeaser';
import { LoginContext } from '../../shared/login';
import ProjectHomeButton from './ProjectHomeButton';


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
    }, [projectId, loginData]);

    const [limited, limitedPredecessors] = limitPredecessors(predecessors);

    return <>
        { projectDocument && <ProjectHomeButton projectDocument={ projectDocument } /> }
        { limited && renderPlaceholder() }
        { limitedPredecessors.map(renderPredecessor) }
    </>;
}


const renderPlaceholder = (): ReactNode =>
    <div style={ placeholderStyle }>
        <Icon path={ mdiDotsVertical } size={ 1 } color="grey" />
    </div>;


const renderPredecessor = (predecessor: ResultDocument|null, i: number): ReactNode =>
    <div style={ predecessorContainerStyle(i) }
            key={ predecessor ? predecessor.resource.id : 'breadcrumb-placeholder' }
            className="d-flex">
        <div style={ { flexGrow: 1 } }>
            <div style={ iconContainerStyle }>
                <Icon path={ mdiSubdirectoryArrowRight } size={ 1 } color="grey" />
            </div>
            <DocumentTeaser document={ predecessor }
                linkUrl={ getHierarchyLink(predecessor) }
                fullShortDescriptions={ false }
                size="small" />
        </div>
    </div>;


const limitPredecessors = (predecessors: ResultDocument[]): [boolean, ResultDocument[]] => {

    const result = clone(predecessors);
    let limited = false;
    
    if (predecessors.length > MAX_BREADCRUMB_ITEMS) {
        result.splice(0, predecessors.length - MAX_BREADCRUMB_ITEMS);
        limited = true;
    }

    return [limited, result];
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
    margin: '-4px 0 0 13px'
};
