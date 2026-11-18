---
title: ROI
kind: class
longname: ROI
description: "Region Of Interest shape. Note: should be a closed path."
---

# ROI

<SourceLink href="/source/src/math/roi-js/#L8" label="roi.js:8" />

Region Of Interest shape. Note: should be a closed path.

---

## Constructor

<Signature code="new ROI(points?: Array.<Point2D>): ROI" />

**Parameters**

- `points` (Array.\<[Point2D](/point2d)>, optional) — Optional initial point list.

---

## Instance Methods

<MemberHeading id="getpoint" depth="3" name="getPoint" sig="getPoint(index: number): Point2D | undefined" />

<MemberMeta sourceHref="/source/src/math/roi-js/#L33" sourceLabel="roi.js:33" />

Get a point of the list at a given index.

**Parameters**

- `index` (number) — The index of the point to get (beware, no size check).

**Returns**

- [`Point2D`](/point2d)` | undefined` — The Point2D at the given index.

<MemberHeading id="getpoints" depth="3" name="getPoints" sig="getPoints(): Array.<Point2D>" />

<MemberMeta sourceHref="/source/src/math/roi-js/#L42" sourceLabel="roi.js:42" />

Get the point list.

**Returns**

- `Array.<`[`Point2D`](/point2d)`>` — The list.

<MemberHeading id="getlength" depth="3" name="getLength" sig="getLength(): number" />

<MemberMeta sourceHref="/source/src/math/roi-js/#L51" sourceLabel="roi.js:51" />

Get the length of the point list.

**Returns**

- `number` — The length of the point list.

<MemberHeading id="addpoint" depth="3" name="addPoint" sig="addPoint(point: Point2D)" />

<MemberMeta sourceHref="/source/src/math/roi-js/#L60" sourceLabel="roi.js:60" />

Add a point to the ROI.

**Parameters**

- `point` ([Point2D](/point2d)) — The Point2D to add.

<MemberHeading id="addpoints" depth="3" name="addPoints" sig="addPoints(rhs: Array.<Point2D>)" />

<MemberMeta sourceHref="/source/src/math/roi-js/#L69" sourceLabel="roi.js:69" />

Add points to the ROI.

**Parameters**

- `rhs` (Array.\<[Point2D](/point2d)>) — The array of POints2D to add.

<MemberHeading id="getcentroid" depth="3" name="getCentroid" sig="getCentroid(): Point2D | undefined" />

<MemberMeta sourceHref="/source/src/math/roi-js/#L80" sourceLabel="roi.js:80" />

Get the centroid of the roi. Only valid for a non-self-intersecting closed polygon. Ref: [https://en.wikipedia.org/wiki/Centroid#Of\_a\_polygon](https://en.wikipedia.org/wiki/Centroid#Of_a_polygon).

**Returns**

- [`Point2D`](/point2d)` | undefined` — The centroid point.

<MemberHeading id="contains" depth="3" name="contains" sig="contains(point: Point2D, tolerance?: number): boolean" />

<MemberMeta sourceHref="/source/src/math/roi-js/#L115" sourceLabel="roi.js:115" />

Check if a point is inside the roi (seen as a closed polygon), or within a tolerance of its outline.

**Parameters**

- `point` ([Point2D](/point2d)) — The point to check.
- `tolerance` (number, optional, default: 0) — Optional maximum distance to the outline for an outside point, defaults to 0.

**Returns**

- `boolean` — True if the point is in the roi.
