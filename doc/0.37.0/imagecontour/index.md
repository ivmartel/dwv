---
title: ImageContour
kind: class
longname: ImageContour
description: "Image contour buffer manager. Caches per-pixel distance-to-border values for contour rendering. Stores 3 distance values per pixel (one per orientation: x, y, z)."
---

# ImageContour

<SourceLink href="/source/src/image/imagecontour-js/#L18" label="imageContour.js:18" />

Image contour buffer manager. Caches per-pixel distance-to-border values for contour rendering. Stores 3 distance values per pixel (one per orientation: x, y, z).

---

## Constructor

<Signature code="new ImageContour(): ImageContour" />

---

## Instance Methods

<MemberHeading id="initialize" depth="3" name="initialize" sig="initialize(imageBuffer: Uint8Array, imageSize: Size)" />

<MemberMeta sourceHref="/source/src/image/imagecontour-js/#L50" sourceLabel="imageContour.js:50" />

Initialize the contour buffer. Should be called on every segmentation image, or any image where contour rendering needs to be supported.

**Parameters**

- `imageBuffer` (Uint8Array) — The image data buffer.
- `imageSize` ([Size](/size)) — The image size.

<MemberHeading id="isinitialized" depth="3" name="isInitialized" sig="isInitialized(): boolean" />

<MemberMeta sourceHref="/source/src/image/imagecontour-js/#L61" sourceLabel="imageContour.js:61" />

Get whether or not the contour buffer has been initialized.

**Returns**

- `boolean` — True if buffer has been initialized.

<MemberHeading id="realloc" depth="3" name="realloc" sig="realloc(imageBuffer: Uint8Array, imageSize: Size)" />

<MemberMeta sourceHref="/source/src/image/imagecontour-js/#L72" sourceLabel="imageContour.js:72" />

Re-allocate contour buffer memory after an image buffer resize. Updates the stored image buffer and size references.

**Parameters**

- `imageBuffer` (Uint8Array) — The new image data buffer.
- `imageSize` ([Size](/size)) — The new image size.

<MemberHeading
  id="shiftslice"
  depth="3"
  name="shiftSlice"
  sig="shiftSlice(
	contourIndexOffset: number,
	contourSliceSize: number,
	contourMaxOffset: number,
)"
/>

<MemberMeta sourceHref="/source/src/image/imagecontour-js/#L90" sourceLabel="imageContour.js:90" />

Shift contour buffer content to make room for an inserted slice.

**Parameters**

- `contourIndexOffset` (number) — Start offset of the slice to shift.
- `contourSliceSize` (number) — Size of one contour slice.
- `contourMaxOffset` (number) — End offset of content to shift.

<MemberHeading id="resetaroundoffset" depth="3" name="resetAroundOffset" sig="resetAroundOffset(offset: number)" />

<MemberMeta sourceHref="/source/src/image/imagecontour-js/#L115" sourceLabel="imageContour.js:115" />

Reset contour buffer for the values around an offset. Prevents certain artifacts, especially at small brush sizes and when erasing.

**Parameters**

- `offset` (number) — The offset to reset.

<MemberHeading id="getdistance" depth="3" name="getDistance" sig="getDistance(index: number, viewOrientation: Matrix33): number" />

<MemberMeta sourceHref="/source/src/image/imagecontour-js/#L254" sourceLabel="imageContour.js:254" />

Calculate the distance to the nearest border pixel (or return the cached distance). Returns 0 if the contour buffer is not initialized.

**Parameters**

- `index` (number) — Index/offset of the pixel to check.
- `viewOrientation` ([Matrix33](/matrix33)) — The orientation of the view.

**Returns**

- `number` — The distance to the nearest border pixel or 0.
