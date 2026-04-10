import { decodeRgbV3d, decodeRgbV3dVideoInter, encodeRgbLossless, encodeRgbV3dVideoInter } from './index.js';
const w = 17;
const h = 13;
const rgb = new Uint8Array(w * h * 3);
for (let i = 0; i < rgb.length; i++)
    rgb[i] = (i * 37 + 11) % 256;
const blob = encodeRgbLossless({ width: w, height: h, rgb });
const back = decodeRgbV3d(blob);
if (back.width !== w || back.height !== h)
    throw new Error('dims');
for (let i = 0; i < rgb.length; i++)
    if (rgb[i] !== back.rgb[i])
        throw new Error(`byte ${i}`);
const blobV2 = encodeRgbLossless({ width: w, height: h, rgb, profile: 1, dirBits: 8 });
const backV2 = decodeRgbV3d(blobV2);
if (backV2.width !== w || backV2.height !== h)
    throw new Error('dims v2');
for (let i = 0; i < rgb.length; i++)
    if (rgb[i] !== backV2.rgb[i])
        throw new Error(`byte v2 ${i}`);
const rgb2 = new Uint8Array(rgb.length);
for (let i = 0; i < rgb.length; i++)
    rgb2[i] = (rgb[i] + 3) & 0xff;
const iv = encodeRgbV3dVideoInter({
    width: w,
    height: h,
    framesRgb: [rgb, rgb2],
    fpsNumerator: 24,
    fpsDenominator: 1,
    keyframeProfile: 1,
});
const dv = decodeRgbV3dVideoInter(iv);
if (dv.frameRgbs.length !== 2)
    throw new Error('video frame count');
for (let i = 0; i < rgb.length; i++)
    if (dv.frameRgbs[1][i] !== rgb2[i])
        throw new Error(`video byte ${i}`);
console.log('rgbv3d selftest OK', blob.length, blobV2.length, iv.length);
