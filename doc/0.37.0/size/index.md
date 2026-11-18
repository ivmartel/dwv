---
title: Size
kind: class
longname: Size
description: "Immutable Size class. Warning: the input array is NOT cloned, modifying it will modify the index values."
---

# Size

<SourceLink href="/source/src/image/size-js/#L14" label="size.js:14" />

Immutable Size class. Warning: the input array is NOT cloned, modifying it will modify the index values.

---

## Constructor

<Signature code="new Size(values: Array.<number>): Size" />

**Parameters**

- `values` (Array.\<number>) — The size values.

---

## Instance Methods

<MemberHeading id="get" depth="3" name="get" sig="get(i: number): number" />

<MemberMeta sourceHref="/source/src/image/size-js/#L48" sourceLabel="size.js:48" />

Get the size value at the given array index.

**Parameters**

- `i` (number) — The index to get.

**Returns**

- `number` — The value.

<MemberHeading id="length" depth="3" name="length" sig="length(): number" />

<MemberMeta sourceHref="/source/src/image/size-js/#L57" sourceLabel="size.js:57" />

Get the length of the index.

**Returns**

- `number` — The length.

<MemberHeading id="tostring" depth="3" name="toString" sig="toString(): string" />

<MemberMeta sourceHref="/source/src/image/size-js/#L66" sourceLabel="size.js:66" />

Get a string representation of the size.

**Returns**

- `string` — The Size as a string.

<MemberHeading id="getvalues" depth="3" name="getValues" sig="getValues(): Array.<number>" />

<MemberMeta sourceHref="/source/src/image/size-js/#L75" sourceLabel="size.js:75" />

Get the values of this index.

**Returns**

- `Array.<number>` — The array of values.

<MemberHeading id="morethanone" depth="3" name="moreThanOne" sig="moreThanOne(dimension: number): boolean" />

<MemberMeta sourceHref="/source/src/image/size-js/#L85" sourceLabel="size.js:85" />

Check if a dimension exists and has more than one element.

**Parameters**

- `dimension` (number) — The dimension to check.

**Returns**

- `boolean` — True if the size is more than one.

<MemberHeading id="canscroll3d" depth="3" name="canScroll3D" sig="canScroll3D(viewOrientation?: Matrix33): boolean" />

<MemberMeta sourceHref="/source/src/image/size-js/#L95" sourceLabel="size.js:95" />

Check if the associated data is scrollable in 3D.

**Parameters**

- `viewOrientation` ([Matrix33](/matrix33), optional) — The orientation matrix.

**Returns**

- `boolean` — True if scrollable.

<MemberHeading id="canscroll" depth="3" name="canScroll" sig="canScroll(viewOrientation: Matrix33): boolean" />

<MemberMeta sourceHref="/source/src/image/size-js/#L110" sourceLabel="size.js:110" />

Check if the associated data is scrollable: either in 3D or in other directions.

**Parameters**

- `viewOrientation` ([Matrix33](/matrix33)) — The orientation matrix.

**Returns**

- `boolean` — True if scrollable.

<MemberHeading id="getdimsize" depth="3" name="getDimSize" sig="getDimSize(dimension: number, start?: number): number" />

<MemberMeta sourceHref="/source/src/image/size-js/#L126" sourceLabel="size.js:126" />

Get the size of a given dimension.

**Parameters**

- `dimension` (number) — The dimension.
- `start` (number, optional) — Optional start dimension to start counting from.

**Returns**

- `number` — The size.

<MemberHeading id="gettotalsize" depth="3" name="getTotalSize" sig="getTotalSize(start?: number): number" />

<MemberMeta sourceHref="/source/src/image/size-js/#L148" sourceLabel="size.js:148" />

Get the total size.

**Parameters**

- `start` (number, optional) — Optional start dimension to base the offset on.

**Returns**

- `number` — The total size.

<MemberHeading id="equals" depth="3" name="equals" sig="equals(rhs: Size): boolean" />

<MemberMeta sourceHref="/source/src/image/size-js/#L158" sourceLabel="size.js:158" />

Check for equality.

**Parameters**

- `rhs` ([Size](/size)) — The object to compare to.

**Returns**

- `boolean` — True if both objects are equal.

<MemberHeading id="isinbounds" depth="3" name="isInBounds" sig="isInBounds(index: Index, dirs: Array.<number>): boolean" />

<MemberMeta sourceHref="/source/src/image/size-js/#L185" sourceLabel="size.js:185" />

Check that an index is within bounds.

**Parameters**

- `index` ([Index](/index)) — The index to check.
- `dirs` (Array.\<number>) — Optional list of directions to check.

**Returns**

- `boolean` — True if the given coordinates are within bounds.

<MemberHeading id="indextooffset" depth="3" name="indexToOffset" sig="indexToOffset(index: Index, start?: number): number" />

<MemberMeta sourceHref="/source/src/image/size-js/#L229" sourceLabel="size.js:229" />

Convert an index to an offset in memory.

**Parameters**

- `index` ([Index](/index)) — The index to convert.
- `start` (number, optional) — Optional start dimension to base the offset on.

**Returns**

- `number` — The offset or -1 if out of bounds.

<MemberHeading id="offsettoindex" depth="3" name="offsetToIndex" sig="offsetToIndex(offset: number): Index" />

<MemberMeta sourceHref="/source/src/image/size-js/#L260" sourceLabel="size.js:260" />

Convert an offset in memory to an index.

**Parameters**

- `offset` (number) — The offset to convert.

**Returns**

- [`Index`](/index) — The index.

<MemberHeading id="get2d" depth="3" name="get2D" sig="get2D(): Scalar2D" />

<MemberMeta sourceHref="/source/src/image/size-js/#L278" sourceLabel="size.js:278" />

Get the 2D base of this size.

**Returns**

- [`Scalar2D`](/scalar2d) — The 2D base \[0,1] as {x,y}.

<MemberHeading id="normalisepoint" depth="3" name="normalisePoint" sig="normalisePoint(point: Point, extra?: Point): Point" />

<MemberMeta sourceHref="/source/src/image/size-js/#L316" sourceLabel="size.js:316" />

Normalise a point to this size.

**Parameters**

- `point` ([Point](/point)) — The input point.
- `extra` ([Point](/point), optional) — Optional point used to fill extra dimensions.

**Returns**

- [`Point`](/point) — The result point.

<MemberHeading id="normaliseindex" depth="3" name="normaliseIndex" sig="normaliseIndex(index: Index, extra?: Index): Index" />

<MemberMeta sourceHref="/source/src/image/size-js/#L332" sourceLabel="size.js:332" />

Normalise an index to this size.

**Parameters**

- `index` ([Index](/index)) — The input index.
- `extra` ([Index](/index), optional) — Optional index used to fill extra dimensions.

**Returns**

- [`Index`](/index) — The result point.
