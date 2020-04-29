import React, { useState } from 'react';
import { compose as $ } from 'tsfun/async';
import SearchBar from './SearchBar';
import Map from './Map';
import { search } from './search';


export default () => {

    const [results, setResults] = useState([]);

    return <div>
            <SearchBar onSubmit={ $(search, setResults) }></SearchBar>
            <Map resources={ results }></Map>
        </div>;
};
