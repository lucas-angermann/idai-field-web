import { Button, ButtonGroup } from 'react-bootstrap';
import React, { CSSProperties } from 'react';


export default ({ onModeSelected }: { onModeSelected: (mapMode: boolean) => void } ) => {

    return (
        <ButtonGroup style={ buttonGroupStyle }>
            <Button className="btn-block"
                    style={ buttonStyle }
                    onClick={ () => onModeSelected(false) }>
                Liste
            </Button>
            <Button className="btn-block"
                    style={ buttonStyle }
                    onClick={ () => onModeSelected(true) }>
                Karte
            </Button>
        </ButtonGroup>
    );
};


const buttonGroupStyle: CSSProperties = {
    width: '100%'
};


const buttonStyle: CSSProperties = {
    marginTop: '0px'
};
