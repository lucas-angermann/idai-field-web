import { mdiFilter } from '@mdi/js';
import Icon from '@mdi/react';
import { TFunction } from 'i18next';
import React, { CSSProperties, ReactElement } from 'react';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { ResultFilter } from '../../api/result';
import { NAVBAR_HEIGHT } from '../../constants';
import CategoryFilter from './CategoryFilter';
import RelationFilters from './RelationFilters';
import SimpleFilter from './SimpleFilter';


export default function Filters({ filters, searchParams, projectId }
        : { filters: ResultFilter[], searchParams: URLSearchParams, projectId?: string }): ReactElement {

    const { t } = useTranslation();

    if (!filters.find(filter => filter.values.length > 0)) return <></>;

    return <div>
        <OverlayTrigger trigger="click" placement="right"
                overlay={ renderFilterPopover(filters, searchParams, projectId, t) }
                popperConfig={ popperConfig }>
            <Button variant="link">
                <Icon path={ mdiFilter } size={ 0.8 } />
            </Button>
        </OverlayTrigger>
    </div>;
}


const renderFilterPopover = (filters: ResultFilter[], searchParams: URLSearchParams, projectId: string, t: TFunction) =>
    <Popover id="filter-popover" style={ popoverStyles } className="d-flex flex-column">
        <Popover.Title as="h3">{ t('project.filters') }</Popover.Title>
        <Popover.Content className="flex-grow-1" style={ contentStyles }>
            { filters.map((filter: ResultFilter) =>
                filter.name === 'resource.category.name'
                ? <CategoryFilter filter={ filter } searchParams={ searchParams } projectId={ projectId }
                                    key={ filter.name } />
                : <SimpleFilter filter={ filter } searchParams={ searchParams } projectId={ projectId }
                                key={ filter.name } />) }
            <RelationFilters searchParams={ searchParams } projectId={ projectId } />
        </Popover.Content>
    </Popover>;


const popperConfig = {
    modifiers: [
        {
            name: 'preventOverflow',
            options: {
                padding: NAVBAR_HEIGHT + 10,
            },
        },
    ]
};


const popoverStyles: CSSProperties = {
    maxWidth: '400px',
    maxHeight: `calc(100vh - ${NAVBAR_HEIGHT + 18}px)`
};

const contentStyles: CSSProperties = {
    overflowY: 'auto'
};
