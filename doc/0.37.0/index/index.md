---
title: Index
kind: class
longname: Index
description: "Immutable index. Warning: the input array is NOT cloned, modifying it will modify the index values."
---

# Index

<SourceLink href="/source/src/math/index-js/#L6" label="index.js:6" />

Immutable index. Warning: the input array is NOT cloned, modifying it will modify the index values.

---

## Constructor

<Signature code="new Index(values: Array.<number>): Index" />

**Parameters**

- `values` (Array.\<number>) — The index values.

---

## Instance Methods

<MemberHeading id="get" depth="3" name="get" sig="get(i: number): number | undefined" />

<MemberMeta sourceHref="/source/src/math/index-js/#L40" sourceLabel="index.js:40" />

Get the index value at the given array index.

**Parameters**

- `i` (number) — The index to get.

**Returns**

- `number | undefined` — The value or undefined if not in range.

<MemberHeading id="length" depth="3" name="length" sig="length(): number" />

<MemberMeta sourceHref="/source/src/math/index-js/#L49" sourceLabel="index.js:49" />

Get the length of the index.

**Returns**

- `number` — The length.

<MemberHeading id="tostring" depth="3" name="toString" sig="toString(): string" />

<MemberMeta sourceHref="/source/src/math/index-js/#L58" sourceLabel="index.js:58" />

Get a string representation of the Index.

**Returns**

- `string` — The Index as a string.

<MemberHeading id="getvalues" depth="3" name="getValues" sig="getValues(): Array.<number>" />

<MemberMeta sourceHref="/source/src/math/index-js/#L67" sourceLabel="index.js:67" />

Get the values of this index.

**Returns**

- `Array.<number>` — The array of values.

<MemberHeading id="cancompare" depth="3" name="canCompare" sig="canCompare(rhs: Index): boolean" />

<MemberMeta sourceHref="/source/src/math/index-js/#L77" sourceLabel="index.js:77" />

Check if the input index can be compared to this one.

**Parameters**

- `rhs` ([Index](/index)) — The index to compare to.

**Returns**

- `boolean` — True if both indices are comparable.

<MemberHeading id="equals" depth="3" name="equals" sig="equals(rhs: Index): boolean" />

<MemberMeta sourceHref="/source/src/math/index-js/#L96" sourceLabel="index.js:96" />

Check for Index equality.

**Parameters**

- `rhs` ([Index](/index)) — The index to compare to.

**Returns**

- `boolean` — True if both indices are equal.

<MemberHeading id="compare" depth="3" name="compare" sig="compare(rhs: Index): Array.<number>" />

<MemberMeta sourceHref="/source/src/math/index-js/#L117" sourceLabel="index.js:117" />

Compare indices and return different dimensions.

**Parameters**

- `rhs` ([Index](/index)) — The index to compare to.

**Returns**

- `Array.<number>` — The list of different dimensions.

<MemberHeading id="add" depth="3" name="add" sig="add(rhs: Index): Index" />

<MemberMeta sourceHref="/source/src/math/index-js/#L139" sourceLabel="index.js:139" />

Add another index to this one and return the result as a new index.

**Parameters**

- `rhs` ([Index](/index)) — The index to add.

**Returns**

- [`Index`](/index) — The index representing the sum of both indices.

<MemberHeading id="next" depth="3" name="next" sig="next(dim: number): Index" />

<MemberMeta sourceHref="/source/src/math/index-js/#L179" sourceLabel="index.js:179" />

Increment this index by 1 at the given dimension and return the result as a new index.

**Parameters**

- `dim` (number) — The dimension number.

**Returns**

- [`Index`](/index) — The result index.

<MemberHeading id="previous" depth="3" name="previous" sig="previous(dim: number): Index" />

<MemberMeta sourceHref="/source/src/math/index-js/#L190" sourceLabel="index.js:190" />

Decrement this index by 1 at the given dimension and return the result as a new index.

**Parameters**

- `dim` (number) — The dimension number.

**Returns**

- [`Index`](/index) — The result index.

<MemberHeading id="getwithnew2d" depth="3" name="getWithNew2D" sig="getWithNew2D(i: number, j: number): Index" />

<MemberMeta sourceHref="/source/src/math/index-js/#L202" sourceLabel="index.js:202" />

Get the current index with a new 2D base and return the result as a new index.

**Parameters**

- `i` (number) — The new 0 index.
- `j` (number) — The new 1 index.

**Returns**

- [`Index`](/index) — The new index.
