---
title: Point3D
kind: class
longname: Point3D
description: Immutable 3D point.
---

# Point3D

<SourceLink href="/source/src/math/point-js/#L118" label="point.js:118" />

Immutable 3D point.

---

## Constructor

<Signature code="new Point3D(x: number, y: number, z: number): Point3D" />

**Parameters**

- `x` (number) — The X coordinate for the point.
- `y` (number) — The Y coordinate for the point.
- `z` (number) — The Z coordinate for the point.

---

## Instance Methods

<MemberHeading id="getx" depth="3" name="getX" sig="getX(): number" />

<MemberMeta sourceHref="/source/src/math/point-js/#L157" sourceLabel="point.js:157" />

Get the X position of the point.

**Returns**

- `number` — The X position of the point.

<MemberHeading id="gety" depth="3" name="getY" sig="getY(): number" />

<MemberMeta sourceHref="/source/src/math/point-js/#L166" sourceLabel="point.js:166" />

Get the Y position of the point.

**Returns**

- `number` — The Y position of the point.

<MemberHeading id="getz" depth="3" name="getZ" sig="getZ(): number" />

<MemberMeta sourceHref="/source/src/math/point-js/#L175" sourceLabel="point.js:175" />

Get the Z position of the point.

**Returns**

- `number` — The Z position of the point.

<MemberHeading id="getvalues" depth="3" name="getValues" sig="getValues(): Array.<number>" />

<MemberMeta sourceHref="/source/src/math/point-js/#L184" sourceLabel="point.js:184" />

Get the values of this point.

**Returns**

- `Array.<number>` — The array of values.

<MemberHeading id="equals" depth="3" name="equals" sig="equals(rhs: Point3D): boolean" />

<MemberMeta sourceHref="/source/src/math/point-js/#L194" sourceLabel="point.js:194" />

Check for Point3D equality.

**Parameters**

- `rhs` ([Point3D](/point3d)) — The other point to compare to.

**Returns**

- `boolean` — True if both points are equal.

<MemberHeading id="issimilar" depth="3" name="isSimilar" sig="isSimilar(rhs: Point3D, tol?: number): boolean" />

<MemberMeta sourceHref="/source/src/math/point-js/#L209" sourceLabel="point.js:209" />

Check for Point3D similarity.

**Parameters**

- `rhs` ([Point3D](/point3d)) — The other point to compare to.
- `tol` (number, optional) — Optional number comparison tolerance, defaults to Number.EPSILON.

**Returns**

- `boolean` — True if both points are similar.

<MemberHeading id="tostring" depth="3" name="toString" sig="toString(): string" />

<MemberMeta sourceHref="/source/src/math/point-js/#L221" sourceLabel="point.js:221" />

Get a string representation of the Point3D.

**Returns**

- `string` — The point as a string.

<MemberHeading id="getdistance" depth="3" name="getDistance" sig="getDistance(point3D: Point3D): number" />

<MemberMeta sourceHref="/source/src/math/point-js/#L233" sourceLabel="point.js:233" />

Get the distance to another Point3D.

**Parameters**

- `point3D` ([Point3D](/point3d)) — The input point.

**Returns**

- `number` — Ths distance to the input point.

<MemberHeading id="getclosest" depth="3" name="getClosest" sig="getClosest(pointList: Array.<Point3D>): number" />

<MemberMeta sourceHref="/source/src/math/point-js/#L257" sourceLabel="point.js:257" />

Get the closest point to this in a Point3D list.

**Parameters**

- `pointList` (Array.\<[Point3D](/point3d)>) — The list to check.

**Returns**

- `number` — The index of the closest point in the input list.

<MemberHeading id="minus" depth="3" name="minus" sig="minus(point3D: Point3D): Vector3D" />

<MemberMeta sourceHref="/source/src/math/point-js/#L277" sourceLabel="point.js:277" />

Get the difference to another Point3D.

**Parameters**

- `point3D` ([Point3D](/point3d)) — The input point.

**Returns**

- [`Vector3D`](/vector3d) — The 3D vector from the input point to this one.
