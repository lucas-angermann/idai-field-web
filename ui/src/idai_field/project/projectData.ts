import { Query } from '../../api/query';
import { Result, ResultDocument } from '../../api/result';
import { Document } from '../../api/document';
import { get, getPredecessors, search, searchMap } from '../../api/documents';
import { ProjectView } from './Project';


export type ProjectData = {
    searchResult: Result,
    mapSearchResult: Result,
    selected: Document,
    predecessors: ResultDocument[]
};


export const fetchProjectData = async (token: string, view: ProjectView, query?: Query, selectedId?: string,
        predecessorsId?: string): Promise<ProjectData> => {

    let selected: Document;
    if (view === 'hierarchy' && selectedId && query && !query.parent) {
        selected = await get(selectedId, token);
        query.parent = selected.resource.parentId || 'root';
    }

    const promises = [];
    promises.push(query ? search(query, token) : undefined);
    promises.push(query ? searchMap(query, token) : undefined);
    promises.push(predecessorsId ? getPredecessors(predecessorsId, token) : { results: [] });
    if (!selected) promises.push(selectedId ? get(selectedId, token) : undefined);

    const data = await Promise.all(promises);
    return {
        searchResult: data[0],
        mapSearchResult: data[1],
        predecessors: data[2].results,
        selected: selected || data[3]
     };
};
