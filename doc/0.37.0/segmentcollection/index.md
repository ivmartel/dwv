---
title: SegmentCollection
kind: class
longname: SegmentCollection
description: "Collection of mask segments: stores per-segment, per-slice pixel data and segment metadata. Builds the combined label map on demand. TODO: check if mergeable with MaskSegmentHelper."
---

# SegmentCollection

<SourceLink href="/source/src/image/segmentcollection-js/#L84" label="segmentCollection.js:84" />

Collection of mask segments: stores per-segment, per-slice pixel data and segment metadata. Builds the combined label map on demand. TODO: check if mergeable with MaskSegmentHelper.

---

## Constructor

<Signature code="new SegmentCollection(geometry: Geometry): SegmentCollection" />

**Parameters**

- `geometry` ([Geometry](/geometry)) — The mask geometry, used to size the label map.

---

## Instance Methods

<MemberHeading id="getall" depth="3" name="getAll" sig="getAll(): Map.<number, Map.<number, Uint8Array>>" />

<MemberMeta sourceHref="/source/src/image/segmentcollection-js/#L126" sourceLabel="segmentCollection.js:126" />

Get all the segments.

**Returns**

- `Map.<number, Map.<number, Uint8Array>>` — The segment buffers, indexed by segment number and slice index.

<MemberHeading id="setlabelmap" depth="3" name="setLabelMap" sig="setLabelMap(buffer: Uint8Array)" />

<MemberMeta sourceHref="/source/src/image/segmentcollection-js/#L136" sourceLabel="segmentCollection.js:136" />

Set the label map directly. Used when the buffer already exists, for brush-painted masks.

**Parameters**

- `buffer` (Uint8Array) — The label map buffer.

<MemberHeading
  id="addframe"
  depth="3"
  name="addFrame"
  sig="addFrame(
	segNumber: number,
	pixelBuffer: Uint8Array,
	frameOffset: number,
	sliceIndex: number,
	sliceSize: number,
	value: number,
)"
/>

<MemberMeta sourceHref="/source/src/image/segmentcollection-js/#L152" sourceLabel="segmentCollection.js:152" />

Add pixel data for one DICOM frame to the appropriate segment and slice. Allocates a Uint8Array(sliceSize) on first use for each (segNumber, sliceIndex) pair; merges if the same pair appears again.

**Parameters**

- `segNumber` (number) — The segment number.
- `pixelBuffer` (Uint8Array) — The raw DICOM pixel buffer.
- `frameOffset` (number) — Offset of this frame within pixelBuffer.
- `sliceIndex` (number) — The slice index in the full label map geometry.
- `sliceSize` (number) — Number of pixels per slice (ncols \* nrows).
- `value` (number) — The value to write for non-zero pixels.

<MemberHeading id="getlabelmap" depth="3" name="getLabelMap" sig="getLabelMap(): Uint8Array" />

<MemberMeta sourceHref="/source/src/image/segmentcollection-js/#L176" sourceLabel="segmentCollection.js:176" />

Build and return the combined label map (lazy cached). Iterates segments in insertion order so lower segment numbers win at overlapping positions. Sets the hasOverlap flag if any voxel already carries a different segment's value.

**Returns**

- `Uint8Array` — The full-volume label map.

<MemberHeading
  id="updateatoffset"
  depth="3"
  name="updateAtOffset"
  sig="updateAtOffset(
	offset: number,
	previousValue: number,
	newValue: number,
)"
/>

<MemberMeta sourceHref="/source/src/image/segmentcollection-js/#L236" sourceLabel="segmentCollection.js:236" />

Update the per-segment, per-slice buffers after a direct edit to the shared label map (for example brush painting on a mask loaded from DICOM, where the label map and the per-segment buffers are otherwise two separate structures). No-op when this collection has no per-segment data (brush-created masks), since the label map is already the source of truth in that case.

**Parameters**

- `offset` (number) — The offset in the label map that changed.
- `previousValue` (number) — The segment number previously at offset.
- `newValue` (number) — The segment number now at offset.

<MemberHeading id="shiftslices" depth="3" name="shiftSlices" sig="shiftSlices(sliceIndexThreshold: number, numberOfSlices: number)" />

