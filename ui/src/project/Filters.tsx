import React, { CSSProperties, ReactNode, ReactElement } from 'react';
import { Card, Dropdown, ButtonGroup } from 'react-bootstrap';
import { ResultFilter, FilterBucket } from '../api/result';
import { Link } from 'react-router-dom';
import { mdiCloseCircle } from '@mdi/js';
import { Icon } from '@mdi/react';
import LinkButton from '../LinkButton';
import { deleteFilterFromParams, addFilterToParams } from '../api/query';
import { getLabel } from '../languages';


export default function Filters({ filters, searchParams }
        : { filters: ResultFilter[], searchParams: string }): ReactElement {

    return (
        <Card>
            <Card.Body className="d-flex py-2 pl-1 pr-2 align-self-stretch">
                { filters.map((filter: ResultFilter) => renderFilter(filter, searchParams)) }
            </Card.Body>
        </Card>
    );
}


const renderFilter = (filter: ResultFilter, searchParams: string): ReactNode => {

    if (!filter.values.length) return null;

    const params = new URLSearchParams(searchParams);

    return (
        <Dropdown as={ ButtonGroup } key={ filter.name } size="sm pl-2" style={ { flexGrow: 1 } }>
            { renderFilterDropdownToggle(filter, params) }
            <Dropdown.Menu>
                <Dropdown.Header><h3>{ getLabel(filter.name, filter.label) }</h3></Dropdown.Header>
                { filter.values.map((bucket: FilterBucket) =>
                    renderFilterValue(filter.name, bucket, params)) }
            </Dropdown.Menu>
        </Dropdown>
    );
};


const renderFilterDropdownToggle = (filter: ResultFilter, params: URLSearchParams): ReactNode =>
    params.has(filter.name)
        ?
            <>
                <LinkButton to={ '?' + deleteFilterFromParams(params, filter.name) }
                        style={ { flexGrow: 1 } }>
                    { getLabel(filter.name, filter.label) }: <em>{ params.getAll(filter.name).join(', ') }</em>
                    &nbsp; <Icon path={ mdiCloseCircle } style={ { verticalAlign: 'sub' } } size={ 0.7 } />
                </LinkButton>
                <Dropdown.Toggle split id={ `filter-dropdown-${filter.name}` }
                        style={ { maxWidth: '2.5rem' } }/>
            </>
        :   <Dropdown.Toggle id={ `filter-dropdown-${filter.name}` }>
                { getLabel(filter.name, filter.label) }
            </Dropdown.Toggle>;


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
    (params.has('resource.' + key + '.name')
        && params.getAll('resource.' + key + '.name').includes(value)) &&
        <LinkButton
                to={ '?' + deleteFilterFromParams(params, key, value) }
                variant="link"
                style={ { padding: 0, verticalAlign: 'baseline' } }>
            <Icon path={ mdiCloseCircle } size={ 0.8 }/>
        </LinkButton>;


const filterValueStyle: CSSProperties = {
    width: '350px'
};
