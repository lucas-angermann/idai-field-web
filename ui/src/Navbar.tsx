import React, { CSSProperties, useContext, ReactElement } from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoginContext } from './App';
import { LoginData } from './login';

export default ({ onLogout }: { onLogout: () => void }): ReactElement => {

    const location = useLocation();
    const loginData = useContext(LoginContext);
    const { t } = useTranslation();

    return (
        <Navbar variant="dark" style={ navbarStyle }>
            <Navbar.Brand href="/">iDAI.<strong>field</strong></Navbar.Brand>
            <Nav activeKey={ location.pathname } className="mr-auto">
                <Nav.Link as="span">
                    <Link to="/">{ t('navbar.projects') }</Link>
                </Nav.Link>
                <Nav.Link as="span">
                    <Link to="/download">{ t('navbar.download') }</Link>
                </Nav.Link>
                <Nav.Link as="span">
                    <Link to="/manual">{ t('navbar.manual') }</Link>
                </Nav.Link>
            </Nav>
            { renderLogin(loginData, onLogout) }
        </Navbar>
    );
};


const renderLogin = (loginData: LoginData, onLogout: () => void): ReactElement =>
    loginData.user === 'anonymous'
        ? <Navbar.Text className="mr-sm-2"><Link to="/login">Login</Link></Navbar.Text>
        : <Navbar.Text>Eingeloggt als: { loginData.user }
            <Button variant="link" onClick={ onLogout }>Ausloggen</Button>
        </Navbar.Text>;


const navbarStyle: CSSProperties = {
    backgroundImage: 'linear-gradient(to right, rgba(106,164,184,0.95) 0%, #557ebb 100%)'
};
