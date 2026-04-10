import { concat, readU32BE, writeU32BE } from './binary.js';
import { filterSubGray, filterSubRgb, unfilterSubGray, unfilterSubRgb } from './filter.js';
import { entropyDecode, entropyEncode } from './entropy.js';
function clamp8(n) {
    if (n < 0)
        return 0;
    if (n > 255)
        return 255;
    return n;
}
function zigzagEncode16(n) {
    return ((n << 1) ^ (n >> 15)) & 0xffff;
}
function zigzagDecode16(v) {
    return ((v >>> 1) ^ -(v & 1)) | 0;
}
/** Precompute first-octant spherical codebook. */
function buildCodebook(dirBits) {
    const count = 1 << dirBits;
    const thetaBins = 1 << Math.floor(dirBits / 2);
    const phiBins = 1 << (dirBits - Math.floor(dirBits / 2));
    const out = new Array(count);
    for (let t = 0; t < thetaBins; t++) {
        const theta = ((t + 0.5) / thetaBins) * (Math.PI / 2);
        for (let p = 0; p < phiBins; p++) {
            const phi = ((p + 0.5) / phiBins) * (Math.PI / 2);
            const idx = t * phiBins + p;
            const x = Math.sin(theta) * Math.cos(phi);
            const y = Math.sin(theta) * Math.sin(phi);
            const z = Math.cos(theta);
            out[idx] = [x, y, z];
        }
    }
    return out;
}
function quantizeDirection(r, g, b, dirBits) {
    if (r === 0 && g === 0 && b === 0)
        return 0;
    const L = Math.hypot(r, g, b);
    const rn = r / L;
    const gn = g / L;
    const bn = b / L;
    const thetaBins = 1 << Math.floor(dirBits / 2);
    const phiBins = 1 << (dirBits - Math.floor(dirBits / 2));
    const theta = Math.acos(Math.max(-1, Math.min(1, bn)));
    const phi = Math.atan2(gn, rn);
    const t = Math.min(thetaBins - 1, Math.max(0, Math.floor((theta / (Math.PI / 2)) * thetaBins)));
    const p = Math.min(phiBins - 1, Math.max(0, Math.floor((phi / (Math.PI / 2)) * phiBins)));
    return t * phiBins + p;
}
function packU9(values) {
    const totalBits = values.length * 9;
    const out = new Uint8Array(Math.ceil(totalBits / 8));
    let bitPos = 0;
    for (let i = 0; i < values.length; i++) {
        const v = values[i] & 0x1ff;
        for (let b = 0; b < 9; b++) {
            if (v & (1 << b))
                out[bitPos >> 3] |= 1 << (bitPos & 7);
            bitPos++;
        }
    }
    return out;
}
function unpackU9(packed, count) {
    const out = new Uint16Array(count);
    let bitPos = 0;
    for (let i = 0; i < count; i++) {
        let v = 0;
        for (let b = 0; b < 9; b++) {
            const bit = (packed[bitPos >> 3] >> (bitPos & 7)) & 1;
            v |= bit << b;
            bitPos++;
        }
        out[i] = v;
    }
    return out;
}
function toU16BE(values) {
    const out = new Uint8Array(values.length * 2);
    let o = 0;
    for (let i = 0; i < values.length; i++) {
        const zz = zigzagEncode16(values[i]);
        out[o++] = (zz >>> 8) & 0xff;
        out[o++] = zz & 0xff;
    }
    return out;
}
function fromU16BE(buf, count) {
    if (buf.length !== count * 2)
        throw new Error('Residual stream size mismatch');
    const out = new Int16Array(count);
    let o = 0;
    for (let i = 0; i < count; i++) {
        const zz = (buf[o] << 8) | buf[o + 1];
        out[i] = zigzagDecode16(zz);
        o += 2;
    }
    return out;
}
function extractBlock(width, rgb, r) {
    const out = new Uint8Array(r.w * r.h * 3);
    for (let y = 0; y < r.h; y++) {
        const srcOff = ((r.y + y) * width + r.x) * 3;
        const dstOff = y * r.w * 3;
        out.set(rgb.subarray(srcOff, srcOff + r.w * 3), dstOff);
    }
    return out;
}
function placeBlock(width, rgb, r, blk) {
    for (let y = 0; y < r.h; y++) {
        const dstOff = ((r.y + y) * width + r.x) * 3;
        const srcOff = y * r.w * 3;
        rgb.set(blk.subarray(srcOff, srcOff + r.w * 3), dstOff);
    }
}
function luminanceVariance(blk) {
    const n = blk.length / 3;
    if (n === 0)
        return 0;
    let sum = 0;
    let sum2 = 0;
    for (let i = 0; i < blk.length; i += 3) {
        const y = (blk[i] * 77 + blk[i + 1] * 150 + blk[i + 2] * 29) >> 8;
        sum += y;
        sum2 += y * y;
    }
    const mean = sum / n;
    return sum2 / n - mean * mean;
}
function gradientEnergy(blk, w, h) {
    if (w < 2 || h < 2)
        return 0;
    let sum = 0;
    let n = 0;
    for (let y = 0; y < h - 1; y++) {
        for (let x = 0; x < w - 1; x++) {
            const i = (y * w + x) * 3;
            const y0 = (blk[i] * 77 + blk[i + 1] * 150 + blk[i + 2] * 29) >> 8;
            const ir = (y * w + (x + 1)) * 3;
            const id = ((y + 1) * w + x) * 3;
            const yr = (blk[ir] * 77 + blk[ir + 1] * 150 + blk[ir + 2] * 29) >> 8;
            const yd = (blk[id] * 77 + blk[id + 1] * 150 + blk[id + 2] * 29) >> 8;
            sum += Math.abs(y0 - yr) + Math.abs(y0 - yd);
            n += 2;
        }
    }
    return n ? sum / n : 0;
}
/** High-frequency energy (helps tag film-grain / sensor noise). */
function laplacianEnergyLuma(blk, w, h) {
    if (w < 3 || h < 3)
        return 0;
    let sum = 0;
    let n = 0;
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const i = (y * w + x) * 3;
            const c = (blk[i] * 77 + blk[i + 1] * 150 + blk[i + 2] * 29) >> 8;
            const t = (blk[i - w * 3] * 77 + blk[i - w * 3 + 1] * 150 + blk[i - w * 3 + 2] * 29) >> 8;
            const b = (blk[i + w * 3] * 77 + blk[i + w * 3 + 1] * 150 + blk[i + w * 3 + 2] * 29) >> 8;
            const l = (blk[i - 3] * 77 + blk[i - 2] * 150 + blk[i - 1] * 29) >> 8;
            const r = (blk[i + 3] * 77 + blk[i + 4] * 150 + blk[i + 5] * 29) >> 8;
            const lap = 4 * c - l - r - t - b;
            sum += Math.abs(lap);
            n++;
        }
    }
    return n ? sum / n : 0;
}
function classifyBlock(blk, w, h) {
    const v = luminanceVariance(blk);
    const g = gradientEnergy(blk, w, h);
    const lap = laplacianEnergyLuma(blk, w, h);
    // Strong variance + high micro-contrast => treat as noise-heavy (prefer plane / raw paths).
    if ((v > 1800 && g > 32 && lap > 22) || (v > 2200 && g > 28) || lap > 38)
        return 'noise';
    if (g > 18)
        return 'edge';
    return 'flat';
}
function encodeVectorCore(width, height, rgb, dirBits) {
    const pixels = width * height;
    const codebook = buildCodebook(dirBits);
    const dirU16 = new Uint16Array(pixels);
    const lqDelta = new Int16Array(pixels);
    const residual = new Int16Array(pixels * 3);
    let prevLq = 0;
    for (let i = 0; i < pixels; i++) {
        const j = i * 3;
        const R = rgb[j];
        const G = rgb[j + 1];
        const B = rgb[j + 2];
        const dir = quantizeDirection(R, G, B, dirBits);
        dirU16[i] = dir;
        const L = Math.hypot(R, G, B);
        const Lq = Math.round(L * 64);
        lqDelta[i] = Lq - prevLq;
        prevLq = Lq;
        const d = codebook[dir];
        const scale = Lq / 64;
        const r0 = clamp8(Math.round(scale * d[0]));
        const g0 = clamp8(Math.round(scale * d[1]));
        const b0 = clamp8(Math.round(scale * d[2]));
        residual[j] = R - r0;
        residual[j + 1] = G - g0;
        residual[j + 2] = B - b0;
    }
    let dirRaw;
    if (dirBits === 8) {
        dirRaw = new Uint8Array(pixels);
        for (let i = 0; i < pixels; i++)
            dirRaw[i] = dirU16[i];
    }
    else {
        dirRaw = packU9(dirU16);
    }
    const dLRaw = toU16BE(lqDelta);
    const resRaw = toU16BE(residual);
    const signRaw = new Uint8Array(Math.ceil(pixels / 8)); // reserved for future signed-vector mode
    const dirComp = entropyEncode(dirRaw);
    const signComp = entropyEncode(signRaw);
    const dLComp = entropyEncode(dLRaw);
    const resComp = entropyEncode(resRaw);
    return concat([
        new Uint8Array([0, dirBits, 6, 0, 0]), // mode=0(vector), dirBits, Lq fractional bits (=6), reserved
        writeU32BE(dirComp.length),
        writeU32BE(signComp.length),
        writeU32BE(dLComp.length),
        writeU32BE(resComp.length),
        dirComp,
        signComp,
        dLComp,
        resComp,
    ]);
}
function encodeClassicCore(width, height, rgb) {
    const classicComp = entropyEncode(filterSubRgb(width, height, rgb));
    return concat([new Uint8Array([1]), writeU32BE(classicComp.length), classicComp]);
}
/** Deinterleave RGB, Sub-filter each plane, stack; often beats interleaved Sub on high-noise blocks. */
function encodePlaneStackCore(width, height, rgb) {
    const n = width * height;
    const r = new Uint8Array(n);
    const g = new Uint8Array(n);
    const b = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
        const j = i * 3;
        r[i] = rgb[j];
        g[i] = rgb[j + 1];
        b[i] = rgb[j + 2];
    }
    const fr = filterSubGray(width, height, r);
    const fg = filterSubGray(width, height, g);
    const fb = filterSubGray(width, height, b);
    const stacked = concat([fr, fg, fb]);
    const comp = entropyEncode(stacked);
    return concat([new Uint8Array([4]), writeU32BE(comp.length), comp]);
}
function decodePlaneStack(width, height, stacked) {
    const n = width * height;
    if (stacked.length !== n * 3)
        throw new Error('Plane stack size mismatch');
    const r = unfilterSubGray(width, height, stacked.subarray(0, n));
    const g = unfilterSubGray(width, height, stacked.subarray(n, n * 2));
    const b = unfilterSubGray(width, height, stacked.subarray(n * 2, n * 3));
    const rgb = new Uint8Array(n * 3);
    for (let i = 0; i < n; i++) {
        const j = i * 3;
        rgb[j] = r[i];
        rgb[j + 1] = g[i];
        rgb[j + 2] = b[i];
    }
    return rgb;
}
function encodeBlockAdaptive(width, height, rgb, dirBits) {
    const block = 16;
    const blocksX = Math.ceil(width / block);
    const blocksY = Math.ceil(height / block);
    const chunks = [
        new Uint8Array([2, block, dirBits, 0, 0]),
        writeU32BE(blocksX),
        writeU32BE(blocksY),
    ];
    for (let by = 0; by < blocksY; by++) {
        for (let bx = 0; bx < blocksX; bx++) {
            const r = {
                x: bx * block,
                y: by * block,
                w: Math.min(block, width - bx * block),
                h: Math.min(block, height - by * block),
            };
            const blk = extractBlock(width, rgb, r);
            const cls = classifyBlock(blk, r.w, r.h);
            const vecPayload = encodeVectorCore(r.w, r.h, blk, dirBits);
            const classicPayload = encodeClassicCore(r.w, r.h, blk);
            const planePayload = encodePlaneStackCore(r.w, r.h, blk);
            const rawComp = entropyEncode(blk);
            const rawPayload = concat([new Uint8Array([3]), writeU32BE(rawComp.length), rawComp]);
            let best = vecPayload;
            if (cls === 'edge' && classicPayload.length <= best.length)
                best = classicPayload;
            if (classicPayload.length < best.length)
                best = classicPayload;
            if (planePayload.length < best.length)
                best = planePayload;
            if (cls === 'noise' && rawPayload.length < best.length)
                best = rawPayload;
            chunks.push(new Uint8Array([r.w, r.h]), writeU32BE(best.length), best);
        }
    }
    return concat(chunks);
}
/**
 * Vector-primary lossless profile:
 * - low-bit direction index (8/9)
 * - differential luminance proxy Lq (Q6 of Euclidean norm)
 * - exact RGB residual (lossless guarantee)
 * - all streams compressed independently with deflate
 */
