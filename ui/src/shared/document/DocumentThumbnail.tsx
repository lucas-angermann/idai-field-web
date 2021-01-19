import React, { CSSProperties, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { ResultDocument } from '../../api/result';
import Image from '../image/Image';
import NotFoundImage from '../image/NotFoundImage';


const LABEL_HEIGHT = 30;


interface DocumentThumbnailProps {
    document: ResultDocument;
    linkUrl: string;
    maxWidth: number;
    maxHeight: number;
}


export default React.memo(function DocumentThumbnail({ document, linkUrl, maxWidth, maxHeight }: DocumentThumbnailProps)
    : ReactElement {

    const imageId = getImageId(document);
    
    return (
        <Link to={ linkUrl }>
            <div style={ outerStyle }>
                <div style={ innerStyle }>
                    { imageId
                        ? <Image
                            project={ document.project }
                            id={ imageId }
                            maxWidth={ maxWidth } maxHeight={ maxHeight } />
                        : <NotFoundImage />
                    }
                </div>
                <div className="p-1" title={ document.resource.identifier } style={ labelStyle }>
                    { document.resource.identifier }
                </div>
            </div>
        </Link>
    );
});


const getImageId = (document: ResultDocument): string => document.resource.relations.isDepictedIn?.[0].resource.id;


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
    height: `${LABEL_HEIGHT}px`,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
};
