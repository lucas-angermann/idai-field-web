import { mdiCloseCircle } from "@mdi/js";
import Icon from "@mdi/react";
import React, { ReactElement, ReactNode } from "react";
import { ButtonGroup, Dropdown } from "react-bootstrap";
import { deleteFilterFromParams } from "../api/query";
import { ResultFilter } from "../api/result";
import { getLabel } from "../languages";
import LinkButton from "../LinkButton";

export default function FilterDropdown({ filter, params, children }
        : { filter: ResultFilter, params: URLSearchParams, children: ReactNode }): ReactElement {

    return <>
        <Dropdown as={ ButtonGroup } key={ filter.name } size="sm pl-2" style={ { flexGrow: 1 } }>
            { renderFilterDropdownToggle(filter, params) }
            <Dropdown.Menu>
                <Dropdown.Header><h3>{ getLabel(filter.name, filter.label) }</h3></Dropdown.Header>
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
                    { getLabel(filter.name, filter.label) }: <em>{ params.getAll(filter.name).join(', ') }</em>
                    &nbsp; <Icon path={ mdiCloseCircle } style={ { verticalAlign: 'sub' } } size={ 0.7 } />
                </LinkButton>
                <Dropdown.Toggle split id={ `filter-dropdown-${filter.name}` }
                        style={ { maxWidth: '2.5rem' } }/>
            </>
        :   <Dropdown.Toggle id={ `filter-dropdown-${filter.name}` }>
                { getLabel(filter.name, filter.label) }
            </Dropdown.Toggle>;