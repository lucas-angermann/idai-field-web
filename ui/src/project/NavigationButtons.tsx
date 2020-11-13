import React, { ReactElement } from 'react';
import { TFunction } from 'i18next';
import { Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Icon from '@mdi/react';
import { mdiArrowLeftCircle } from '@mdi/js';
import { ResultDocument } from '../api/result';
import { Document } from '../api/document';
import LinkButton from '../LinkButton';
import { getProjectSearchResultsUrl } from './navigation';


export default function NavigationButtons({ projectDocument, locationSearch, documents, document }
        : { projectDocument: Document, locationSearch: string, documents?: ResultDocument[],
            document: Document }): ReactElement {

    const { t } = useTranslation();
    const searchParams = new URLSearchParams(locationSearch);

    return projectDocument && <Card body={ true }>
        { searchParams.has('q') && searchParams.get('r') === 'overview'
            && renderOverviewSearchResultsButton(t, locationSearch) }
        { searchParams.has('q')
            && renderProjectSearchResultsButton(t, projectDocument.resource.id, locationSearch) }
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
