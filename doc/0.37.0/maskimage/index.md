---
title: MaskImage
kind: class
longname: MaskImage
description: "Mask (segmentation) image class. Extends {@link Image} with a {@link SegmentCollection} and the segment-aware behavior built on top of it: per-segment/per-slice bookkeeping, the brush tool's offset-editing methods, and per-segment labeling statistics (volume/centroid/diameter)."
---

# MaskImage

<SourceLink href="/source/src/image/maskimage-js/#L30" label="maskImage.js:30" />

Mask (segmentation) image class. Extends [Image](/image) with a [SegmentCollection](/segmentcollection) and the segment-aware behavior built on top of it: per-segment/per-slice bookkeeping, the brush tool's offset-editing methods, and per-segment labeling statistics (volume/centroid/diameter).

---

## Constructor

<Signature
  code="new MaskImage(
	geometry: Geometry,
	buffer: Uint8Array,
	imageUids?: Array.<string>,
	segmentCollection?: SegmentCollection,
): MaskImage"
/>

**Parameters**

- `geometry` ([Geometry](/geometry)) — The geometry of the image.
- `buffer` (Uint8Array) — The mask data as a one dimensional buffer: one byte per voxel, 0 for background, the segment number otherwise.
- `imageUids` (Array.\<string>, optional) — An array of Uids indexed to slice number.
- `segmentCollection` ([SegmentCollection](/segmentcollection), optional) — The segment collection, for a mask already parsed from DICOM (its own label map already aliases `buffer`). When omitted (brush-created masks), a fresh collection is created and its label map is aliased to `buffer`.

---

## Instance Methods

<MemberHeading id="initializecontour" depth="3" name="initializeContour" sig="initializeContour()" />

<MemberMeta sourceHref="/source/src/image/maskimage-js/#L119" sourceLabel="maskImage.js:119" />

Initialize the contour buffer. Should be called on every segmentation image, or any image where contour rendering needs to be supported.

<MemberHeading id="getcontour" depth="3" name="getContour" sig="getContour(): ImageContour" />

<MemberMeta sourceHref="/source/src/image/maskimage-js/#L133" sourceLabel="maskImage.js:133" />

Get the image contour. Should only be available for segmentation images, but can be initialized for any Uint8Array image.

**Returns**

- [`ImageContour`](/imagecontour) — The image contour.

<MemberHeading id="getsegmentcollection" depth="3" name="getSegmentCollection" sig="getSegmentCollection(): SegmentCollection" />

<MemberMeta sourceHref="/source/src/image/maskimage-js/#L142" sourceLabel="maskImage.js:142" />

Get the segment collection.

**Returns**

- [`SegmentCollection`](/segmentcollection) — The segment collection.

<MemberHeading id="gethasoverlap" depth="3" name="getHasOverlap" sig="getHasOverlap(): boolean" />

<MemberMeta sourceHref="/source/src/image/maskimage-js/#L151" sourceLabel="maskImage.js:151" />

Check whether the mask has overlapping segments.

**Returns**

- `boolean` — True if any two segments share at least one voxel.

<MemberHeading id="getmaskreferencedseriesuid" depth="3" name="getMaskReferencedSeriesUID" sig="getMaskReferencedSeriesUID(): string | undefined" />

<MemberMeta sourceHref="/source/src/image/maskimage-js/#L160" sourceLabel="maskImage.js:160" />

Get the UID of the series referenced by the mask, if any.

**Returns**

- `string | undefined` — The UID.

<MemberHeading id="ismask" depth="3" name="isMask" sig="isMask(): boolean" />

<MemberMeta badges="deprecated" sourceHref="/source/src/image/maskimage-js/#L170" sourceLabel="maskImage.js:170" />

Check is the image is a mask.

<Callout type="error">
  &#x20;Since v0.37, please use \`instanceof MaskImage\` instead.
</Callout>

**Returns**

- `boolean` — True.

<MemberHeading id="getsegmentnumbersatindex" depth="3" name="getSegmentNumbersAtIndex" sig="getSegmentNumbersAtIndex(index: Index): Array.<number>" />

<MemberMeta sourceHref="/source/src/image/maskimage-js/#L183" sourceLabel="maskImage.js:183" />

Get the numbers of the segments present at an index. When segments overlap, all the segments at the index are returned, not only the one stored in the buffer (first wins).

**Parameters**

- `index` ([Index](/index)) — The index, no bounds check.

**Returns**

- `Array.<number>` — The sorted list of segment numbers, empty for background.

<MemberHeading id="getoffsets" depth="3" name="getOffsets" sig="getOffsets(value: number | RGB): Array.<number>" />

<MemberMeta sourceHref="/source/src/image/maskimage-js/#L210" sourceLabel="maskImage.js:210" />

Get the offsets where the buffer equals the input value. Loops through the whole volume, can get long for big data...

**Parameters**

- `value` (number | [RGB](/rgb)) — The value to check.

**Returns**

- `Array.<number>` — The list of offsets.

