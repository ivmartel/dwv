---
title: RoiAnnotator
kind: class
longname: RoiAnnotator
description: ROI shape annotator.
---

# RoiAnnotator

<SourceLink href="/source/src/tools/shapes/shapeannotators-js/#L982" label="shapeAnnotators.js:982" />

ROI shape annotator.

---

## Constructor

<Signature code="new RoiAnnotator(): RoiAnnotator" />

---

## Instance Methods

<MemberHeading id="getname" depth="3" name="getName" sig="getName(): string" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L1004" sourceLabel="shapeAnnotators.js:1004" />

Get the name.

**Returns**

- `string` — The name.

<MemberHeading id="getgroupname" depth="3" name="getGroupName" sig="getGroupName(): string" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L1013" sourceLabel="shapeAnnotators.js:1013" />

Get the Konva group name.

**Returns**

- `string` — The group name.

<MemberHeading id="getnpoints" depth="3" name="getNPoints" sig="getNPoints(): undefined" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L1023" sourceLabel="shapeAnnotators.js:1023" />

Get the number of points needed to build the shape (undefined = double click to finish).

**Returns**

- `undefined` — No fixed point count.

<MemberHeading id="iscomplete" depth="3" name="isComplete" sig="isComplete(): boolean" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L1032" sourceLabel="shapeAnnotators.js:1032" />

Returns true when the annotation has enough data to be fully rendered.

**Returns**

- `boolean` — Always true for ROI.

<MemberHeading
  id="setannotationmathshape"
  depth="3"
  name="setAnnotationMathShape"
  sig="setAnnotationMathShape(
	annotation: Annotation,
	points: Array.<Point2D>,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L1042" sourceLabel="shapeAnnotators.js:1042" />

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

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L1054" sourceLabel="shapeAnnotators.js:1054" />

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

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L1069" sourceLabel="shapeAnnotators.js:1069" />

Update the annotation math shape after a group translation.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `translation` (object) — The translation {x, y}.

<MemberHeading id="constrainanchormove" depth="3" name="constrainAnchorMove" sig="constrainAnchorMove(_anchor: Anchor, _annotation: Annotation)" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L1088" sourceLabel="shapeAnnotators.js:1088" />

Constrain the anchor movement (no constraints for ruler).

**Parameters**

- `_anchor` ([Anchor](/anchor)) — The active anchor.
- `_annotation` ([Annotation](/annotation)) — The annotation (unused).

<MemberHeading id="onanchormoveend" depth="3" name="onAnchorMoveEnd" sig="onAnchorMoveEnd()" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L1095" sourceLabel="shapeAnnotators.js:1095" />

Handle anchor movement end.

<MemberHeading id="getanchors" depth="3" name="getAnchors" sig="getAnchors(annotation: Annotation): Array.<Anchor>" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L1105" sourceLabel="shapeAnnotators.js:1105" />

Get the anchors (one per ROI vertex).

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.

**Returns**

- `Array.<`[`Anchor`](/anchor)`>` — The anchors.

<MemberHeading id="getconnectorpositions" depth="3" name="getConnectorPositions" sig="getConnectorPositions(annotation: Annotation): Array.<Point2D>" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L1121" sourceLabel="shapeAnnotators.js:1121" />

Get the connector positions (edge midpoints).

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.

**Returns**

- `Array.<`[`Point2D`](/point2d)`>` — The connector positions.

<MemberHeading id="getdefaultlabelposition" depth="3" name="getDefaultLabelPosition" sig="getDefaultLabelPosition(annotation: Annotation): Point2D" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L1142" sourceLabel="shapeAnnotators.js:1142" />

Get the default label position (first vertex).

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.

**Returns**

- [`Point2D`](/point2d) — The position.

## Static Methods

<MemberHeading id="supports" depth="3" name="supports" sig="supports(mathShape: object): boolean" />

<MemberMeta badges="static" sourceHref="/source/src/tools/shapes/shapeannotators-js/#L995" sourceLabel="shapeAnnotators.js:995" />

Does this annotator support the input math shape.

**Parameters**

- `mathShape` (object) — The math shape.

**Returns**

- `boolean` — True if supported.
