import React, { CSSProperties } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

export default () => {

    const location = useLocation();

    return (
        <Navbar variant="dark" style={ navbarStyle }>
            <Navbar.Brand href="/">iDAI.field</Navbar.Brand>
            <Nav activeKey={ location.pathname }>
                <Nav.Link href="/">Projekte</Nav.Link>
                <Nav.Link href="/download">Download</Nav.Link>
                <Nav.Link href="/manual">Handbuch</Nav.Link>
            </Nav>
        </Navbar>
    );
};

const navbarStyle: CSSProperties = {
    backgroundImage: 'linear-gradient(to right, rgba(106,164,184,0.95) 0%, #557ebb 100%)'
};
