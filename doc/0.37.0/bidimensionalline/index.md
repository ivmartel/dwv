---
title: BidimensionalLine
kind: class
longname: BidimensionalLine
description: BidimensionalLine shape. Represents a line with a main (long) axis and a perpendicular (short) axis.
---

# BidimensionalLine

<SourceLink href="/source/src/math/bidimensionalline-js/#L13" label="bidimensionalLine.js:13" />

BidimensionalLine shape. Represents a line with a main (long) axis and a perpendicular (short) axis.

---

## Constructor

<Signature
  code="new BidimensionalLine(
	begin: Point2D,
	end: Point2D,
): BidimensionalLine"
/>

**Parameters**

- `begin` ([Point2D](/point2d)) — The beginning point of the main axis.
- `end` ([Point2D](/point2d)) — The ending point of the main axis.

---

## Instance Methods

<MemberHeading id="getbegin" depth="3" name="getBegin" sig="getBegin(): Point2D" />

<MemberMeta sourceHref="/source/src/math/bidimensionalline-js/#L120" sourceLabel="bidimensionalLine.js:120" />

Get the begin point of the main axis.

**Returns**

- [`Point2D`](/point2d) — The beginning point.

<MemberHeading id="getend" depth="3" name="getEnd" sig="getEnd(): Point2D" />

<MemberMeta sourceHref="/source/src/math/bidimensionalline-js/#L129" sourceLabel="bidimensionalLine.js:129" />

Get the end point of the main axis.

**Returns**

- [`Point2D`](/point2d) — The ending point.

<MemberHeading id="getcentroid" depth="3" name="getCentroid" sig="getCentroid(): Point2D" />

<MemberMeta sourceHref="/source/src/math/bidimensionalline-js/#L138" sourceLabel="bidimensionalLine.js:138" />

Get the centroid (midpoint) of the main axis.

**Returns**

- [`Point2D`](/point2d) — The centroid point.

<MemberHeading id="contains" depth="3" name="contains" sig="contains(point: Point2D, tolerance?: number): boolean" />

<MemberMeta sourceHref="/source/src/math/bidimensionalline-js/#L153" sourceLabel="bidimensionalLine.js:153" />

Check if a point is on the main or short axis, within a tolerance.

**Parameters**

- `point` ([Point2D](/point2d)) — The point to check.
- `tolerance` (number, optional, default: 0) — Optional maximum distance to the axes, defaults to 0.

**Returns**

- `boolean` — True if the point is on one of the axes.

<MemberHeading id="getlength" depth="3" name="getLength" sig="getLength(): number" />

<MemberMeta sourceHref="/source/src/math/bidimensionalline-js/#L180" sourceLabel="bidimensionalLine.js:180" />

Get the length of the main axis.

**Returns**

- `number` — The length.

<MemberHeading id="getslope" depth="3" name="getSlope" sig="getSlope(): number" />

<MemberMeta sourceHref="/source/src/math/bidimensionalline-js/#L191" sourceLabel="bidimensionalLine.js:191" />

Get the slope of the main axis.

**Returns**

- `number` — The slope.

<MemberHeading id="getdeltax" depth="3" name="getDeltaX" sig="getDeltaX(): number" />

<MemberMeta sourceHref="/source/src/math/bidimensionalline-js/#L205" sourceLabel="bidimensionalLine.js:205" />

Get the delta in the X direction for the main axis.

**Returns**

- `number` — The delta X.

<MemberHeading id="getdeltay" depth="3" name="getDeltaY" sig="getDeltaY(): number" />

<MemberMeta sourceHref="/source/src/math/bidimensionalline-js/#L214" sourceLabel="bidimensionalLine.js:214" />

Get the delta in the Y direction for the main axis.

**Returns**

- `number` — The delta Y.

<MemberHeading id="quantify" depth="3" name="quantify" sig="quantify(viewController: ViewController): Object" />

<MemberMeta sourceHref="/source/src/math/bidimensionalline-js/#L229" sourceLabel="bidimensionalLine.js:229" />

Quantify the bidimensional line according to view information. Returns the length (main axis) and width (short axis) if available.

**Parameters**

- `viewController` ([ViewController](/viewcontroller)) — The associated view controller.

**Returns**

