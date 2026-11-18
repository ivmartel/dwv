---
title: Path
kind: class
longname: Path
description: Path shape.
---

# Path

<SourceLink href="/source/src/math/path-js/#L8" label="path.js:8" />

Path shape.

---

## Constructor

<Signature
  code="new Path(
	inputPointArray?: Array.<Point2D>,
	inputControlPointIndexArray?: Array.<number>,
): Path"
/>

**Parameters**

- `inputPointArray` (Array.\<[Point2D](/point2d)>, optional) — The list of Point2D that make the path (optional).
- `inputControlPointIndexArray` (Array.\<number>, optional) — The list of control point of path, as indexes (optional). Note: first and last point do not need to be equal.

---

## Instance Methods

<MemberHeading id="getpoint" depth="3" name="getPoint" sig="getPoint(index: number): Point2D" />

<MemberMeta sourceHref="/source/src/math/path-js/#L40" sourceLabel="path.js:40" />

Get a point of the list.

**Parameters**

- `index` (number) — The index of the point to get (beware, no size check).

**Returns**

- [`Point2D`](/point2d) — The Point2D at the given index.

<MemberHeading id="iscontrolpoint" depth="3" name="isControlPoint" sig="isControlPoint(point: Point2D): boolean" />

<MemberMeta sourceHref="/source/src/math/path-js/#L50" sourceLabel="path.js:50" />

Is the given point a control point.

**Parameters**

- `point` ([Point2D](/point2d)) — The Point2D to check.

**Returns**

- `boolean` — True if a control point.

<MemberHeading id="getlength" depth="3" name="getLength" sig="getLength(): number" />

<MemberMeta sourceHref="/source/src/math/path-js/#L63" sourceLabel="path.js:63" />

Get the length of the path.

**Returns**

- `number` — The length of the path.

<MemberHeading id="addpoint" depth="3" name="addPoint" sig="addPoint(point: Point2D)" />

<MemberMeta sourceHref="/source/src/math/path-js/#L72" sourceLabel="path.js:72" />

Add a point to the path.

**Parameters**

- `point` ([Point2D](/point2d)) — The Point2D to add.

<MemberHeading id="addcontrolpoint" depth="3" name="addControlPoint" sig="addControlPoint(point: Point2D)" />

<MemberMeta sourceHref="/source/src/math/path-js/#L81" sourceLabel="path.js:81" />

Add a control point to the path.

**Parameters**

- `point` ([Point2D](/point2d)) — The Point2D to make a control point.

<MemberHeading id="addpoints" depth="3" name="addPoints" sig="addPoints(newPointArray: Array.<Point2D>)" />

<MemberMeta sourceHref="/source/src/math/path-js/#L96" sourceLabel="path.js:96" />

Add points to the path.

**Parameters**

- `newPointArray` (Array.\<[Point2D](/point2d)>) — The list of Point2D to add.

<MemberHeading id="appenpath" depth="3" name="appenPath" sig="appenPath(other: Path)" />

<MemberMeta sourceHref="/source/src/math/path-js/#L105" sourceLabel="path.js:105" />

Append a Path to this one.

**Parameters**

- `other` ([Path](/path)) — The Path to append.

## Instance Fields

<MemberHeading id="pointarray" depth="3" name="pointArray" sig="pointArray: Array.<Point2D>" />

<MemberMeta sourceHref="/source/src/math/path-js/#L23" sourceLabel="path.js:23" />

List of points.

<MemberHeading id="controlpointindexarray" depth="3" name="controlPointIndexArray" sig="controlPointIndexArray: Array.<number>" />

<MemberMeta sourceHref="/source/src/math/path-js/#L29" sourceLabel="path.js:29" />

List of control points.
