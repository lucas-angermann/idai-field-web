import React from 'react';
import { Carousel, Jumbotron } from 'react-bootstrap';
import './Download.css';


type Slide = { imageUrl: string, description: string };


const slides: Array<Slide> = [
    {
        imageUrl: 'https://raw.githubusercontent.com/dainst/idai-field/master/img/README-FEATURES-1.png',
        description: 'Metadata editor'
    },
    {
        imageUrl: 'https://raw.githubusercontent.com/dainst/idai-field/master/img/README-FEATURES-2.png',
        description: 'Shape editor'
    },
    {
        imageUrl: 'https://raw.githubusercontent.com/dainst/idai-field/master/img/README-FEATURES-8.png',
        description: 'Matrix view'
    },
    {
        imageUrl: 'https://raw.githubusercontent.com/dainst/idai-field/master/img/README-FEATURES-6.png',
        description: 'Synchronization'
    },
    {
        imageUrl: 'https://raw.githubusercontent.com/dainst/idai-field/master/img/README-FEATURES-3.png',
        description: 'Table view'
    },
    {
        imageUrl: 'https://raw.githubusercontent.com/dainst/idai-field/master/img/README-FEATURES-4.png',
        description: 'Nesting'
    }
];


export default () => {

    return <div>
        <Jumbotron>
            <div className="container">
                <Carousel>
                    { getCarouselItems() }
                </Carousel>
            </div>
        </Jumbotron>
    </div>;
};


const getCarouselItems = () => {

    return slides.map(slide => {
       return <Carousel.Item key={ slide.imageUrl }>
           <img src={ slide.imageUrl } />
           <Carousel.Caption>
               <h3>{ slide.description }</h3>
           </Carousel.Caption>
       </Carousel.Item>;
    });
};
