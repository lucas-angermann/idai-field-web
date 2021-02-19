import React, { ReactNode, ReactElement} from 'react';
import { Carousel } from 'react-bootstrap';
import { ResultDocument } from '../../api/result';
import { Document } from '../../api/document';
import { Location } from 'history';
import Image from './Image';
import './imagecarousel.css';
import { Link } from 'react-router-dom';

export interface ImageCarouselProps {
    document: Document;
    images: ResultDocument[];
    location: Location;
}

export function ImageCarousel ({ document, images, location }: ImageCarouselProps): ReactElement {

    return (
        <Carousel className="image-carousel" interval={ null }>
            { images?.map(renderImage(document, location)) }
        </Carousel>
    );
}

const renderImage = (document: Document, location: Location) =>
    
    function CarouselImage(imageDoc: ResultDocument): ReactNode {

        return (
            <Carousel.Item key={ imageDoc.resource.id }>
                <Link to={ `/image/${document.project}/${imageDoc.resource.id}?r=${location.pathname}` }
                        className="d-block mb-2">
                    <Image
                        project={ document.project }
                        id={ imageDoc.resource.id }
                        maxWidth={ 380 } maxHeight={ 350 } />
                </Link>
            </Carousel.Item>
        );
};