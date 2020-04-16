import React, { useState } from 'react';
import { compose as _ } from 'tsfun/async';
import SearchBar from './SearchBar';
import ResultList from './ResultList';
import {search} from './search';


export default () => {

    const [results, setResults] = useState([]);

    return <div> 
        <SearchBar onSubmit={_(search, setResults)}></SearchBar>
        <ResultList results={results}></ResultList>
    </div>;
}