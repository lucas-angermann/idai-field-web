import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import { Col, Dropdown, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FilterBucketTreeNode, ResultFilter } from '../../api/result';
import CategoryIcon from '../../shared/document/CategoryIcon';
import { getLabel } from '../../shared/languages';
import CloseButton from './CloseButton';
import { buildParamsForFilterValue, isFilterValueInParams } from './utils';


export default function CategoryFilter({ filter, searchParams, projectId }
        : { filter: ResultFilter, searchParams: URLSearchParams, projectId?: string }): ReactElement {

    if (!filter.values.length) return null;

    return <>
        { filter.values.map((bucket: FilterBucketTreeNode) =>
            renderFilterValue(filter.name, bucket, searchParams, projectId)) }
    </>;
}


const renderFilterValue = (key: string, bucket: FilterBucketTreeNode, params: URLSearchParams,
                           projectId?: string, level: number = 1): ReactNode =>
    <React.Fragment key={ bucket.item.value.name }>
        <Dropdown.Item
                as={ Link }
                style={ filterValueStyle(level) }
                to={ (projectId ? `/project/${projectId}?` : '/?')
                    + buildParamsForFilterValue(params, key, bucket.item.value.name) }>
            <Row>
                <Col xs={ 1 }><CategoryIcon category={ bucket.item.value }
                                            size="30" /></Col>
                <Col style={ categoryLabelStyle }>
                    { getLabel(bucket.item.value) }
                    {
                        isFilterValueInParams(params, key, bucket.item.value.name)
                        && <CloseButton params={ params } filterKey={ key } value={ bucket.item.value.name }
                                        projectId={ projectId } />
                    }
                </Col>
                <Col xs={ 1 } style={ { margin: '3px' } }>
                    <span className="float-right"><em>{ bucket.item.count }</em></span>
                </Col>
            </Row>
        </Dropdown.Item>
        { bucket.trees && bucket.trees.map((b: FilterBucketTreeNode) =>
                renderFilterValue(key, b, params, projectId, level + 1))
        }
    </React.Fragment>;


const filterValueStyle = (level: number): CSSProperties => ({
    width: '315px',
    paddingLeft: `${level * 1.2}em`
});

const categoryLabelStyle: CSSProperties = {
    margin: '3px 10px',
    whiteSpace: 'normal'
};
