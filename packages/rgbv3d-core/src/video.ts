import { concat, readU32BE, writeU32BE } from './binary.js';
import { MAGIC_RGBV3DV, MAGIC_RGBV3DVI } from './constants.js';
import { encodeRgbLossless } from './encode.js';
import { decodeRgbV3d } from './decode.js';
import { entropyDecode, entropyEncode } from './entropy.js';

const INTER_STREAM_VERSION = 1;

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
export function encodeRgbV3dVideo(opts: EncodeVideoOptions): Uint8Array {
  const { frames, fpsNumerator, fpsDenominator } = opts;
  if (frames.length === 0) throw new Error('No frames');
  const chunks: Uint8Array[] = [
    MAGIC_RGBV3DV,
    writeU32BE(frames.length),
    writeU32BE(fpsNumerator),
    writeU32BE(fpsDenominator),
  ];
  for (const f of frames) {
    chunks.push(writeU32BE(f.rgbv3dBlob.length), f.rgbv3dBlob);
  }
  return concat(chunks);
}

export interface DecodedVideo {
  fpsNumerator: number;
  fpsDenominator: number;
  frameBlobs: Uint8Array[];
}

export function decodeRgbV3dVideo(file: Uint8Array): DecodedVideo {
  if (file.length < MAGIC_RGBV3DV.length + 12) throw new Error('Truncated .rgbv3dv');
  for (let i = 0; i < MAGIC_RGBV3DV.length; i++) {
    if (file[i] !== MAGIC_RGBV3DV[i]) throw new Error('Bad .rgbv3dv magic');
  }
  let o = MAGIC_RGBV3DV.length;
  const frameCount = readU32BE(file, o);
  o += 4;
  const fpsNumerator = readU32BE(file, o);
  o += 4;
  const fpsDenominator = readU32BE(file, o);
  o += 4;
  const blobs: Uint8Array[] = [];
  for (let i = 0; i < frameCount; i++) {
    if (o + 4 > file.length) throw new Error('Truncated frame length');
    const len = readU32BE(file, o);
    o += 4;
    if (o + len > file.length) throw new Error('Truncated frame data');
    blobs.push(file.subarray(o, o + len));
    o += len;
  }
  return { fpsNumerator, fpsDenominator, frameBlobs: blobs };
}

function zigzagEncode16(n: number): number {
  return ((n << 1) ^ (n >> 15)) & 0xffff;
}

function zigzagDecode16(v: number): number {
  return ((v >>> 1) ^ -(v & 1)) | 0;
}

function diffToBytes(curr: Uint8Array, prev: Uint8Array): Uint8Array {
  if (curr.length !== prev.length) throw new Error('Frame size mismatch');
  const out = new Uint8Array(curr.length * 2);
  let o = 0;
  for (let i = 0; i < curr.length; i++) {
    const d = curr[i]! - prev[i]!;
    const z = zigzagEncode16(d);
    out[o++] = (z >>> 8) & 0xff;
    out[o++] = z & 0xff;
  }
  return out;
}

function bytesToDiff(diffRaw: Uint8Array, prev: Uint8Array): Uint8Array {
  if (diffRaw.length !== prev.length * 2) throw new Error('Inter-frame diff size mismatch');
  const out = new Uint8Array(prev.length);
  let o = 0;
  for (let i = 0; i < prev.length; i++) {
    const z = (diffRaw[o]! << 8) | diffRaw[o + 1]!;
    o += 2;
    const d = zigzagDecode16(z);
    const v = prev[i]! + d;
    out[i] = v < 0 ? 0 : v > 255 ? 255 : v;
  }
  return out;
}

interface BlockDiffFrame {
  blockSize: number;
  modeComp: Uint8Array;
  mvComp: Uint8Array;
  diffComp: Uint8Array;
}

function computeSadAgainstPredictor(
  curr: Uint8Array,
  pred: Uint8Array,
  width: number,
  x0: number,
  y0: number,
  bw: number,
  bh: number,
  srcX0: number,
  srcY0: number
): number {
  let sad = 0;
  for (let y = 0; y < bh; y++) {
    const rowOff = ((y0 + y) * width + x0) * 3;
    const predOff = ((srcY0 + y) * width + srcX0) * 3;
    for (let x = 0; x < bw * 3; x++) sad += Math.abs(curr[rowOff + x]! - pred[predOff + x]!);
  }
  return sad;
}

