import { mdiCloseCircle } from '@mdi/js';
import Icon from '@mdi/react';
import React, { CSSProperties, ReactNode, ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { addFilterToParams, deleteFilterFromParams } from '../api/query';
import { FilterBucket, ResultFilter } from '../api/result';
import { getLabel } from '../languages';
import LinkButton from '../LinkButton';
import FilterDropdown from './FilterDropdown';


export default function SimpleFilter({ filter, searchParams }
        : { filter: ResultFilter, searchParams: string}): ReactElement {

    if (!filter.values.length) return null;

    const params = new URLSearchParams(searchParams);

    return <FilterDropdown filter={ filter } params={ params }>
        { filter.values.map((bucket: any) => renderFilterValue(filter.name, bucket, params)) }         
    </FilterDropdown>;
}




const renderFilterValue = (key: string, bucket: FilterBucket, params: URLSearchParams): ReactNode =>
    <Dropdown.Item
            as={ Link }
            key={ bucket.value.name }
            style={ filterValueStyle }
            to={ '?' + addFilterToParams(params, key, bucket.value.name) }>
        { getLabel(bucket.value.name, bucket.value.label) }
        { renderCloseButton(params, key, bucket.value.name) }
        <span className="float-right"><em>{ bucket.count }</em></span>
    </Dropdown.Item>;


const renderCloseButton = (params: URLSearchParams, key: string, value: string): ReactNode =>
    (params.has(key + '.name') && params.getAll(key + '.name').includes(value)) &&
        <LinkButton
                to={ '?' + deleteFilterFromParams(params, key, value) }
                variant="link"
                style={ { padding: 0, verticalAlign: 'baseline' } }>
            <Icon path={ mdiCloseCircle } size={ 0.8 }/>
        </LinkButton>;


const filterValueStyle: CSSProperties = {
    width: '350px'
};
