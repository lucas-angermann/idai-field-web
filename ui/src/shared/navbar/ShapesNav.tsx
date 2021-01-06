import React, { ReactElement } from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { shapesBasepath } from '../../constants';

export default function ShapesNav(): ReactElement {
    const createEntry = (name: string, route: string) => createNavEntry(name, `${shapesBasepath}${route}`);

    return (
        <>
            <Nav className="mr-auto">
                { createEntry('Browse & Select', '/browseSelect')}
                { createEntry('Find', '/find')}
                { createEntry('Export', '/export')}
                { createEntry('Edit', '/edit')}
                { createEntry('Mining', '/mining')}
            </Nav>
        </>
    );
}


const createNavEntry = (name: string, route: string): ReactElement => (
       <Nav.Link as="span">
            <Link to={ route}>
            { name}
            </Link>
        </Nav.Link>
);