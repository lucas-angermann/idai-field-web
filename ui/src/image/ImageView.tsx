import React, { CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import { NAVBAR_HEIGHT } from '../constants';
import Image from './Image';

export default function ImageView() {

    const { id } = useParams();
    
    return (
        <div style={ containerStyle }>
            <Image id={ id } />
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
