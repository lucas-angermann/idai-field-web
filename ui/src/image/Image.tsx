import React, { ReactElement, CSSProperties, useState, useEffect, useContext } from 'react';
import { LoginContext } from '../App';
import { fetchImage } from '../api/image';
import { mdiEmoticonSad } from '@mdi/js';
import Icon from '@mdi/react';

export default React.memo(function Image({ id }: { id: string }): ReactElement {

    const [imgUrl, setImgUrl] = useState<string>();
    const [error, setError] = useState<string>();
    const loginData = useContext(LoginContext);

    useEffect(() => {

        let didCancel = false;
        let url: string;

        const fetchAndSetImage = async () => {
            try {
                url = await fetchImage(id, loginData.token);
                if (!didCancel) {
                    setImgUrl(url);
                }
            } catch (e) {
                setError(e.error);
            }
        };

        fetchAndSetImage();
        return () => {
            didCancel = true; // necessary to avoid setting imgUrl after the component is removed
            if (url) URL.revokeObjectURL(url); // necessary to allow garbage collection of image objects
        };
    }, [id, loginData]);

    return imgUrl
        ? <img src={ imgUrl } style={ imageStyle } alt={ id }/>
        : error
            && <div style={ errorStyle }>
                <Icon path={ mdiEmoticonSad } color="#ffffff" size={ 1.5 }></Icon><br/>
                image not found
               </div>;
});

const imageStyle: CSSProperties = {
    display: 'block',
    maxHeight: `100%`,
    maxWidth: '100%',
    margin: 'auto',
    backgroundColor: '#ccc',
    color: '#fff'
};

const errorStyle: CSSProperties = {
    height: '100%',
    width: '100%',
    margin: 'auto',
    backgroundColor: '#ccc',
    color: '#fff',
    textAlign: 'center',
    padding: '20%'
};
