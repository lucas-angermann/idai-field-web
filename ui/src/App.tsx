import React from 'react';
import SearchBar from './SearchBar';
import ResultList from './ResultList';


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
            <SearchBar onSubmit={search}></SearchBar>
            <ResultList results={this.state.results}></ResultList>
        </div>;
    }
}

function search(query: string) {
    console.log(query);
}
