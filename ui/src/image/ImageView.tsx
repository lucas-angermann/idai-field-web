import React, { CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import { NAVBAR_HEIGHT } from '../constants';

export default function ImageView() {

    const { id } = useParams();
    
    return (
        <div style={ containerStyle }>
            <img src={ `/api/images/${id}` } style={ imageStyle } alt={ id } />
        </div>
    );
}

const containerStyle: CSSProperties = {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
};

const imageStyle: CSSProperties = {
    display: 'block',
    maxHeight: `100%`,
    maxWidth: '100%',
    margin: 'auto'
};
