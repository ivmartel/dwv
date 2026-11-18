---
title: MaskSegmentHelper
kind: class
longname: MaskSegmentHelper
description: "Mask segment helper: helps handling the segments list, but does NOT update the associated mask (use special commands for that such as DeleteSegmentCommand, ChangeSegmentColourCommand...)."
---

# MaskSegmentHelper

<SourceLink href="/source/src/image/masksegmenthelper-js/#L13" label="maskSegmentHelper.js:13" />

Mask segment helper: helps handling the segments list, but does _NOT_ update the associated mask (use special commands for that such as DeleteSegmentCommand, ChangeSegmentColourCommand...).

---

## Constructor

<Signature code="new MaskSegmentHelper(mask: MaskImage): MaskSegmentHelper" />

**Parameters**

- `mask` ([MaskImage](/maskimage)) — The associated mask image.

---

## Instance Methods

<MemberHeading id="getmask" depth="3" name="getMask" sig="getMask(): MaskImage" />

<MemberMeta sourceHref="/source/src/image/masksegmenthelper-js/#L50" sourceLabel="maskSegmentHelper.js:50" />

Get the associated mask image.

**Returns**

- [`MaskImage`](/maskimage) — The mask image.

<MemberHeading id="hassegment" depth="3" name="hasSegment" sig="hasSegment(segmentNumber: number): boolean" />

<MemberMeta sourceHref="/source/src/image/masksegmenthelper-js/#L72" sourceLabel="maskSegmentHelper.js:72" />

Check if a segment is part of the segments list.

**Parameters**

- `segmentNumber` (number) — The segment number.

**Returns**

- `boolean` — True if the segment is included.

<MemberHeading id="getnumberofsegments" depth="3" name="getNumberOfSegments" sig="getNumberOfSegments(): number" />

<MemberMeta sourceHref="/source/src/image/masksegmenthelper-js/#L81" sourceLabel="maskSegmentHelper.js:81" />

Get the number of segments of the segmentation.

**Returns**

- `number` — The number of segments.

<MemberHeading id="maskhassegments" depth="3" name="maskHasSegments" sig="maskHasSegments(numbers: Array.<number>): Array.<boolean>" />

<MemberMeta sourceHref="/source/src/image/masksegmenthelper-js/#L92" sourceLabel="maskSegmentHelper.js:92" />

Check if a segment is present in a mask image.

**Parameters**

- `numbers` (Array.\<number>) — Array of segment numbers.

**Returns**

- `Array.<boolean>` — Array of boolean set to true if the segment is present in the mask.

<MemberHeading id="getsegment" depth="3" name="getSegment" sig="getSegment(segmentNumber: number): MaskSegment | undefined" />

<MemberMeta sourceHref="/source/src/image/masksegmenthelper-js/#L123" sourceLabel="maskSegmentHelper.js:123" />

Get a segment from the inner segment list.

**Parameters**

- `segmentNumber` (number) — The segment number.

**Returns**

- [`MaskSegment`](/masksegment)` | undefined` — The segment or undefined if not found.

<MemberHeading id="addsegment" depth="3" name="addSegment" sig="addSegment(segment: MaskSegment)" />

<MemberMeta sourceHref="/source/src/image/masksegmenthelper-js/#L137" sourceLabel="maskSegmentHelper.js:137" />

Add a segment to the segments list.

**Parameters**

- `segment` ([MaskSegment](/masksegment)) — The segment to add.

<MemberHeading id="removesegment" depth="3" name="removeSegment" sig="removeSegment(segmentNumber: number)" />

<MemberMeta sourceHref="/source/src/image/masksegmenthelper-js/#L158" sourceLabel="maskSegmentHelper.js:158" />

Remove a segment from the segments list.

**Parameters**

- `segmentNumber` (number) — The segment number.

<MemberHeading id="updatesegment" depth="3" name="updateSegment" sig="updateSegment(segment: MaskSegment)" />

<MemberMeta sourceHref="/source/src/image/masksegmenthelper-js/#L174" sourceLabel="maskSegmentHelper.js:174" />

Update a segment of the segments list.

**Parameters**

- `segment` ([MaskSegment](/masksegment)) — The segment to update.

<MemberHeading id="findoverlap" depth="3" name="findOverlap" sig="findOverlap(rhs: MaskSegmentHelper): OverlapMap" />

<MemberMeta sourceHref="/source/src/image/masksegmenthelper-js/#L225" sourceLabel="maskSegmentHelper.js:225" />

Find the overlap for each segment between two segmentation masks. It is assumed these images have the same orientation.

**Parameters**

- `rhs` ([MaskSegmentHelper](/masksegmenthelper)) — The helper of the segmentation image to find overlap with.

**Returns**

- [`OverlapMap`](/overlapmap) — The overlapping voxel counts. First level is the segments from this image, second level is the compare image segments.
