import pako from 'pako';
import { readU32BE } from './binary.js';
import {
  MAGIC_RGBV3D,
  PROFILE_LOSSLESS_RGB_SUB_DEFLATE,
  PROFILE_LOSSLESS_VECTOR_V2,
} from './constants.js';
import { unfilterSubRgb } from './filter.js';
import { decodeVectorLossless } from './vector.js';

export interface DecodedImage {
  width: number;
  height: number;
  rgb: Uint8Array;
  profile: number;
}

function startsWith(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length < b.length) return false;
  for (let i = 0; i < b.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export function decodeRgbV3d(file: Uint8Array): DecodedImage {
  if (!startsWith(file, MAGIC_RGBV3D)) throw new Error('Not a .rgbv3d v file (bad magic)');
  let o = MAGIC_RGBV3D.length;
  if (o + 4 + 4 + 2 + 4 > file.length) throw new Error('Truncated header');
  const width = readU32BE(file, o);
  o += 4;
  const height = readU32BE(file, o);
  o += 4;
  const profile = file[o]!;
  o += 1;
  o += 1; // flags reserved
  const compLen = readU32BE(file, o);
  o += 4;
  if (o + compLen > file.length) throw new Error('Truncated compressed payload');
  const comp = file.subarray(o, o + compLen);
  if (profile === PROFILE_LOSSLESS_RGB_SUB_DEFLATE) {
    const filtered = pako.inflateRaw(comp);
    const expect = width * height * 3;
    if (filtered.length !== expect) throw new Error(`Inflated size mismatch: ${filtered.length} vs ${expect}`);
    const rgb = unfilterSubRgb(width, height, filtered);
    return { width, height, rgb, profile };
  }
  if (profile === PROFILE_LOSSLESS_VECTOR_V2) {
    const out = decodeVectorLossless(comp, width, height);
    return { width: out.width, height: out.height, rgb: out.rgb, profile };
  }
  throw new Error(`Unsupported profile: ${profile}`);
}
