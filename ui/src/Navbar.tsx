import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

export default () => {

    const location = useLocation();

    return (
        <Navbar bg="light">
            <Navbar.Brand href="/">iDAI.field</Navbar.Brand>
            <Nav activeKey={ location.pathname }>
                <Nav.Link href="/">Projekte</Nav.Link>
                <Nav.Link href="/download">Download</Nav.Link>
                <Nav.Link href="/manual">Handbuch</Nav.Link>
            </Nav>
        </Navbar>
    );
};
