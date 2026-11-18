---
title: BidimensionalFactory
kind: class
longname: BidimensionalFactory
description: Bidimensional (long/short axis) annotation factory.
---

# BidimensionalFactory

<SourceLink href="/source/src/tools/shapes/bidimensional-js/#L22" label="bidimensional.js:22" />

Bidimensional (long/short axis) annotation factory.

---

## Constructor

<Signature code="new BidimensionalFactory(): BidimensionalFactory" />

---

## Instance Methods

<MemberHeading id="getname" depth="3" name="getName" sig="getName(): string" />

<MemberMeta sourceHref="/source/src/tools/shapes/bidimensional-js/#L53" sourceLabel="bidimensional.js:53" />

Get the name of the factory.

**Returns**

- `string` — The name.

<MemberHeading id="getgroupname" depth="3" name="getGroupName" sig="getGroupName(): string" />

<MemberMeta sourceHref="/source/src/tools/shapes/bidimensional-js/#L62" sourceLabel="bidimensional.js:62" />

Get the name of the shape group.

**Returns**

- `string` — The name.

<MemberHeading id="getnpoints" depth="3" name="getNPoints" sig="getNPoints(): number" />

<MemberMeta sourceHref="/source/src/tools/shapes/bidimensional-js/#L71" sourceLabel="bidimensional.js:71" />

Get the number of points needed to build the shape.

**Returns**

- `number` — The number of points.

<MemberHeading
  id="setannotationmathshape"
  depth="3"
  name="setAnnotationMathShape"
  sig="setAnnotationMathShape(
	annotation: Annotation,
	points: Array.<Point2D>,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/bidimensional-js/#L105" sourceLabel="bidimensional.js:105" />

Set an annotation math shape from input points. Initializes the short axis and related properties if needed.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `points` (Array.\<[Point2D](/point2d)>) — The points.

<MemberHeading
  id="createshapegroup"
  depth="3"
  name="createShapeGroup"
  sig="createShapeGroup(
	annotation: Annotation,
	style: Style,
): Konva.Group"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/bidimensional-js/#L140" sourceLabel="bidimensional.js:140" />

Create a Konva group for the bidimensional annotation.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `style` ([Style](/style)) — The drawing style.

**Returns**

- `Konva.Group` — The Konva group.

<MemberHeading
  id="getanchors"
  depth="3"
  name="getAnchors"
  sig="getAnchors(
	annotation: Annotation,
	style: Style,
): Array.<Konva.Ellipse>"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/bidimensional-js/#L394" sourceLabel="bidimensional.js:394" />

Get anchors for an annotation.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `style` ([Style](/style)) — The drawing style.

**Returns**

- `Array.<Konva.Ellipse>` — The anchors.

<MemberHeading
  id="constrainanchormove"
  depth="3"
  name="constrainAnchorMove"
  sig="constrainAnchorMove(
	anchor: Konva.Ellipse,
	annotation: Annotation,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/bidimensional-js/#L416" sourceLabel="bidimensional.js:416" />

Constrain anchor movement for short axis anchors.

**Parameters**

- `anchor` (Konva.Ellipse) — The active anchor.
- `annotation` ([Annotation](/annotation)) — The associated annotation.

<MemberHeading id="onanchormoveend" depth="3" name="onAnchorMoveEnd" sig="onAnchorMoveEnd(_anchor: Konva.Ellipse, _annotation: Annotation)" />

<MemberMeta sourceHref="/source/src/tools/shapes/bidimensional-js/#L476" sourceLabel="bidimensional.js:476" />

Handle anchor movement end.

**Parameters**

- `_anchor` (Konva.Ellipse) — The active anchor.
- `_annotation` ([Annotation](/annotation)) — The associated annotation.

<MemberHeading
  id="updateshapegrouponanchormove"
  depth="3"
  name="updateShapeGroupOnAnchorMove"
  sig="updateShapeGroupOnAnchorMove(
	annotation: Annotation,
	anchor: Konva.Ellipse,
	style: Style,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/bidimensional-js/#L487" sourceLabel="bidimensional.js:487" />

