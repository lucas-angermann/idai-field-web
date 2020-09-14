import { getTileLayerExtent } from './tileLayer';


test('get tile layer extent', () => {

    const document = {
        resource: {
            category: 'Image',
            width: 8000,
            height: 8000,
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
            }
        }
    };

    const extent = getTileLayerExtent(document);

    expect(extent).toStrictEqual(
        // [ 562998.477499999804, 3466498.50669999979, 563501.493200000143, 3467001.52240000013 ]
        [ 562998.5089384811, 3466498.5381384813, 563501.461761519, 3467001.490961519 ]
    );
    
});
