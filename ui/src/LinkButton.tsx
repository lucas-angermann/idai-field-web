import React, { ReactNode, CSSProperties, MouseEvent, ReactElement } from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from 'react-bootstrap';


interface LinkButtonProps {
    to: string;
    children: ReactNode;
    variant?: 'link' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light'
        | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-danger' | 'outline-warning'
        | 'outline-info' | 'outline-dark' | 'outline-light';
    style?: CSSProperties;
    size?: 'sm' | 'lg';
}


export default function LinkButton({ to, children, style, size, variant = 'primary' }: LinkButtonProps): ReactElement {

    const history = useHistory();

    return (
        <Button onClick={ (e: MouseEvent) => { e.preventDefault(); history.push(to); } }
                style={ style }
                size={ size }
                variant={ variant }>
            { children }
        </Button>
    );
}
