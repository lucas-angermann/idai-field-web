import React, { CSSProperties, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './Manual.css';


type Chapter = {
    id: string,
    label: string
};


export default () => {

    const [markdown, setMarkdown] = useState('');
    const [chapters, setChapters] = useState([]);
    const [activeChapter, setActiveChapter] = useState(undefined);

    useEffect(() => {
        getManual().then(result => {
            setMarkdown(result.markdown);
            setChapters(result.chapters);
            if (result.chapters.length > 0) setActiveChapter(result.chapters[0]);
        });
    }, []);

    return (
        <div>
            { getChaptersNavigationElement(chapters, activeChapter, setActiveChapter) }
            { getManualElement(markdown) }
        </div>
    );
};


const getChaptersNavigationElement = (chapters: Chapter[],
                                      activeChapter: Chapter,
                                      setActiveChapter: (chapter: Chapter) => void) => {

    return (
        <ul className="col-md-2 nav flex-column" style={ chaptersNavigationStyle }>
            {
                chapters.map((chapter: Chapter) => {
                    return getChapterElement(chapter, chapter === activeChapter, setActiveChapter);
                })
            }
        </ul>
    );
};


const getManualElement = (markdown: string) => {

    return (
        <div style={ markdownContainerStyle }>
            <ReactMarkdown source={ markdown } escapeHtml={ false } />
        </div>
    );
};


const getChapterElement = (chapter: Chapter,
                           isActiveChapter: boolean,
                           setActiveChapter: (chapter: Chapter) => void) => {

    return (
        <li key={ chapter.id } className="nav nav-pills flex-column">
            <button className="btn btn-link nav-link" style={ getChapterStyle(isActiveChapter) }
               onClick={ () => scrollToChapter(chapter, setActiveChapter) }>{ chapter.label }</button>
        </li>
    );
};


const getManual = async (): Promise<{ markdown: string, chapters: Chapter[] }> => {

    const markdownText: string = setHeadingIds(fixImageLinks(await loadMarkdown()));

    return {
        markdown: markdownText,
        chapters: getChapters(markdownText)
    };
};


const loadMarkdown = (): Promise<string> => {

    const url = 'https://raw.githubusercontent.com/dainst/idai-field/master/manual/manual.de.md';

    return new Promise<string>(resolve => {
        const request = new XMLHttpRequest();
        request.addEventListener('load', () => resolve(request.response));
        request.open('GET', url);
        request.send();
    });
};


const setHeadingIds = (markdown: string): string => {

    return markdown.replace(
        /(^|\n)## .*\n/g,
        (text: string) => {
            const heading: string = text
                .replace('## ', '')
                .replace(/\n/g, '');
            const id: string = heading.replace(' ', '-').toLowerCase();
            return `<h2 id="${id}">${heading}</h2>`;
        }
    );
};


const getChapters = (markdown: string): Chapter[] => {

    const matches = markdown.match(/<h2 id=".*">.*<\/h2>/g);

    return matches.map(match => {
        const result = /<h2 id="(.*)">(.*)<\/h2>/g.exec(match);
        return {
            id: result[1],
            label: result[2]
        };
    });
};


const fixImageLinks = (markdown: string): string => {

    return markdown.replace(
        /img src="images/g,
        'img src="https://raw.githubusercontent.com/dainst/idai-field/master/manual/images'
    );
};


const scrollToChapter = (chapter: Chapter, setActiveChapter: (chapter: Chapter) => void) => {

    setActiveChapter(chapter);

    const element: HTMLElement | null = document.getElementById(chapter.id);
    if (!element) return;

    element.scrollIntoView(true);
};


const chaptersNavigationStyle: CSSProperties = {
    position: 'absolute',
    width: '200px'
};


const getChapterStyle = (isActiveChapter: boolean): CSSProperties => ({
    cursor: 'pointer',
    color: isActiveChapter ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.5)'
});


const markdownContainerStyle: CSSProperties = {
    position: 'relative',
    left: '200px',
    width: 'calc(100vw - 200px)',
    height: 'calc(100vh - 56px)',
    padding: '20px',
    overflowY: 'auto'
};