import React, { CSSProperties, useContext } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { useLocation, Link } from 'react-router-dom';
import { LoginContext } from './App';
import { LoginData } from './login';

export default ({ onLogout }: { onLogout: () => void }) => {

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
            { renderLogin(loginData, onLogout) }
        </Navbar>
    );
};


const renderLogin = (loginData: LoginData, onLogout: () => void) =>
    loginData.user === 'anonymous'
        ? <Navbar.Text className="mr-sm-2"><Link to="/login">Login</Link></Navbar.Text>
        : <Navbar.Text>Eingeloggt als: { loginData.user }
            <a className="ml-sm-2" href="#" onClick={ onLogout }>Ausloggen</a>
        </Navbar.Text>;


const navbarStyle: CSSProperties = {
    backgroundImage: 'linear-gradient(to right, rgba(106,164,184,0.95) 0%, #557ebb 100%)'
};
