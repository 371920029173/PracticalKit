/** Magic + version byte for `.rgbv3d` container v1 */
export const MAGIC_RGBV3D = new Uint8Array([0x52, 0x47, 0x42, 0x56, 0x33, 0x44, 0x01]); // "RGBV3D" + 0x01
/** Magic for `.rgbv3dv` v1 */
export const MAGIC_RGBV3DV = new Uint8Array([0x52, 0x47, 0x42, 0x56, 0x33, 0x44, 0x56, 0x01]);
/** Magic for inter-frame `.rgbv3dvi` v1 */
export const MAGIC_RGBV3DVI = new Uint8Array([0x52, 0x47, 0x42, 0x56, 0x33, 0x44, 0x49, 0x01]);
export const PROFILE_LOSSLESS_RGB_SUB_DEFLATE = 0;
export const PROFILE_LOSSLESS_VECTOR_V2 = 1;
