---
title: RectangleFactory
kind: class
longname: RectangleFactory
description: Rectangle factory. Thin adapter that delegates annotation logic to {@link RectangleAnnotator} and Konva rendering to {@link ShapeRenderer}.
---

# RectangleFactory

<SourceLink href="/source/src/tools/shapes/rectangle-js/#L17" label="rectangle.js:17" />

Rectangle factory.

Thin adapter that delegates annotation logic to [RectangleAnnotator](/rectangleannotator) and Konva rendering to [ShapeRenderer](/shaperenderer).

---

## Constructor

<Signature code="new RectangleFactory(): RectangleFactory" />

---

## Instance Methods

<MemberHeading id="getname" depth="3" name="getName" sig="getName(): string" />

<MemberMeta sourceHref="/source/src/tools/shapes/rectangle-js/#L44" sourceLabel="rectangle.js:44" />

Get the name of the factory.

**Returns**

- `string` — The name.

<MemberHeading id="getgroupname" depth="3" name="getGroupName" sig="getGroupName(): string" />

<MemberMeta sourceHref="/source/src/tools/shapes/rectangle-js/#L53" sourceLabel="rectangle.js:53" />

Get the name of the shape group.

**Returns**

- `string` — The name.

<MemberHeading id="getnpoints" depth="3" name="getNPoints" sig="getNPoints(): number" />

<MemberMeta sourceHref="/source/src/tools/shapes/rectangle-js/#L62" sourceLabel="rectangle.js:62" />

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

<MemberMeta sourceHref="/source/src/tools/shapes/rectangle-js/#L72" sourceLabel="rectangle.js:72" />

Set an annotation math shape from input points.

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

<MemberMeta sourceHref="/source/src/tools/shapes/rectangle-js/#L83" sourceLabel="rectangle.js:83" />

Create a rectangle shape to be displayed.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The associated annotation.
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

<MemberMeta sourceHref="/source/src/tools/shapes/rectangle-js/#L94" sourceLabel="rectangle.js:94" />

Get anchors to update a rectangle shape.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `style` ([Style](/style)) — The application style.

**Returns**

- `Array.<Konva.Ellipse>` — A list of anchors.

<MemberHeading
  id="constrainanchormove"
  depth="3"
  name="constrainAnchorMove"
  sig="constrainAnchorMove(
	anchor: Konva.Ellipse,
	annotation: Annotation,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/rectangle-js/#L104" sourceLabel="rectangle.js:104" />

Constrain anchor movement.

**Parameters**

- `anchor` (Konva.Ellipse) — The active anchor.
- `annotation` ([Annotation](/annotation)) — The associated annotation.

<MemberHeading id="onanchormoveend" depth="3" name="onAnchorMoveEnd" sig="onAnchorMoveEnd(anchor: Konva.Ellipse, annotation: Annotation)" />

<MemberMeta sourceHref="/source/src/tools/shapes/rectangle-js/#L114" sourceLabel="rectangle.js:114" />

Handle anchor movement end.

**Parameters**

- `anchor` (Konva.Ellipse) — The active anchor.
- `annotation` ([Annotation](/annotation)) — The associated annotation.

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

<MemberMeta sourceHref="/source/src/tools/shapes/rectangle-js/#L126" sourceLabel="rectangle.js:126" />

Update shape and label on anchor move taking the updated annotation as input.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The associated annotation.
- `anchor` (Konva.Ellipse) — The active anchor.
- `style` ([Style](/style)) — The application style.

<MemberHeading
  id="updateannotationonanchormove"
  depth="3"
  name="updateAnnotationOnAnchorMove"
  sig="updateAnnotationOnAnchorMove(
	annotation: Annotation,
	anchor: Konva.Ellipse,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/rectangle-js/#L136" sourceLabel="rectangle.js:136" />

Update an annotation on anchor move.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `anchor` (Konva.Ellipse) — The anchor.

<MemberHeading
  id="updateannotationontranslation"
  depth="3"
  name="updateAnnotationOnTranslation"
  sig="updateAnnotationOnTranslation(
	annotation: Annotation,
	translation: object,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/rectangle-js/#L146" sourceLabel="rectangle.js:146" />

Update an annotation on translation (shape move).

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `translation` (object) — The translation.

<MemberHeading
  id="updatelabelcontent"
  depth="3"
  name="updateLabelContent"
  sig="updateLabelContent(
	annotation: Annotation,
	group: Konva.Group,
	style: Style,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/rectangle-js/#L157" sourceLabel="rectangle.js:157" />

Update the shape label content.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The associated annotation.
- `group` (Konva.Group) — The shape group.
- `style` ([Style](/style)) — The application style.

<MemberHeading id="updateconnector" depth="3" name="updateConnector" sig="updateConnector(annotation: Annotation, group: Konva.Group)" />

<MemberMeta sourceHref="/source/src/tools/shapes/rectangle-js/#L167" sourceLabel="rectangle.js:167" />

Update the shape connector.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The associated annotation.
- `group` (Konva.Group) — The shape group.

## Static Methods

<MemberHeading id="supports" depth="3" name="supports" sig="supports(mathShape: object): boolean" />

<MemberMeta badges="static" sourceHref="/source/src/tools/shapes/rectangle-js/#L35" sourceLabel="rectangle.js:35" />

Does this factory support the input math shape.

**Parameters**

- `mathShape` (object) — The mathematical shape.

**Returns**

- `boolean` — True if supported.
