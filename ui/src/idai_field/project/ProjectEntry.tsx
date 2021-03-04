import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Card } from 'react-bootstrap';
import SearchBar from '../../shared/search/SearchBar';
import { Document, getDocumentImages, getDocumentDescription, FieldValue } from '../../api/document';
import { get } from '../../api/documents';
import { LoginContext } from '../../shared/login';
import { ImageCarousel } from '../../shared/image/ImageCarousel';
import { ResultDocument } from '../../api/result';
import { useSearchParams } from '../../shared/location';
import ProjectHomeButton from './ProjectHomeButton';

export default function ProjectEntry ():ReactElement {

    const { projectId } = useParams<{ projectId: string }>();
    const [projectDoc, setProjectDoc] = useState<Document>();
    const [description, setDescription] = useState<FieldValue>();
    const [images, setImages] = useState<ResultDocument[]>();
    const loginData = useContext(LoginContext);
    const searchParams = useSearchParams();

    useEffect(() => {

        get(projectId, loginData.token)
            .then(setProjectDoc);
    }, [projectId, loginData, searchParams]);

    useEffect(() => {

        if(projectDoc){
            setDescription(getDocumentDescription(projectDoc));
            setImages(getDocumentImages(projectDoc));
        }

    },[projectDoc]);

    if (!projectDoc || !images || !description) return null;
    return (
        <Card className="m-2">
            <Row>
                <Col className="col-3">
                    <SearchBar basepath={ `/project/${projectId}` } />
                </Col>
                <Col>
                    <Row>
                        <Col>
                            <Card.Title>{ projectDoc.resource.shortDescription }</Card.Title>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="col-6">
                            <ImageCarousel document={ projectDoc } images={ images } />
                        </Col>
                        <Col>
                            <Card.Text>{ description }</Card.Text>
                        </Col>
                    </Row>
                    <Row className="mt-1">
                        <Col className="col-6">
                            <p>Minimap</p>
                        </Col>
                        <Col className="d-flex align-items-end flex-column mt-auto">
                            { <ProjectHomeButton projectId={ projectId } /> }
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Card>
    );
}
