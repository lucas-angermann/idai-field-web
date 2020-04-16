import React, { useState } from 'react';
import SearchBar from './SearchBar';
import ResultList from './ResultList';
import {search} from './search';


export default () => {

    const [results, setResults] = useState([]);

    return <div> 
        <SearchBar onSubmit={fetchResults(setResults)}></SearchBar>
        <ResultList results={results}></ResultList>
    </div>;
}

const fetchResults = (setResults: any) => async (query: string) => setResults(await search(query))
