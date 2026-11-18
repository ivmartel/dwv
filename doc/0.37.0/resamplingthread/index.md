---
title: ResamplingThread
kind: class
longname: ResamplingThread
description: Resampling thread.
---

# ResamplingThread

<SourceLink href="/source/src/image/resamplingthread-js/#L396" label="resamplingThread.js:396" />

Resampling thread.

---

## Constructor

<Signature code="new ResamplingThread(): ResamplingThread" />

---

## Instance Methods

<MemberHeading
  id="run"
  depth="3"
  name="run"
  sig="run(
	sourceImageBuffer: TypedArray,
	sourceImageGeometry: Geometry,
	pixelRepresentation: number,
	targetOrientation: Matrix33,
	interpolated: boolean,
	centerOfRotation: Point | undefined,
): object"
/>

<MemberMeta sourceHref="/source/src/image/resamplingthread-js/#L424" sourceLabel="resamplingThread.js:424" />

Trigger a resampling.

**Parameters**

- `sourceImageBuffer` ([TypedArray](/typedarray)) — The buffer to resample.
- `sourceImageGeometry` ([Geometry](/geometry)) — The current image geometry.
- `pixelRepresentation` (number) — The pixel representation of the original image.
- `targetOrientation` ([Matrix33](/matrix33)) — The orientation to resample to.
- `interpolated` (boolean) — If true use bilinear sampling, otherwise use nearest neighbor.
- `centerOfRotation` ([Point](/point) | undefined) — World space center of rotation.

**Returns**

- `object` — Updated buffer and geometry.

<MemberHeading id="ondoneframe" depth="3" name="ondoneframe" sig="ondoneframe(_event: object)" />

<MemberMeta sourceHref="/source/src/image/resamplingthread-js/#L483" sourceLabel="resamplingThread.js:483" />

Handle a completed resampling of a 3D frame. Default behavior is do nothing, this is meant to be overridden.

**Parameters**

- `_event` (object) — The work item event fired when a resampling calculation is completed.

<MemberHeading id="ondone" depth="3" name="ondone" sig="ondone(_event: object)" />

<MemberMeta sourceHref="/source/src/image/resamplingthread-js/#L492" sourceLabel="resamplingThread.js:492" />

Handle a completed resampling. Default behavior is do nothing, this is meant to be overridden.

**Parameters**

- `_event` (object) — The work item event fired when a resampling calculation is completed.
