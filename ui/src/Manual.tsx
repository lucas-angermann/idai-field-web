import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';


export default () => {

    const [markdown, setMarkdown] = useState('');

    useEffect(() => {
        getMarkdown().then(setMarkdown);
    }, []);

    return (
        <ReactMarkdown source={ markdown } escapeHtml={ false }/>
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


const fixImageLinks = (manualMarkdown: string) => {

    return manualMarkdown.replace(
        /img src="images/g,
        'img src="https://raw.githubusercontent.com/dainst/idai-field/master/manual/images'
    );
};