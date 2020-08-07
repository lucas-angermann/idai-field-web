import React, { ReactElement, CSSProperties, useState, useEffect, useContext } from 'react';
import { LoginContext } from '../App';
import { fetchImage } from '../api/image';

export default React.memo(function Image({ id, style, className }
        : { id: string, style?: CSSProperties, className?: string}): ReactElement {

    const [imgUrl, setImgUrl] = useState<string>();
    const loginData = useContext(LoginContext);

    useEffect(() => {

        let didCancel = false;
        let url: string;

        const fetchAndSetImage = async () => {
            url = await fetchImage(id, loginData.token);
            if (!didCancel) {
                setImgUrl(url);
            }
        };

        fetchAndSetImage();
        return () => {
            didCancel = true; // necessary to avoid setting the url after the component is removed
            if (url) URL.revokeObjectURL(url); // necessary to allow garbage collection of image objects
        };
    }, [id, loginData]);

    return imgUrl && <img src={ imgUrl } style={ style } className={ className } alt={ id }/>;
});
