---
title: RleDecoder
kind: class
longname: RleDecoder
description: RLE (Run-length encoding) decoder class.
---

# RleDecoder

<SourceLink href="/source/src/decoders/dwv/rle-js/#L4" label="rle.js:4" />

RLE (Run-length encoding) decoder class.

---

## Constructor

<Signature code="new RleDecoder(): RleDecoder" />

---

## Instance Methods

<MemberHeading
  id="decode"
  depth="3"
  name="decode"
  sig="decode(
	buffer: Array,
	bitsAllocated: number,
	isSigned: boolean,
	sliceSize: number,
	samplesPerPixel: number,
	planarConfiguration: number,
): Array"
/>

<MemberMeta sourceHref="/source/src/decoders/dwv/rle-js/#L20" sourceLabel="rle.js:20" />

Decode a RLE buffer. Ref: [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part05/sect\_G.3.html](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part05/sect_G.3.html).

**Parameters**

- `buffer` (Array) — The buffer to decode.
- `bitsAllocated` (number) — The bits allocated per element in the buffer.
- `isSigned` (boolean) — Is the data signed.
- `sliceSize` (number) — The size of a slice (number of rows per number of columns).
- `samplesPerPixel` (number) — The number of samples per pixel (3 for RGB).
- `planarConfiguration` (number) — The planar configuration.

**Returns**

- `Array` — The decoded buffer as a typed array.
