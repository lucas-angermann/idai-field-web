import React, { ReactElement, useState, useEffect, useContext } from 'react';
import { DocumentsGrid } from '../../shared/documents/DocumentsGrid';
import SearchBar from '../../shared/search/SearchBar';
import { ResultDocument } from '../../api/result';
import { searchDocuments } from '../../api/documents';
import { LoginContext } from '../../App';
import { EXCLUDED_TYPES_SHAPES } from '../constants';
import { Row } from 'react-bootstrap';

// interface HomeProps {

// }

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

    return (
        <div className="d-flex align-items-center flex-column mt-2">
            <h1>iDai.shapes</h1>
            < SearchBar basepath="idaishapes" />
            { functionBar() }
            <DocumentsGrid documents={ documents } searchParams="" selectedItem={ ()=> 0}/>
        </div>
    );
}

const functionBar = (): ReactElement => (
    <Row>
        <p>Suchen durch</p>
    </Row>
)