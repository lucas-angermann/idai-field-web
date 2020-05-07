import React, { CSSProperties, ElementRef } from 'react';
import { Chapter } from './Manual';
import { CHAPTER_NAVIGATION_WIDTH, PADDING } from './constants';

export default ({ chapters, activeChapter, setActiveChapter, manualElementRef }
                    : { chapters: Chapter[], activeChapter: Chapter,
                        setActiveChapter: (activeChapter: Chapter) => void,
                        manualElementRef: ElementRef<any> }) => {

    return (
        <ul className="col-md-2 nav flex-column" style={ chapterNavigationStyle }>
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


const scrollToChapter = (chapter: Chapter,
                         setActiveChapter: (chapter: Chapter) => void,
                         manualElementRef: ElementRef<any>) => {

    setActiveChapter(chapter);

    const element: HTMLElement | null = document.getElementById(chapter.id);
    if (!element) return;

    element.scrollIntoView(true);
    manualElementRef.current.scrollTop -= PADDING;
};


const chapterNavigationStyle: CSSProperties = {
    position: 'absolute',
    width: CHAPTER_NAVIGATION_WIDTH + 'px'
};


const getChapterStyle = (isActiveChapter: boolean): CSSProperties => ({
    cursor: 'pointer',
    color: isActiveChapter ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.5)'
});
