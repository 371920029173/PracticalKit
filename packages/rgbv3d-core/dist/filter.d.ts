/** PNG filter 1 (Sub): each byte minus previous pixel same channel (mod 256). */
export declare function filterSubRgb(width: number, height: number, rgb: Uint8Array): Uint8Array;
export declare function unfilterSubRgb(width: number, height: number, filtered: Uint8Array): Uint8Array;
/** PNG filter 1 (Sub) on a single plane (row-major). */
export declare function filterSubGray(width: number, height: number, plane: Uint8Array): Uint8Array;
export declare function unfilterSubGray(width: number, height: number, filtered: Uint8Array): Uint8Array;
//# sourceMappingURL=filter.d.ts.map