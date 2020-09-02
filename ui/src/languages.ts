import { set } from 'tsfun';
import { I18nString } from './api/document';

const MAIN_LANGUAGES = ['en', 'de'];


export const LANGUAGES: string[] = initializeLanguages();


export function getLabel(name: string, label: I18nString): string {

    const language: string = LANGUAGES.find((lang: string) => label[lang]);

    return language ? label[language] : name;
}


function initializeLanguages(): string[] {

    return set(
        window.navigator.languages
            .map(getTwoCharacterLanguageCode)
            .concat(MAIN_LANGUAGES)
    );
}


function getTwoCharacterLanguageCode(language: string): string {

    const index: number = language.indexOf('-');
    return index > 0 ? language.substring(0, index) : language;
}
