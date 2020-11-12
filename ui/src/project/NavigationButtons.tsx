import React, { ReactElement } from 'react';
import { TFunction } from 'i18next';
import { Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Icon from '@mdi/react';
import { mdiArrowLeftCircle } from '@mdi/js';
import { ResultDocument } from '../api/result';
import { Document } from '../api/document';
import LinkButton from '../LinkButton';
import DocumentTeaser from '../document/DocumentTeaser';


export default function NavigationButtons({ projectId, locationSearch, documents, document }
        : { projectId: string, locationSearch: string, documents?: ResultDocument[],
            document?: Document }  ): ReactElement {

    const { t } = useTranslation();

    const searchParams = new URLSearchParams(locationSearch);
    const parentDocument = getParentDocument(documents);

    return <Card body={ true }>
        { parentDocument && <DocumentTeaser document={ parentDocument } asLink={ false } /> }
        { document && searchParams.has('q') && searchParams.get('r') === 'overview'
            && renderOverviewSearchResultsButton(t, locationSearch) }
        { document && searchParams.has('q') && renderProjectSearchResultsButton(t, projectId, locationSearch) }
        { document && renderContextButton(t, projectId, locationSearch, document) }
        { !document && renderPreviousHierarchyLevelButton(t, projectId, locationSearch, documents) }
    </Card>;
}

export const renderOverviewSearchResultsButton = (t: TFunction, locationSearch: string): ReactElement => {

    const searchParams = new URLSearchParams(locationSearch);
    searchParams.delete('r');

    return <LinkButton variant="link" to={ `/?${searchParams.toString()}` }>
        <Icon path={ mdiArrowLeftCircle } size={ 0.8 } /> { t('project.navigationButtons.overviewSearchResults') }
    </LinkButton>;
};


export const renderProjectSearchResultsButton = (t: TFunction, projectId: string,
                                                 locationSearch: string): ReactElement => {

    return <LinkButton variant="link" to={ getProjectSearchResultsUrl(projectId, locationSearch) }>
        <Icon path={ mdiArrowLeftCircle } size={ 0.8 } /> { t('project.navigationButtons.searchResults') }
    </LinkButton>;
};


export const renderContextButton = (t: TFunction, projectId: string, locationSearch: string,
                                    document: Document): ReactElement => {

    return <LinkButton variant="link" to={ getContextUrl(projectId, locationSearch, document) }>
        <Icon path={ mdiArrowLeftCircle } size={ 0.8 } /> { t('project.navigationButtons.context') }
    </LinkButton>;
};


export const renderPreviousHierarchyLevelButton = (t: TFunction, projectId: string, locationSearch: string,
                                                   documents?: ResultDocument[]): ReactElement => {

    let url: string = `/project/${projectId}`;
    if (new URLSearchParams(locationSearch).has('q')) {
        url += locationSearch;
    } else if (documents) {
        const grandparentId: string = getGrandparentId(documents);
        if (grandparentId) url += `?parent=${grandparentId}`;
    }

    return <LinkButton variant="link" to={ url }>
        <Icon path={ mdiArrowLeftCircle } size={ 0.8 } /> { t('project.navigationButtons.previousHierarchyLevel') }
    </LinkButton>;
};


export const getMapDeselectionUrl = (projectId: string, locationSearch: string,
                                     document: Document): string => {

    return new URLSearchParams(locationSearch).has('q')
        ? getProjectSearchResultsUrl(projectId, locationSearch)
        : getContextUrl(projectId, locationSearch, document);
};


const getContextUrl = (projectId: string, locationSearch: string, document: Document): string => {

    const parentId: string = new URLSearchParams(locationSearch).get('parent') ?? document.resource.parentId;

    return `/project/${projectId}` + (parentId
        ? `?parent=${parentId}`
        : '');
};


const getProjectSearchResultsUrl = (projectId: string, locationSearch: string): string => {

    const searchParams = new URLSearchParams(locationSearch);
    searchParams.delete('r');

    return `/project/${projectId}?${searchParams.toString()}`;
};


const getGrandparentId = (documents: ResultDocument[]): string | undefined => {

    if (documents.length === 0) return undefined;

    return documents[0].resource.grandparentId;
};


const getParentDocument = (documents: ResultDocument[]): ResultDocument | undefined => {

    if (!documents || documents.length === 0) return undefined;

    const relations = documents[0].resource.relations?.isChildOf;
    if (relations?.length > 0) return relations[0];
};
