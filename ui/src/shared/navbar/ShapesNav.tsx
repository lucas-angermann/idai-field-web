import React, { ReactElement } from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import NavbarHoc, { NavBarProps } from './NavbarHoc';

export default function ShapesNav({ onLogout }: NavBarProps): ReactElement {

    const createEntry = (name: string, route: string) => createNavEntry(name, route);

    return (
        <NavbarHoc onLogout={ onLogout } brand= "shapes">
            <Nav className="mr-auto">
                { createEntry('Browse & Select', './') }
                { createEntry('Find', 'find') }
                { createEntry('Export', 'export') }
                { createEntry('Edit', 'edit') }
                { createEntry('Mining', 'mining') }
            </Nav>
        </NavbarHoc>
    );
}


const createNavEntry = (name: string, route: string): ReactElement => (
    <Nav.Link as="span">
        <Link to={ route }>
            { name }
        </Link>
    </Nav.Link>
);