function computeSadMotion(
  curr: Uint8Array,
  prev: Uint8Array,
  width: number,
  height: number,
  x0: number,
  y0: number,
  bw: number,
  bh: number,
  dx: number,
  dy: number
): number {
  let sad = 0;
  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      const cx = x0 + x;
      const cy = y0 + y;
      const sx = Math.max(0, Math.min(width - 1, cx + dx));
      const sy = Math.max(0, Math.min(height - 1, cy + dy));
      const cOff = (cy * width + cx) * 3;
      const sOff = (sy * width + sx) * 3;
      sad += Math.abs(curr[cOff]! - prev[sOff]!);
      sad += Math.abs(curr[cOff + 1]! - prev[sOff + 1]!);
      sad += Math.abs(curr[cOff + 2]! - prev[sOff + 2]!);
    }
  }
  return sad;
}

function encodeInterFrameBlockDiff(curr: Uint8Array, prev: Uint8Array, width: number, height: number): BlockDiffFrame {
  const blockSize = 16;
  const blocksX = Math.ceil(width / blockSize);
  const blocksY = Math.ceil(height / blockSize);
  const modeMap = new Uint8Array(blocksX * blocksY); // 0 skip, 1 prev, 2 left, 3 top, 4 motion
  const motionPairs: number[] = [];
  const diffs: number[] = [];
  let bi = 0;
  const currRecon = new Uint8Array(prev);
  const motionRadius = 2;
  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++, bi++) {
      const x0 = bx * blockSize;
      const y0 = by * blockSize;
      const bw = Math.min(blockSize, width - x0);
      const bh = Math.min(blockSize, height - y0);
      const prevSad = computeSadAgainstPredictor(curr, prev, width, x0, y0, bw, bh, x0, y0);
      let leftSad = Number.MAX_SAFE_INTEGER;
      let topSad = Number.MAX_SAFE_INTEGER;
      if (bx > 0) leftSad = computeSadAgainstPredictor(curr, currRecon, width, x0, y0, bw, bh, x0 - bw, y0);
      if (by > 0) topSad = computeSadAgainstPredictor(curr, currRecon, width, x0, y0, bw, bh, x0, y0 - bh);
      let mvDx = 0;
      let mvDy = 0;
      let motionSad = prevSad;
      for (let dy = -motionRadius; dy <= motionRadius; dy++) {
        for (let dx = -motionRadius; dx <= motionRadius; dx++) {
          if (dx === 0 && dy === 0) continue;
          const sad = computeSadMotion(curr, prev, width, height, x0, y0, bw, bh, dx, dy);
          if (sad < motionSad) {
            motionSad = sad;
            mvDx = dx;
            mvDy = dy;
          }
        }
      }
      let mode = 1;
      let bestSad = prevSad;
      if (leftSad < bestSad) {
        bestSad = leftSad;
        mode = 2;
      }
      if (topSad < bestSad) {
        bestSad = topSad;
        mode = 3;
      }
      if (motionSad < bestSad) {
        bestSad = motionSad;
        mode = 4;
      }
      if (bestSad === 0) mode = 0;
      modeMap[bi] = mode;
      if (mode === 4) motionPairs.push((mvDx + 128) & 0xff, (mvDy + 128) & 0xff);
      for (let y = 0; y < bh; y++) {
        const rowOff = ((y0 + y) * width + x0) * 3;
        for (let x = 0; x < bw * 3; x++) {
          const cv = curr[rowOff + x]!;
          let pv = prev[rowOff + x]!;
          if (mode === 2) {
            const predOff = ((y0 + y) * width + (x0 - bw)) * 3 + x;
            pv = currRecon[predOff]!;
          } else if (mode === 3) {
            const predOff = ((y0 - bh + y) * width + x0) * 3 + x;
            pv = currRecon[predOff]!;
          } else if (mode === 4) {
            const px = x0 + Math.floor(x / 3);
            const py = y0 + y;
            const sx = Math.max(0, Math.min(width - 1, px + mvDx));
            const sy = Math.max(0, Math.min(height - 1, py + mvDy));
            const c = x % 3;
            pv = prev[(sy * width + sx) * 3 + c]!;
          }
          if (mode !== 0) {
            const d = cv - pv;
            const z = zigzagEncode16(d);
            diffs.push((z >>> 8) & 0xff, z & 0xff);
          }
          currRecon[rowOff + x] = cv;
        }
      }
    }
  }
  return {
    blockSize,
    modeComp: entropyEncode(modeMap),
    mvComp: entropyEncode(new Uint8Array(motionPairs)),
    diffComp: entropyEncode(new Uint8Array(diffs)),
  };
}

