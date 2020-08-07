import React, { ReactElement, CSSProperties, useState, useEffect, useContext } from 'react';
import { LoginContext } from '../App';
import { fetchImage } from '../api/image';

export default React.memo(function Image({ id, style, className }
        : { id: string, style?: CSSProperties, className?: string}): ReactElement {

    const [imgUrl, setImgUrl] = useState<string>();
    const loginData = useContext(LoginContext);

    useEffect(() => {

        fetchImage(id, loginData.token).then(setImgUrl);
    }, [id, loginData]);

    return imgUrl && <img src={ imgUrl } style={ style } className={ className } alt={ id }/>;
});
