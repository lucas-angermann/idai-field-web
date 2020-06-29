import { Button, ButtonGroup } from 'react-bootstrap';
import React from 'react';


export default ({ onModeSelected }: { onModeSelected: (mapMode: boolean) => void } ) => {

    return (
        <ButtonGroup>
            <Button onClick={ () => onModeSelected(false) }>Liste</Button>
            <Button onClick={ () => onModeSelected(true) }>Karte</Button>
        </ButtonGroup>
    );
};