function decodeInterFrameBlockDiff(
  prev: Uint8Array,
  width: number,
  height: number,
  blockSize: number,
  modeComp: Uint8Array,
  mvComp: Uint8Array,
  diffComp: Uint8Array
): Uint8Array {
  const blocksX = Math.ceil(width / blockSize);
  const blocksY = Math.ceil(height / blockSize);
  const curr = new Uint8Array(prev);
  const modeMap = entropyDecode(modeComp);
  if (modeMap.length !== blocksX * blocksY) throw new Error('Inter-frame mode map size mismatch');
  const mvRaw = entropyDecode(mvComp);
  let mvOff = 0;
  const diffRaw = entropyDecode(diffComp);
  let dOff = 0;
  let bi = 0;
  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++, bi++) {
      const mode = modeMap[bi]!;
      const x0 = bx * blockSize;
      const y0 = by * blockSize;
      const bw = Math.min(blockSize, width - x0);
      const bh = Math.min(blockSize, height - y0);
      let mvDx = 0;
      let mvDy = 0;
      if (mode === 4) {
        if (mvOff + 2 > mvRaw.length) throw new Error('Truncated motion vector stream');
        mvDx = (mvRaw[mvOff++]! - 128) | 0;
        mvDy = (mvRaw[mvOff++]! - 128) | 0;
      }
      for (let y = 0; y < bh; y++) {
        const rowOff = ((y0 + y) * width + x0) * 3;
        for (let x = 0; x < bw * 3; x++) {
          let pred = prev[rowOff + x]!;
          if (mode === 2) {
            const predOff = ((y0 + y) * width + (x0 - bw)) * 3 + x;
            pred = curr[predOff]!;
          } else if (mode === 3) {
            const predOff = ((y0 - bh + y) * width + x0) * 3 + x;
            pred = curr[predOff]!;
          } else if (mode === 4) {
            const px = x0 + Math.floor(x / 3);
            const py = y0 + y;
            const sx = Math.max(0, Math.min(width - 1, px + mvDx));
            const sy = Math.max(0, Math.min(height - 1, py + mvDy));
            const c = x % 3;
            pred = prev[(sy * width + sx) * 3 + c]!;
          }
          if (mode === 0) {
            curr[rowOff + x] = pred;
          } else {
            const z = (diffRaw[dOff]! << 8) | diffRaw[dOff + 1]!;
            dOff += 2;
            const d = zigzagDecode16(z);
            const v = pred + d;
            curr[rowOff + x] = v < 0 ? 0 : v > 255 ? 255 : v;
          }
        }
      }
    }
  }
  return curr;
}

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
export function encodeRgbV3dVideoInter(opts: EncodeVideoInterOptions): Uint8Array {
  const { width, height, framesRgb, fpsNumerator, fpsDenominator } = opts;
  if (!framesRgb.length) throw new Error('No frames');
  const pixelsBytes = width * height * 3;
  for (const f of framesRgb) if (f.length !== pixelsBytes) throw new Error('Frame RGB size mismatch');
  const keyBlob = encodeRgbLossless({
    width,
    height,
    rgb: framesRgb[0]!,
    profile: opts.keyframeProfile,
    dirBits: opts.keyframeDirBits,
  });
  const chunks: Uint8Array[] = [
    MAGIC_RGBV3DVI,
    new Uint8Array([INTER_STREAM_VERSION]),
    writeU32BE(framesRgb.length),
    writeU32BE(fpsNumerator),
    writeU32BE(fpsDenominator),
    writeU32BE(width),
    writeU32BE(height),
    writeU32BE(keyBlob.length),
    keyBlob,
  ];
  let prev = framesRgb[0]!;
  for (let i = 1; i < framesRgb.length; i++) {
    const inter = encodeInterFrameBlockDiff(framesRgb[i]!, prev, width, height);
    const interPayload = concat([
      new Uint8Array([inter.blockSize]),
      writeU32BE(inter.modeComp.length),
      writeU32BE(inter.mvComp.length),
      writeU32BE(inter.diffComp.length),
      inter.modeComp,
      inter.mvComp,
      inter.diffComp,
    ]);
    const intraBlob = encodeRgbLossless({
      width,
      height,
      rgb: framesRgb[i]!,
      profile: opts.keyframeProfile,
      dirBits: opts.keyframeDirBits,
    });
    if (intraBlob.length + 5 < interPayload.length + 1) {
      chunks.push(new Uint8Array([1]), writeU32BE(intraBlob.length), intraBlob);
    } else {
      chunks.push(new Uint8Array([0]), interPayload);
    }
    prev = framesRgb[i]!;
  }
  return concat(chunks);
}

