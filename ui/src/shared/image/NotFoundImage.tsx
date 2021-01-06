import React, { ReactElement, CSSProperties } from 'react';
import { mdiEmoticonSad } from '@mdi/js';
import Icon from '@mdi/react';

export default function NotFoundImage() : ReactElement {
    return (
        <div style={ errorStyle }>
            <Icon path={ mdiEmoticonSad} color="#ffffff" size={ 1.5}></Icon>
            <br />
            image not found
        </div>
    );
}


const errorStyle: CSSProperties = {
    height: '100%',
    width: '100%',
    margin: 'auto',
    backgroundColor: '#ccc',
    color: '#fff',
    textAlign: 'center',
    padding: '20%'
};