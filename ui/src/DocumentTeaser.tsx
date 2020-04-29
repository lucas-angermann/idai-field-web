import React from 'react';
import { Card } from 'react-bootstrap';
import CategoryIcon from './CategoryIcon';

export default ({ document: document }) => {

    return <Card>
        <Card.Body>
            <Card.Title>
                <CategoryIcon size="40" category={ document.resource.type } />
                { document.resource.identifier }
            </Card.Title>
            <Card.Subtitle>{ document.resource.shortDescription } / { document.resource.type }</Card.Subtitle>
        </Card.Body>
    </Card>;

};
