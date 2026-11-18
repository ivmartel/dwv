---
title: Protractor
kind: class
longname: Protractor
description: "Protractor shape: 3 points from which to calculate an angle."
---

# Protractor

<SourceLink href="/source/src/math/protractor-js/#L12" label="protractor.js:12" />

Protractor shape: 3 points from which to calculate an angle.

---

## Constructor

<Signature code="new Protractor(points: Array.<Point2D>): Protractor" />

**Parameters**

- `points` (Array.\<[Point2D](/point2d)>) — The list of Point2D that make the protractor.

---

## Instance Methods

<MemberHeading id="getpoint" depth="3" name="getPoint" sig="getPoint(index: number): Point2D | undefined" />

<MemberMeta sourceHref="/source/src/math/protractor-js/#L39" sourceLabel="protractor.js:39" />

Get a point of the list.

**Parameters**

- `index` (number) — The index of the point to get (beware, no size check).

**Returns**

- [`Point2D`](/point2d)` | undefined` — The Point2D at the given index.

<MemberHeading id="getlength" depth="3" name="getLength" sig="getLength(): number" />

<MemberMeta sourceHref="/source/src/math/protractor-js/#L48" sourceLabel="protractor.js:48" />

Get the length of the path (should be 3).

**Returns**

- `number` — The length of the path.

<MemberHeading id="getcentroid" depth="3" name="getCentroid" sig="getCentroid(): Point2D" />

<MemberMeta sourceHref="/source/src/math/protractor-js/#L57" sourceLabel="protractor.js:57" />

Get the centroid of the protractor.

**Returns**

- [`Point2D`](/point2d) — THe centroid point.

<MemberHeading id="contains" depth="3" name="contains" sig="contains(point: Point2D, tolerance?: number): boolean" />

<MemberMeta sourceHref="/source/src/math/protractor-js/#L69" sourceLabel="protractor.js:69" />

Check if a point is on one of the protractor lines, within a tolerance.

**Parameters**

- `point` ([Point2D](/point2d)) — The point to check.
- `tolerance` (number, optional, default: 0) — Optional maximum distance to the lines, defaults to 0.

**Returns**

- `boolean` — True if the point is on the protractor.

<MemberHeading
  id="quantify"
  depth="3"
  name="quantify"
  sig="quantify(
	_viewController: ViewController,
	_flags: Array.<string>,
): Record.<string, NumberValue>"
/>

<MemberMeta sourceHref="/source/src/math/protractor-js/#L86" sourceLabel="protractor.js:86" />

Quantify a path according to view information.

**Parameters**

- `_viewController` ([ViewController](/viewcontroller)) — The associated view controller.
- `_flags` (Array.\<string>) — A list of stat values to calculate.

**Returns**

- `Record.<string, `[`NumberValue`](/numbervalue)`>` — A quantification object.
