import React from 'react';
import SearchBar from './SearchBar';
import ResultList from './ResultList';
import {search} from './search';


type AppState = {
    results: Array<any>
}


export default class App extends React.Component<{}, AppState> {

    constructor(props: any) {

        super(props);
        this.state = {
            results: []
        };
    }


    public render() {

        return <div> 
            <SearchBar onSubmit={(query: string) => this.performSearch(query)}></SearchBar>
            <ResultList results={this.state.results}></ResultList>
        </div>;
    }


    async performSearch(query: string) {

        const results = await search(query);
        this.setState({ results });
    }
}
