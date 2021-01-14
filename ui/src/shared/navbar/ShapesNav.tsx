import React, { ReactElement, useEffect, useState } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import NavbarHoc, { NavBarProps } from './NavbarHoc';
import SearchBar from '../../shared/search/SearchBar';


export default function ShapesNav({ onLogout }: NavBarProps): ReactElement {

    const renderEntry = (name: string, route: string) => renderNavEntry(name, route);
    const location = useLocation();
    const [showSearchBar, setSearchBar] = useState<boolean>(false);

    useEffect(() => {
        setSearchBar(window.location.pathname !== '/idaishapes/');
    }, [location]);

    return (
        <NavbarHoc onLogout={ onLogout } brand= "shapes" brandUrl= "/idaishapes">
            <Nav className="mr-auto">
                { renderEntry('Browse & Select', './') }
                { renderEntry('Find', 'find') }
                { renderEntry('Export', 'export') }
                { renderEntry('Edit', 'edit') }
                { renderEntry('Mining', 'mining') }
                { showSearchBar && < SearchBar basepath="/idaishapes/document/" /> }
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