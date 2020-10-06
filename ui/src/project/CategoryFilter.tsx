import { mdiCloseCircle } from '@mdi/js';
import Icon from '@mdi/react';
import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import { Dropdown, ButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { deleteFilterFromParams, addFilterToParams } from '../api/query';
import { FilterBucket, FilterBucketTreeNode, ResultFilter } from '../api/result';
import CategoryIcon from '../document/CategoryIcon';
import { getLabel } from '../languages';
import LinkButton from '../LinkButton';


export default function CategoryFilter({ filter, searchParams }
        : { filter: ResultFilter, searchParams: string}): ReactElement {

    if (!filter.values.length) return null;

    const params = new URLSearchParams(searchParams);

    return <>
        <Dropdown as={ ButtonGroup } key={ filter.name } size="sm pl-2" style={ { flexGrow: 1 } }>
            { renderFilterDropdownToggle(filter, params) }
            <Dropdown.Menu>
                <Dropdown.Header><h3>{ getLabel(filter.name, filter.label) }</h3></Dropdown.Header>
                { filter.values.map((bucket: FilterBucketTreeNode) => renderFilterValue(filter.name, bucket, params)) }
            </Dropdown.Menu>
        </Dropdown>
    </>;
}


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


const renderFilterValue = (key: string, bucket: FilterBucketTreeNode, params: URLSearchParams, level: number = 1)
        : ReactNode =>
    <>
        <Dropdown.Item
                as={ Link }
                key={ bucket.item.value.name }
                style={ filterValueStyle(level) }
                to={ '?' + addFilterToParams(params, key, bucket.item.value.name) }>
            <CategoryIcon category={ bucket.item.value.name } size="30" />
            { getLabel(bucket.item.value.name, bucket.item.value.label) }
            { renderCloseButton(params, key, bucket.item.value.name) }
            <span className="float-right"><em>{ bucket.item.count }</em></span>
        </Dropdown.Item>
        { bucket.trees
            && bucket.trees.map((bucket: FilterBucketTreeNode) => renderFilterValue(key, bucket, params, level + 1)) }
    </>;


const renderCloseButton = (params: URLSearchParams, key: string, value: string): ReactNode =>
    (params.has(key + '.name') && params.getAll(key + '.name').includes(value)) &&
        <LinkButton
                to={ '?' + deleteFilterFromParams(params, key, value) }
                variant="link"
                style={ { padding: 0, verticalAlign: 'baseline' } }>
            <Icon path={ mdiCloseCircle } size={ 0.8 }/>
        </LinkButton>;


const filterValueStyle = (level: number): CSSProperties => ({
    width: '350px',
    paddingLeft: `${level * 1.5}em`
});