Update shape and label on anchor move.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `anchor` (Konva.Ellipse) — The active anchor.
- `style` ([Style](/style)) — The drawing style.

<MemberHeading
  id="updatelabelcontent"
  depth="3"
  name="updateLabelContent"
  sig="updateLabelContent(
	annotation: Annotation,
	group: Konva.Group,
	_style: Style,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/bidimensional-js/#L612" sourceLabel="bidimensional.js:612" />

Update the label content.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `group` (Konva.Group) — The shape group.
- `_style` ([Style](/style)) — The drawing style.

<MemberHeading id="updateconnector" depth="3" name="updateConnector" sig="updateConnector(annotation: Annotation, group: Konva.Group)" />

<MemberMeta sourceHref="/source/src/tools/shapes/bidimensional-js/#L622" sourceLabel="bidimensional.js:622" />

Update the label connector.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `group` (Konva.Group) — The shape group.

<MemberHeading
  id="updateannotationontranslation"
  depth="3"
  name="updateAnnotationOnTranslation"
  sig="updateAnnotationOnTranslation(
	annotation: Annotation,
	translation: object,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/bidimensional-js/#L653" sourceLabel="bidimensional.js:653" />

Update annotation on translation (shape move).

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `translation` (object) — The translation.

<MemberHeading
  id="updateannotationonanchormove"
  depth="3"
  name="updateAnnotationOnAnchorMove"
  sig="updateAnnotationOnAnchorMove(
	annotation: Annotation,
	anchor: Konva.Shape,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/bidimensional-js/#L695" sourceLabel="bidimensional.js:695" />

Update annotation on anchor move.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `anchor` (Konva.Shape) — The anchor.

<MemberHeading id="updateshortaxistosolid" depth="3" name="updateShortAxisToSolid" sig="updateShortAxisToSolid(group: Konva.Group)" />

<MemberMeta sourceHref="/source/src/tools/shapes/bidimensional-js/#L763" sourceLabel="bidimensional.js:763" />

Set the short axis to solid (remove dash).

**Parameters**

- `group` (Konva.Group) — The shape group.

<MemberHeading
  id="updateshortaxisticks"
  depth="3"
  name="updateShortAxisTicks"
  sig="updateShortAxisTicks(
	group: Konva.Group,
	sa1: Point2D,
	sa2: Point2D,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/bidimensional-js/#L778" sourceLabel="bidimensional.js:778" />

Update the short axis ticks.

**Parameters**

- `group` (Konva.Group) — The shape group.
- `sa1` ([Point2D](/point2d)) — The first short axis endpoint.
- `sa2` ([Point2D](/point2d)) — The second short axis endpoint.

<MemberHeading id="getshortaxisendpoints" depth="3" name="getShortAxisEndpoints" sig="getShortAxisEndpoints(annotation: Annotation): Array.<Point2D>" />

<MemberMeta sourceHref="/source/src/tools/shapes/bidimensional-js/#L842" sourceLabel="bidimensional.js:842" />

Get the endpoints of the short axis.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.

**Returns**

- `Array.<`[`Point2D`](/point2d)`>` — The endpoints as an array of two Point2D objects.

<MemberHeading id="getpointalongline" depth="3" name="getPointAlongLine" sig="getPointAlongLine(line: BidimensionalLine, t: number): Point2D" />

<MemberMeta sourceHref="/source/src/tools/shapes/bidimensional-js/#L924" sourceLabel="bidimensional.js:924" />

Get a point along the main axis line.

**Parameters**

- `line` ([BidimensionalLine](/bidimensionalline)) — The main axis line.
- `t` (number) — The interpolation parameter \[0, 1].

**Returns**

- [`Point2D`](/point2d) — The point along the line.

## Static Methods

<MemberHeading id="supports" depth="3" name="supports" sig="supports(mathShape: object): boolean" />

<MemberMeta badges="static" sourceHref="/source/src/tools/shapes/bidimensional-js/#L44" sourceLabel="bidimensional.js:44" />

Does this factory support the input math shape.

**Parameters**

- `mathShape` (object) — The mathematical shape.

**Returns**

- `boolean` — True if supported.
