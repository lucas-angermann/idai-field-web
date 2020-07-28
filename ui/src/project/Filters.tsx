import React, { CSSProperties } from 'react';
import { Card, Dropdown, ButtonGroup } from 'react-bootstrap';
import { ResultFilter, FilterBucket } from '../api/result';
import { Link } from 'react-router-dom';
import { mdiCloseCircle } from '@mdi/js';
import { Icon } from '@mdi/react';
import LinkButton from '../LinkButton';


export default function Filters({ filters, searchParams }: { filters: ResultFilter[], searchParams: string }) {

    return (
        <Card>
            <Card.Body className="d-flex py-2 pl-1 pr-2 align-self-stretch">
                { filters.map((filter: ResultFilter) => renderFilter(filter, searchParams)) }
            </Card.Body>
        </Card>
    );
}


const renderFilter = (filter: ResultFilter, searchParams: string) => {

    if (!filter.values.length) return null;

    const urlParams = new URLSearchParams(searchParams);

    return (
        <Dropdown
                as={ ButtonGroup }
                key={ filter.name }
                size="sm pl-2"
                style={ { flexGrow: 1 } }>
            {
                urlParams.has(filter.name)
                    ? <>
                        <LinkButton to={ getLinkWithoutFilter(searchParams, filter.name) }
                                style={ { flexGrow: 1 } }>
                            { filter.label.de }: <em>{ urlParams.getAll(filter.name).join(', ') }</em>
                            &nbsp; <Icon path={ mdiCloseCircle } style={ { verticalAlign: 'sub' } } size={ 0.7 } />
                        </LinkButton>
                        <Dropdown.Toggle split id={ `filter-dropdown-${filter.name}` }
                                style={ { maxWidth: '2.5rem' } }/>
                      </>
                    : <Dropdown.Toggle id={ `filter-dropdown-${filter.name}` }>{ filter.label.de }</Dropdown.Toggle>
            }
            <Dropdown.Menu>
                <Dropdown.Header><h3>{ filter.label.de }</h3></Dropdown.Header>
                { filter.values.map((bucket: FilterBucket) =>
                    renderFilterValue(filter.name, bucket, searchParams)) }
            </Dropdown.Menu>
        </Dropdown>
    );
};


const renderFilterValue = (key: string, bucket: FilterBucket, searchParams: string) => {

    return (
        <Dropdown.Item
                as={ Link }
                key={ bucket.value }
                style={ filterValueStyle }
                to={ addFilterToLocation(searchParams, key, bucket.value) }>
            { bucket.value }
            { renderCloseButton(searchParams, key, bucket.value) }
            <span className="float-right"><em>{ bucket.count }</em></span>
        </Dropdown.Item>
    );
};


const renderCloseButton = (searchParams: string, key: string, value: string) => {
     
    const urlParams = new URLSearchParams(searchParams);
    if ( (urlParams.has(key) && urlParams.getAll(key).includes(value) ) ) {
        const newParams = urlParams.getAll(key).filter(v => v !== value);
        urlParams.delete(key);
        newParams.forEach(v => urlParams.append(key, v));
        return (
            <LinkButton
                    to={ `?${urlParams.toString()}` }
                    variant="link"
                    style={ { padding: 0, verticalAlign: 'baseline' } }>
                <Icon path={ mdiCloseCircle } size={ 0.8 }/>
            </LinkButton>
        );
    }
    return '';
};


const addFilterToLocation = (searchParams: string, key: string, value: string): string => {

    const urlParams = new URLSearchParams(searchParams);
    urlParams.append(key, value);
    return `?${urlParams.toString()}`;
};


const getLinkWithoutFilter = (searchParams: string, key: string): string => {

    const urlParams = new URLSearchParams(searchParams);
    urlParams.delete(key);
    return '?' + urlParams.toString();
};


const filterValueStyle: CSSProperties = {
    width: '350px'
};