<MemberMeta sourceHref="/source/src/image/segmentcollection-js/#L275" sourceLabel="segmentCollection.js:275" />

Re-index the per-segment, per-slice buffers after a slice insertion (from Image#appendSlice) that shifted existing slice content to make room for new slices. Unlike the shared label map (which aliases the image buffer, so the raw byte-level shift already covers it for free), `#segments` is keyed by slice index rather than buffer offset, so an insertion before an existing slice leaves its entries silently pointing at the wrong (pre-shift) slice index unless they are explicitly re-keyed here.

**Parameters**

- `sliceIndexThreshold` (number) — Slices at or after this index (numbering as it was _before_ the insertion) are shifted.
- `numberOfSlices` (number) — Number of slices inserted.

<MemberHeading
  id="getothervalueatoffset"
  depth="3"
  name="getOtherValueAtOffset"
  sig="getOtherValueAtOffset(
	offset: number,
	excludeSegmentNumber: number,
): number"
/>

<MemberMeta sourceHref="/source/src/image/segmentcollection-js/#L308" sourceLabel="segmentCollection.js:308" />

Get the value that a different, non-excluded segment holds at a given label map offset. Used when deleting a segment to restore a voxel that also belonged to another (overlapping) segment instead of losing that other segment's presence there. Segments are checked in insertion order, consistent with the first-wins policy used by [SegmentCollection#getLabelMap](/segmentcollection#getlabelmap).

**Parameters**

- `offset` (number) — The offset in the label map.
- `excludeSegmentNumber` (number) — The segment number to ignore.

**Returns**

- `number` — The other segment's stored value at that offset, or 0 if no other segment covers it.

<MemberHeading id="clone" depth="3" name="clone" sig="clone(): SegmentCollection" />

<MemberMeta sourceHref="/source/src/image/segmentcollection-js/#L334" sourceLabel="segmentCollection.js:334" />

Create a deep copy of this collection: per-segment/per-slice buffers and the overlap flag are copied, the lazily-built label map and union contour caches are left unset (they rebuild on demand from the copied per-segment data, same as a freshly constructed collection).

**Returns**

- [`SegmentCollection`](/segmentcollection) — The copy.

<MemberHeading id="gethasoverlap" depth="3" name="getHasOverlap" sig="getHasOverlap(): boolean" />

<MemberMeta sourceHref="/source/src/image/segmentcollection-js/#L352" sourceLabel="segmentCollection.js:352" />

Check whether any two segments share at least one voxel.

**Returns**

- `boolean` — True if overlap was detected.

<MemberHeading
  id="getsegmentbuffers"
  depth="3"
  name="getSegmentBuffers"
  sig="getSegmentBuffers(
	segments: Array.<MaskSegment>,
): Record.<string, Record.<number, Uint8Array>>"
/>

<MemberMeta sourceHref="/source/src/image/segmentcollection-js/#L372" sourceLabel="segmentCollection.js:372" />

Get the segment buffers. Using input image and segments since they could have been modified (for example by brush).

When per-segment data is available (MaskFactory path), builds ROI buffers directly from #segments so that overlap pixels for every segment are included. Falls back to label-map reconstruction for masks created via setupSegmentCollection (brush path), where #segments is empty and the label map is the only source of truth.

**Parameters**

- `segments` (Array.\<[MaskSegment](/masksegment)>) — The mask segments.

**Returns**

- `Record.<string, Record.<number, Uint8Array>>` — The segment buffers, indexed by segment index (segment.number - 1) and slice index.

<MemberHeading
  id="getorbuildunioncontour"
  depth="3"
  name="getOrBuildUnionContour"
  sig="getOrBuildUnionContour(
	segmentViewHelper: MaskSegmentViewHelper | undefined,
	imageSize: Size,
): ImageContour"
/>

<MemberMeta sourceHref="/source/src/image/segmentcollection-js/#L446" sourceLabel="segmentCollection.js:446" />

Get the union ImageContour for the current visibility state, building it if the set of hidden segments has changed.

**Parameters**

- `segmentViewHelper` ([MaskSegmentViewHelper](/masksegmentviewhelper) | undefined) — Hidden-segment tracker.
- `imageSize` ([Size](/size)) — The image size.

**Returns**

- [`ImageContour`](/imagecontour) — The union ImageContour.
