---
title: SobelFilter
kind: class
longname: SobelFilter
description: Apply a Sobel filter to an image.
---

# SobelFilter

<SourceLink href="/source/src/image/filter-js/#L171" label="filter.js:171" />

Apply a Sobel filter to an image.

---

## Constructor

<Signature code="new SobelFilter(): SobelFilter" />

---

## Instance Methods

<MemberHeading id="getname" depth="3" name="getName" sig="getName(): string" />

<MemberMeta sourceHref="/source/src/image/filter-js/#L177" sourceLabel="filter.js:177" />

Get the name of the filter.

**Returns**

- `string` — The name of the filter.

<MemberHeading id="setoriginalimage" depth="3" name="setOriginalImage" sig="setOriginalImage(image: Image)" />

<MemberMeta sourceHref="/source/src/image/filter-js/#L193" sourceLabel="filter.js:193" />

Set the original image.

**Parameters**

- `image` ([Image](/image)) — The original image.

<MemberHeading id="getoriginalimage" depth="3" name="getOriginalImage" sig="getOriginalImage(): Image" />

<MemberMeta sourceHref="/source/src/image/filter-js/#L202" sourceLabel="filter.js:202" />

Get the original image.

**Returns**

- [`Image`](/image) — The original image.

<MemberHeading id="update" depth="3" name="update" sig="update(): Image" />

<MemberMeta sourceHref="/source/src/image/filter-js/#L211" sourceLabel="filter.js:211" />

Transform the main image using this filter.

**Returns**

- [`Image`](/image) — The transformed image.
