import React, { CSSProperties, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { ResultDocument } from '../../api/result';
import NotFoundImage from '../image/NotFoundImage';


interface DocumentThumbnailProps {
    document: ResultDocument;
    linkUrl: string;
    imageUrl: string;
}


export default React.memo(function DocumentThumbnail({ document, linkUrl, imageUrl }: DocumentThumbnailProps)
    : ReactElement {
    
    return (
        <Link to={ linkUrl }>
            <div style={ outerStyle }>
                <div style={ innerStyle }>
                    { imageUrl
                        ? <img alt={ document.resource.identifier } src={ imageUrl } />
                        : <NotFoundImage />
                    }
                </div>
                <div className="p-1">{ document.resource.identifier }</div>
            </div>
        </Link>
    );
});


const outerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
};

const innerStyle: CSSProperties = {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto'
};
