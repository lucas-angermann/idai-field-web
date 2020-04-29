import React, { CSSProperties } from 'react';

export default ({ category: category, size: size}) => {

    const color = getColor(category);

    return <div style={ iconStyle(size, color) }>
        <span style={ characterStyle(color) }>
            { category.substr(0, 1) }
        </span>
    </div>;

};

const getColor = (category) => '#000000';

const isColorTooBright = (color: string): boolean => {

    const c = color.substring(1);  // strip #
    const rgb = parseInt(c, 16);   // convert rrggbb to decimal
    /* tslint:disable:no-bitwise */
    const r = (rgb >> 16) & 0xff;  // extract red
    const g = (rgb >>  8) & 0xff;  // extract green
    const b = (rgb >>  0) & 0xff;  // extract blue
    /* tslint:enable:no-bitwise */
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    return luma > 200;
};

const iconStyle = (size: number, color: string): CSSProperties => ({
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${size}px`,
    lineHeight: `${size}px`,
    backgroundColor: color,
    display: 'inline-block',
    fontFamily: 'Roboto, sans-serif !important',
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
