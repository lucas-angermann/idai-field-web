import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import { Dropdown, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FilterBucketTreeNode, ResultFilter } from '../api/result';
import CategoryIcon from '../document/CategoryIcon';
import { getLabel } from '../languages';
import CloseButton from './CloseButton';
import FilterDropdown from './FilterDropdown';
import { buildParamsForFilterValue, isFilterValueInParams } from './utils';


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
    <React.Fragment key={ bucket.item.value.name }>
        <Dropdown.Item
                as={ Link }
                style={ filterValueStyle(level) }
                to={ '?' + buildParamsForFilterValue(params, key, bucket.item.value.name) }>
            <Row>
                <Col xs={ 1 }><CategoryIcon category={ bucket.item.value }
                                            size="30" /></Col>
                <Col style={ categoryLabelStyle }>
                    { getLabel(bucket.item.value) }
                    {
                        isFilterValueInParams(params, key, bucket.item.value.name)
                        && <CloseButton params={ params } filterKey={ key } value={ bucket.item.value.name } />
                    }
                </Col>
                <Col xs={ 1 }><span className="float-right"><em>{ bucket.item.count }</em></span></Col>
            </Row>
        </Dropdown.Item>
        { bucket.trees
            && bucket.trees.map((b: FilterBucketTreeNode) => renderFilterValue(key, b, params, level + 1)) }
    </React.Fragment>;


const filterValueStyle = (level: number): CSSProperties => ({
    width: '365px',
    paddingLeft: `${level * 1.2}em`
});

const categoryLabelStyle: CSSProperties = {
    margin: '3px 10px'
};
