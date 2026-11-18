---
title: Ellipse
kind: class
longname: Ellipse
description: Ellipse shape.
---

# Ellipse

<SourceLink href="/source/src/math/ellipse-js/#L31" label="ellipse.js:31" />

Ellipse shape.

---

## Constructor

<Signature code="new Ellipse(centre: Point2D, a: number, b: number): Ellipse" />

**Parameters**

- `centre` ([Point2D](/point2d)) — A Point2D representing the centre of the ellipse.
- `a` (number) — The radius of the ellipse on the horizontal axe.
- `b` (number) — The radius of the ellipse on the vertical axe.

---

## Instance Methods

<MemberHeading id="getcenter" depth="3" name="getCenter" sig="getCenter(): Point2D" />

<MemberMeta sourceHref="/source/src/math/ellipse-js/#L71" sourceLabel="ellipse.js:71" />

Get the centre (point) of the ellipse.

**Returns**

- [`Point2D`](/point2d) — The center (point) of the ellipse.

<MemberHeading id="getcentroid" depth="3" name="getCentroid" sig="getCentroid(): Point2D" />

<MemberMeta sourceHref="/source/src/math/ellipse-js/#L80" sourceLabel="ellipse.js:80" />

Get the centroid of the ellipse.

**Returns**

- [`Point2D`](/point2d) — The centroid point.

<MemberHeading id="geta" depth="3" name="getA" sig="getA(): number" />

<MemberMeta sourceHref="/source/src/math/ellipse-js/#L89" sourceLabel="ellipse.js:89" />

Get the radius of the ellipse on the horizontal axe.

**Returns**

- `number` — The radius of the ellipse on the horizontal axe.

<MemberHeading id="getb" depth="3" name="getB" sig="getB(): number" />

<MemberMeta sourceHref="/source/src/math/ellipse-js/#L98" sourceLabel="ellipse.js:98" />

Get the radius of the ellipse on the vertical axe.

**Returns**

- `number` — The radius of the ellipse on the vertical axe.

<MemberHeading id="contains" depth="3" name="contains" sig="contains(point: Point2D, tolerance?: number): boolean" />

<MemberMeta sourceHref="/source/src/math/ellipse-js/#L110" sourceLabel="ellipse.js:110" />

Check if a point is inside the ellipse, the ellipse radii being extended by a tolerance.

**Parameters**

- `point` ([Point2D](/point2d)) — The point to check.
- `tolerance` (number, optional, default: 0) — Optional radius extension, defaults to 0.

**Returns**

- `boolean` — True if the point is in the ellipse.

<MemberHeading id="equals" depth="3" name="equals" sig="equals(rhs: Ellipse): boolean" />

<MemberMeta sourceHref="/source/src/math/ellipse-js/#L127" sourceLabel="ellipse.js:127" />

Check for equality.

**Parameters**

- `rhs` ([Ellipse](/ellipse)) — The object to compare to.

**Returns**

- `boolean` — True if both objects are equal.

<MemberHeading id="getsurface" depth="3" name="getSurface" sig="getSurface(): number" />

<MemberMeta sourceHref="/source/src/math/ellipse-js/#L139" sourceLabel="ellipse.js:139" />

Get the surface of the ellipse.

**Returns**

- `number` — The surface of the ellipse.

<MemberHeading id="getworldsurface" depth="3" name="getWorldSurface" sig="getWorldSurface(spacing2D: Scalar2D): number" />

<MemberMeta sourceHref="/source/src/math/ellipse-js/#L150" sourceLabel="ellipse.js:150" />

Get the surface of the ellipse according to a spacing.

**Parameters**

- `spacing2D` ([Scalar2D](/scalar2d)) — The 2D spacing.

**Returns**

- `number` — The surface of the ellipse multiplied by the given spacing or null for null spacings.

<MemberHeading id="getround" depth="3" name="getRound" sig="getRound(): Array.<Array.<Array.<number>>>" />

<MemberMeta sourceHref="/source/src/math/ellipse-js/#L166" sourceLabel="ellipse.js:166" />

Get the rounded limits of the ellipse.

See: [https://en.wikipedia.org/wiki/Ellipse#Standard\_equation](https://en.wikipedia.org/wiki/Ellipse#Standard_equation).

Ellipse formula: `x*x / a*a + y*y / b*b = 1`.

Implies: `y = (+-)(b/a) * sqrt(a*a - x*x)`.

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

<MemberMeta sourceHref="/source/src/math/ellipse-js/#L206" sourceLabel="ellipse.js:206" />

Quantify an ellipse according to view information.

**Parameters**

- `viewController` ([ViewController](/viewcontroller)) — The associated view controller.
- `index` ([Index](/index)) — The index at which to get the image values.
- `flags` (Array.\<string>) — A list of stat values to calculate.

**Returns**

- `Record.<string, `[`NumberValue`](/numbervalue)`>` — A quantification object.
