import pako from 'pako';
import { concat, writeU32BE } from './binary.js';
import { MAGIC_RGBV3D, PROFILE_LOSSLESS_RGB_SUB_DEFLATE, PROFILE_LOSSLESS_VECTOR_V2, } from './constants.js';
import { filterSubRgb } from './filter.js';
import { encodeVectorLossless } from './vector.js';
/**
 * Build `.rgbv3d` container (profile 0: Sub predictor + raw deflate payload).
 */
export function encodeRgbLossless(opts) {
    const { width, height, rgb } = opts;
    const profile = opts.profile ?? PROFILE_LOSSLESS_RGB_SUB_DEFLATE;
    if (width <= 0 || height <= 0)
        throw new Error('Invalid dimensions');
    if (rgb.length !== width * height * 3)
        throw new Error('RGB buffer size mismatch');
    let compressed;
    if (profile === PROFILE_LOSSLESS_RGB_SUB_DEFLATE) {
        const filtered = filterSubRgb(width, height, rgb);
        compressed = pako.deflateRaw(filtered, { level: 9 });
    }
    else if (profile === PROFILE_LOSSLESS_VECTOR_V2) {
        compressed = encodeVectorLossless({
            width,
            height,
            rgb,
            dirBits: opts.dirBits ?? 8,
            skipClassicFallback: opts.skipClassicFallback,
        });
    }
    else {
        throw new Error(`Unsupported profile for encoder: ${profile}`);
    }
    const header = concat([
        MAGIC_RGBV3D,
        writeU32BE(width),
        writeU32BE(height),
        new Uint8Array([profile, 0]),
        writeU32BE(compressed.length),
        compressed,
    ]);
    return header;
}
