import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import { Col, Dropdown, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FilterBucketTreeNode, ResultFilter } from '../../api/result';
import CategoryIcon from '../../shared/document/CategoryIcon';
import { getLabel } from '../../shared/languages';
import CloseButton from './CloseButton';
import { buildParamsForFilterValue, isFilterValueInParams } from './utils';


export default function CategoryFilter({ filter, searchParams = new URLSearchParams(), projectId, onMouseEnter,
        onMouseLeave }: { filter: ResultFilter, searchParams?: URLSearchParams, projectId?: string,
        onMouseEnter?: (categories: string[]) => void, onMouseLeave?: (categories: string[]) => void }): ReactElement {

    if (!filter.values.length) return null;

    return <div onMouseLeave={ () => onMouseLeave && onMouseLeave([]) }>
        { filter.values.map((bucket: FilterBucketTreeNode) =>
            renderFilterValue(filter.name, bucket, searchParams, onMouseEnter, projectId)) }
    </div>;
}


const renderFilterValue = (key: string, bucket: FilterBucketTreeNode, params: URLSearchParams,
        onMouseEnter?: (categories: string[]) => void, projectId?: string, level: number = 1): ReactNode =>
    <React.Fragment key={ bucket.item.value.name }>
        <Dropdown.Item
                as={ Link }
                style={ filterValueStyle(level) }
                onMouseOver={ () => onMouseEnter && onMouseEnter([bucket.item.value.name]) }
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
            renderFilterValue(key, b, params, onMouseEnter, projectId, level + 1))
        }
    </React.Fragment>;


const filterValueStyle = (level: number): CSSProperties => ({
    paddingLeft: `${level * 1.2}em`
});

const categoryLabelStyle: CSSProperties = {
    margin: '3px 10px',
    whiteSpace: 'normal'
};
