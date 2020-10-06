import React, { ReactElement } from 'react';
import { Card } from 'react-bootstrap';
import { ResultFilter } from '../api/result';
import CategoryFilter from './CategoryFilter';
import SimpleFilter from './SimpleFilter';


export default function Filters({ filters, searchParams }
        : { filters: ResultFilter[], searchParams: string }): ReactElement {

    if (!filters.find(filter => filter.values.length > 0)) return <></>;

    return <>
        <Card>
            <Card.Body className="d-flex py-2 pl-1 pr-2 align-self-stretch">
                { filters.map((filter: ResultFilter) =>
                    filter.name === 'resource.category.name'
                    ? <CategoryFilter filter={ filter } searchParams={ searchParams } key={ filter.name } />
                    : <SimpleFilter filter={ filter } searchParams={ searchParams } key={ filter.name } />) }
            </Card.Body>
        </Card>
    </>;
}
