import React, { CSSProperties, useContext, ReactElement, useEffect, useState } from 'react';
import { Navbar, Nav, Button, NavDropdown } from 'react-bootstrap';
import { useLocation, useHistory, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import Icon from '@mdi/react';
import { mdiMenuRight } from '@mdi/js';
import { LoginContext } from './App';
import { LoginData } from './login';
import LanguageButton from './LanguageButton';
import { get } from './api/documents';
import { Document } from './api/document';
import './navbar.css';


export default ({ onLogout }: { onLogout: () => void }): ReactElement => {

    const [projectDocument, setProjectDocument] = useState<Document>(null);
    const location = useLocation();
    const loginData = useContext(LoginContext);
    const history = useHistory();
    const { t } = useTranslation();


    useEffect(() => {

        const projectId: string | undefined = getProjectId(location);
        if (projectId) get(projectId, loginData.token).then(setProjectDocument);
    }, [location, loginData]);


    const getNavItemClass = (route: string) => getCurrentRoute(location, projectDocument) === route
        ? 'active-navitem'
        : '';


    return (
        <Navbar variant="dark" style={ navbarStyle }>
            <Navbar.Brand href="/">iDAI.<strong>field</strong></Navbar.Brand>
            <Nav activeKey={ location.pathname } className="mr-auto">
                <Nav.Link as="span">
                    <Link to="/" className={ getNavItemClass('overview') }>
                        { t('navbar.projects') }
                    </Link>
                </Nav.Link>
                {
                    projectDocument && <>
                        <Icon path={ mdiMenuRight } size={ 1 } className="navbar-project-arrow" />
                        <Nav.Link as="span">
                            <Link to={ `/project/${projectDocument.resource.id}` }
                                  className={ getNavItemClass('project') }>
                                { projectDocument.resource.identifier }
                            </Link>
                        </Nav.Link>
                    </>
                }
                <NavDropdown id="desktop-dropdown" as="span"
                             className={ getNavItemClass('desktop') }
                             title={ t('navbar.desktop') }
                        style={ dropdownStyle }>
                    <NavDropdown.Item onClick={ () => history.push('/download') } >
                        { t('navbar.download') }
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={ () => history.push('/manual') }>
                        { t('navbar.manual') }
                    </NavDropdown.Item>
                </NavDropdown>
                <Nav.Link as="span">
                    <Link to="/contact" className={ getNavItemClass('contact') }>
                        { t('navbar.contact') }
                    </Link>
                </Nav.Link>
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


const getProjectId = (location: any): string | undefined => {

    return location.pathname.startsWith('/project/')
        ? location.pathname.split('/')[2]
        : undefined;
};


const getCurrentRoute = (location: any, projectDocument?: Document): string => {

    if (projectDocument && location.pathname.startsWith('/project/')
            && location.pathname.split('/')[2] === projectDocument.resource.id) {
        return 'project';
    } else if (location.pathname.startsWith('/download') || location.pathname.startsWith('/manual')) {
        return 'desktop';
    } else if (location.pathname.startsWith('/contact')) {
        return 'contact';
    } else if (location.pathname.startsWith('/login')) {
        return 'login';
    } else {
        return 'overview';
    }
};


const navbarStyle: CSSProperties = {
    backgroundImage: 'linear-gradient(to right, rgba(106,164,184,0.95) 0%, #557ebb 100%)'
};


const dropdownStyle: CSSProperties = {
    zIndex: 1001
};

