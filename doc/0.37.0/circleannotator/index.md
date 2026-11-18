---
title: CircleAnnotator
kind: class
longname: CircleAnnotator
description: Circle shape annotator.
---

# CircleAnnotator

<SourceLink href="/source/src/tools/shapes/shapeannotators-js/#L248" label="shapeAnnotators.js:248" />

Circle shape annotator.

---

## Constructor

<Signature code="new CircleAnnotator(): CircleAnnotator" />

---

## Instance Methods

<MemberHeading id="getname" depth="3" name="getName" sig="getName(): string" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L270" sourceLabel="shapeAnnotators.js:270" />

Get the name.

**Returns**

- `string` — The name.

<MemberHeading id="getgroupname" depth="3" name="getGroupName" sig="getGroupName(): string" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L279" sourceLabel="shapeAnnotators.js:279" />

Get the Konva group name.

**Returns**

- `string` — The group name.

<MemberHeading id="getnpoints" depth="3" name="getNPoints" sig="getNPoints(): number" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L288" sourceLabel="shapeAnnotators.js:288" />

Get the number of points needed to build the shape.

**Returns**

- `number` — The point count.

<MemberHeading id="iscomplete" depth="3" name="isComplete" sig="isComplete(): boolean" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L297" sourceLabel="shapeAnnotators.js:297" />

Returns true when the annotation has enough data to be fully rendered.

**Returns**

- `boolean` — Always true for circles.

<MemberHeading
  id="setannotationmathshape"
  depth="3"
  name="setAnnotationMathShape"
  sig="setAnnotationMathShape(
	annotation: Annotation,
	points: Array.<Point2D>,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L307" sourceLabel="shapeAnnotators.js:307" />

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

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L322" sourceLabel="shapeAnnotators.js:322" />

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

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L337" sourceLabel="shapeAnnotators.js:337" />

Update the annotation math shape after a group translation.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `translation` (object) — The translation {x, y}.

<MemberHeading id="constrainanchormove" depth="3" name="constrainAnchorMove" sig="constrainAnchorMove(anchor: Anchor, annotation: Annotation)" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L355" sourceLabel="shapeAnnotators.js:355" />

Constrain the anchor movement: horizontal anchors block Y, vertical anchors block X.

**Parameters**

- `anchor` ([Anchor](/anchor)) — The active anchor.
- `annotation` ([Annotation](/annotation)) — The annotation (for sibling positions).

<MemberHeading id="onanchormoveend" depth="3" name="onAnchorMoveEnd" sig="onAnchorMoveEnd()" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L378" sourceLabel="shapeAnnotators.js:378" />

Handle anchor movement end.

<MemberHeading id="getanchors" depth="3" name="getAnchors" sig="getAnchors(annotation: Annotation): Array.<Anchor>" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L388" sourceLabel="shapeAnnotators.js:388" />

Get the anchors (left, right, bottom, top).

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.

**Returns**

- `Array.<`[`Anchor`](/anchor)`>` — The anchors.

<MemberHeading id="getconnectorpositions" depth="3" name="getConnectorPositions" sig="getConnectorPositions(annotation: Annotation): Array.<Point2D>" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L407" sourceLabel="shapeAnnotators.js:407" />

Get the connector positions (diagonal points on the circle).

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.

**Returns**

- `Array.<`[`Point2D`](/point2d)`>` — The connector positions.

<MemberHeading id="getdefaultlabelposition" depth="3" name="getDefaultLabelPosition" sig="getDefaultLabelPosition(annotation: Annotation): Point2D" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L426" sourceLabel="shapeAnnotators.js:426" />

Get the default label position.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.

**Returns**

- [`Point2D`](/point2d) — The position.

## Static Methods

<MemberHeading id="supports" depth="3" name="supports" sig="supports(mathShape: object): boolean" />

<MemberMeta badges="static" sourceHref="/source/src/tools/shapes/shapeannotators-js/#L261" sourceLabel="shapeAnnotators.js:261" />

Does this annotator support the input math shape.

**Parameters**

- `mathShape` (object) — The math shape.

**Returns**

- `boolean` — True if supported.
