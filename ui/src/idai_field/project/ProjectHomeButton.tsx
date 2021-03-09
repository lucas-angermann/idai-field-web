import React, { ReactElement, CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Document } from '../../api/document';
import { getProjectLabel } from '../projects';


interface ProjectHomeButtonProps {
    projectDocument: Document;
}


export default function ProjectHomeButton ({ projectDocument }: ProjectHomeButtonProps): ReactElement {
    return (
        <Link to={ `/project/${projectDocument.resource.id}?parent=root` } className="document-teaser">
            <div className="p-2 d-flex teaser-container link">
                <div>
                    <h3 className="mx-2 my-1" style={ homeHeadingStyle }>
                        { getProjectLabel(projectDocument) }
                    </h3>
                </div>
            </div>
        </Link>
    );
}


const homeHeadingStyle: CSSProperties = {
    fontSize: '18px',
    color: 'black'
};
