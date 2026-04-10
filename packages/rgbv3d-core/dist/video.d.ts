export interface RgbV3dVideoFrame {
    width: number;
    height: number;
    /** Raw `.rgbv3d` file bytes */
    rgbv3dBlob: Uint8Array;
}
export interface EncodeVideoOptions {
    /** Frames in order */
    frames: RgbV3dVideoFrame[];
    fpsNumerator: number;
    fpsDenominator: number;
}
/**
 * `.rgbv3dv` v1: magic + meta + repeated [u32 len][blob].
 */
export declare function encodeRgbV3dVideo(opts: EncodeVideoOptions): Uint8Array;
export interface DecodedVideo {
    fpsNumerator: number;
    fpsDenominator: number;
    frameBlobs: Uint8Array[];
}
export declare function decodeRgbV3dVideo(file: Uint8Array): DecodedVideo;
export interface EncodeVideoInterOptions {
    width: number;
    height: number;
    framesRgb: Uint8Array[];
    fpsNumerator: number;
    fpsDenominator: number;
    keyframeProfile?: number;
    keyframeDirBits?: 8 | 9;
}
/**
 * `.rgbv3dvi` v1:
 * - keyframe as normal `.rgbv3d`
 * - following frames encoded as deflated per-channel signed deltas from previous frame
 */
export declare function encodeRgbV3dVideoInter(opts: EncodeVideoInterOptions): Uint8Array;
export interface DecodedInterVideo {
    width: number;
    height: number;
    fpsNumerator: number;
    fpsDenominator: number;
    frameRgbs: Uint8Array[];
}
export declare function decodeRgbV3dVideoInter(file: Uint8Array): DecodedInterVideo;
//# sourceMappingURL=video.d.ts.map