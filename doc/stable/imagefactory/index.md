---
title: ImageFactory
kind: class
longname: ImageFactory
description: "{@link Image} factory."
---

# ImageFactory

<SourceLink href="/source/src/image/imagefactory-js/#L290" label="imageFactory.js:290" />

[Image](/image) factory.

---

## Constructor

<Signature code="new ImageFactory(): ImageFactory" />

---

## Instance Methods

<MemberHeading id="getwarning" depth="3" name="getWarning" sig="getWarning(): string | undefined" />

<MemberMeta sourceHref="/source/src/image/imagefactory-js/#L312" sourceLabel="imageFactory.js:312" />

Get a warning string if elements are not as expected. Created by checkElements.

**Returns**

- `string | undefined` — The warning.

<MemberHeading id="checkelements" depth="3" name="checkElements" sig="checkElements(dataElements: DataElements): string | undefined" />

<MemberMeta sourceHref="/source/src/image/imagefactory-js/#L323" sourceLabel="imageFactory.js:323" />

Check dicom elements.

**Parameters**

- `dataElements` ([DataElements](/dataelements)) — The DICOM data elements.

**Returns**

- `string | undefined` — A possible warning.

**Throws**

- `Error` — Error for missing or wrong data.

<MemberHeading
  id="create"
  depth="3"
  name="create"
  sig="create(
	dataElements: DataElements,
	pixelBuffer: TypedArray,
	numberOfItems: number,
	frameNumber?: number,
): Image"
/>

<MemberMeta sourceHref="/source/src/image/imagefactory-js/#L364" sourceLabel="imageFactory.js:364" />

Get an [Image](/image) object from the read DICOM file.

**Parameters**

- `dataElements` ([DataElements](/dataelements)) — The DICOM tags.
- `pixelBuffer` ([TypedArray](/typedarray)) — The pixel buffer.
- `numberOfItems` (number) — The number of load items.
- `frameNumber` (number, optional) — The frame number if the pixel buffer only contains one frame of a multi-frame data: the image is then one frame, the other ones are to be appended to it.

**Returns**

- [`Image`](/image) — A new Image.

**Throws**

- `Error` — Error for missing or wrong data.
