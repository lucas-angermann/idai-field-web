import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { search, get } from './documents';
import DocumentTeaser from './DocumentTeaser';
import { Container, Row, Col } from 'react-bootstrap';
import DocumentList from './DocumentList';


const CHUNK_SIZE = 50;


export default () => {

    const { id } = useParams();
    const [documents, setDocuments] = useState([]);
    const [offset, setOffset] = useState(0);
    const [projectDocument, setProjectDocument] = useState(null);

    const onScroll = (e: React.UIEvent<Element, UIEvent>) => {

        const el = e.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
            const newOffset = offset + CHUNK_SIZE;
            getDocuments(id, newOffset).then(newDocs => setDocuments(documents.concat(newDocs)));
            setOffset(newOffset);
        }
    };

    useEffect(() => {
        getDocuments(id, 0).then(setDocuments);
        get(id).then(setProjectDocument);
    }, [id]);

    return (
        <Container fluid>
            <Row>
                <Col sm={ 3 }>
                    { renderProjectTeaser(projectDocument) }
                </Col>
                <Col onScroll={ onScroll } style={ { height: 'calc(100vh - 56px)', overflow: 'auto' } }>
                    <DocumentList documents={ documents } />
                </Col>
            </Row>
        </Container>
    );

};

const getDocuments = async (id: string, from: number) => {

    const query = {
        q: `project:${id}`,
        size: CHUNK_SIZE,
        from,
        skipTypes: ['Project', 'Image', 'Photo', 'Drawing']
    };
    return (await search(query)).hits;
};

const renderProjectTeaser = (projectDocument: any) =>
    projectDocument ? <DocumentTeaser document={ projectDocument } /> : '';
