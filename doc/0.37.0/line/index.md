---
title: Line
kind: class
longname: Line
description: Line shape.
---

# Line

<SourceLink href="/source/src/math/line-js/#L16" label="line.js:16" />

Line shape.

---

## Constructor

<Signature code="new Line(begin: Point2D, end: Point2D): Line" />

**Parameters**

- `begin` ([Point2D](/point2d)) — A Point2D representing the beginning of the line.
- `end` ([Point2D](/point2d)) — A Point2D representing the end of the line.

---

## Instance Methods

<MemberHeading id="getbegin" depth="3" name="getBegin" sig="getBegin(): Point2D" />

<MemberMeta sourceHref="/source/src/math/line-js/#L47" sourceLabel="line.js:47" />

Get the begin point of the line.

**Returns**

- [`Point2D`](/point2d) — The beginning point of the line.

<MemberHeading id="getend" depth="3" name="getEnd" sig="getEnd(): Point2D" />

<MemberMeta sourceHref="/source/src/math/line-js/#L56" sourceLabel="line.js:56" />

Get the end point of the line.

**Returns**

- [`Point2D`](/point2d) — The ending point of the line.

<MemberHeading id="equals" depth="3" name="equals" sig="equals(rhs: Line): boolean" />

<MemberMeta sourceHref="/source/src/math/line-js/#L66" sourceLabel="line.js:66" />

Check for equality.

**Parameters**

- `rhs` ([Line](/line)) — The object to compare to.

**Returns**

- `boolean` — True if both objects are equal.

<MemberHeading id="getdeltax" depth="3" name="getDeltaX" sig="getDeltaX(): number" />

<MemberMeta sourceHref="/source/src/math/line-js/#L77" sourceLabel="line.js:77" />

Get the line delta in the X direction.

**Returns**

- `number` — The delta in the X direction.

<MemberHeading id="getdeltay" depth="3" name="getDeltaY" sig="getDeltaY(): number" />

<MemberMeta sourceHref="/source/src/math/line-js/#L86" sourceLabel="line.js:86" />

Get the line delta in the Y direction.

**Returns**

- `number` — The delta in the Y direction.

<MemberHeading id="getlength" depth="3" name="getLength" sig="getLength(): number" />

<MemberMeta sourceHref="/source/src/math/line-js/#L95" sourceLabel="line.js:95" />

Get the length of the line.

**Returns**

- `number` — The length of the line.

<MemberHeading id="getworldlength" depth="3" name="getWorldLength" sig="getWorldLength(spacing2D: Scalar2D): number" />

<MemberMeta sourceHref="/source/src/math/line-js/#L109" sourceLabel="line.js:109" />

Get the length of the line according to a spacing.

**Parameters**

- `spacing2D` ([Scalar2D](/scalar2d)) — The 2D spacing.

**Returns**

- `number` — The length of the line with spacing or null for null spacings.

<MemberHeading id="getmidpoint" depth="3" name="getMidpoint" sig="getMidpoint(): Point2D" />

<MemberMeta badges="deprecated" sourceHref="/source/src/math/line-js/#L125" sourceLabel="line.js:125" />

Get the mid point of the line.

<Callout type="error">
  &#x20;Since v0.36, please use getCentroid instead.
</Callout>

**Returns**

- [`Point2D`](/point2d) — The mid point of the line.

<MemberHeading id="getcentroid" depth="3" name="getCentroid" sig="getCentroid(): Point2D" />

<MemberMeta sourceHref="/source/src/math/line-js/#L134" sourceLabel="line.js:134" />

Get the centroid of the line.

**Returns**

- [`Point2D`](/point2d) — THe centroid point.

<MemberHeading id="contains" depth="3" name="contains" sig="contains(point: Point2D, tolerance?: number): boolean" />

<MemberMeta sourceHref="/source/src/math/line-js/#L149" sourceLabel="line.js:149" />

Check if a point is on the line, within a tolerance.

**Parameters**

- `point` ([Point2D](/point2d)) — The point to check.
- `tolerance` (number, optional, default: 0) — Optional maximum distance to the line, defaults to 0.

**Returns**

- `boolean` — True if the point is on the line.

<MemberHeading id="getslope" depth="3" name="getSlope" sig="getSlope(): number" />

<MemberMeta sourceHref="/source/src/math/line-js/#L159" sourceLabel="line.js:159" />

Get the slope of the line.

**Returns**

- `number` — The slope of the line.

<MemberHeading id="getintercept" depth="3" name="getIntercept" sig="getIntercept(): number" />

<MemberMeta sourceHref="/source/src/math/line-js/#L168" sourceLabel="line.js:168" />

Get the intercept of the line.

**Returns**

- `number` — The slope of the line.

<MemberHeading id="getinclination" depth="3" name="getInclination" sig="getInclination(): number" />

<MemberMeta sourceHref="/source/src/math/line-js/#L180" sourceLabel="line.js:180" />

Get the inclination of the line.

**Returns**

- `number` — The inclination of the line.

<MemberHeading id="getflipped" depth="3" name="getFlipped" sig="getFlipped(): Line" />

<MemberMeta sourceHref="/source/src/math/line-js/#L193" sourceLabel="line.js:193" />

Get a new line with the start and end flipped.

**Returns**

- [`Line`](/line) — The new flipped line.

<MemberHeading
  id="quantify"
  depth="3"
  name="quantify"
  sig="quantify(
	viewController: ViewController,
): Record.<string, NumberValue>"
/>

<MemberMeta sourceHref="/source/src/math/line-js/#L203" sourceLabel="line.js:203" />

Quantify a line according to view information.

**Parameters**

- `viewController` ([ViewController](/viewcontroller)) — The associated view controller.

**Returns**

- `Record.<string, `[`NumberValue`](/numbervalue)`>` — A quantification object.
