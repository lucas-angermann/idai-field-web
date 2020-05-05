import React, { CSSProperties, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './Manual.css';


export default () => {

    const [markdown, setMarkdown] = useState('');

    useEffect(() => {
        getMarkdown().then(setMarkdown);
    }, []);

    return (
        <div style={ markdownContainerStyle }>
            <ReactMarkdown source={ markdown } escapeHtml={ false } />
        </div>
    );
};


const getMarkdown = (): Promise<string> => {

    const url = 'https://raw.githubusercontent.com/dainst/idai-field/master/manual/manual.de.md';

    return new Promise<string>(resolve => {
        const request = new XMLHttpRequest();
        request.addEventListener('load', () => resolve(fixImageLinks(request.response)));
        request.open('GET', url);
        request.send();
    });
};


const fixImageLinks = (markdown: string) => {

    return markdown.replace(
        /img src="images/g,
        'img src="https://raw.githubusercontent.com/dainst/idai-field/master/manual/images'
    );
};


const markdownContainerStyle: CSSProperties = {
    padding: '20px'
};