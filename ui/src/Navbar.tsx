import React, { CSSProperties, useContext } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { useLocation, Link } from 'react-router-dom';
import { LoginContext, LoginData } from './App';

export default () => {

    const location = useLocation();
    const loginData = useContext(LoginContext);

    return (
        <Navbar variant="dark" style={ navbarStyle }>
            <Navbar.Brand href="/">iDAI.<strong>field</strong></Navbar.Brand>
            <Nav activeKey={ location.pathname } className="mr-auto">
                <Nav.Link as="span">
                    <Link to="/">Projekte</Link>
                </Nav.Link>
                <Nav.Link as="span">
                    <Link to="/download">Download</Link>
                </Nav.Link>
                <Nav.Link as="span">
                    <Link to="/manual">Handbuch</Link>
                </Nav.Link>
            </Nav>
            <Navbar.Text className="mr-sm-2">{ renderLogin(loginData) }</Navbar.Text>
        </Navbar>
    );
};


const renderLogin = (loginData: LoginData) =>
    loginData.user === 'anonymous'
        ? <Link to="/login">Login</Link>
        : <span>Eingeloggt als: { loginData.user }</span>;


const navbarStyle: CSSProperties = {
    backgroundImage: 'linear-gradient(to right, rgba(106,164,184,0.95) 0%, #557ebb 100%)'
};
