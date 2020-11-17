import { mdiCloseCircle } from '@mdi/js';
import Icon from '@mdi/react';
import React, { ReactElement } from 'react';
import { deleteFilterFromParams } from '../api/query';
import LinkButton from '../LinkButton';


export default function CloseButton({ params, filterKey, value, projectId }
        : { params: URLSearchParams, filterKey: string, value: string, projectId?: string }): ReactElement {

    return <LinkButton
        to={ (projectId ? `/project/${projectId}?` : '/?') + deleteFilterFromParams(params, filterKey, value) }
        variant="link"
        style={ { padding: 0, verticalAlign: 'baseline' } }>
        <Icon path={ mdiCloseCircle } size={ 0.8 }/>
    </LinkButton>;
}
