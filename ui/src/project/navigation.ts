import { ResultDocument } from '../api/result';
import { Document } from '../api/document';


export const getPreviousHierarchyLevelUrl = (projectId: string, documents: ResultDocument[]): string => {

    return `/project/${projectId}?parent=${getGrandparentId(documents) ?? 'root'}`;
};


export const getMapDeselectionUrl = (projectId: string, locationSearch: string, document: Document): string => {

    return new URLSearchParams(locationSearch).has('q')
        ? getProjectSearchResultsUrl(projectId, locationSearch)
        : getContextUrl(projectId, locationSearch, document);
};


export const getContextUrl = (projectId: string, locationSearch: string, document: Document): string => {

    const parentId: string = new URLSearchParams(locationSearch).get('r') === 'children'
        ? (document.resource.category.name === 'Project' ? undefined : document.resource.id)
        : document.resource.parentId;

    return `/project/${projectId}?parent=${parentId ?? 'root'}`;
};


export const getProjectSearchResultsUrl = (projectId: string, locationSearch: string): string => {

    const searchParams = new URLSearchParams(locationSearch);
    searchParams.delete('r');

    return `/project/${projectId}?${searchParams.toString()}`;
};


const getGrandparentId = (documents: ResultDocument[]): string | undefined => {

    if (documents.length === 0) return undefined;

    return documents[0].resource.grandparentId;
};
