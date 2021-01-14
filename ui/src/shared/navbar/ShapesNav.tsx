import React, { ReactElement } from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import NavbarHoc, { NavBarProps } from './NavbarHoc';


export default function ShapesNav({ onLogout }: NavBarProps): ReactElement {

    const renderEntry = (name: string, route: string) => renderNavEntry(name, route);

    return (
        <NavbarHoc onLogout={ onLogout } brand= "shapes" brandUrl= "/idaishapes">
            <Nav className="mr-auto">
                { renderEntry('Browse & Select', './') }
                { renderEntry('Find', 'find') }
                { renderEntry('Export', 'export') }
                { renderEntry('Edit', 'edit') }
                { renderEntry('Mining', 'mining') }
            </Nav>
        </NavbarHoc>
    );
}


const renderNavEntry = (name: string, route: string): ReactElement => (
    <Nav.Link as="span">
        <Link to={ route }>
            { name }
        </Link>
    </Nav.Link>
);