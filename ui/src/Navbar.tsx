import React, { CSSProperties, useContext, ReactElement } from 'react';
import { Navbar, Nav, Button, NavDropdown } from 'react-bootstrap';
import { useLocation, useHistory, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { LoginContext } from './App';
import { LoginData } from './login';
import LanguageButton from './LanguageButton';


export default ({ onLogout }: { onLogout: () => void }): ReactElement => {

    const location = useLocation();
    const loginData = useContext(LoginContext);
    const history = useHistory();
    const { t } = useTranslation();

    return (
        <Navbar variant="dark" style={ navbarStyle }>
            <Navbar.Brand href="/">iDAI.<strong>field</strong></Navbar.Brand>
            <Nav activeKey={ location.pathname } className="mr-auto">
                <Nav.Link as="span">
                    <Link to="/">{ t('navbar.projects') }</Link>
                </Nav.Link>
                <NavDropdown id="desktop-dropdown" as="span" title={ t('navbar.desktop') }
                        style={ dropdownStyle }>
                    <NavDropdown.Item onClick={ () => history.push('/download') }>
                        { t('navbar.download') }
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={ () => history.push('/manual') }>
                        { t('navbar.manual') }
                    </NavDropdown.Item>
                </NavDropdown>
            </Nav>
            <LanguageButton/>
            { renderLogin(loginData, onLogout, t) }
        </Navbar>
    );
};


const renderLogin = (loginData: LoginData, onLogout: () => void, t: TFunction): ReactElement =>
    loginData.user === 'anonymous'
        ? <Navbar.Text className="mr-sm-2"><Link to="/login">{ t('navbar.login') }</Link></Navbar.Text>
        : <Navbar.Text>{ t('navbar.loggedInAs') } { loginData.user }
            <Button variant="link" onClick={ onLogout }>{ t('navbar.logOut') }</Button>
        </Navbar.Text>;


const navbarStyle: CSSProperties = {
    backgroundImage: 'linear-gradient(to right, rgba(106,164,184,0.95) 0%, #557ebb 100%)'
};

const dropdownStyle: CSSProperties = {
    zIndex: 1001
};
