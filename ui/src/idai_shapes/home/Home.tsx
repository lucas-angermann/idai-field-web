import { mdiInboxArrowUp, mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { search } from '../../api/documents';
import { Query } from '../../api/query';
import { Result, ResultDocument } from '../../api/result';
import DocumentGrid from '../../shared/documents/DocumentGrid';
import { LoginContext } from '../../shared/login';
import SearchBar from '../../shared/search/SearchBar';
import { SHAPES_PROJECT_ID } from '../constants';
import './home.css';


const NUM_CATALOGS = 6;


export default function Home(): ReactElement {

    const [documents, setDocuments] = useState<ResultDocument[]>(null);
    const loginData = useContext(LoginContext);

    useEffect(() => {
        searchCatalogDocuments(loginData.token)
            .then(result => setDocuments(result.documents));
    }, [loginData]);

    const getDocumentLink = (document: ResultDocument): string => `document/${document.resource.id}`;

    return (
        <>
            <Container fluid className="shapes-home p-0">
                <div className="search-background">
                    <div className="search-container">
                        <h1>iDAI.<b>shapes</b></h1>
                        <SearchBar basepath="document/" />
                        { renderFunctionBar() }
                    </div>
                </div>
            </Container>
            <Container>
                <Row className="catalog">
                    <Col>
                        <h1 className="my-5">Catalogs:</h1>
                        <DocumentGrid documents={ documents } getLinkUrl={ getDocumentLink } />
                    </Col>
                </Row>
                <Row>
                    <Col className="text-right">
                        <Link to="document/">Show all catalogs ...</Link>
                    </Col>
                </Row>
            </Container>
        </>
    );
}


const searchCatalogDocuments = async (token: string): Promise<Result> => {
    
    const query: Query = {
        size: NUM_CATALOGS,
        filters: [
            { field: 'project', value: SHAPES_PROJECT_ID },
            { field: 'resource.category.name', value: 'TypeCatalog' }
        ],
        parent: 'root'
    };
    
    return search(query, token);
};


const renderFunctionBar = (): ReactElement => (
    <div className="d-flex justify-content-around mt-2">
        <div className="p-1">
            <p>Suchen durch</p>
        </div>
        <div className="d-flex p-1">
            <Icon path={ mdiPencilOutline } size={ 0.9 } />
            <p>Zeichnen einer Form</p>
        </div>
        <div className="d-flex p-1">
            <Icon path={ mdiInboxArrowUp } size={ 0.9 } />
            <p>Upload einer Bilddatei</p>
        </div>
    </div>
);
