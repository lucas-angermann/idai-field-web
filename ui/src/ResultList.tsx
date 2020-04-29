import React from 'react';

export default (props: { results: any[] }) => <ul>{ props.results.map(renderResult) }</ul>;

const renderResult = (result: any) => <li>{ result.identifier }</li>;