export function encodeVectorLossless(opts) {
    const { width, height, rgb } = opts;
    const dirBits = opts.dirBits ?? 8;
    if (dirBits !== 8 && dirBits !== 9)
        throw new Error('dirBits must be 8 or 9');
    if (rgb.length !== width * height * 3)
        throw new Error('RGB buffer size mismatch');
    const vectorPayload = encodeBlockAdaptive(width, height, rgb, dirBits);
    if (opts.skipClassicFallback)
        return vectorPayload;
    const classicPayload = encodeClassicCore(width, height, rgb);
    return classicPayload.length < vectorPayload.length ? classicPayload : vectorPayload;
}
export function decodeVectorLossless(payload, width, height) {
    if (payload.length < 1)
        throw new Error('Truncated vector payload');
    let o = 0;
    const mode = payload[o++];
    if (mode === 1) {
        if (o + 4 > payload.length)
            throw new Error('Truncated vector fallback header');
        const compLen = readU32BE(payload, o);
        o += 4;
        if (o + compLen > payload.length)
            throw new Error('Truncated vector fallback payload');
        const filtered = entropyDecode(payload.subarray(o, o + compLen));
        const rgb = unfilterSubRgb(width, height, filtered);
        return { width, height, rgb, dirBits: 0 };
    }
    if (mode === 4) {
        if (o + 4 > payload.length)
            throw new Error('Truncated plane-stack header');
        const compLen = readU32BE(payload, o);
        o += 4;
        if (o + compLen > payload.length)
            throw new Error('Truncated plane-stack payload');
        const filtered = entropyDecode(payload.subarray(o, o + compLen));
        const rgb = decodePlaneStack(width, height, filtered);
        return { width, height, rgb, dirBits: 0 };
    }
    if (mode === 2) {
        if (payload.length < 5 + 8)
            throw new Error('Truncated block-adaptive payload');
        const block = payload[o++];
        const dirBits = payload[o++];
        o += 2;
        const blocksX = readU32BE(payload, o);
        o += 4;
        const blocksY = readU32BE(payload, o);
        o += 4;
        const rgb = new Uint8Array(width * height * 3);
        for (let by = 0; by < blocksY; by++) {
            for (let bx = 0; bx < blocksX; bx++) {
                if (o + 2 + 4 > payload.length)
                    throw new Error('Truncated block header');
                const bw = payload[o++];
                const bh = payload[o++];
                const len = readU32BE(payload, o);
                o += 4;
                if (o + len > payload.length)
                    throw new Error('Truncated block payload');
                const blkPayload = payload.subarray(o, o + len);
                o += len;
                let blk;
                const blkMode = blkPayload[0];
                if (blkMode === 3) {
                    if (blkPayload.length < 5)
                        throw new Error('Truncated raw block');
                    const compLen = readU32BE(blkPayload, 1);
                    const raw = entropyDecode(blkPayload.subarray(5, 5 + compLen));
                    blk = raw;
                }
                else {
                    blk = decodeVectorLossless(blkPayload, bw, bh).rgb;
                }
                placeBlock(width, rgb, { x: bx * block, y: by * block, w: bw, h: bh }, blk);
            }
        }
        return { width, height, rgb, dirBits };
    }
    if (mode !== 0)
        throw new Error('Unsupported vector payload mode');
    if (payload.length < 5 + 16)
        throw new Error('Truncated vector payload');
    const dirBits = payload[o++];
    const lFrac = payload[o++];
    o += 2; // reserved
    if ((dirBits !== 8 && dirBits !== 9) || lFrac !== 6)
        throw new Error('Unsupported vector profile settings');
    const dirCompLen = readU32BE(payload, o);
    o += 4;
    const signCompLen = readU32BE(payload, o);
    o += 4;
    const dLCompLen = readU32BE(payload, o);
    o += 4;
    const resCompLen = readU32BE(payload, o);
    o += 4;
    const end = o + dirCompLen + signCompLen + dLCompLen + resCompLen;
    if (end > payload.length)
        throw new Error('Truncated vector stream');
    const dirComp = payload.subarray(o, o + dirCompLen);
    o += dirCompLen;
    const _signComp = payload.subarray(o, o + signCompLen);
    o += signCompLen;
    const dLComp = payload.subarray(o, o + dLCompLen);
    o += dLCompLen;
    const resComp = payload.subarray(o, o + resCompLen);
    const pixels = width * height;
    const dirRaw = entropyDecode(dirComp);
    const dLRaw = entropyDecode(dLComp);
    const resRaw = entropyDecode(resComp);
    const dirs = dirBits === 8 ? Uint16Array.from(dirRaw) : unpackU9(dirRaw, pixels);
    const lqDelta = fromU16BE(dLRaw, pixels);
    const residual = fromU16BE(resRaw, pixels * 3);
    const codebook = buildCodebook(dirBits);
    const rgb = new Uint8Array(pixels * 3);
    let prevLq = 0;
    for (let i = 0; i < pixels; i++) {
        const j = i * 3;
        const Lq = prevLq + lqDelta[i];
        prevLq = Lq;
        const d = codebook[dirs[i]];
        const scale = Lq / 64;
        const r0 = clamp8(Math.round(scale * d[0]));
        const g0 = clamp8(Math.round(scale * d[1]));
        const b0 = clamp8(Math.round(scale * d[2]));
        rgb[j] = clamp8(r0 + residual[j]);
        rgb[j + 1] = clamp8(g0 + residual[j + 1]);
        rgb[j + 2] = clamp8(b0 + residual[j + 2]);
    }
    return { width, height, rgb, dirBits };
}
