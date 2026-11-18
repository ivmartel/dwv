---
title: Point
kind: class
longname: Point
description: "Immutable point. Warning: the input array is NOT cloned, modifying it will modify the point values."
---

# Point

<SourceLink href="/source/src/math/point-js/#L328" label="point.js:328" />

Immutable point. Warning: the input array is NOT cloned, modifying it will modify the point values.

---

## Constructor

<Signature code="new Point(values: Array.<number>): Point" />

**Parameters**

- `values` (Array.\<number>) — The point values.

---

## Instance Methods

<MemberHeading id="get" depth="3" name="get" sig="get(i: number): number" />

<MemberMeta sourceHref="/source/src/math/point-js/#L362" sourceLabel="point.js:362" />

Get the point value at the given array index.

**Parameters**

- `i` (number) — The index to get.

**Returns**

- `number` — The value.

<MemberHeading id="length" depth="3" name="length" sig="length(): number" />

<MemberMeta sourceHref="/source/src/math/point-js/#L371" sourceLabel="point.js:371" />

Get the length of the point.

**Returns**

- `number` — The length.

<MemberHeading id="tostring" depth="3" name="toString" sig="toString(): string" />

<MemberMeta sourceHref="/source/src/math/point-js/#L380" sourceLabel="point.js:380" />

Get a string representation of the point.

**Returns**

- `string` — The point as a string.

<MemberHeading id="getvalues" depth="3" name="getValues" sig="getValues(): Array.<number>" />

<MemberMeta sourceHref="/source/src/math/point-js/#L389" sourceLabel="point.js:389" />

Get the values of this point.

**Returns**

- `Array.<number>` — The array of values.

<MemberHeading id="cancompare" depth="3" name="canCompare" sig="canCompare(rhs: Point): boolean" />

<MemberMeta sourceHref="/source/src/math/point-js/#L399" sourceLabel="point.js:399" />

Check if the input point can be compared to this one.

**Parameters**

- `rhs` ([Point](/point)) — The point to compare to.

**Returns**

- `boolean` — True if both points are comparable.

<MemberHeading id="equals" depth="3" name="equals" sig="equals(rhs: Point): boolean" />

<MemberMeta sourceHref="/source/src/math/point-js/#L418" sourceLabel="point.js:418" />

Check for Point equality.

**Parameters**

- `rhs` ([Point](/point)) — The point to compare to.

**Returns**

- `boolean` — True if both points are equal.

<MemberHeading id="compare" depth="3" name="compare" sig="compare(rhs: Point): Array.<number>" />

<MemberMeta sourceHref="/source/src/math/point-js/#L439" sourceLabel="point.js:439" />

Compare points and return different dimensions.

**Parameters**

- `rhs` ([Point](/point)) — The point to compare to.

**Returns**

- `Array.<number>` — The list of different dimensions.

<MemberHeading id="get3d" depth="3" name="get3D" sig="get3D(): Point3D" />

<MemberMeta sourceHref="/source/src/math/point-js/#L459" sourceLabel="point.js:459" />

Get the 3D part of this point.

**Returns**

- [`Point3D`](/point3d) — The Point3D.

<MemberHeading id="add" depth="3" name="add" sig="add(rhs: Point): Point" />

<MemberMeta sourceHref="/source/src/math/point-js/#L469" sourceLabel="point.js:469" />

Add another point to this one.

**Parameters**

- `rhs` ([Point](/point)) — The point to add.

**Returns**

- [`Point`](/point) — The point representing the sum of both points.

<MemberHeading id="mergewith3d" depth="3" name="mergeWith3D" sig="mergeWith3D(rhs: Point3D): Point" />

<MemberMeta sourceHref="/source/src/math/point-js/#L489" sourceLabel="point.js:489" />

Merge this point with a Point3D to create a new point.

**Parameters**

- `rhs` ([Point3D](/point3d)) — The Point3D to merge with.

**Returns**

- [`Point`](/point) — The merge result.
