import React, { CSSProperties, ElementRef, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './Manual.css';


type Chapter = {
    id: string,
    label: string
};


const NAVBAR_HEIGHT: number = 56;
const PADDING: number = 15;
const CHAPTER_NAVIGATION_WIDTH: number = 200;


export default () => {

    const [markdown, setMarkdown] = useState('');
    const [chapters, setChapters] = useState([]);
    const [activeChapter, setActiveChapter] = useState(undefined);

    const manualElementRef: ElementRef<any> = useRef(null);

    useEffect(() => {
        getManual().then(result => {
            setMarkdown(result.markdown);
            setChapters(result.chapters);
            if (result.chapters.length > 0) setActiveChapter(result.chapters[0]);
        });
    }, []);

    return (
        <div>
            { getChaptersNavigationElement(chapters, activeChapter, setActiveChapter, manualElementRef) }
            { getManualElement(markdown, chapters, setActiveChapter, manualElementRef) }
        </div>
    );
};


const getChaptersNavigationElement = (chapters: Chapter[],
                                      activeChapter: Chapter,
                                      setActiveChapter: (chapter: Chapter) => void,
                                      manualElementRef: ElementRef<any>) => {

    return (
        <ul className="col-md-2 nav flex-column" style={ chaptersNavigationStyle }>
            {
                chapters.map((chapter: Chapter) => {
                    return getChapterElement(
                        chapter, chapter === activeChapter, setActiveChapter, manualElementRef
                    );
                })
            }
        </ul>
    );
};


const getManualElement = (markdown: string,
                          chapters: Chapter[],
                          setActiveChapter: (chapter: Chapter) => void,
                          manualElementRef: ElementRef<any>) => {

    return (
        <div ref={ manualElementRef }
             style={ markdownContainerStyle }
             onScroll={ () => updateActiveChapter(chapters, setActiveChapter) }>
            <ReactMarkdown source={ markdown } escapeHtml={ false } />
        </div>
    );
};


const getChapterElement = (chapter: Chapter,
                           isActiveChapter: boolean,
                           setActiveChapter: (chapter: Chapter) => void,
                           manualElementRef: ElementRef<any>) => {

    return (
        <li key={ chapter.id } className="nav nav-pills flex-column">
            <button className="btn btn-link nav-link"
                    style={ getChapterStyle(isActiveChapter) }
                    onClick={ () => scrollToChapter(chapter, setActiveChapter, manualElementRef) }>
                { chapter.label }
            </button>
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
            return `<h2 id="${id}">${heading}</h2>\n`;
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


const scrollToChapter = (chapter: Chapter,
                         setActiveChapter: (chapter: Chapter) => void,
                         manualElementRef: ElementRef<any>) => {

    setActiveChapter(chapter);

    const element: HTMLElement | null = document.getElementById(chapter.id);
    if (!element) return;

    element.scrollIntoView(true);
    manualElementRef.current.scrollTop -= PADDING;
};


const updateActiveChapter = (chapters: Chapter[], setActiveChapter: (chapter: Chapter) => void) => {

    let activeElementTop: number = 1;

    chapters.forEach(chapter => {
        const top: number = getHeaderTop(chapter);
        if (top <= 0 && (top > activeElementTop || activeElementTop === 1)) {
            activeElementTop = top;
            setActiveChapter(chapter);
        }
    });
};


const getHeaderTop = (chapter: Chapter): number => {

    const element: HTMLElement | null = document.getElementById(chapter.id);
    if (!element) return 1;

    return element.getBoundingClientRect().top
        - NAVBAR_HEIGHT
        - PADDING;
};


const chaptersNavigationStyle: CSSProperties = {
    position: 'absolute',
    width: CHAPTER_NAVIGATION_WIDTH + 'px'
};


const getChapterStyle = (isActiveChapter: boolean): CSSProperties => ({
    cursor: 'pointer',
    color: isActiveChapter ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.5)'
});


const markdownContainerStyle: CSSProperties = {
    position: 'relative',
    left: CHAPTER_NAVIGATION_WIDTH + 'px',
    width: 'calc(100vw - ' + CHAPTER_NAVIGATION_WIDTH + 'px)',
    height: 'calc(100vh - ' + NAVBAR_HEIGHT + 'px)',
    padding: PADDING + 'px',
    overflowY: 'auto'
};