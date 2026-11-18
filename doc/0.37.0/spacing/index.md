---
title: Spacing
kind: class
longname: Spacing
description: "Immutable Spacing class. Warning: the input array is NOT cloned, modifying it will modify the index values."
---

# Spacing

<SourceLink href="/source/src/image/spacing-js/#L10" label="spacing.js:10" />

Immutable Spacing class. Warning: the input array is NOT cloned, modifying it will modify the index values.

---

## Constructor

<Signature code="new Spacing(values: Array.<number>): Spacing" />

**Parameters**

- `values` (Array.\<number>) — The spacing values.

---

## Instance Methods

<MemberHeading id="get" depth="3" name="get" sig="get(i: number): number" />

<MemberMeta sourceHref="/source/src/image/spacing-js/#L44" sourceLabel="spacing.js:44" />

Get the spacing value at the given array index.

**Parameters**

- `i` (number) — The index to get.

**Returns**

- `number` — The value.

<MemberHeading id="length" depth="3" name="length" sig="length(): number" />

<MemberMeta sourceHref="/source/src/image/spacing-js/#L53" sourceLabel="spacing.js:53" />

Get the length of the spacing.

**Returns**

- `number` — The length.

<MemberHeading id="tostring" depth="3" name="toString" sig="toString(): string" />

<MemberMeta sourceHref="/source/src/image/spacing-js/#L62" sourceLabel="spacing.js:62" />

Get a string representation of the spacing.

**Returns**

- `string` — The spacing as a string.

<MemberHeading id="getvalues" depth="3" name="getValues" sig="getValues(): Array.<number>" />

<MemberMeta sourceHref="/source/src/image/spacing-js/#L71" sourceLabel="spacing.js:71" />

Get the values of this spacing.

**Returns**

- `Array.<number>` — The array of values.

<MemberHeading id="equals" depth="3" name="equals" sig="equals(rhs: Spacing): boolean" />

<MemberMeta sourceHref="/source/src/image/spacing-js/#L81" sourceLabel="spacing.js:81" />

Check for equality.

**Parameters**

- `rhs` ([Spacing](/spacing)) — The object to compare to.

**Returns**

- `boolean` — True if both objects are equal.

<MemberHeading id="get2d" depth="3" name="get2D" sig="get2D(): Scalar2D" />

<MemberMeta sourceHref="/source/src/image/spacing-js/#L106" sourceLabel="spacing.js:106" />

Get the 2D base of this size.

**Returns**

- [`Scalar2D`](/scalar2d) — The 2D base \[col,row] as {x,y}.
