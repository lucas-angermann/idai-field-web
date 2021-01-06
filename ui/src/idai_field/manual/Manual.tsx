import React, { ElementRef, useEffect, useRef, useState, ReactElement } from 'react';
import ChapterNavigation from './ChapterNavigation';
import MarkdownViewer from './MarkdownViewer';
import { loadManual } from './loadManual';


const URL: string = 'https://raw.githubusercontent.com/dainst/idai-field/master/src/manual';


export type Chapter = {
    id: string,
    label: string
};


export default function Manual(): ReactElement {

    const [markdown, setMarkdown] = useState('');
    const [chapters, setChapters] = useState([]);
    const [activeChapter, setActiveChapter] = useState(undefined);

    const manualElementRef: ElementRef<any> = useRef(null);

    useEffect(() => {
        loadManual(URL).then(result => {
            setMarkdown(result.markdown);
            setChapters(result.chapters);
            if (result.chapters.length > 0) setActiveChapter(result.chapters[0]);
        });
    }, []);

    return (
        <div>
            <ChapterNavigation chapters={ chapters }
                               activeChapter={ activeChapter }
                               setActiveChapter={ setActiveChapter }
                               manualElementRef={ manualElementRef } />
            <MarkdownViewer markdown={ markdown }
                            chapters={ chapters }
                            setActiveChapter={ setActiveChapter }
                            manualElementRef={ manualElementRef } />
        </div>
    );
}
