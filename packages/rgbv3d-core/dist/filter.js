/** PNG filter 1 (Sub): each byte minus previous pixel same channel (mod 256). */
export function filterSubRgb(width, height, rgb) {
    const stride = width * 3;
    const out = new Uint8Array(stride * height);
    for (let y = 0; y < height; y++) {
        const row = y * stride;
        for (let x = 0; x < width; x++) {
            const i = row + x * 3;
            const R = rgb[i];
            const G = rgb[i + 1];
            const B = rgb[i + 2];
            if (x === 0) {
                out[i] = R;
                out[i + 1] = G;
                out[i + 2] = B;
            }
            else {
                const j = i - 3;
                out[i] = (R - rgb[j] + 256) & 0xff;
                out[i + 1] = (G - rgb[j + 1] + 256) & 0xff;
                out[i + 2] = (B - rgb[j + 2] + 256) & 0xff;
            }
        }
    }
    return out;
}
export function unfilterSubRgb(width, height, filtered) {
    const stride = width * 3;
    const rgb = new Uint8Array(stride * height);
    for (let y = 0; y < height; y++) {
        const row = y * stride;
        for (let x = 0; x < width; x++) {
            const i = row + x * 3;
            if (x === 0) {
                rgb[i] = filtered[i];
                rgb[i + 1] = filtered[i + 1];
                rgb[i + 2] = filtered[i + 2];
            }
            else {
                const j = i - 3;
                rgb[i] = (filtered[i] + rgb[j]) & 0xff;
                rgb[i + 1] = (filtered[i + 1] + rgb[j + 1]) & 0xff;
                rgb[i + 2] = (filtered[i + 2] + rgb[j + 2]) & 0xff;
            }
        }
    }
    return rgb;
}
/** PNG filter 1 (Sub) on a single plane (row-major). */
export function filterSubGray(width, height, plane) {
    const out = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
        const row = y * width;
        for (let x = 0; x < width; x++) {
            const i = row + x;
            const v = plane[i];
            if (x === 0)
                out[i] = v;
            else
                out[i] = (v - plane[i - 1] + 256) & 0xff;
        }
    }
    return out;
}
export function unfilterSubGray(width, height, filtered) {
    const plane = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
        const row = y * width;
        for (let x = 0; x < width; x++) {
            const i = row + x;
            if (x === 0)
                plane[i] = filtered[i];
            else
                plane[i] = (filtered[i] + plane[i - 1]) & 0xff;
        }
    }
    return plane;
}
