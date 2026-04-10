import pako from 'pako';
import { concat, writeU32BE } from './binary.js';
import {
  MAGIC_RGBV3D,
  PROFILE_LOSSLESS_RGB_SUB_DEFLATE,
  PROFILE_LOSSLESS_VECTOR_V2,
} from './constants.js';
import { filterSubRgb } from './filter.js';
import { encodeVectorLossless } from './vector.js';

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
export function encodeRgbLossless(opts: EncodeRgbOptions): Uint8Array {
  const { width, height, rgb } = opts;
  const profile = opts.profile ?? PROFILE_LOSSLESS_RGB_SUB_DEFLATE;
  if (width <= 0 || height <= 0) throw new Error('Invalid dimensions');
  if (rgb.length !== width * height * 3) throw new Error('RGB buffer size mismatch');
  let compressed: Uint8Array;
  if (profile === PROFILE_LOSSLESS_RGB_SUB_DEFLATE) {
    const filtered = filterSubRgb(width, height, rgb);
    compressed = pako.deflateRaw(filtered, { level: 9 });
  } else if (profile === PROFILE_LOSSLESS_VECTOR_V2) {
    compressed = encodeVectorLossless({
      width,
      height,
      rgb,
      dirBits: opts.dirBits ?? 8,
      skipClassicFallback: opts.skipClassicFallback,
    });
  } else {
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
