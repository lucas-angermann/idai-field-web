import React, { ReactElement } from 'react';
import { ResultFilter } from '../../api/result';
import CategoryFilter from './CategoryFilter';
import RelationFilters from './RelationFilters';
import SimpleFilter from './SimpleFilter';


export default function Filters({ filters, searchParams, projectId }
        : { filters: ResultFilter[], searchParams: URLSearchParams, projectId?: string }): ReactElement {

    if (!filters.find(filter => filter.values.length > 0)) return <></>;

    return <div className="float-right">
        { filters.map((filter: ResultFilter) =>
            filter.name === 'resource.category.name'
            ? <CategoryFilter filter={ filter } searchParams={ searchParams } projectId={ projectId }
                                key={ filter.name } />
            : <SimpleFilter filter={ filter } searchParams={ searchParams } projectId={ projectId }
                            key={ filter.name } />) }
        <RelationFilters searchParams={ searchParams } projectId={ projectId } />
    </div>;
}
