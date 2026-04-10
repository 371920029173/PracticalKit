export interface VectorEncodeOptions {
    width: number;
    height: number;
    rgb: Uint8Array;
    /** 8 or 9 are supported in this build. */
    dirBits?: 8 | 9;
    /**
     * When false (default), the encoder may replace the whole image with classic
     * Sub+deflate if that compresses smaller — in that case `dirBits` has no effect.
     * Set true to always use block-adaptive vector mode so 8 vs 9 bit direction
     * quantization is honored at the container level.
     */
    skipClassicFallback?: boolean;
}
export interface VectorDecoded {
    width: number;
    height: number;
    rgb: Uint8Array;
    dirBits: number;
}
/**
 * Vector-primary lossless profile:
 * - low-bit direction index (8/9)
 * - differential luminance proxy Lq (Q6 of Euclidean norm)
 * - exact RGB residual (lossless guarantee)
 * - all streams compressed independently with deflate
 */
export declare function encodeVectorLossless(opts: VectorEncodeOptions): Uint8Array;
export declare function decodeVectorLossless(payload: Uint8Array, width: number, height: number): VectorDecoded;
//# sourceMappingURL=vector.d.ts.map