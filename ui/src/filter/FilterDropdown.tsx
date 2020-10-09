import { mdiCloseCircle } from '@mdi/js';
import Icon from '@mdi/react';
import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import { ButtonGroup, Dropdown } from 'react-bootstrap';
import { LabeledValue } from '../api/document';
import { deleteFilterFromParams } from '../api/query';
import { FilterBucket, FilterBucketTreeNode, ResultFilter } from '../api/result';
import { getLabel } from '../languages';
import LinkButton from '../LinkButton';

export default function FilterDropdown({ filter, params, children }
        : { filter: ResultFilter, params: URLSearchParams, children: ReactNode }): ReactElement {

    return <>
        <Dropdown as={ ButtonGroup } key={ filter.name } size="sm pl-2" style={ { flexGrow: 1 } }>
            { renderFilterDropdownToggle(filter, params) }
            <Dropdown.Menu style={ dropdownMenuStyles }>
                <Dropdown.Header><h3>{ getLabel(filter) }</h3></Dropdown.Header>
                { children }
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
                    { getLabel(filter) }: <em>{ getLabelForFilterParam(filter, params) }</em>
                    &nbsp; <Icon path={ mdiCloseCircle } style={ { verticalAlign: 'sub' } } size={ 0.7 } />
                </LinkButton>
                <Dropdown.Toggle split id={ `filter-dropdown-${filter.name}` }
                        style={ { maxWidth: '2.5rem' } }/>
            </>
        :   <Dropdown.Toggle id={ `filter-dropdown-${filter.name}` }>
                { getLabel(filter) }
            </Dropdown.Toggle>;


const getLabelForFilterParam = (filter: ResultFilter, params: URLSearchParams): string => {

    return params.getAll(filter.name)
        .map(bucketName => {
            const bucket = getBucketByName(filter.values, bucketName);
            return bucket ? getLabel(getBucketValue(bucket)) : bucketName;
        })
        .join(', ');
};


const getBucketByName = (values: (FilterBucket | FilterBucketTreeNode)[], bucketName: string)
        : FilterBucket | FilterBucketTreeNode => {

    const allValues = [...values, ...values.map(v => (v as FilterBucketTreeNode).trees).flat()];
    return allValues.find((b: FilterBucket | FilterBucketTreeNode) => getBucketValue(b).name === bucketName);
};


const getBucketValue = (bucket: FilterBucket | FilterBucketTreeNode): LabeledValue => {

    if ((bucket as FilterBucketTreeNode).item) bucket = (bucket as FilterBucketTreeNode).item;
    return (bucket as FilterBucket).value;
};


const dropdownMenuStyles: CSSProperties = {
    maxHeight: `calc(100vh - 200px)`,
    overflow: 'auto'
};
