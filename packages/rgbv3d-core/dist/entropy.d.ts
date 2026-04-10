export type EntropyCodec = 'deflate-raw';
/**
 * Entropy adapter (v1): keeps API stable for future rANS/range-coder swap.
 */
export declare function entropyEncode(data: Uint8Array, codec?: EntropyCodec): Uint8Array;
export declare function entropyDecode(data: Uint8Array, codec?: EntropyCodec): Uint8Array;
//# sourceMappingURL=entropy.d.ts.map