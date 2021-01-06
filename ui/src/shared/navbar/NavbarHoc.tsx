import React, {  useContext, ReactElement } from 'react';
import { Navbar,  Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { LoginContext } from '../../App';
import { LoginData } from '../../login';
import LanguageButton from './LanguageButton';
import './navbar.css';
import { navbarStyle } from './styles';

export interface NavBarProps {
    onLogout: () => void;
    basepath?: string;
    brand?: string;
    children?: JSX.Element;
}


export default ({ onLogout, basepath, brand, children }: NavBarProps): ReactElement => {
    const loginData = useContext(LoginContext);
    const { t } = useTranslation();

    return (
        < Navbar variant = "dark" style = { navbarStyle } >
            <Navbar.Brand href={ basepath}>
                { renderBrand(brand)}
            </Navbar.Brand>
            { children}
       
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
    <>
        iDAI.<strong>{ name}</strong>
    </>
);