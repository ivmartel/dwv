import {describe, test, assert} from 'vitest';
import {RleDecoder} from '../../../src/decoders/dwv/rle.js';

/**
 * Tests for the 'decoders/dwv/rle.js' file.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Create a RLE fragment from already encoded segments: 64 bytes header
 * (number of segments + 15 segment offsets) followed by the segments.
 * Ref: {@link https://dicom.nema.org/medical/dicom/current/output/chtml/part05/sect_G.5.html}.
 *
 * @param {number[][]} segments The encoded segments, as byte values
 *   (negative counts can be given as signed values).
 * @returns {Uint8Array} The RLE fragment.
 */
function getRleFragment(segments) {
  const headerSize = 64;
  let size = headerSize;
  for (const segment of segments) {
    size += segment.length;
  }
  const fragment = new Uint8Array(size);
  const header = new DataView(fragment.buffer);
  header.setUint32(0, segments.length, true);
  let offset = headerSize;
  for (let i = 0; i < segments.length; ++i) {
    header.setUint32((i + 1) * 4, offset, true);
    // Uint8Array.set wraps negative values (-1 -> 0xff)
    fragment.set(segments[i], offset);
    offset += segments[i].length;
  }
  return fragment;
}

/**
 * Decode a fragment.
 *
 * @param {Uint8Array} fragment The RLE fragment.
 * @param {object} meta The meta data: {bitsAllocated, isSigned,
 *   sliceSize, samplesPerPixel, planarConfiguration}.
 * @returns {TypedArray} The decoded data.
 */
function decode(fragment, meta) {
  return new RleDecoder().decode(
    fragment,
    meta.bitsAllocated,
    meta.isSigned,
    meta.sliceSize,
    meta.samplesPerPixel,
    meta.planarConfiguration
  );
}

const mono8 = {
  bitsAllocated: 8,
  isSigned: false,
  samplesPerPixel: 1
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('decoders', () => {

  describe('RleDecoder', () => {

    describe('runs', () => {

      test('literal run', () => {
        // count n >= 0: copy the next n + 1 bytes
        const fragment = getRleFragment([[3, 1, 2, 3, 4]]);
        const decoded = decode(fragment, {...mono8, sliceSize: 4});
        assert.deepEqual(Array.from(decoded), [1, 2, 3, 4]);
      });

      test('replicate run', () => {
        // count -n (n in [1, 127]): repeat the next byte n + 1 times
        const fragment = getRleFragment([[-3, 7]]);
        const decoded = decode(fragment, {...mono8, sliceSize: 4});
        assert.deepEqual(Array.from(decoded), [7, 7, 7, 7]);
      });

      test('mixed runs', () => {
        const fragment = getRleFragment([[1, 5, 6, -2, 9, 0, 3]]);
        const decoded = decode(fragment, {...mono8, sliceSize: 6});
        assert.deepEqual(Array.from(decoded), [5, 6, 9, 9, 9, 3]);
      });

      test('-128 is a no-op', () => {
        const fragment = getRleFragment([[-128, 1, 10, 11]]);
        const decoded = decode(fragment, {...mono8, sliceSize: 2});
        assert.deepEqual(Array.from(decoded), [10, 11]);
      });

      test('odd segment padded with zero', () => {
        // segments have an even length, padded with a trailing zero
        const fragment = getRleFragment([[1, 4, 5, 0]]);
        const decoded = decode(fragment, {...mono8, sliceSize: 2});
        assert.deepEqual(Array.from(decoded), [4, 5]);
      });

      test('fragment not at the start of its buffer', () => {
        // decoded data is usually a view on the full file buffer
        const fragment = getRleFragment([[1, 4, 5]]);
        const buffer = new Uint8Array(fragment.length + 4);
        buffer.set(fragment, 4);
        const view = buffer.subarray(4);
        const decoded = decode(view, {...mono8, sliceSize: 2});
        assert.deepEqual(Array.from(decoded), [4, 5]);
      });

    });

    describe('8 bits', () => {

      test('unsigned', () => {
        const fragment = getRleFragment([[2, 0, 128, 255]]);
        const decoded = decode(fragment, {...mono8, sliceSize: 3});
        assert.ok(decoded instanceof Uint8Array, 'Uint8Array');
        assert.deepEqual(Array.from(decoded), [0, 128, 255]);
      });

      test('signed', () => {
        const fragment = getRleFragment([[2, -1, -128, 5]]);
        const decoded = decode(
          fragment, {...mono8, isSigned: true, sliceSize: 3});
        assert.ok(decoded instanceof Int8Array, 'Int8Array');
        assert.deepEqual(Array.from(decoded), [-1, -128, 5]);
      });

    });

    describe('16 bits', () => {

      // one segment per byte, most significant byte first
      const meta16 = {
        bitsAllocated: 16,
        samplesPerPixel: 1,
        sliceSize: 3
      };

      test('unsigned', () => {
        // values: 0x0102, 0x0304, 0xff00
        const fragment = getRleFragment([
          [2, 0x01, 0x03, 0xff],
          [2, 0x02, 0x04, 0x00]
        ]);
        const decoded = decode(fragment, {...meta16, isSigned: false});
        assert.ok(decoded instanceof Uint16Array, 'Uint16Array');
        assert.deepEqual(Array.from(decoded), [0x0102, 0x0304, 0xff00]);
      });

      test('signed', () => {
        // values: -1 (0xffff), -2 (0xfffe), 256 (0x0100)
        const fragment = getRleFragment([
          [-1, 0xff, 0, 0x01],
          [2, 0xff, 0xfe, 0x00]
        ]);
        const decoded = decode(fragment, {...meta16, isSigned: true});
        assert.ok(decoded instanceof Int16Array, 'Int16Array');
        assert.deepEqual(Array.from(decoded), [-1, -2, 256]);
      });

    });

    describe('RGB', () => {

      // one segment per sample: R, G, B
      const segments = [
        [1, 10, 20],
        [1, 30, 40],
        [1, 50, 60]
      ];
      const metaRgb = {
        bitsAllocated: 8,
        isSigned: false,
        samplesPerPixel: 3,
        sliceSize: 2
      };

      test('planar configuration 0: interleaved', () => {
        const decoded = decode(
          getRleFragment(segments), {...metaRgb, planarConfiguration: 0});
        assert.deepEqual(
          Array.from(decoded), [10, 30, 50, 20, 40, 60]);
      });

      test('planar configuration 1: by plane', () => {
        const decoded = decode(
          getRleFragment(segments), {...metaRgb, planarConfiguration: 1});
        assert.deepEqual(
          Array.from(decoded), [10, 20, 30, 40, 50, 60]);
      });

    });

  });

});
