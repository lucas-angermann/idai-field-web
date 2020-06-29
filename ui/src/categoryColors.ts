export const getColor = (categoryName: string): string => {

    return colors[categoryName] ?? generateColorForCategory(categoryName);
};


/* tslint:disable:no-bitwise */
export const isColorTooBright = (color: string): boolean => {

    const c = color.substring(1);  // strip #
    const rgb = parseInt(c, 16);   // convert rrggbb to decimal
    const r = (rgb >> 16) & 0xff;  // extract red
    const g = (rgb >>  8) & 0xff;  // extract green
    const b = (rgb >>  0) & 0xff;  // extract blue
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

    return luma > 200;
};
/* tslint:enable:no-bitwise */


const colors: { [categoryName: string]: string } = {
    Trench: 'blue',
    Glass: '#99CC33',
    Mollusk: '#ff99ff',
    Brick: '#CC0000',
    Wood: '#660000',
    Architecture: '#707070',
    Place: '#5572A1',
    Layer: '#663300',
    Feature: 'black',
    Floor: '#6600cc',
    Grave: '#339900',
    Bone: '#CCFFFF',
    Terracotta: '#FF6600',
    Stone: '#5c5c8a',
    Coin: '#cc9900',
    Find: 'black',
    PlasterFragment: '#737373',
    Metal: '#995f25',
    BuildingPart: '#707070',
    SurveyUnit: '#6baed6',
    Sample: '#9ecae1'
};


/* tslint:disable:no-bitwise */
const generateColorForCategory = (categoryName: string): string => {

    const hash = hashCode(categoryName);
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
