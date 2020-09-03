import { set } from 'tsfun';
import { I18nString } from './api/document';

const USER_INTERFACE_LANGUAGES = ['en', 'de'];

const LANGUAGES: string[] = initializeLanguages();


export function getUserInterfaceLanguage(): string {

    return LANGUAGES.find(language => USER_INTERFACE_LANGUAGES.includes(language));
}


export function getLabel(name: string, label: I18nString): string {

    const language: string = LANGUAGES.find((lang: string) => label[lang]);
    return language ? label[language] : name;
}


function initializeLanguages(): string[] {

    return set(
        window.navigator.languages
            .map(getBasicLanguageCode)
            .filter(language => language.length === 2)
            .concat(USER_INTERFACE_LANGUAGES)
    );
}


function getBasicLanguageCode(language: string): string {

    const index: number = language.indexOf('-');
    return index > 0 ? language.substring(0, index) : language;
}
