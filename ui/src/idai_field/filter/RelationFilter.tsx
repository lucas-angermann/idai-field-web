import React, { CSSProperties, ReactElement, useContext, useEffect, useState } from 'react';
import { ButtonGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Icon from '@mdi/react';
import { mdiCloseCircle } from '@mdi/js';
import { LoginContext } from '../../shared/login';
import { Document } from '../../api/document';
import { get } from '../../api/documents';
import LinkButton from '../../shared/linkbutton/LinkButton';
import { deleteFilterFromParams } from '../../api/query';


export default function RelationFilter({ relationName, resourceId, params, projectId }
        : { relationName: string, resourceId: string, params: URLSearchParams, projectId?: string }): ReactElement {

    const [document, setDocument] = useState<Document>(null);

    const loginData = useContext(LoginContext);
    const { t } = useTranslation();

    useEffect(() => {

       get(resourceId, loginData.token).then(setDocument)
    }, [resourceId, loginData]);

    return document
        ? <ButtonGroup size="sm">
            <LinkButton variant="primary" style={ buttonStyle }
                        to={ (projectId ? `/project/${projectId}?` : '/?')
                            + deleteFilterFromParams(params,
                            `resource.relations.${relationName}.resource.id`,
                            resourceId) }>
                <div style={ labelStyle }>
                    <div>{ t(`filters.relations.${relationName}`) }:</div>
                    <div>{ document.resource.identifier }</div>
                </div>
                &nbsp; <Icon path={ mdiCloseCircle } style={ iconStyle } size={ 0.7 } />
            </LinkButton>
        </ButtonGroup>
        : <></>;
}


const buttonStyle: CSSProperties = {
    backgroundColor: '#5572a1',
    height: '31px',
    fontSize: '11px',
    lineHeight: '11px'
};


const labelStyle: CSSProperties = {
    float: 'left',
    position: 'relative',
    top: '-1px'
};


const iconStyle: CSSProperties = {
    position: 'relative',
    top: '3px'
};
