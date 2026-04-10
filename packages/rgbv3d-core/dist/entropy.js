import pako from 'pako';
/**
 * Entropy adapter (v1): keeps API stable for future rANS/range-coder swap.
 */
export function entropyEncode(data, codec = 'deflate-raw') {
    if (codec !== 'deflate-raw')
        throw new Error(`Unsupported entropy codec: ${codec}`);
    return pako.deflateRaw(data, { level: 9 });
}
export function entropyDecode(data, codec = 'deflate-raw') {
    if (codec !== 'deflate-raw')
        throw new Error(`Unsupported entropy codec: ${codec}`);
    return pako.inflateRaw(data);
}
