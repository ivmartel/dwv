---
title: SharpenFilter
kind: class
longname: SharpenFilter
description: Sharpen an image using a sharpen convolution matrix.
---

# SharpenFilter

<SourceLink href="/source/src/image/filter-js/#L115" label="filter.js:115" />

Sharpen an image using a sharpen convolution matrix.

---

## Constructor

<Signature code="new SharpenFilter(): SharpenFilter" />

---

## Instance Methods

<MemberHeading id="getname" depth="3" name="getName" sig="getName(): string" />

<MemberMeta sourceHref="/source/src/image/filter-js/#L121" sourceLabel="filter.js:121" />

Get the name of the filter.

**Returns**

- `string` — The name of the filter.

<MemberHeading id="setoriginalimage" depth="3" name="setOriginalImage" sig="setOriginalImage(image: Image)" />

<MemberMeta sourceHref="/source/src/image/filter-js/#L137" sourceLabel="filter.js:137" />

Set the original image.

**Parameters**

- `image` ([Image](/image)) — The original image.

<MemberHeading id="getoriginalimage" depth="3" name="getOriginalImage" sig="getOriginalImage(): Image" />

<MemberMeta sourceHref="/source/src/image/filter-js/#L146" sourceLabel="filter.js:146" />

Get the original image.

**Returns**

- [`Image`](/image) — The original image.

<MemberHeading id="update" depth="3" name="update" sig="update(): Image" />

<MemberMeta sourceHref="/source/src/image/filter-js/#L155" sourceLabel="filter.js:155" />

Transform the main image using this filter.

**Returns**

- [`Image`](/image) — The transformed image.
