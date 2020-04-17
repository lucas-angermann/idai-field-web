import React, { useState } from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import Icon from '@mdi/react';
import { mdiMagnify } from '@mdi/js';


type SearchBarProps = {
    onSubmit: (query: string) => void
}


export default (props: SearchBarProps) => {

    let query = '';

    return (
        <InputGroup style={{zIndex: 1, position: 'absolute'}}>
            <FormControl
                placeholder="Suchen ..."
                aria-label="Suchbegriff"
                onChange={(event: any) => query = event.target.value}
            />
            <InputGroup.Append>
                <Button variant="secondary" onClick={() => props.onSubmit(query)}>
                    <Icon path={mdiMagnify} size={0.8}/>
                </Button>
            </InputGroup.Append>
        </InputGroup>
    );

}