import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoginContext } from '../../shared/login';
import { Document } from '../../api/document';
import { get } from '../../api/documents';


export default function RelationFilter({ relationName, resourceId }
        : { relationName: string, resourceId: string }): ReactElement {

    const [document, setDocument] = useState<Document>(null);

    const loginData = useContext(LoginContext);
    const { t } = useTranslation();

    useEffect(() => {

       get(resourceId, loginData.token).then(setDocument)
    }, [resourceId, loginData]);

    return document
        ? <div>
            { t(`filters.relations.${relationName}`) }
            { document.resource.identifier }
        </div>
        : <></>;
}