- `Object` — Quantification object.

## Static Methods

<MemberHeading
  id="restorepropertiesfromquantification"
  depth="3"
  name="restorePropertiesFromQuantification"
  sig="restorePropertiesFromQuantification(
	annotation: Annotation,
	bidim: BidimensionalLine,
	quant: object,
)"
/>

<MemberMeta badges="static" sourceHref="/source/src/math/bidimensionalline-js/#L313" sourceLabel="bidimensionalLine.js:313" />

Restore all bidimensional (short axis) properties from quantification data and a BidimensionalLine instance to the annotation object. This ensures that after loading from a saved drawing, the annotation has all the properties needed for correct display and quantification.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation to update.
- `bidim` ([BidimensionalLine](/bidimensionalline)) — The BidimensionalLine math shape.
- `quant` (object) — The quantification object containing saved properties.

## Instance Fields

<MemberHeading id="shortaxislength" depth="3" name="shortAxisLength" sig="shortAxisLength: number" />

<MemberMeta sourceHref="/source/src/math/bidimensionalline-js/#L34" sourceLabel="bidimensionalLine.js:34" />

Optional length of the short axis (perpendicular to main axis).

<MemberHeading id="shortaxiscenter" depth="3" name="shortAxisCenter" sig="shortAxisCenter: Point2D | undefined" />

<MemberMeta sourceHref="/source/src/math/bidimensionalline-js/#L41" sourceLabel="bidimensionalLine.js:41" />

Optional length of the short axis (perpendicular to main axis).

<MemberHeading id="shortaxisl1" depth="3" name="shortAxisL1" sig="shortAxisL1: number" />

<MemberMeta sourceHref="/source/src/math/bidimensionalline-js/#L48" sourceLabel="bidimensionalLine.js:48" />

Optional length from center to one end of the short axis.

<MemberHeading id="shortaxisl2" depth="3" name="shortAxisL2" sig="shortAxisL2: number" />

<MemberMeta sourceHref="/source/src/math/bidimensionalline-js/#L55" sourceLabel="bidimensionalLine.js:55" />

Optional length from center to the other end of the short axis.

<MemberHeading id="shortaxist" depth="3" name="shortAxisT" sig="shortAxisT: number" />

<MemberMeta sourceHref="/source/src/math/bidimensionalline-js/#L63" sourceLabel="bidimensionalLine.js:63" />

Optional relative position (0-1) of the short axis center along the main axis.

<MemberHeading id="shortaxiscenter" depth="3" name="shortAxisCenter" sig="shortAxisCenter: Point2D | undefined" />

<MemberMeta sourceHref="/source/src/math/bidimensionalline-js/#L77" sourceLabel="bidimensionalLine.js:77" />

Center of the short axis.

<MemberHeading id="shortaxist" depth="3" name="shortAxisT" sig="shortAxisT: number | undefined" />

<MemberMeta sourceHref="/source/src/math/bidimensionalline-js/#L84" sourceLabel="bidimensionalLine.js:84" />

Short axis T value.

<MemberHeading id="shortaxisl1" depth="3" name="shortAxisL1" sig="shortAxisL1: number | undefined" />

<MemberMeta sourceHref="/source/src/math/bidimensionalline-js/#L91" sourceLabel="bidimensionalLine.js:91" />

Short axis L1 value.

<MemberHeading id="shortaxisl2" depth="3" name="shortAxisL2" sig="shortAxisL2: number | undefined" />

<MemberMeta sourceHref="/source/src/math/bidimensionalline-js/#L98" sourceLabel="bidimensionalLine.js:98" />

Short axis L2 value.

<MemberHeading id="shortaxislength" depth="3" name="shortAxisLength" sig="shortAxisLength: number | undefined" />

<MemberMeta sourceHref="/source/src/math/bidimensionalline-js/#L105" sourceLabel="bidimensionalLine.js:105" />

Short axis length.

<MemberHeading id="hasshortaxisinteraction" depth="3" name="hasShortAxisInteraction" sig="hasShortAxisInteraction: boolean" />

<MemberMeta sourceHref="/source/src/math/bidimensionalline-js/#L112" sourceLabel="bidimensionalLine.js:112" />

Indicates if the annotation has short axis interaction.
