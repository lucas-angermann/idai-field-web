import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import Icon from '@mdi/react';
import { mdiMagnify } from '@mdi/js';
import CSS from 'csstype';

const iconStyle: CSS.Properties = {
    
}


type SearchBarProps = {
    onSubmit: (query: string) => void
}


type SearchBarState = {
    query: string
}


export default class SearchBar extends React.Component<SearchBarProps, SearchBarState> {

    constructor(props: any) {
        super(props);
        this.state = {
            query: ''
        };
    }

    queryChanged = (event: any) => this.setState({ query: event.target.value });

    public render() {
        return (
            <InputGroup>
                <FormControl
                    placeholder="Suchen ..."
                    aria-label="Suchbegriff"
                    onChange={this.queryChanged}
                />
                <InputGroup.Append>
                    <Button variant="outline-secondary" onClick={() => this.props.onSubmit(this.state.query)} style={iconStyle}>
                        <Icon path={mdiMagnify} size={0.8}/>
                    </Button>
                </InputGroup.Append>
            </InputGroup>
        );
    }
}