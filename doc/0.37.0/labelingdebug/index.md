---
title: LabelingDebug
kind: class
longname: LabelingDebug
description: Helper for the LabelingFilter, provides a debug display for diameters and contours. Temporary until a proper way of rendering them is added.
---

# LabelingDebug

<SourceLink href="/source/src/image/labelingdebug-js/#L13" label="labelingDebug.js:13" />

Helper for the LabelingFilter, provides a debug display for diameters and contours.

Temporary until a proper way of rendering them is added.

---

## Constructor

<Signature code="new LabelingDebug(): LabelingDebug" />

---

## Instance Methods

<MemberHeading id="cleanbuffer" depth="3" name="cleanBuffer" sig="cleanBuffer(imageBuffer: Uint8Array)" />

<MemberMeta sourceHref="/source/src/image/labelingdebug-js/#L20" sourceLabel="labelingDebug.js:20" />

Cleans buffer of debug lines before calculations.

**Parameters**

- `imageBuffer` (Uint8Array) — The image buffer to clean.

<MemberHeading
  id="drawdebuglines"
  depth="3"
  name="drawDebugLines"
  sig="drawDebugLines(
	imageBuffer: Uint8Array,
	unitVectors: Array.<number>,
	sizes: Array.<number>,
	spacing: Array.<number>,
	borders: Int32Array,
	maxDiameters: object,
)"
/>

<MemberMeta sourceHref="/source/src/image/labelingdebug-js/#L178" sourceLabel="labelingDebug.js:178" />

Renders debug lines for contours and diameters. The pixel value of the debug lines are the segmentation label of the segment + 128.

**Parameters**

- `imageBuffer` (Uint8Array) — The image buffer to draw debug lines on.
- `unitVectors` (Array.\<number>) — The unit vectors for index to offset conversion.
- `sizes` (Array.\<number>) — The image dimensions.
- `spacing` (Array.\<number>) — The pixel spacing of the image.
- `borders` (Int32Array) — The buffer containing the border pixel arrays.
- `maxDiameters` (object) — The dictionary of calculated diameters.
