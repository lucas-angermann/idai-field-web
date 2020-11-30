import React, { ReactElement, Fragment, useState, useContext, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import { LoginContext } from '../../App';
import { getContextUrl } from '../../idai_field/project/navigation';
import { buildProjectQueryTemplate, parseFrontendGetParams } from '../../api/query';
import { ResultDocument, Result } from '../../api/result';
import { get,  search } from '../../api/documents';
import { Document } from '../../api/document';
import DocumentDetails from '../../shared/document/DocumentDetails';
import { ShapesHierarchy } from '../../shared/documents/ShapesHierarchy';
import { shapesBasepath } from '../../constants';
import DocumentHierarNav, { HierarItem } from '../../shared/documents/DocumentHierarNav';
const CHUNK_SIZE = 50;

/* eslint-disable react-hooks/exhaustive-deps */
export default function BrowseSelect(): ReactElement {

    const {  documentId } = useParams<{ documentId: string }>();
    const [document, setDocument] = useState<Document>(null);
    const loginData = useContext(LoginContext);
    const [documents, setDocuments] = useState<ResultDocument[]>(null);
    const location = useLocation();
    const projectId = 'idaishapes';

    const root = 'Catalogs';
    const [hierarchy, setHierarchy] = useState<HierarItem[]>([]);
    
    useEffect(() => {
        if (!documentId) {
            const index = hierarchy.findIndex(item => item.id === location.search.split('=')[1]);
            const newHierar = hierarchy.slice(0, index + 1);
            setHierarchy([...newHierar]);
        }
    }, [document, documentId, location]);
 
    const selectedItemHandler = (id: string, identifier: string, url: string, parent: string | null): void => {
        setHierarchy(hierarchy.concat({ url, id, name: identifier }));

    };

    let parentId: string | undefined;
    let waitForDocument: Promise<any> = new Promise(resolve => resolve());
    
    useEffect(() => {

    if (documentId) {
        waitForDocument = get(documentId, loginData.token);
        waitForDocument.then(doc => {
            setDocument(doc);
            parentId = doc?.resource.parentId;
        });
    } else {
        setDocument(null);
    }
    }, [documentId, loginData]);

    useEffect(() => {

        waitForDocument.then(() => {
            searchDocuments(projectId, location.search, 0, loginData.token, parentId)
                .then(result => {
                    setDocuments(result.documents);
                });
        });
    }, [ location.search, loginData]);

    
    return (
        <Fragment>
            <DocumentHierarNav hierarchy={ [{ name: root, url: shapesBasepath }, ...hierarchy]}/>
            { document
                ? <DocumentDetails document={ document }
                                     searchParams={ location.search }
                                     backButtonUrl={ getContextUrl(projectId, location.search, document) } />
                :
                <ShapesHierarchy
                    documents={ documents}
                    searchParams={ location.search}
                    selectedItem={ selectedItemHandler}
                />
            }
        </Fragment>
    );
}
       
const searchDocuments = async (id: string, searchParams: string, from: number, token: string,
                               parentId?: string): Promise<Result> => {

    const query = parseFrontendGetParams(searchParams, buildProjectQueryTemplate(id, from, CHUNK_SIZE), parentId);
    return search(query, token);
};