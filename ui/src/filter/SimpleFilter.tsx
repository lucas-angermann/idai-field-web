import React, { CSSProperties, ReactNode, ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FilterBucket, ResultFilter } from '../api/result';
import { getLabel } from '../languages';
import CloseButton from './CloseButton';
import FilterDropdown from './FilterDropdown';
import { buildParamsForFilterValue, isFilterValueInParams } from './utils';


export default function SimpleFilter({ filter, searchParams, projectId }
        : { filter: ResultFilter, searchParams: string, projectId?: string }): ReactElement {

    if (!filter.values.length) return null;

    const params = new URLSearchParams(searchParams);

    return <FilterDropdown filter={ filter } params={ params } projectId={ projectId }>
        { filter.values.map((bucket: any) => renderFilterValue(filter.name, bucket, params, projectId)) }
    </FilterDropdown>;
}


const renderFilterValue = (key: string, bucket: FilterBucket, params: URLSearchParams,
                           projectId?: string): ReactNode =>
    <Dropdown.Item
            as={ Link }
            key={ bucket.value.name }
            style={ filterValueStyle }
            to={ (projectId ? `/project/${projectId}?` : '/?')
                + buildParamsForFilterValue(params, key, bucket.value.name) }>
        { getLabel(bucket.value) }
        {
            isFilterValueInParams(params, key, bucket.value.name)
            && <CloseButton params={ params } filterKey={ key } value={ bucket.value.name }
                            projectId={ projectId } />
        }
        <span className="float-right"><em>{ bucket.count }</em></span>
    </Dropdown.Item>;


const filterValueStyle: CSSProperties = {
    width: '365px',
};
