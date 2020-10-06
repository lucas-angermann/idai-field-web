import { mdiCloseCircle } from "@mdi/js";
import Icon from "@mdi/react";
import React, { ReactElement } from "react";
import { deleteFilterFromParams } from "../api/query";
import LinkButton from "../LinkButton";

export default function CloseButton({ params, key, value }
        : { params: URLSearchParams, key: string, value: string }): ReactElement {

    return (params.has(key + '.name') && params.getAll(key + '.name').includes(value)) &&
        <LinkButton
                to={ '?' + deleteFilterFromParams(params, key, value) }
                variant="link"
                style={ { padding: 0, verticalAlign: 'baseline' } }>
            <Icon path={ mdiCloseCircle } size={ 0.8 }/>
        </LinkButton>;
}
