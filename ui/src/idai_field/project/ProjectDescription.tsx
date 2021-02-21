import React, { ReactElement, CSSProperties } from 'react';
import { Document, getDocumentImages, getDocumentDescription } from '../../api/document';
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from '../../constants';
import { Card, Row, Col } from 'react-bootstrap';
import { ImageCarousel } from '../../shared/image/ImageCarousel';


export interface ProjectDescriptionProps {
    document: Document;
}

export function ProjectDescription ({ document }: ProjectDescriptionProps):ReactElement {

    const images = getDocumentImages(document);
    const description = getDocumentDescription(document);
    return (
            <Card style={ containerStyle } >
                <Row>
                    { images &&
                    <Col className="col-4">
                        <ImageCarousel
                            document={ document }
                            images={ images }
                        />
                    </Col>
                    }
                    <Col>
                        <Card.Title>{ document.resource.shortDescription }</Card.Title>
                        <Card.Text>{ description }</Card.Text>
                    </Col>
                </Row>
            </Card>
    );
}


const containerStyle: CSSProperties = {
    width: '60%',
    position: 'absolute',
    top: NAVBAR_HEIGHT,
    left: `${SIDEBAR_WIDTH+40}px`,
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    padding: '10px',
    outline: '2px solid black',
};