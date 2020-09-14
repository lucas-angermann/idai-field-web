export const getTileLayerExtent = (document: any): [number, number, number, number] => [
    document.resource.georeference.bottomLeftCoordinates[1],
    document.resource.georeference.bottomLeftCoordinates[0],
    document.resource.georeference.topRightCoordinates[1],
    document.resource.georeference.topRightCoordinates[0]
];


export const getResolutions = (extent: [number, number, number, number], tileSize: [number, number]): number[] => {

    return [ 2.0120628000014551, 1.00603140000072755, 0.503015700000363775, 0.251507850000181887,
        0.125753925000090944, 0.0628769625000454718];
};
