import React, { ReactNode, ReactElement } from 'react';
import { Carousel } from 'react-bootstrap';
import { ResultDocument } from '../../api/result';
import { Document } from '../../api/document';
import { Location } from 'history';
import Image from './Image';
import './imagecarousel.css';
import { Link } from 'react-router-dom';

const MAX_IMG_WIDTH = 380;
const MAX_IMG_HEIGHT = 350;
export interface ImageCarouselProps {
    document: Document;
    images: ResultDocument[];
    location?: Location;
}

export function ImageCarousel ({ document, images, location }: ImageCarouselProps): ReactElement {

    return (
        <Carousel className="image-carousel" interval={ null }>
            { images?.map(renderImage(document, location)) }
        </Carousel>
    );
}

const renderImage = (document: Document, location?: Location) =>
    
    function CarouselImage(imageDoc: ResultDocument): ReactNode {

        return (
            <Carousel.Item key={ imageDoc.resource.id }>
                <>
                    {location?
                        <Link to={ `/image/${document.project}/${imageDoc.resource.id}?r=${location.pathname}` }
                                className="d-block mb-2">
                            <Image
                                project={ document.project }
                                id={ imageDoc.resource.id }
                                maxWidth={ MAX_IMG_WIDTH } maxHeight={ MAX_IMG_HEIGHT } />
                        </Link>
                    :
                        <Image
                        project={ document.project }
                        id={ imageDoc.resource.id }
                        maxWidth={ MAX_IMG_WIDTH } maxHeight={ MAX_IMG_HEIGHT } />
                        }
                </>
            </Carousel.Item>
        );
};