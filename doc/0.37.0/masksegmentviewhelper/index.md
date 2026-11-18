---
title: MaskSegmentViewHelper
kind: class
longname: MaskSegmentViewHelper
description: "Mask segment view helper: handles hidden segments."
---

# MaskSegmentViewHelper

<SourceLink href="/source/src/image/masksegmentviewhelper-js/#L6" label="maskSegmentViewHelper.js:6" />

Mask segment view helper: handles hidden segments.

---

## Constructor

<Signature code="new MaskSegmentViewHelper(): MaskSegmentViewHelper" />

---

## Instance Methods

<MemberHeading id="ishidden" depth="3" name="isHidden" sig="isHidden(segmentNumber: number): boolean" />

<MemberMeta sourceHref="/source/src/image/masksegmentviewhelper-js/#L31" sourceLabel="maskSegmentViewHelper.js:31" />

Check if a segment is in the hidden list.

**Parameters**

- `segmentNumber` (number) — The segment number.

**Returns**

- `boolean` — True if the segment is in the list.

<MemberHeading id="addtohidden" depth="3" name="addToHidden" sig="addToHidden(segmentNumber: number)" />

<MemberMeta sourceHref="/source/src/image/masksegmentviewhelper-js/#L40" sourceLabel="maskSegmentViewHelper.js:40" />

Add a segment to the hidden list.

**Parameters**

- `segmentNumber` (number) — The segment number.

<MemberHeading id="removefromhidden" depth="3" name="removeFromHidden" sig="removeFromHidden(segmentNumber: number)" />

<MemberMeta sourceHref="/source/src/image/masksegmentviewhelper-js/#L55" sourceLabel="maskSegmentViewHelper.js:55" />

Remove a segment from the hidden list.

**Parameters**

- `segmentNumber` (number) — The segment number.
