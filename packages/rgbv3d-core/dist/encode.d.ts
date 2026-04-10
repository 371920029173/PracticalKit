export interface EncodeRgbOptions {
    width: number;
    height: number;
    /** Row-major RGB888 */
    rgb: Uint8Array;
    /** default: 0 (classic Sub+Deflate), 1: vector-primary lossless v2 */
    profile?: number;
    /** only used in profile=1 */
    dirBits?: 8 | 9;
    /** only used in profile=1; forwarded to encodeVectorLossless */
    skipClassicFallback?: boolean;
}
/**
 * Build `.rgbv3d` container (profile 0: Sub predictor + raw deflate payload).
 */
export declare function encodeRgbLossless(opts: EncodeRgbOptions): Uint8Array;
//# sourceMappingURL=encode.d.ts.map