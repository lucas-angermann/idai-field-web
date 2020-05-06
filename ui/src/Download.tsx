import React, { CSSProperties, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';
import Icon from '@mdi/react';
import { mdiApple, mdiMicrosoftWindows, mdiDownload, mdiGithub } from '@mdi/js';
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
        getLatestVersion().then(setLatestVersion);
    }, []);

    return (
        <div>
            { getCarousel() }
            { getDownloadSection(latestVersion) }
        </div>
    );
};


const getCarousel = () => {

    return (
        <div style={ carouselContainerStyle } className="mt-5">
            <Carousel>
                { getCarouselItems() }
            </Carousel>
        </div>
    );
};


const getCarouselItems = () => {

    return slides.map(slide => {
       return (
           <Carousel.Item key={ slide.imageUrl }>
               <img src={ slide.imageUrl } alt="Screenshot" />
               <Carousel.Caption>
                   <h3>{ slide.description }</h3>
               </Carousel.Caption>
           </Carousel.Item>
       );
    });
};


const getDownloadSection = (latestVersion: string) => {

    if (latestVersion === '') return;

    return (
        <div style={ downloadContainerStyle }>
            <hr className="m-5"/>
            <h1>iDAI.field herunterladen</h1>
            <p className="lead text-muted">Hier können Sie die aktuelle Version von iDAI.field herunterladen.</p>
            <p>Es werden Pakete für macOS und Windows zur Verfügung gestellt.</p>
            <p>Aktuelle Version: <strong>{ latestVersion }</strong></p>
            <p>
                <a href={ 'https://github.com/dainst/idai-field/releases/download/v' + latestVersion + '/iDAI.field-'
                + latestVersion + '-Windows.exe' } className="btn btn-primary my-2 mr-1">
                    <Icon path={ mdiMicrosoftWindows } size={ 0.8 } className="windows-icon"/>
                    Download für Windows
                    <Icon path={ mdiDownload } size={ 0.8 } className="download-icon"/>
                </a>
                <a href={ 'https://github.com/dainst/idai-field/releases/download/v' + latestVersion + '/iDAI.field-'
                + latestVersion + '-MacOS.dmg' } className="btn btn-primary my-2">
                    <Icon path={ mdiApple } size={ 0.8 } className="apple-icon"/>
                    Download für macOS
                    <Icon path={ mdiDownload } size={ 0.8 } className="download-icon"/>
                </a>
            </p>
            <p>
                <a href="https://github.com/dainst/idai-field/releases" target="_blank" rel="noopener noreferrer">
                    Alle Versionen...
                </a>
            </p>
            <p>
                <Link to="/manual">Handbuch</Link>
            </p>
            <hr className="m-5"/>
            <p className="mb-5">
                <a className="btn btn-secondary" href="https://github.com/dainst/idai-field"
                   target="_blank" rel="noopener noreferrer">
                    <Icon path={ mdiGithub } size={ 0.8 } className="github-icon" />
                    Quellcode auf GitHub
                </a>
            </p>
        </div>
    );
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
    width: '1030px',
    paddingRight: '15px',
    paddingLeft: '15px',
    marginRight: 'auto',
    marginLeft: 'auto'
};


const downloadContainerStyle: CSSProperties = {
    textAlign: 'center'
};
