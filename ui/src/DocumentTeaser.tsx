import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CategoryIcon from './CategoryIcon';

export default ({ document }) => {

    return <Card>
        <Card.Body>
            <Card.Title>
                <CategoryIcon size="40" category={ document.resource.type } />
                <Link to={ `/documents/${document.resource.id}` }>{ document.resource.identifier }</Link>
            </Card.Title>
            <Card.Subtitle>{ document.resource.shortDescription } / { document.resource.type }</Card.Subtitle>
        </Card.Body>
    </Card>;

};
