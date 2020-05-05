import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';

export default () => {

    return (
        <Navbar bg="light">
            <Navbar.Brand href="/">iDAI.field</Navbar.Brand>
            <Nav>
                <Nav.Link href="/">Projekte</Nav.Link>
                <Nav.Link href="/download">Download</Nav.Link>
                <Nav.Link href="/manual">Handbuch</Nav.Link>
            </Nav>
        </Navbar>
    );
};
