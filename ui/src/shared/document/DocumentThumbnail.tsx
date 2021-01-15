import React, { CSSProperties, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { ResultDocument } from '../../api/result';
import NotFoundImage from '../image/NotFoundImage';


const LABEL_HEIGHT = 30;


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
                        ? <img src={ imageUrl }
                            alt={ document.resource.identifier }
                            style={ imageStyle } />
                        : <NotFoundImage />
                    }
                </div>
                <div className="p-1" style={ labelStyle }>{ document.resource.identifier }</div>
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
    justifyContent: 'center',
    alignItems: 'center',
    height: `calc(100% - ${LABEL_HEIGHT}px)`
};

const imageStyle: CSSProperties = {
    maxWidth: '100%',
    height: '100%'
};

const labelStyle: CSSProperties = {
    height: `${LABEL_HEIGHT}px`
};
