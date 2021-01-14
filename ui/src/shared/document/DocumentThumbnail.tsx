import React, { ReactElement } from 'react';
import { Card } from 'react-bootstrap';
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
            <Card className="mx-2 my-0 mb-2">
                { imageUrl === ''
                    ? <NotFoundImage />
                    : <Card.Img variant="top" src={ imageUrl } />
                }
                <Card.Text className="p-2">{ document.resource.identifier}</Card.Text>
            </Card>
        </Link>
    );
});
