---
title: LabelingThread
kind: class
longname: LabelingThread
description: Labeling thread.
---

# LabelingThread

<SourceLink href="/source/src/image/labelingthread-js/#L77" label="labelingThread.js:77" />

Labeling thread.

---

## Constructor

<Signature code="new LabelingThread(): LabelingThread" />

---

## Instance Methods

<MemberHeading id="run" depth="3" name="run" sig="run(imageBuffer: TypedArray, geometry: Geometry)" />

<MemberMeta sourceHref="/source/src/image/labelingthread-js/#L97" sourceLabel="labelingThread.js:97" />

Trigger a labels recalculation.

**Parameters**

- `imageBuffer` ([TypedArray](/typedarray)) — The buffer to label.
- `geometry` ([Geometry](/geometry)) — The image geometry.

<MemberHeading
  id="runoverlap"
  depth="3"
  name="runOverlap"
  sig="runOverlap(
	segments: Array.<{segNumber: number, size: Size, slices: Array.<{sliceIndex: number, data: Uint8Array}>, minSlice: number}>,
	geometry: Geometry,
)"
/>

<MemberMeta sourceHref="/source/src/image/labelingthread-js/#L122" sourceLabel="labelingThread.js:122" />

Trigger a labels recalculation for overlapping segments. Spawns one worker task per segment for parallel execution.

**Parameters**

- `segments` (Array.\<{segNumber: number, size: [Size](/size), slices: Array.\<{sliceIndex: number, data: Uint8Array}>, minSlice: number}>) — Per-segment raw slice data with local (0-based) slice indices and the global minSlice offset.
- `geometry` ([Geometry](/geometry)) — The full image geometry.

<MemberHeading id="ondone" depth="3" name="ondone" sig="ondone(_event: object)" />

<MemberMeta sourceHref="/source/src/image/labelingthread-js/#L159" sourceLabel="labelingThread.js:159" />

Handle a completed labeling. Default behavior is do nothing, this is meant to be overridden.

**Parameters**

- `_event` (object) — The work item event fired when a labeling calculation is completed. Event.data should contain a 'labels' item.
