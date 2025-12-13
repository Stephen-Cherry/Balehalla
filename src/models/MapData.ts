interface MapData {
    worldMin: number;
    worldMax: number;
    worldSpan: number;
    interior: {
        x0: number;
        y0: number;
        x1: number;
        y1: number;
    };
    interiorWidth: number;
    interiorHeight: number;
}

export { MapData };