/**
 * Reads pixel dimensions out of an image header.
 *
 * Enough of PNG, GIF and JPEG to cover what the posts use. The build already
 * has every image in memory, so this costs nothing and lets each `<img>` ship
 * width and height, which is what stops the page reflowing as images arrive.
 */
export type Dimensions = { width: number; height: number };

export function imageSize(bytes: ArrayBuffer): Dimensions | undefined {
	const view = new DataView(bytes);
	if (view.byteLength < 24) return undefined;

	// PNG: 8-byte signature, then an IHDR chunk carrying the dimensions.
	if (view.getUint32(0) === 0x89504e47 && view.getUint32(4) === 0x0d0a1a0a) {
		return { width: view.getUint32(16), height: view.getUint32(20) };
	}

	// GIF: "GIF8", then the logical screen descriptor, little-endian.
	if (view.getUint32(0) === 0x47494638) {
		return { width: view.getUint16(6, true), height: view.getUint16(8, true) };
	}

	// JPEG: walk the segment chain to the start-of-frame marker.
	if (view.getUint16(0) === 0xffd8) {
		let offset = 2;
		while (offset + 9 < view.byteLength) {
			if (view.getUint8(offset) !== 0xff) return undefined;

			const marker = view.getUint8(offset + 1);
			const length = view.getUint16(offset + 2);

			// SOFn, excluding the huffman/arithmetic coding tables that share
			// the same high nibble.
			const isFrame =
				marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
			if (isFrame) {
				return { height: view.getUint16(offset + 5), width: view.getUint16(offset + 7) };
			}

			if (length < 2) return undefined;
			offset += 2 + length;
		}
	}

	return undefined;
}
