---
title: Rectangle
kind: class
longname: Rectangle
description: Rectangle shape.
---

# Rectangle

<SourceLink href="/source/src/math/rectangle-js/#L31" label="rectangle.js:31" />

Rectangle shape.

---

## Constructor

<Signature code="new Rectangle(begin: Point2D, end: Point2D): Rectangle" />

**Parameters**

- `begin` ([Point2D](/point2d)) — A Point2D representing the beginning of the rectangle.
- `end` ([Point2D](/point2d)) — A Point2D representing the end of the rectangle.

---

## Instance Methods

<MemberHeading id="getbegin" depth="3" name="getBegin" sig="getBegin(): Point2D" />

<MemberMeta sourceHref="/source/src/math/rectangle-js/#L69" sourceLabel="rectangle.js:69" />

Get the begin point of the rectangle.

**Returns**

- [`Point2D`](/point2d) — The begin point of the rectangle.

<MemberHeading id="getend" depth="3" name="getEnd" sig="getEnd(): Point2D" />

<MemberMeta sourceHref="/source/src/math/rectangle-js/#L78" sourceLabel="rectangle.js:78" />

Get the end point of the rectangle.

**Returns**

- [`Point2D`](/point2d) — The end point of the rectangle.

<MemberHeading id="equals" depth="3" name="equals" sig="equals(rhs: Rectangle): boolean" />

<MemberMeta sourceHref="/source/src/math/rectangle-js/#L88" sourceLabel="rectangle.js:88" />

Check for equality.

**Parameters**

- `rhs` ([Rectangle](/rectangle)) — The object to compare to.

**Returns**

- `boolean` — True if both objects are equal.

<MemberHeading id="getsurface" depth="3" name="getSurface" sig="getSurface(): number" />

<MemberMeta sourceHref="/source/src/math/rectangle-js/#L99" sourceLabel="rectangle.js:99" />

Get the surface of the rectangle.

**Returns**

- `number` — The surface of the rectangle.

<MemberHeading id="getworldsurface" depth="3" name="getWorldSurface" sig="getWorldSurface(spacing2D: Scalar2D): number" />

<MemberMeta sourceHref="/source/src/math/rectangle-js/#L113" sourceLabel="rectangle.js:113" />

Get the surface of the rectangle according to a spacing.

**Parameters**

- `spacing2D` ([Scalar2D](/scalar2d)) — The 2D spacing.

**Returns**

- `number` — The surface of the rectangle multiplied by the given spacing or null for null spacings.

<MemberHeading id="getrealwidth" depth="3" name="getRealWidth" sig="getRealWidth(): number" />

<MemberMeta sourceHref="/source/src/math/rectangle-js/#L122" sourceLabel="rectangle.js:122" />

Get the real width of the rectangle.

**Returns**

- `number` — The real width of the rectangle.

<MemberHeading id="getrealheight" depth="3" name="getRealHeight" sig="getRealHeight(): number" />

<MemberMeta sourceHref="/source/src/math/rectangle-js/#L131" sourceLabel="rectangle.js:131" />

Get the real height of the rectangle.

**Returns**

- `number` — The real height of the rectangle.

<MemberHeading id="getwidth" depth="3" name="getWidth" sig="getWidth(): number" />

<MemberMeta sourceHref="/source/src/math/rectangle-js/#L140" sourceLabel="rectangle.js:140" />

Get the width of the rectangle.

**Returns**

- `number` — The width of the rectangle.

<MemberHeading id="getheight" depth="3" name="getHeight" sig="getHeight(): number" />

<MemberMeta sourceHref="/source/src/math/rectangle-js/#L149" sourceLabel="rectangle.js:149" />

Get the height of the rectangle.

**Returns**

- `number` — The height of the rectangle.

<MemberHeading id="getround" depth="3" name="getRound" sig="getRound(): object" />

<MemberMeta sourceHref="/source/src/math/rectangle-js/#L158" sourceLabel="rectangle.js:158" />

Get the rounded limits of the rectangle.

**Returns**

- `object` — The rounded limits as {min, max} (Point2D).

<MemberHeading id="getcentroid" depth="3" name="getCentroid" sig="getCentroid(): Point2D" />

<MemberMeta sourceHref="/source/src/math/rectangle-js/#L178" sourceLabel="rectangle.js:178" />

Get the centroid of the rectangle.

**Returns**

- [`Point2D`](/point2d) — The centroid point.

<MemberHeading id="contains" depth="3" name="contains" sig="contains(point: Point2D, tolerance?: number): boolean" />

<MemberMeta sourceHref="/source/src/math/rectangle-js/#L194" sourceLabel="rectangle.js:194" />

Check if a point is inside the rectangle, or within a tolerance of its outline.

**Parameters**

- `point` ([Point2D](/point2d)) — The point to check.
- `tolerance` (number, optional, default: 0) — Optional maximum distance to the outline for an outside point, defaults to 0.

**Returns**

- `boolean` — True if the point is in the rectangle.

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

<MemberMeta sourceHref="/source/src/math/rectangle-js/#L210" sourceLabel="rectangle.js:210" />

Quantify a rectangle according to view information.

**Parameters**

- `viewController` ([ViewController](/viewcontroller)) — The associated view controller.
- `index` ([Index](/index)) — The index at which to get the image values.
- `flags` (Array.\<string>) — A list of stat values to calculate.

**Returns**

- `Record.<string, `[`NumberValue`](/numbervalue)`>` — A quantification object.
