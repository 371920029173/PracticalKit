export interface DecodedImage {
    width: number;
    height: number;
    rgb: Uint8Array;
    profile: number;
}
export declare function decodeRgbV3d(file: Uint8Array): DecodedImage;
//# sourceMappingURL=decode.d.ts.map