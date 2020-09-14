import { getTileLayerExtent, getResolutions } from './tileLayer';

const DOCUMENT = {
    resource: {
        category: 'Image',
        georeference: {
            topRightCoordinates: [
                3467001.490961519,
                563501.461761519
            ],
            topLeftCoordinates: [
                3467001.490961519,
                562998.5089384811
            ],
            bottomLeftCoordinates: [
                3466498.5381384813,
                562998.5089384811
            ]
        },
        groups: [
            {
                name: 'stem'
            },
            {
                name: 'parent',
                fields: [
                    { value: 8000, name: 'height' },
                    { value: 8000, name: 'width' },
                ]
            }
        ]
    }
};


test('get tile layer extent', () => {

    const extent = getTileLayerExtent(DOCUMENT);

    expect(extent).toStrictEqual(
        // [ 562998.477499999804, 3466498.50669999979, 563501.493200000143, 3467001.52240000013 ]
        [ 562998.5089384811, 3466498.5381384813, 563501.461761519, 3467001.490961519 ]
    );
    
});


test('get tile layer resolutions', () => {

    const extent = getTileLayerExtent(DOCUMENT);
    const resolutions = getResolutions(extent, 256, DOCUMENT);

    expect(resolutions).toStrictEqual(
        // [ 2.0120628000014551, 1.00603140000072755, 0.503015700000363775, 0.251507850000181887,
        //    0.125753925000090944, 0.0628769625000454718 ]
        [ 2.011811292151455, 1.0059056460757274, 0.5029528230378637, 0.25147641151893185,
            0.12573820575946593, 0.06286910287973296 ]
    );

});
