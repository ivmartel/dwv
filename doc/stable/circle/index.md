---
title: Circle
kind: class
longname: Circle
description: Circle shape.
---

# Circle

<SourceLink href="/source/src/math/circle-js/#L31" label="circle.js:31" />

Circle shape.

---

## Constructor

<Signature code="new Circle(centre: Point2D, radius: number): Circle" />

**Parameters**

- `centre` ([Point2D](/point2d)) — A Point2D representing the centre of the circle.
- `radius` (number) — The radius of the circle.

---

## Instance Methods

<MemberHeading id="getcenter" depth="3" name="getCenter" sig="getCenter(): Point2D" />

<MemberMeta sourceHref="/source/src/math/circle-js/#L62" sourceLabel="circle.js:62" />

Get the centre (point) of the circle.

**Returns**

- [`Point2D`](/point2d) — The center (point) of the circle.

<MemberHeading id="getcentroid" depth="3" name="getCentroid" sig="getCentroid(): Point2D" />

<MemberMeta sourceHref="/source/src/math/circle-js/#L71" sourceLabel="circle.js:71" />

Get the centroid of the circle.

**Returns**

- [`Point2D`](/point2d) — The centroid point.

<MemberHeading id="getradius" depth="3" name="getRadius" sig="getRadius(): number" />

<MemberMeta sourceHref="/source/src/math/circle-js/#L80" sourceLabel="circle.js:80" />

Get the radius of the circle.

**Returns**

- `number` — The radius of the circle.

<MemberHeading id="contains" depth="3" name="contains" sig="contains(point: Point2D, tolerance?: number): boolean" />

<MemberMeta sourceHref="/source/src/math/circle-js/#L93" sourceLabel="circle.js:93" />

Check if a point is inside the circle, or within a tolerance of its outline.

**Parameters**

- `point` ([Point2D](/point2d)) — The point to check.
- `tolerance` (number, optional, default: 0) — Optional maximum distance to the outline for an outside point, defaults to 0.

**Returns**

- `boolean` — True if the point is in the circle.

<MemberHeading id="equals" depth="3" name="equals" sig="equals(rhs: Circle): boolean" />

<MemberMeta sourceHref="/source/src/math/circle-js/#L104" sourceLabel="circle.js:104" />

Check for equality.

**Parameters**

- `rhs` ([Circle](/circle)) — The object to compare to.

**Returns**

- `boolean` — True if both objects are equal.

<MemberHeading id="getsurface" depth="3" name="getSurface" sig="getSurface(): number" />

<MemberMeta sourceHref="/source/src/math/circle-js/#L115" sourceLabel="circle.js:115" />

Get the surface of the circle.

**Returns**

- `number` — The surface of the circle.

<MemberHeading id="getworldsurface" depth="3" name="getWorldSurface" sig="getWorldSurface(spacing2D: Scalar2D): number" />

<MemberMeta sourceHref="/source/src/math/circle-js/#L126" sourceLabel="circle.js:126" />

Get the surface of the circle according to a spacing.

**Parameters**

- `spacing2D` ([Scalar2D](/scalar2d)) — The 2D spacing.

**Returns**

- `number` — The surface of the circle multiplied by the given spacing or null for null spacings.

<MemberHeading id="getround" depth="3" name="getRound" sig="getRound(): Array.<Array.<Array.<number>>>" />

<MemberMeta sourceHref="/source/src/math/circle-js/#L142" sourceLabel="circle.js:142" />

Get the rounded limits of the circle.

See: [https://en.wikipedia.org/wiki/Circle#Equations](https://en.wikipedia.org/wiki/Circle#Equations).

Circle formula: `x*x + y*y = r*r`.

Implies: `y = (+-) sqrt(r*r - x*x)`.

**Returns**

- `Array.<Array.<Array.<number>>>` — The rounded limits: list of \[x, y] pairs (min, max).

<MemberHeading
  id="quantify"
  depth="3"
  name="quantify"
  sig="quantify(
	viewController: ViewController,
	index: Index,
	flags: Array.<string>,
): Record.<string, NumberValue>"
/>

<MemberMeta sourceHref="/source/src/math/circle-js/#L180" sourceLabel="circle.js:180" />

Quantify an circle according to view information.

**Parameters**

- `viewController` ([ViewController](/viewcontroller)) — The associated view controller.
- `index` ([Index](/index)) — The index at which to get the image values.
- `flags` (Array.\<string>) — A list of stat values to calculate.

**Returns**

- `Record.<string, `[`NumberValue`](/numbervalue)`>` — A quantification object.
