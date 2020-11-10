import { TFunction } from 'i18next';
import { ResultDocument } from '../api/result';
import { Document } from '../api/document';


export const getBackUrl = (projectId: string, locationSearch: string, documents?: ResultDocument[],
                           document?: Document): string => {

    let url: string = `/project/${projectId}`;
    if (document) {
        if (locationSearch.length > 0) {
            url += locationSearch;
        } else if (document?.resource.parentId) {
            url += `?parent=${document.resource.parentId}`;
        }
    } else {
        if (locationSearch.includes('q')) {
            url += locationSearch;
        } else if (documents) {
            const grandparentId: string = getGrandparentId(documents);
            if (grandparentId) url += `?parent=${grandparentId}`;
        }
    }

    return url;
};


export const getBackButtonLabel = (t: TFunction, locationSearch: string, document?: Document): string => {

    if (document) {
        if (locationSearch.includes('q')) {
            return t('project.backButton.searchResults');
        } else {
            return t('project.backButton.context');
        }
    } else {
        return t('project.backButton.previousHierarchyLevel');
    }
};


const getGrandparentId = (documents: ResultDocument[]): string | undefined => {

    if (documents.length === 0) return undefined;

    return documents[0].resource.grandparentId;
};
