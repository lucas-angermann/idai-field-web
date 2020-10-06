import { mdiCloseCircle } from '@mdi/js';
import Icon from '@mdi/react';
import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import { Dropdown, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { deleteFilterFromParams, addFilterToParams } from '../api/query';
import { FilterBucketTreeNode, ResultFilter } from '../api/result';
import CategoryIcon from '../document/CategoryIcon';
import { getLabel } from '../languages';
import LinkButton from '../LinkButton';
import FilterDropdown from './FilterDropdown';


export default function CategoryFilter({ filter, searchParams }
        : { filter: ResultFilter, searchParams: string}): ReactElement {

    if (!filter.values.length) return null;

    const params = new URLSearchParams(searchParams);

    return <FilterDropdown filter={ filter } params={ params }>
        { filter.values.map((bucket: FilterBucketTreeNode) => renderFilterValue(filter.name, bucket, params)) }
    </FilterDropdown>;
}


const renderFilterValue = (key: string, bucket: FilterBucketTreeNode, params: URLSearchParams, level: number = 1)
        : ReactNode =>
    <>
        <Dropdown.Item
                as={ Link }
                key={ bucket.item.value.name }
                style={ filterValueStyle(level) }
                to={ '?' + addFilterToParams(params, key, bucket.item.value.name) }>
            <Row>
                <Col xs={ 1 }><CategoryIcon category={ bucket.item.value.name } size="30" /></Col>
                <Col style={ categoryLabelStyle }>
                    { getLabel(bucket.item.value.name, bucket.item.value.label) }
                    { renderCloseButton(params, key, bucket.item.value.name) }
                </Col>
                <Col xs={ 1 }><span className="float-right"><em>{ bucket.item.count }</em></span></Col>
            </Row>
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
    paddingLeft: `${level * 1.2}em`
});

const categoryLabelStyle: CSSProperties = {
    margin: '3px 10px'
};
