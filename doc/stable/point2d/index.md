---
title: Point2D
kind: class
longname: Point2D
description: Immutable 2D point.
---

# Point2D

<SourceLink href="/source/src/math/point-js/#L7" label="point.js:7" />

Immutable 2D point.

---

## Constructor

<Signature code="new Point2D(x: number, y: number): Point2D" />

**Parameters**

- `x` (number) — The X coordinate for the point.
- `y` (number) — The Y coordinate for the point.

---

## Instance Methods

<MemberHeading id="getx" depth="3" name="getX" sig="getX(): number" />

<MemberMeta sourceHref="/source/src/math/point-js/#L37" sourceLabel="point.js:37" />

Get the X position of the point.

**Returns**

- `number` — The X position of the point.

<MemberHeading id="gety" depth="3" name="getY" sig="getY(): number" />

<MemberMeta sourceHref="/source/src/math/point-js/#L46" sourceLabel="point.js:46" />

Get the Y position of the point.

**Returns**

- `number` — The Y position of the point.

<MemberHeading id="getvalues" depth="3" name="getValues" sig="getValues(): Array.<number>" />

<MemberMeta sourceHref="/source/src/math/point-js/#L55" sourceLabel="point.js:55" />

Get the values of this point.

**Returns**

- `Array.<number>` — The array of values.

<MemberHeading id="getcentroid" depth="3" name="getCentroid" sig="getCentroid(): Point2D" />

<MemberMeta sourceHref="/source/src/math/point-js/#L64" sourceLabel="point.js:64" />

Get the centroid of the point, ie itself.

**Returns**

- [`Point2D`](/point2d) — The centroid point.

<MemberHeading id="contains" depth="3" name="contains" sig="contains(point: Point2D, tolerance?: number): boolean" />

<MemberMeta sourceHref="/source/src/math/point-js/#L75" sourceLabel="point.js:75" />

Check if a point is at this point, within a tolerance.

**Parameters**

- `point` ([Point2D](/point2d)) — The point to check.
- `tolerance` (number, optional, default: 0) — Optional maximum distance, defaults to 0.

**Returns**

- `boolean` — True if the point is within tolerance.

<MemberHeading id="equals" depth="3" name="equals" sig="equals(rhs: Point2D): boolean" />

<MemberMeta sourceHref="/source/src/math/point-js/#L85" sourceLabel="point.js:85" />

Check for Point2D equality.

**Parameters**

- `rhs` ([Point2D](/point2d)) — The other point to compare to.

**Returns**

- `boolean` — True if both points are equal.

<MemberHeading id="tostring" depth="3" name="toString" sig="toString(): string" />

<MemberMeta sourceHref="/source/src/math/point-js/#L97" sourceLabel="point.js:97" />

Get a string representation of the Point2D.

**Returns**

- `string` — The point as a string.

<MemberHeading id="getdistance" depth="3" name="getDistance" sig="getDistance(point2D: Point2D): number" />

<MemberMeta sourceHref="/source/src/math/point-js/#L107" sourceLabel="point.js:107" />

Get the distance to another Point2D.

**Parameters**

- `point2D` ([Point2D](/point2d)) — The input point.

**Returns**

- `number` — Ths distance to the input point.
