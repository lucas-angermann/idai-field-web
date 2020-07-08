import React, { CSSProperties } from 'react';
import { getColor, isColorTooBright } from '../categoryColors';


export default React.memo(function CategoryIcon({ category, size }: { category: string, size: string }) {

    const color = getColor(category);

    return <div style={ iconStyle(size, color) }>
        <span style={ characterStyle(color) }>
            { category.substr(0, 1) }
        </span>
    </div>;
});


const iconStyle = (size: string, color: string): CSSProperties => ({
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${size}px`,
    lineHeight: `${size}px`,
    backgroundColor: color,
    display: 'inline-block',
    fontFamily: `'Open Sans', sans-serif`,
    fontWeight: 'lighter',
    borderRadius: '50%',
    textAlign: 'center',
    padding: 0,
    filter: 'saturate(50%)'
});


const characterStyle = (color: string): CSSProperties => ({
    fontSize: '70%',
    verticalAlign: 'top',
    color: isColorTooBright(color) ? 'black' : 'white',
    userSelect: 'none'
});
