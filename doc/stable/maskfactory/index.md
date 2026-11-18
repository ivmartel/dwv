---
title: MaskFactory
kind: class
longname: MaskFactory
description: Mask {@link Image} factory.
---

# MaskFactory

<SourceLink href="/source/src/image/maskfactory-js/#L243" label="maskFactory.js:243" />

Mask [Image](/image) factory.

---

## Constructor

<Signature code="new MaskFactory(): MaskFactory" />

---

## Instance Methods

<MemberHeading id="getwarning" depth="3" name="getWarning" sig="getWarning(): string | undefined" />

<MemberMeta sourceHref="/source/src/image/maskfactory-js/#L258" sourceLabel="maskFactory.js:258" />

Get a warning string if elements are not as expected. Created by checkElements.

**Returns**

- `string | undefined` — The warning.

<MemberHeading
  id="checkelements"
  depth="3"
  name="checkElements"
  sig="checkElements(
	_dicomElements: Record.<string, DataElement>,
): string | undefined"
/>

<MemberMeta sourceHref="/source/src/image/maskfactory-js/#L268" sourceLabel="maskFactory.js:268" />

Check dicom elements.

**Parameters**

- `_dicomElements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.

**Returns**

- `string | undefined` — A possible warning.

<MemberHeading
  id="create"
  depth="3"
  name="create"
  sig="create(
	dataElements: Record.<string, DataElement>,
	pixelBuffer: Uint8Array,
	refImage?: Image,
): MaskImage"
/>

<MemberMeta sourceHref="/source/src/image/maskfactory-js/#L282" sourceLabel="maskFactory.js:282" />

Get a [MaskImage](/maskimage) object from the read DICOM file.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.
- `pixelBuffer` (Uint8Array) — The pixel buffer.
- `refImage` ([Image](/image), optional) — Reference image, code will use its origins if present (best) or try to calculate them.

**Returns**

- [`MaskImage`](/maskimage) — A new mask image.

**Throws**

- `Error` — Error for missing or wrong data.

<MemberHeading
  id="todicom"
  depth="3"
  name="toDicom"
  sig="toDicom(
	image: MaskImage,
	segments: Array.<MaskSegment>,
	sourceImage: Image,
	extraTags?: SimpleTagValues,
): Record.<string, DataElement>"
/>

<MemberMeta sourceHref="/source/src/image/maskfactory-js/#L473" sourceLabel="maskFactory.js:473" />

Convert a mask image into a DICOM segmentation object.

**Parameters**

- `image` ([MaskImage](/maskimage)) — The mask image.
- `segments` (Array.\<[MaskSegment](/masksegment)>) — The mask segments.
- `sourceImage` ([Image](/image)) — The source image.
- `extraTags` ([SimpleTagValues](/simpletagvalues), optional) — Optional list of extra tags.

**Returns**

- `Record.<string, `[`DataElement`](/dataelement)`>` — A list of dicom elements.