<MemberHeading id="setatoffsets" depth="3" name="setAtOffsets" sig="setAtOffsets(offsets: Array.<number>, value: number | RGB)" />

<MemberMeta sourceHref="/source/src/image/maskimage-js/#L256" sourceLabel="maskImage.js:256" />

Set the inner buffer values at given offsets.

**Parameters**

- `offsets` (Array.\<number>) — List of offsets where to set the data.
- `value` (number | [RGB](/rgb)) — The value to set at the given offsets.

**Fires**

- `Image#event:imagecontentchange`

<MemberHeading
  id="setatoffsetswithvalues"
  depth="3"
  name="setAtOffsetsWithValues"
  sig="setAtOffsetsWithValues(
	offsets: Array.<number>,
	values: Array.<number>,
)"
/>

<MemberMeta sourceHref="/source/src/image/maskimage-js/#L305" sourceLabel="maskImage.js:305" />

Set the inner buffer values at given offsets, each to its own value. Used when a single uniform value cannot be used across all offsets, for example restoring the segment still present at a voxel that used to be hidden by an overlapping, now deleted, segment.

**Parameters**

- `offsets` (Array.\<number>) — List of offsets where to set the data.
- `values` (Array.\<number>) — Per-offset values, same length as offsets.

**Fires**

- `Image#event:imagecontentchange`

<MemberHeading
  id="setatoffsetsandgetoriginals"
  depth="3"
  name="setAtOffsetsAndGetOriginals"
  sig="setAtOffsetsAndGetOriginals(
	offsetsLists: Array.<Array.<number>>,
	value: number,
): Array"
/>

<MemberMeta sourceHref="/source/src/image/maskimage-js/#L329" sourceLabel="maskImage.js:329" />

Set the inner buffer values at given offsets.

**Parameters**

- `offsetsLists` (Array.\<Array.\<number>>) — List of offset lists where to set the data.
- `value` (number) — The value to set at the given offsets.

**Returns**

- `Array` — A list of objects representing the original values before replacing them.

**Fires**

- `Image#event:imagecontentchange`

<MemberHeading
  id="setatoffsetswithiterator"
  depth="3"
  name="setAtOffsetsWithIterator"
  sig="setAtOffsetsWithIterator(
	offsetsLists: Array.<Array.<number>>,
	value: number | Array,
)"
/>

<MemberMeta sourceHref="/source/src/image/maskimage-js/#L377" sourceLabel="maskImage.js:377" />

Set the inner buffer values at given offsets.

**Parameters**

- `offsetsLists` (Array.\<Array.\<number>>) — List of offset lists where to set the data.
- `value` (number | Array) — The value to set at the given offsets.

**Fires**

- `Image#event:imagecontentchange`

<MemberHeading id="getlabels" depth="3" name="getLabels" sig="getLabels(): Array.<Label> | undefined" />

<MemberMeta sourceHref="/source/src/image/maskimage-js/#L531" sourceLabel="maskImage.js:531" />

Get the labels from the last labeling (see [MaskImage#recalculateLabels](/maskimage#recalculatelabels)).

**Returns**

- `Array.<`[`Label`](/label)`> | undefined` — The labels, undefined if not calculated.

<MemberHeading id="recalculatelabels" depth="3" name="recalculateLabels" sig="recalculateLabels()" />

<MemberMeta sourceHref="/source/src/image/maskimage-js/#L541" sourceLabel="maskImage.js:541" />

Recalculate labels.

**Fires**

- `Image#event:labelingstart`
- `Image#event:labelschanged`

<MemberHeading id="clone" depth="3" name="clone" sig="clone(): MaskImage" />

<MemberMeta sourceHref="/source/src/image/maskimage-js/#L573" sourceLabel="maskImage.js:573" />

Clone the mask image.

**Returns**

- [`MaskImage`](/maskimage) — A clone of this mask image.

<MemberHeading
  id="gethistogrambysegment"
  depth="3"
  name="getHistogramBySegment"
  sig="getHistogramBySegment(
	image: Image,
	segmentId: string,
): Array.<SegmentHistogram>"
/>

<MemberMeta sourceHref="/source/src/image/maskimage-js/#L606" sourceLabel="maskImage.js:606" />

Get per-volume histograms of reference-image intensities for one segment.

For each volume of `image`, counts how often each intensity appears in voxels belonging to the given segment of this mask. Segmentations are 3D: the same mask is applied to every volume. Raw values are counted per rescale slope and intercept and rescaled when read from the [ImageHistogram](/imagehistogram).

If labels are available (see [MaskImage#getLabels](/maskimage#getlabels)), each entry also has `labelHistograms`: one histogram per label of the segment, made of the segment voxels between the label min and max Z. Since labels of the same segment that share slices cannot be separated this way, `labelHistograms` is not provided in that case.

**Parameters**

- `image` ([Image](/image)) — The reference image (intensities).
- `segmentId` (string) — Segment tracking UID, or segment number as string.

**Returns**

- `Array.<`[`SegmentHistogram`](/segmenthistogram)`>` — One entry per volume.
