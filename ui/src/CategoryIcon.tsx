import React, { CSSProperties } from 'react';
import { colors } from './categoryColors';


export default ({ category, size }) => {

    const color = getColor(category);

    return <div style={ iconStyle(size, color) }>
        <span style={ characterStyle(color) }>
            { category.substr(0, 1) }
        </span>
    </div>;

};


const getColor = (category: string): string => colors[category] ?? generateColorForCategory(category);


/* tslint:disable:no-bitwise */
const isColorTooBright = (color: string): boolean => {

    const c = color.substring(1);  // strip #
    const rgb = parseInt(c, 16);   // convert rrggbb to decimal
    const r = (rgb >> 16) & 0xff;  // extract red
    const g = (rgb >>  8) & 0xff;  // extract green
    const b = (rgb >>  0) & 0xff;  // extract blue
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    return luma > 200;
};


const generateColorForCategory = (category: string): string => {

    const hash = hashCode(category);
    const r = (hash & 0xFF0000) >> 16;
    const g = (hash & 0x00FF00) >> 8;
    const b = hash & 0x0000FF;
    return '#' + ('0' + r.toString(16)).substr(-2)
        + ('0' + g.toString(16)).substr(-2) + ('0' + b.toString(16)).substr(-2);
};


const hashCode = (value: string): number => {

    let hash = 0;
    let i = 0;
    let charCode = 0;

    if (value.length === 0) return hash;
    for (i = 0; i < value.length; i++) {
        charCode = value.charCodeAt(i);
        hash = ((hash << 5) - hash) + charCode;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};
/* tslint:enable:no-bitwise */


const iconStyle = (size: number, color: string): CSSProperties => ({
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
