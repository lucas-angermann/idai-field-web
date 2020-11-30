import React, { Fragment, ReactElement } from 'react';
import { Row } from 'react-bootstrap';
import { ResultDocument } from '../../api/result';
import DocumentThumbnail from '../document/DocumentThumbnail';

import { shapesBasepath } from '../../constants';

interface ShapesHierarchy {
    documents: ResultDocument[];
    searchParams?: string;
    selectedItem: (id: string, identifier: string, url: string, parentId: string | null) => void;
}

export function ShapesHierarchy({ documents, searchParams, selectedItem }: ShapesHierarchy): ReactElement {
    if (documents !== null) {
        return (
            <Row  className="mx-1">
                { documents.map((document: ResultDocument) => {
                    const linkUrl = getLinkUrl(searchParams, document);
                    return (
                        <div onClick={ () => selectedItem(
                            document.resource.id,
                            document.resource.identifier,
                            linkUrl,
                            document.resource.parentId)}
                            key={ document.resource.id} >
                            <DocumentThumbnail
                                document={ document}
                                linkUrl={ linkUrl}
                                imageUrl="" />
                        </div>
                    );
                }
                )}
            </Row>
        );
    } else {
        return <Fragment/>;
    }
}

const getLinkUrl = (searchParams: string, document: ResultDocument): string => {
    if (document.resource.childrenCount > 0) {
        return `${shapesBasepath}/browseSelect?${getHierarchySearchParams(searchParams, document.resource.id)}`;
    } else {
        return `${shapesBasepath}/browseSelect/${document?.project}/${document.resource.id}${searchParams}`;
    }
};

const getHierarchySearchParams = (searchParams: string | undefined, documentId: string) => {

    const params = new URLSearchParams(searchParams);
    params.set('parent', documentId);

    return params.toString();
};