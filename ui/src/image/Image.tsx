import React, { ReactElement, CSSProperties } from 'react';

export default function Image({ id, style, className }
        : { id: string, style?: CSSProperties, className?: string }): ReactElement {

    if (!id) return null;

    return <img src={ `/api/images/${id}` } style={ style } className={ className } alt={ id }/>;
}
