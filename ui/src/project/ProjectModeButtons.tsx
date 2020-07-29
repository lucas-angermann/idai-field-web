import { Button, ButtonGroup } from 'react-bootstrap';
import React, { CSSProperties, ReactElement } from 'react';


export default function ProjectModeButtons({ onModeSelected }
        : { onModeSelected: (mapMode: boolean) => void } ): ReactElement {

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
}


const buttonGroupStyle: CSSProperties = {
    width: '100%'
};


const buttonStyle: CSSProperties = {
    marginTop: '0px'
};
