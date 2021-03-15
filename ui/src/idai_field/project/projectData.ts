import { Query } from '../../api/query';
import { Result, ResultDocument } from '../../api/result';
import { Document } from '../../api/document';
import { get, getPredecessors, search, searchMap } from '../../api/documents';


export type ProjectData = {
    searchResult: Result,
    mapSearchResult: Result,
    selected: Document,
    predecessors: ResultDocument[]
};


export const fetchProjectData = async (token: string, query?: Query, selectedId?: string,
        predecessorsId?: string): Promise<ProjectData> => {

    const searchResult: Result = query ? await search(query, token) : undefined;
    const mapSearchResult: Result = query ? await searchMap(query, token) : undefined;
    const selected: Document = selectedId ? await get(selectedId, token) : undefined;
    const predecessors: ResultDocument[] = predecessorsId ? (await getPredecessors(predecessorsId, token)).results : [];

    return { searchResult, mapSearchResult, selected, predecessors };
};
