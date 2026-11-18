---
title: ThresholdFilter
kind: class
longname: ThresholdFilter
description: Threshold an image between an input minimum and maximum.
---

# ThresholdFilter

<SourceLink href="/source/src/image/filter-js/#L8" label="filter.js:8" />

Threshold an image between an input minimum and maximum.

---

## Constructor

<Signature code="new ThresholdFilter(): ThresholdFilter" />

---

## Instance Methods

<MemberHeading id="getmin" depth="3" name="getMin" sig="getMin(): number" />

<MemberMeta sourceHref="/source/src/image/filter-js/#L28" sourceLabel="filter.js:28" />

Get the threshold minimum.

**Returns**

- `number` — The threshold minimum.

<MemberHeading id="setmin" depth="3" name="setMin" sig="setMin(val: number)" />

<MemberMeta sourceHref="/source/src/image/filter-js/#L37" sourceLabel="filter.js:37" />

Set the threshold minimum.

**Parameters**

- `val` (number) — The threshold minimum.

<MemberHeading id="getmax" depth="3" name="getMax" sig="getMax(): number" />

<MemberMeta sourceHref="/source/src/image/filter-js/#L46" sourceLabel="filter.js:46" />

Get the threshold maximum.

**Returns**

- `number` — The threshold maximum.

<MemberHeading id="setmax" depth="3" name="setMax" sig="setMax(val: number)" />

<MemberMeta sourceHref="/source/src/image/filter-js/#L55" sourceLabel="filter.js:55" />

Set the threshold maximum.

**Parameters**

- `val` (number) — The threshold maximum.

<MemberHeading id="getname" depth="3" name="getName" sig="getName(): string" />

<MemberMeta sourceHref="/source/src/image/filter-js/#L64" sourceLabel="filter.js:64" />

Get the name of the filter.

**Returns**

- `string` — The name of the filter.

<MemberHeading id="setoriginalimage" depth="3" name="setOriginalImage" sig="setOriginalImage(image: Image)" />

<MemberMeta sourceHref="/source/src/image/filter-js/#L80" sourceLabel="filter.js:80" />

Set the original image.

**Parameters**

- `image` ([Image](/image)) — The original image.

<MemberHeading id="getoriginalimage" depth="3" name="getOriginalImage" sig="getOriginalImage(): Image" />

<MemberMeta sourceHref="/source/src/image/filter-js/#L89" sourceLabel="filter.js:89" />

Get the original image.

**Returns**

- [`Image`](/image) — The original image.

<MemberHeading id="update" depth="3" name="update" sig="update(): Image" />

<MemberMeta sourceHref="/source/src/image/filter-js/#L98" sourceLabel="filter.js:98" />

Transform the main image using this filter.

**Returns**

- [`Image`](/image) — The transformed image.