export interface DecodedInterVideo {
  width: number;
  height: number;
  fpsNumerator: number;
  fpsDenominator: number;
  frameRgbs: Uint8Array[];
}

export function decodeRgbV3dVideoInter(file: Uint8Array): DecodedInterVideo {
  if (file.length < MAGIC_RGBV3DVI.length + 25) throw new Error('Truncated .rgbv3dvi');
  for (let i = 0; i < MAGIC_RGBV3DVI.length; i++) {
    if (file[i] !== MAGIC_RGBV3DVI[i]) throw new Error('Bad .rgbv3dvi magic');
  }
  let o = MAGIC_RGBV3DVI.length;
  const version = file[o++]!;
  if (version !== INTER_STREAM_VERSION) throw new Error(`Unsupported .rgbv3dvi version: ${version}`);
  const frameCount = readU32BE(file, o);
  o += 4;
  const fpsNumerator = readU32BE(file, o);
  o += 4;
  const fpsDenominator = readU32BE(file, o);
  o += 4;
  const width = readU32BE(file, o);
  o += 4;
  const height = readU32BE(file, o);
  o += 4;
  const keyLen = readU32BE(file, o);
  o += 4;
  if (o + keyLen > file.length) throw new Error('Truncated keyframe');
  const key = decodeRgbV3d(file.subarray(o, o + keyLen));
  o += keyLen;
  const frames: Uint8Array[] = [key.rgb];
  let prev = key.rgb;
  for (let i = 1; i < frameCount; i++) {
    if (o + 1 > file.length) throw new Error('Truncated inter frame kind');
    const kind = file[o++]!;
    let curr: Uint8Array;
    if (kind === 1) {
      if (o + 4 > file.length) throw new Error('Truncated intra frame length');
      const len = readU32BE(file, o);
      o += 4;
      if (o + len > file.length) throw new Error('Truncated intra frame payload');
      curr = decodeRgbV3d(file.subarray(o, o + len)).rgb;
      o += len;
    } else if (kind === 0) {
      if (o + 1 + 4 + 4 + 4 > file.length) throw new Error('Truncated inter frame header');
      const blockSize = file[o++]!;
      const modeLen = readU32BE(file, o);
      o += 4;
      const mvLen = readU32BE(file, o);
      o += 4;
      const diffCompLen = readU32BE(file, o);
      o += 4;
      if (o + modeLen + mvLen + diffCompLen > file.length) throw new Error('Truncated inter frame payload');
      const modeComp = file.subarray(o, o + modeLen);
      o += modeLen;
      const mvComp = file.subarray(o, o + mvLen);
      o += mvLen;
      const diffComp = file.subarray(o, o + diffCompLen);
      o += diffCompLen;
      curr = decodeInterFrameBlockDiff(prev, width, height, blockSize, modeComp, mvComp, diffComp);
    } else {
      throw new Error(`Unsupported inter frame kind: ${kind}`);
    }
    frames.push(curr);
    prev = curr;
  }
  return { width, height, fpsNumerator, fpsDenominator, frameRgbs: frames };
}
