import React from 'react';

export default function SearchBar(props: any) {
    return (
        <ul>
            {props.results.forEach((result: any) => <li>{result.identifier}</li>)}
        </ul>
    );
}