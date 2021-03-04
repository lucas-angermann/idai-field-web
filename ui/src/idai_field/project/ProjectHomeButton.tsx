import React, { ReactElement, CSSProperties } from 'react';
import { Link } from 'react-router-dom';

interface ProjectHomeButtonProps {
    projectId: string;
}

export default function ProjectHomeButton ({ projectId }: ProjectHomeButtonProps): ReactElement {
    return (
        <Link to={ `/project/${projectId}?parent=root` } className="document-teaser">
            <div className="p-2 d-flex teaser-container link">
                <div>
                    <img src="/marker-icon.svg" alt="Home" style={ homeIconStyle } />
                </div>
                <div>
                    <h3 className="mx-2 my-1" style={ homeHeadingStyle }>{ projectId }</h3>
                </div>
            </div>
        </Link>
    );
}


const homeIconStyle: CSSProperties = {
    height: '26px',
    width: '26px',
    fill: 'black'
};


const homeHeadingStyle: CSSProperties = {
    fontSize: '18px',
    color: 'black'
};
