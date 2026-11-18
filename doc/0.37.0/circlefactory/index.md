---
title: CircleFactory
kind: class
longname: CircleFactory
description: Circle factory. Thin adapter that delegates annotation logic to {@link CircleAnnotator} and Konva rendering to {@link ShapeRenderer}.
---

# CircleFactory

<SourceLink href="/source/src/tools/shapes/circle-js/#L17" label="circle.js:17" />

Circle factory.

Thin adapter that delegates annotation logic to [CircleAnnotator](/circleannotator) and Konva rendering to [ShapeRenderer](/shaperenderer).

---

## Constructor

<Signature code="new CircleFactory(): CircleFactory" />

---

## Instance Methods

<MemberHeading id="getname" depth="3" name="getName" sig="getName(): string" />

<MemberMeta sourceHref="/source/src/tools/shapes/circle-js/#L44" sourceLabel="circle.js:44" />

Get the name of the factory.

**Returns**

- `string` — The name.

<MemberHeading id="getgroupname" depth="3" name="getGroupName" sig="getGroupName(): string" />

<MemberMeta sourceHref="/source/src/tools/shapes/circle-js/#L53" sourceLabel="circle.js:53" />

Get the name of the shape group.

**Returns**

- `string` — The name.

<MemberHeading id="getnpoints" depth="3" name="getNPoints" sig="getNPoints(): number" />

<MemberMeta sourceHref="/source/src/tools/shapes/circle-js/#L62" sourceLabel="circle.js:62" />

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

<MemberMeta sourceHref="/source/src/tools/shapes/circle-js/#L72" sourceLabel="circle.js:72" />

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

<MemberMeta sourceHref="/source/src/tools/shapes/circle-js/#L83" sourceLabel="circle.js:83" />

Create a circle shape to be displayed.

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

<MemberMeta sourceHref="/source/src/tools/shapes/circle-js/#L94" sourceLabel="circle.js:94" />

Get anchors to update a circle shape.

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

<MemberMeta sourceHref="/source/src/tools/shapes/circle-js/#L104" sourceLabel="circle.js:104" />

Constrain anchor movement.

**Parameters**

- `anchor` (Konva.Ellipse) — The active anchor.
- `annotation` ([Annotation](/annotation)) — The associated annotation.

<MemberHeading id="onanchormoveend" depth="3" name="onAnchorMoveEnd" sig="onAnchorMoveEnd(anchor: Konva.Ellipse, annotation: Annotation)" />

<MemberMeta sourceHref="/source/src/tools/shapes/circle-js/#L114" sourceLabel="circle.js:114" />

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

<MemberMeta sourceHref="/source/src/tools/shapes/circle-js/#L126" sourceLabel="circle.js:126" />

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

<MemberMeta sourceHref="/source/src/tools/shapes/circle-js/#L136" sourceLabel="circle.js:136" />

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

<MemberMeta sourceHref="/source/src/tools/shapes/circle-js/#L146" sourceLabel="circle.js:146" />

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

<MemberMeta sourceHref="/source/src/tools/shapes/circle-js/#L157" sourceLabel="circle.js:157" />

Update the shape label.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The associated annotation.
- `group` (Konva.Group) — The shape group.
- `style` ([Style](/style)) — The application style.

<MemberHeading id="updateconnector" depth="3" name="updateConnector" sig="updateConnector(annotation: Annotation, group: Konva.Group)" />

<MemberMeta sourceHref="/source/src/tools/shapes/circle-js/#L167" sourceLabel="circle.js:167" />

Update the shape connector.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The associated annotation.
- `group` (Konva.Group) — The shape group.

## Static Methods

<MemberHeading id="supports" depth="3" name="supports" sig="supports(mathShape: object): boolean" />

<MemberMeta badges="static" sourceHref="/source/src/tools/shapes/circle-js/#L35" sourceLabel="circle.js:35" />

Does this factory support the input math shape.

**Parameters**

- `mathShape` (object) — The mathematical shape.

**Returns**

- `boolean` — True if supported.
