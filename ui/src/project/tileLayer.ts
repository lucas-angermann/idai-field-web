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
    
    let zoom = 0;
    while (zoom * tileSize < imageWidth / (zoom + 1)) {
        result.push(layerWidth / imageWidth * Math.pow(2, zoom));
        zoom++;
    }

    return result.reverse();
};
