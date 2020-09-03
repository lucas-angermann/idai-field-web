import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getPreferedLanguage } from '../languages';
import messagesDE from './messages.de.json';
import messagesEN from './messages.en.json';


i18n.use(initReactI18next)
    .init({
        lng: getPreferedLanguage(),
        fallbackLng: 'en',
        resources: {
            en: {
                translation: messagesEN
            },
            de: {
                translation: messagesDE
            }
        },
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
