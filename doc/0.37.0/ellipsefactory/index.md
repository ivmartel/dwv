---
title: EllipseFactory
kind: class
longname: EllipseFactory
description: Ellipse factory. Thin adapter that delegates annotation logic to {@link EllipseAnnotator} and Konva rendering to {@link ShapeRenderer}.
---

# EllipseFactory

<SourceLink href="/source/src/tools/shapes/ellipse-js/#L17" label="ellipse.js:17" />

Ellipse factory.

Thin adapter that delegates annotation logic to [EllipseAnnotator](/ellipseannotator) and Konva rendering to [ShapeRenderer](/shaperenderer).

---

## Constructor

<Signature code="new EllipseFactory(): EllipseFactory" />

---

## Instance Methods

<MemberHeading id="getname" depth="3" name="getName" sig="getName(): string" />

<MemberMeta sourceHref="/source/src/tools/shapes/ellipse-js/#L44" sourceLabel="ellipse.js:44" />

Get the name of the factory.

**Returns**

- `string` — The name.

<MemberHeading id="getgroupname" depth="3" name="getGroupName" sig="getGroupName(): string" />

<MemberMeta sourceHref="/source/src/tools/shapes/ellipse-js/#L53" sourceLabel="ellipse.js:53" />

Get the name of the shape group.

**Returns**

- `string` — The name.

<MemberHeading id="getnpoints" depth="3" name="getNPoints" sig="getNPoints(): number" />

<MemberMeta sourceHref="/source/src/tools/shapes/ellipse-js/#L62" sourceLabel="ellipse.js:62" />

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

<MemberMeta sourceHref="/source/src/tools/shapes/ellipse-js/#L72" sourceLabel="ellipse.js:72" />

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

<MemberMeta sourceHref="/source/src/tools/shapes/ellipse-js/#L83" sourceLabel="ellipse.js:83" />

Create an ellipse shape to be displayed.

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

<MemberMeta sourceHref="/source/src/tools/shapes/ellipse-js/#L94" sourceLabel="ellipse.js:94" />

Get anchors to update an ellipse shape.

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

<MemberMeta sourceHref="/source/src/tools/shapes/ellipse-js/#L104" sourceLabel="ellipse.js:104" />

Constrain anchor movement.

**Parameters**

- `anchor` (Konva.Ellipse) — The active anchor.
- `annotation` ([Annotation](/annotation)) — The associated annotation.

<MemberHeading id="onanchormoveend" depth="3" name="onAnchorMoveEnd" sig="onAnchorMoveEnd(anchor: Konva.Ellipse, annotation: Annotation)" />

<MemberMeta sourceHref="/source/src/tools/shapes/ellipse-js/#L114" sourceLabel="ellipse.js:114" />

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

<MemberMeta sourceHref="/source/src/tools/shapes/ellipse-js/#L126" sourceLabel="ellipse.js:126" />

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
	anchor: Konva.Shape,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/ellipse-js/#L136" sourceLabel="ellipse.js:136" />

Update an annotation on anchor move.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `anchor` (Konva.Shape) — The anchor.

<MemberHeading
  id="updateannotationontranslation"
  depth="3"
  name="updateAnnotationOnTranslation"
  sig="updateAnnotationOnTranslation(
	annotation: Annotation,
	translation: object,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/ellipse-js/#L146" sourceLabel="ellipse.js:146" />

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

<MemberMeta sourceHref="/source/src/tools/shapes/ellipse-js/#L157" sourceLabel="ellipse.js:157" />

Update the shape label.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The associated annotation.
- `group` (Konva.Group) — The shape group.
- `style` ([Style](/style)) — The application style.

<MemberHeading id="updateconnector" depth="3" name="updateConnector" sig="updateConnector(annotation: Annotation, group: Konva.Group)" />

<MemberMeta sourceHref="/source/src/tools/shapes/ellipse-js/#L167" sourceLabel="ellipse.js:167" />

Update the shape connector.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The associated annotation.
- `group` (Konva.Group) — The shape group.

## Static Methods

<MemberHeading id="supports" depth="3" name="supports" sig="supports(mathShape: object): boolean" />

<MemberMeta badges="static" sourceHref="/source/src/tools/shapes/ellipse-js/#L35" sourceLabel="ellipse.js:35" />

Does this factory support the input math shape.

**Parameters**

- `mathShape` (object) — The mathematical shape.

**Returns**

- `boolean` — True if supported.
