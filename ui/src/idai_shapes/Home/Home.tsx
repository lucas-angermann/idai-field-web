import { mdiInboxArrowUp, mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { searchDocuments } from '../../api/documents';
import { ResultDocument } from '../../api/result';
import { LoginContext } from '../../App';
import { DocumentsGrid } from '../../shared/documents/DocumentsGrid';
import SearchBar from '../../shared/search/SearchBar';
import { EXCLUDED_TYPES_SHAPES } from '../constants';
import './home.css';


export default function Home(): ReactElement {

    const [documents, setDocuments] = useState<ResultDocument[]>(null);
    const loginData = useContext(LoginContext);
    const projectId = 'idaishapes';

    useEffect(() => {
        const parentId = 'root';
        searchDocuments(projectId, '',0, loginData.token,
            50, EXCLUDED_TYPES_SHAPES, parentId)
            .then(result => setDocuments(result.documents));
    }, [loginData]);

    const getDocumentLink = (id: string): string => `document/${id}`;

    return (
        <Container>
            <div className="search-container">
                <h1>iDAI.<b>shapes</b></h1>
                < SearchBar basepath="document/" />
                { renderFunctionBar() }
            </div>
            <div>
                <h2>Catalogs:</h2>
                <DocumentsGrid documents={ documents } getLinkUrl= { getDocumentLink }/>
            </div>
        </Container>
    );
}

const renderFunctionBar = (): ReactElement => (
    <div className="d-flex justify-content-around">
        <div className="p-1">
            <p>Suchen durch</p>
        </div>
        <div className="d-flex p-1">
            <Icon path={ mdiPencilOutline } size={ 0.9 } />
            <p>Zeichnen einer Form</p>
        </div>
        <div className="d-flex p-1">
            <Icon path={ mdiInboxArrowUp } size = {0.9} />
            <p>Upload einer Bilddatei</p>
        </div>
    </div>
);
