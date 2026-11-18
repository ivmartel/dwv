---
title: ArrowAnnotator
kind: class
longname: ArrowAnnotator
description: Arrow shape annotator. The math shape is the arrow tip (Point2D); the tail is stored in annotation.referencePoints[0].
---

# ArrowAnnotator

<SourceLink href="/source/src/tools/shapes/shapeannotators-js/#L822" label="shapeAnnotators.js:822" />

Arrow shape annotator. The math shape is the arrow tip (Point2D); the tail is stored in annotation.referencePoints\[0].

---

## Constructor

<Signature code="new ArrowAnnotator(): ArrowAnnotator" />

---

## Instance Methods

<MemberHeading id="getname" depth="3" name="getName" sig="getName(): string" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L844" sourceLabel="shapeAnnotators.js:844" />

Get the name.

**Returns**

- `string` — The name.

<MemberHeading id="getgroupname" depth="3" name="getGroupName" sig="getGroupName(): string" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L853" sourceLabel="shapeAnnotators.js:853" />

Get the Konva group name.

**Returns**

- `string` — The group name.

<MemberHeading id="getnpoints" depth="3" name="getNPoints" sig="getNPoints(): number" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L862" sourceLabel="shapeAnnotators.js:862" />

Get the number of points needed to build the shape.

**Returns**

- `number` — The point count.

<MemberHeading id="iscomplete" depth="3" name="isComplete" sig="isComplete(): boolean" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L871" sourceLabel="shapeAnnotators.js:871" />

Returns true when the annotation has enough data to be fully rendered.

**Returns**

- `boolean` — Always true for arrows.

<MemberHeading
  id="setannotationmathshape"
  depth="3"
  name="setAnnotationMathShape"
  sig="setAnnotationMathShape(
	annotation: Annotation,
	points: Array.<Point2D>,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L881" sourceLabel="shapeAnnotators.js:881" />

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

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L894" sourceLabel="shapeAnnotators.js:894" />

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

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L910" sourceLabel="shapeAnnotators.js:910" />

Update the annotation math shape after a group translation.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `translation` (object) — The translation {x, y}.

<MemberHeading id="constrainanchormove" depth="3" name="constrainAnchorMove" sig="constrainAnchorMove(_anchor: Anchor, _annotation: Annotation)" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L926" sourceLabel="shapeAnnotators.js:926" />

Constrain the anchor movement (no constraints for ruler).

**Parameters**

- `_anchor` ([Anchor](/anchor)) — The active anchor.
- `_annotation` ([Annotation](/annotation)) — The annotation (unused).

<MemberHeading id="onanchormoveend" depth="3" name="onAnchorMoveEnd" sig="onAnchorMoveEnd()" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L933" sourceLabel="shapeAnnotators.js:933" />

Handle anchor movement end.

<MemberHeading id="getanchors" depth="3" name="getAnchors" sig="getAnchors(annotation: Annotation): Array.<Anchor>" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L943" sourceLabel="shapeAnnotators.js:943" />

Get the anchors (tip, tail).

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.

**Returns**

- `Array.<`[`Anchor`](/anchor)`>` — The anchors.

<MemberHeading id="getconnectorpositions" depth="3" name="getConnectorPositions" sig="getConnectorPositions(annotation: Annotation): Array.<Point2D>" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L958" sourceLabel="shapeAnnotators.js:958" />

Get the connector positions (midpoint).

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.

**Returns**

- `Array.<`[`Point2D`](/point2d)`>` — The connector positions.

<MemberHeading id="getdefaultlabelposition" depth="3" name="getDefaultLabelPosition" sig="getDefaultLabelPosition(annotation: Annotation): Point2D" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L973" sourceLabel="shapeAnnotators.js:973" />

Get the default label position (at the tip).

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.

**Returns**

- [`Point2D`](/point2d) — The position.

## Static Methods

<MemberHeading id="supports" depth="3" name="supports" sig="supports(mathShape: object): boolean" />

<MemberMeta badges="static" sourceHref="/source/src/tools/shapes/shapeannotators-js/#L835" sourceLabel="shapeAnnotators.js:835" />

Does this annotator support the input math shape.

**Parameters**

- `mathShape` (object) — The math shape.

**Returns**

- `boolean` — True if supported.
