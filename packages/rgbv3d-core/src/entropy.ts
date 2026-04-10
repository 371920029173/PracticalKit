import pako from 'pako';

export type EntropyCodec = 'deflate-raw';

/**
 * Entropy adapter (v1): keeps API stable for future rANS/range-coder swap.
 */
export function entropyEncode(data: Uint8Array, codec: EntropyCodec = 'deflate-raw'): Uint8Array {
  if (codec !== 'deflate-raw') throw new Error(`Unsupported entropy codec: ${codec}`);
  return pako.deflateRaw(data, { level: 9 });
}

export function entropyDecode(data: Uint8Array, codec: EntropyCodec = 'deflate-raw'): Uint8Array {
  if (codec !== 'deflate-raw') throw new Error(`Unsupported entropy codec: ${codec}`);
  return pako.inflateRaw(data);
}

