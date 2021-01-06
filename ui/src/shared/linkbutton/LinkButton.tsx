import React, { ReactNode, CSSProperties, MouseEvent, ReactElement } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, OverlayTrigger } from 'react-bootstrap';


interface LinkButtonProps {
    to: string;
    children: ReactNode;
    variant?: 'link' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light'
        | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-danger' | 'outline-warning'
        | 'outline-info' | 'outline-dark' | 'outline-light';
    style?: CSSProperties;
    size?: 'sm' | 'lg';
    tooltip?: ReactElement;
}


export default function LinkButton(properties: LinkButtonProps): ReactElement {

    const history = useHistory();

    return properties.tooltip
        ? <OverlayTrigger placement="bottom" overlay={ properties.tooltip } delay={ { show: 500, hide: 0 } }>
            { renderButton(properties, history) }
        </OverlayTrigger>
        : renderButton(properties, history);
}


const renderButton = ({ to, children, style, size, variant = 'primary' }: LinkButtonProps,
                      history: any) => {

    return <Button onClick={ (e: MouseEvent) => { e.preventDefault(); history.push(to); } }
            style={ style }
            size={ size }
            variant={ variant }>
        { children }
    </Button>;
};
