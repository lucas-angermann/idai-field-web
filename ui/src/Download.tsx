import React, { CSSProperties, useEffect, useState } from 'react';
import { Carousel } from 'react-bootstrap';
import './Download.css';


type Slide = { imageUrl: string, description: string };


const slides: Slide[] = [
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

    const [latestVersion, setLatestVersion] = useState('');

    useEffect (() => {
        getLatestVersion().then(version => setLatestVersion(version));
    }, []);

    return <div>
        { getCarousel() }
        { getDownloadSection(latestVersion) }
    </div>;
};


const getCarousel = () => {

    return <div style={ carouselContainerStyle }>
        <Carousel>
            { getCarouselItems() }
        </Carousel>
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


const getDownloadSection = (latestVersion: string) => {

    if (latestVersion === '') return;

    return <div style={ downloadContainerStyle }>
        <h1>iDAI.field herunterladen</h1>
        <p className="lead text-muted">Hier können Sie die aktuelle Version von iDAI.field herunterladen.</p>
        <p>Es werden Pakete für macOS und Windows zur Verfügung gestellt.</p>
        <p>Aktuelle Version: <strong>{ latestVersion }</strong></p>
        <p>
            <a href={ 'https://github.com/dainst/idai-field/releases/download/v' + latestVersion + '/iDAI.field-'
            + latestVersion + '-Windows.exe' } className="btn btn-primary my-2">
                <span className="fa fa-windows"></span>
                Download für Windows
                <span className="fa fa-download"></span>
            </a>
            <a href={ 'https://github.com/dainst/idai-field/releases/download/v' + latestVersion + '/iDAI.field-'
            + latestVersion + '-MacOS.dmg' } className="btn btn-primary my-2">
                <span className="fa fa-apple"></span>
                Download für macOS
                <span className="fa fa-download"></span>
            </a>
        </p>
        <p>
            <a href="https://github.com/dainst/idai-field/releases">
                Alle Versionen...
            </a>
        </p>
    </div>;
};


const getLatestVersion = (): Promise<string> => {

    const url = 'https://api.github.com/repos/dainst/idai-field/releases';

    return new Promise<string>(resolve => {
        const request = new XMLHttpRequest();
        request.addEventListener('load', () => {
            resolve(JSON.parse(request.response)[0].tag_name.substr(1));
        });

        request.open('GET', url);
        request.setRequestHeader('Accept', 'application/vnd.github.v3+json');
        request.send();
    });
};


const carouselContainerStyle: CSSProperties = {
    width: 'calc(100vw - 200px)',
    paddingRight: '15px',
    paddingLeft: '15px',
    marginRight: 'auto',
    marginLeft: 'auto'
};


const downloadContainerStyle: CSSProperties = {
    textAlign: 'center'
};