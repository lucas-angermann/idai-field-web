import { useState } from 'react';


const DEFAULT_CHUNK_SIZE = 50;


type GetChunk = (offset: number) => void;
type OnScroll = (e: React.UIEvent<Element, UIEvent>) => void;

export function useGetChunkOnScroll(getChunk: GetChunk, size = DEFAULT_CHUNK_SIZE): OnScroll {

    const [offset, setOffset] = useState<number>(0);

    const onScroll = (e: React.UIEvent<Element, UIEvent>) => {

        const el = e.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
            const newOffset = offset + size;
            getChunk(newOffset);
            setOffset(newOffset);
        }
    };

    return onScroll;
}
