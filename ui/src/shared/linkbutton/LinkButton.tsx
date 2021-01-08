import { History } from 'history';
import React, { CSSProperties, MouseEvent, ReactElement, ReactNode } from 'react';
import { Button, OverlayTrigger } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';


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
                      history: History) => {

    return <Button onClick={ (e: MouseEvent) => { e.preventDefault(); history.push(to); } }
            style={ style }
            size={ size }
            variant={ variant }>
        { children }
    </Button>;
};
