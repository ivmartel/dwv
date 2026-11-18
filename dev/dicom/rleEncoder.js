/**
 * Encode a byte segment using the PackBits scheme.
 * Ref: {@link https://dicom.nema.org/medical/dicom/current/output/chtml/part05/sect_G.3.html}.
 *
 * @param {Uint8Array} bytes The bytes to encode.
 * @returns {number[]} The encoded bytes, padded to an even length.
 */
function encodeRleSegment(bytes) {
  const res = [];
  const length = bytes.length;
  let i = 0;
  while (i < length) {
    // replicate run
    let runLength = 1;
    while (i + runLength < length &&
      runLength < 128 &&
      bytes[i + runLength] === bytes[i]) {
      ++runLength;
    }
    if (runLength > 1) {
      // -runLength + 1, as unsigned byte
      res.push(257 - runLength);
      res.push(bytes[i]);
      i += runLength;
    } else {
      // literal run: stop before the start of a replicate run
      let j = i + 1;
      while (j < length &&
        j - i < 128 &&
        !(j + 1 < length && bytes[j] === bytes[j + 1])) {
        ++j;
      }
      res.push(j - i - 1);
      for (let k = i; k < j; ++k) {
        res.push(bytes[k]);
      }
      i = j;
    }
  }
  // pad to even length
  if (res.length % 2 !== 0) {
    res.push(0);
  }
  return res;
}

/**
 * Encode a frame using RLE (Run-length encoding).
 * Ref: {@link https://dicom.nema.org/medical/dicom/current/output/chtml/part05/chapter_G.html}.
 *
 * @param {TypedArray} frame The frame pixels (one element per sample).
 * @param {number} bitsAllocated The bits allocated (8 or 16).
 * @param {number} samplesPerPixel The number of samples per pixel.
 * @param {number} planarConfiguration The planar configuration.
 * @returns {Uint8Array} The RLE encoded frame (header + segments).
 */
export function encodeRleFrame(
  frame, bitsAllocated, samplesPerPixel, planarConfiguration) {
  if (bitsAllocated !== 8 && bitsAllocated !== 16) {
    throw new Error(
      `Unsupported BitsAllocated for RLE encoding: ${bitsAllocated}`);
  }
  const bpe = bitsAllocated / 8;
  const numberOfPixels = frame.length / samplesPerPixel;

  // one segment per sample and per byte, most significant byte first
  const segments = [];
  for (let s = 0; s < samplesPerPixel; ++s) {
    for (let b = bpe - 1; b >= 0; --b) {
      const bytes = new Uint8Array(numberOfPixels);
      for (let p = 0; p < numberOfPixels; ++p) {
        let index = p;
        if (samplesPerPixel !== 1) {
          index = planarConfiguration === 0
            ? p * samplesPerPixel + s
            : s * numberOfPixels + p;
        }
        bytes[p] = (frame[index] >> (8 * b)) & 0xff;
      }
      segments.push(encodeRleSegment(bytes));
    }
  }

  // header: number of segments + 15 offsets
  const headerSize = 64;
  let size = headerSize;
  for (const segment of segments) {
    size += segment.length;
  }
  const res = new Uint8Array(size);
  const header = new DataView(res.buffer);
  header.setUint32(0, segments.length, true);
  let offset = headerSize;
  for (let i = 0; i < segments.length; ++i) {
    header.setUint32((i + 1) * 4, offset, true);
    res.set(segments[i], offset);
    offset += segments[i].length;
  }
  return res;
}
