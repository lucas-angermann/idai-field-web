import React from 'react';

export default (props: any) => <ul>{props.results.map(renderResult)}</ul>;

const renderResult = (result: any) => <li>{result.identifier}</li>;