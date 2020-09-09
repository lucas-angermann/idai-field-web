import React, { CSSProperties, useContext, ReactElement, useState } from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import Modal from 'react-modal';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '@mdi/react';
import { mdiClose, mdiEarth } from '@mdi/js';
import { TFunction } from 'i18next';
import { LoginContext } from './App';
import { LoginData } from './login';
import { getUserInterfaceLanguage, LANGUAGES, USER_INTERFACE_LANGUAGES } from './languages';


export default ({ onLogout }: { onLogout: () => void }): ReactElement => {

    const location = useLocation();
    const loginData = useContext(LoginContext);
    const [modalOpened, setModalOpened] = useState(false);
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
            { renderLanguageButton(modalOpened, setModalOpened, t) }
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


const renderLanguageButton = (modalOpened: boolean, setModalOpened: (opened: boolean) => void,
                              t: TFunction): ReactElement => (
    <>
        <Button variant="link" style={ languageButtonStyle } onClick={ () => setModalOpened(true) }>
            <Icon path={ mdiEarth } size={ 1 } />
        </Button>
        { renderLanguageModal(modalOpened, setModalOpened, t) }
    </>
);


const renderLanguageModal = (modalOpened: boolean, setModalOpened: (opened: boolean) => void,
                             t: TFunction) => (

    <Modal isOpen={ modalOpened } onRequestClose={ () => setModalOpened(false) } style={ modalStyle }>
        <Button onClick={ () => setModalOpened(false) } style={ closeButtonStyle }>
            <Icon path={ mdiClose } size={ 0.8 } className="close-button-icon" />
        </Button>
        <h2>{ t('navbar.languageModal.title') }</h2>
        <p>
            <div>{ t('navbar.languageModal.info') }</div>
        </p>
        <p>
            <div>
                { t('navbar.languageModal.userInterfaceLanguage') }
                <strong> { t('languages.' + getUserInterfaceLanguage()) }</strong>
            </div>
            <div>
                <span>{ t('navbar.languageModal.availableUserInterfaceLanguages') } </span>
                { USER_INTERFACE_LANGUAGES.map(language => t('languages.' + language)).join(', ') }
            </div>
        </p>
        <p>
            <div>{ t('navbar.languageModal.configurationLanguages') }</div>
            <ol style={ languageListStyle }>
                { LANGUAGES.map(language => <li>{ t('languages.' + language) }</li>) }
            </ol>
        </p>
    </Modal>
);


const navbarStyle: CSSProperties = {
    backgroundImage: 'linear-gradient(to right, rgba(106,164,184,0.95) 0%, #557ebb 100%)'
};


const languageButtonStyle: CSSProperties = {
    marginRight: '10px'
};


const modalStyle = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        minWidth: '500px',
    },
    overlay: {
        zIndex: 1000
    }
};


const languageListStyle: CSSProperties = {

    maxHeight: '290px',
    overflow: 'auto'
};


const closeButtonStyle: CSSProperties = {
    position: 'relative',
    top: '2px',
    height: '25px',
    width: '25px',
    float: 'right',
    padding: '0'
};
