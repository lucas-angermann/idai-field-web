import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Document } from '../../api/document';
import { get, search } from '../../api/documents';
import { buildProjectQueryTemplate, parseFrontendGetParams } from '../../api/query';
import { Result, ResultDocument } from '../../api/result';
import { LoginContext } from '../../App';
import { getContextUrl } from '../../idai_field/project/navigation';
import DocumentDetails from '../../shared/document/DocumentDetails';
import DocumentHierarNav, { HierarchyItem } from '../../shared/documents/DocumentHierarNav';
import { ShapesHierarchy } from '../../shared/documents/ShapesHierarchy';
import { EXCLUDED_TYPES_SHAPES } from '../constants';

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
    const [hierarchy, setHierarchy] = useState<HierarchyItem[]>([]);
    
    useEffect(() => {

        if (!documentId) {
            const index = hierarchy.findIndex(item => item.id === location.search.split('=')[1]);
            const newHierarchy = hierarchy.slice(0, index + 1);
            setHierarchy([...newHierarchy]);
        }
    }, [document, documentId, location]);
 
    const selectedItemHandler = (id: string, identifier: string, url: string, parent: string | null): void =>
        setHierarchy(hierarchy.concat({ url, id, name: identifier }));

    let parentId: string | undefined;
    let waitForDocument: Promise<void | any> = new Promise<void>(resolve => resolve());
    
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
            searchDocuments(projectId, location.search, 0, loginData.token, parentId === undefined ? 'root' : parentId)
                .then(result => {
                    setDocuments(result.documents);
                });
        });
    }, [ location.search, loginData]);

    
    return (
        <>
            <DocumentHierarNav hierarchy={ [{ name: root, url: '' }, ...hierarchy]}/>
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
        </>
    );
}
  

const searchDocuments = async (id: string, searchParams: string, from: number, token: string,
                               parentId?: string): Promise<Result> => {

    const query = parseFrontendGetParams(searchParams,
        buildProjectQueryTemplate(id, from, CHUNK_SIZE, EXCLUDED_TYPES_SHAPES), parentId);
    return search(query, token);
};
