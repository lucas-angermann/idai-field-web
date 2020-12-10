import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import { ResultDocument } from '../../api/result';
import NotFoundImage from '../image/NotFoundImage';


interface DocumentThumbnailProps {
    document: ResultDocument;
    linkUrl: string;
    imageUrl: string;
}

export default React.memo(function DocumentThumbnail({ document, linkUrl, imageUrl }: DocumentThumbnailProps):
    ReactElement {
    
    return (
      <Link to={ linkUrl}>
            <Card className="m-2">
                { imageUrl === '' ?
                   <NotFoundImage /> :
                    <Card.Img variant="top" src={ imageUrl} />
                }
                <Card.Text className="p-2">{ document.resource.identifier}</Card.Text>
            </Card>
        </Link>
    );
  });
