export const getTileLayerExtent = (document: any): [number, number, number, number] => [
    document.resource.georeference.bottomLeftCoordinates[1],
    document.resource.georeference.bottomLeftCoordinates[0],
    document.resource.georeference.topRightCoordinates[1],
    document.resource.georeference.topRightCoordinates[0]
];


export const getResolutions = (
        extent: [number, number, number, number],
        tileSize: number,
        document: any): number[] => {

    const result = [];
    const layerWidth = extent[2] - extent[0];
    const imageWidth = document.resource.groups[1].fields[1].value;
    
    let scale = 1;
    while (tileSize < imageWidth / scale) {
        result.push(layerWidth / imageWidth * scale);
        scale *= 2;
    }
    result.push(layerWidth / imageWidth * scale);

    return result.reverse();
};
