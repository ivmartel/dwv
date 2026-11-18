---
title: RtStructFactory
kind: class
longname: RtStructFactory
description: "{@link Image} factory for DICOM RT Structure Set (RTSTRUCT). Rasterizes ROI contour polygons into a PALETTE COLOR mask image using the same geometry as the reference CT/MR image so that the result can be rendered by the existing mask pipeline."
---

# RtStructFactory

<SourceLink href="/source/src/image/rtstructfactory-js/#L476" label="rtStructFactory.js:476" />

[Image](/image) factory for DICOM RT Structure Set (RTSTRUCT).

Rasterizes ROI contour polygons into a PALETTE COLOR mask image using the same geometry as the reference CT/MR image so that the result can be rendered by the existing mask pipeline.

---

## Constructor

<Signature code="new RtStructFactory(): RtStructFactory" />

---

## Instance Methods

<MemberHeading id="getwarning" depth="3" name="getWarning" sig="getWarning(): string | undefined" />

<MemberMeta sourceHref="/source/src/image/rtstructfactory-js/#L490" sourceLabel="rtStructFactory.js:490" />

Get a warning string if elements are not as expected.

**Returns**

- `string | undefined` — The warning.

<MemberHeading
  id="checkelements"
  depth="3"
  name="checkElements"
  sig="checkElements(
	_dataElements: Record.<string, DataElement>,
): string | undefined"
/>

<MemberMeta sourceHref="/source/src/image/rtstructfactory-js/#L500" sourceLabel="rtStructFactory.js:500" />

Check dicom elements.

**Parameters**

- `_dataElements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM data elements.

**Returns**

- `string | undefined` — A possible warning.

<MemberHeading
  id="create"
  depth="3"
  name="create"
  sig="create(
	dataElements: Record.<string, DataElement>,
	refImage: Image,
): MaskImage"
/>

<MemberMeta sourceHref="/source/src/image/rtstructfactory-js/#L518" sourceLabel="rtStructFactory.js:518" />

Get a [MaskImage](/maskimage) from RTSTRUCT DICOM elements.

Contours are rasterized into a Uint8Array whose voxel values are segment numbers (0 = background, 1..N = ROI index). A PALETTE COLOR colour map maps each segment number to the ROI's display colour.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM data elements.
- `refImage` ([Image](/image)) — The reference image (CT/MR) that was loaded first.

**Returns**

- [`MaskImage`](/maskimage) — The mask image.

**Throws**

- `Error` — If the reference image geometry cannot be used.

<MemberHeading
  id="todicom"
  depth="3"
  name="toDicom"
  sig="toDicom(
	image: MaskImage,
	segments?: Array.<MaskSegment>,
	sourceImage?: Image,
	extraTags?: SimpleTagValues,
): Record.<string, DataElement>"
/>

<MemberMeta sourceHref="/source/src/image/rtstructfactory-js/#L663" sourceLabel="rtStructFactory.js:663" />

Convert a [MaskImage](/maskimage) into DICOM RT Structure Set elements.

Traces each segment's pixel regions per slice using Moore neighborhood contour tracing, simplifies with Ramer-Douglas-Peucker, then maps the 2D pixel coordinates back to 3D patient-space coordinates.

**Parameters**

- `image` ([MaskImage](/maskimage)) — The mask image.
- `segments` (Array.\<[MaskSegment](/masksegment)>, optional) — The mask segments; if omitted, taken from image meta.
- `sourceImage` ([Image](/image), optional) — Source image (provides StudyInstanceUID).
- `extraTags` ([SimpleTagValues](/simpletagvalues), optional) — Optional extra tags to merge.

**Returns**

- `Record.<string, `[`DataElement`](/dataelement)`>` — The DICOM data elements.
