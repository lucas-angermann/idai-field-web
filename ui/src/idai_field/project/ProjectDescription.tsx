import React, { ReactElement, CSSProperties, useState } from 'react';
import { Document, getDocumentImages, getDocumentDescription } from '../../api/document';
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from '../../constants';
import { Card, Row, Col, Collapse, Button } from 'react-bootstrap';
import { ImageCarousel } from '../../shared/image/ImageCarousel';
import { mdiArrowDownDropCircle, mdiArrowUpDropCircle } from '@mdi/js';
import Icon from '@mdi/react';

export interface ProjectDescriptionProps {
    document: Document;
}

export function ProjectDescription ({ document }: ProjectDescriptionProps):ReactElement {

    const images = getDocumentImages(document);
    const description = getDocumentDescription(document);
    const [open, setOpen] = useState<boolean>(true);
    return (
        <Card style={ containerStyle }>
            <Button className="btn-primary p-1 d-flex flex-row-reverse"
                onClick={ () => setOpen(!open) }
                aria-controls="collapse-card"
                aria-expanded={ open }
                >
                <Icon path={ open? mdiArrowUpDropCircle : mdiArrowDownDropCircle } size={ 0.8 } className="m-1" />
                {!open && document.resource.shortDescription}
            </Button>
            <Collapse in={ open }>
                <Card id="collapse-card" className="p-1">
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
            </Collapse>
        </Card>
    );
}


const containerStyle: CSSProperties = {
    width: '60%',
    position: 'absolute',
    top: NAVBAR_HEIGHT-5,
    left: `${SIDEBAR_WIDTH+40}px`,
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
};