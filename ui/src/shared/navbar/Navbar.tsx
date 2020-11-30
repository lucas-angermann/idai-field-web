import React, {  useContext, ReactElement,  Fragment } from 'react';
import { Navbar,  Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { LoginContext } from '../../App';
import { LoginData } from '../../login';
import LanguageButton from './LanguageButton';
import './navbar.css';
import { navbarStyle } from './styles';
import FieldNav from './FieldNav';
import { AppNames, getActiveApp } from '../../apps';
import ShapesNav from './ShapesNav';
import { shapesBasepath } from '../../constants';

export default ({ onLogout }: { onLogout: () => void }): ReactElement => {
    const loginData = useContext(LoginContext);
    const { t } = useTranslation();
    const app = getActiveApp();

    return (
            < Navbar variant = "dark" style = { navbarStyle } >
            <Navbar.Brand href={ app === AppNames.iDAIField ? '/' : shapesBasepath}>
                { renderBrand(app === AppNames.iDAIField ? 'field' : 'shapes')}
            </Navbar.Brand>
            { app === AppNames.iDAIField ?
            < FieldNav /> : <ShapesNav />
            }
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

export const getNavItemClass = (route: string, currentRoute: string) =>
    currentRoute === route
        ? 'active-navitem'
        : '';

const renderBrand = (name: string) => (
    <Fragment>
        iDAI.<strong>{ name}</strong>
    </Fragment>
);