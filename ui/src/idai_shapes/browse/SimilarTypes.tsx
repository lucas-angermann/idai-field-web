import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Document, getImages } from '../../api/document';
import { search } from '../../api/documents';
import { getSimilar } from '../../api/image';
import { Query } from '../../api/query';
import { ResultDocument } from '../../api/result';
import DocumentGrid from '../../shared/documents/DocumentGrid';
import { LoginContext } from '../../shared/login';

export default function SimilarTypes({ type }: { type: Document }): ReactElement {

    const loginData = useContext(LoginContext);

    const [similarTypes, setSimilarTypes] = useState<ResultDocument[]>([]);

    useEffect(() => {

        if (!type) return;

        const imageId = getImages(type)?.[0].resource.id;
        imageId && getSimilar(imageId, loginData.token).then(imagesResult => {
            const typeDocQueries: Query[] = imagesResult.documents.map(doc =>
                ({ q: `resource.relations.isDepictedIn.resource.id:${doc.resource.id}` }));
            Promise.all(typeDocQueries.map(query => search(query, loginData.token)))
                .then(results => results.filter((result) => result.size > 0))
                .then(results => results.map(result => result.documents[0]))
                .then(setSimilarTypes);
        });
    }, [type, loginData.token]);

    return <>
        <DocumentGrid documents={ similarTypes }
            getLinkUrl={ (doc: ResultDocument): string => doc.resource.id } />
    </>;
}
