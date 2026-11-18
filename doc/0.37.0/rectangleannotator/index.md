---
title: RectangleAnnotator
kind: class
longname: RectangleAnnotator
description: Rectangle shape annotator. Handles pure annotation logic (math shape ↔ anchor/translation updates) for the rectangle tool — no Konva node creation.
---

# RectangleAnnotator

<SourceLink href="/source/src/tools/shapes/shapeannotators-js/#L38" label="shapeAnnotators.js:38" />

Rectangle shape annotator. Handles pure annotation logic (math shape ↔ anchor/translation updates) for the rectangle tool — no Konva node creation.

---

## Constructor

<Signature code="new RectangleAnnotator(): RectangleAnnotator" />

---

## Instance Methods

<MemberHeading id="getname" depth="3" name="getName" sig="getName(): string" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L65" sourceLabel="shapeAnnotators.js:65" />

Get the name.

**Returns**

- `string` — The name.

<MemberHeading id="getgroupname" depth="3" name="getGroupName" sig="getGroupName(): string" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L74" sourceLabel="shapeAnnotators.js:74" />

Get the Konva group name.

**Returns**

- `string` — The group name.

<MemberHeading id="getnpoints" depth="3" name="getNPoints" sig="getNPoints(): number" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L83" sourceLabel="shapeAnnotators.js:83" />

Get the number of points needed to build the shape.

**Returns**

- `number` — The point count.

<MemberHeading id="iscomplete" depth="3" name="isComplete" sig="isComplete(): boolean" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L92" sourceLabel="shapeAnnotators.js:92" />

Returns true when the annotation has enough data to be fully rendered.

**Returns**

- `boolean` — Always true for rectangles.

<MemberHeading
  id="setannotationmathshape"
  depth="3"
  name="setAnnotationMathShape"
  sig="setAnnotationMathShape(
	annotation: Annotation,
	points: Array.<Point2D>,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L102" sourceLabel="shapeAnnotators.js:102" />

Set the annotation math shape from input points.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `points` (Array.\<[Point2D](/point2d)>) — The input points.

<MemberHeading
  id="updateannotationonanchormove"
  depth="3"
  name="updateAnnotationOnAnchorMove"
  sig="updateAnnotationOnAnchorMove(
	annotation: Annotation,
	anchor: Anchor,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L114" sourceLabel="shapeAnnotators.js:114" />

Update the annotation math shape after an anchor move.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `anchor` ([Anchor](/anchor)) — The active anchor.

<MemberHeading
  id="updateannotationontranslation"
  depth="3"
  name="updateAnnotationOnTranslation"
  sig="updateAnnotationOnTranslation(
	annotation: Annotation,
	translation: object,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L152" sourceLabel="shapeAnnotators.js:152" />

Update the annotation math shape after a group translation.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `translation` (object) — The translation {x, y}.

<MemberHeading id="constrainanchormove" depth="3" name="constrainAnchorMove" sig="constrainAnchorMove(_anchor: Anchor, _annotation: Annotation)" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L171" sourceLabel="shapeAnnotators.js:171" />

Constrain the anchor movement (no constraints for rectangle).

**Parameters**

- `_anchor` ([Anchor](/anchor)) — The active anchor.
- `_annotation` ([Annotation](/annotation)) — The annotation (unused).

<MemberHeading id="onanchormoveend" depth="3" name="onAnchorMoveEnd" sig="onAnchorMoveEnd()" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L178" sourceLabel="shapeAnnotators.js:178" />

Handle anchor movement end.

<MemberHeading id="getanchors" depth="3" name="getAnchors" sig="getAnchors(annotation: Annotation): Array.<Anchor>" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L189" sourceLabel="shapeAnnotators.js:189" />

Get the anchors for the current math shape (topLeft, topRight, bottomRight, bottomLeft).

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.

**Returns**

- `Array.<`[`Anchor`](/anchor)`>` — The anchors.

<MemberHeading id="getconnectorpositions" depth="3" name="getConnectorPositions" sig="getConnectorPositions(annotation: Annotation): Array.<Point2D>" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L215" sourceLabel="shapeAnnotators.js:215" />

Get the connector positions for the current math shape.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.

**Returns**

- `Array.<`[`Point2D`](/point2d)`>` — The connector positions (edge midpoints).

<MemberHeading id="getdefaultlabelposition" depth="3" name="getDefaultLabelPosition" sig="getDefaultLabelPosition(annotation: Annotation): Point2D" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L235" sourceLabel="shapeAnnotators.js:235" />

Get the default label position.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.

**Returns**

- [`Point2D`](/point2d) — The position.

## Static Methods

<MemberHeading id="supports" depth="3" name="supports" sig="supports(mathShape: object): boolean" />

<MemberMeta badges="static" sourceHref="/source/src/tools/shapes/shapeannotators-js/#L56" sourceLabel="shapeAnnotators.js:56" />

Does this annotator support the input math shape.

**Parameters**

- `mathShape` (object) — The math shape.

**Returns**

- `boolean` — True if supported.
