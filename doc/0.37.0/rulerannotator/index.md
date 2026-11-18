---
title: RulerAnnotator
kind: class
longname: RulerAnnotator
description: Ruler (Line) shape annotator.
---

# RulerAnnotator

<SourceLink href="/source/src/tools/shapes/shapeannotators-js/#L651" label="shapeAnnotators.js:651" />

Ruler (Line) shape annotator.

---

## Constructor

<Signature code="new RulerAnnotator(): RulerAnnotator" />

---

## Instance Methods

<MemberHeading id="getname" depth="3" name="getName" sig="getName(): string" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L673" sourceLabel="shapeAnnotators.js:673" />

Get the name.

**Returns**

- `string` — The name.

<MemberHeading id="getgroupname" depth="3" name="getGroupName" sig="getGroupName(): string" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L682" sourceLabel="shapeAnnotators.js:682" />

Get the Konva group name.

**Returns**

- `string` — The group name.

<MemberHeading id="getnpoints" depth="3" name="getNPoints" sig="getNPoints(): number" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L691" sourceLabel="shapeAnnotators.js:691" />

Get the number of points needed to build the shape.

**Returns**

- `number` — The point count.

<MemberHeading id="iscomplete" depth="3" name="isComplete" sig="isComplete(): boolean" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L700" sourceLabel="shapeAnnotators.js:700" />

Returns true when the annotation has enough data to be fully rendered.

**Returns**

- `boolean` — Always true for rulers.

<MemberHeading
  id="setannotationmathshape"
  depth="3"
  name="setAnnotationMathShape"
  sig="setAnnotationMathShape(
	annotation: Annotation,
	points: Array.<Point2D>,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L710" sourceLabel="shapeAnnotators.js:710" />

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

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L722" sourceLabel="shapeAnnotators.js:722" />

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

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L740" sourceLabel="shapeAnnotators.js:740" />

Update the annotation math shape after a group translation.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `translation` (object) — The translation {x, y}.

<MemberHeading id="constrainanchormove" depth="3" name="constrainAnchorMove" sig="constrainAnchorMove(_anchor: Anchor, _annotation: Annotation)" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L759" sourceLabel="shapeAnnotators.js:759" />

Constrain the anchor movement (no constraints for ruler).

**Parameters**

- `_anchor` ([Anchor](/anchor)) — The active anchor.
- `_annotation` ([Annotation](/annotation)) — The annotation (unused).

<MemberHeading id="onanchormoveend" depth="3" name="onAnchorMoveEnd" sig="onAnchorMoveEnd()" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L766" sourceLabel="shapeAnnotators.js:766" />

Handle anchor movement end.

<MemberHeading id="getanchors" depth="3" name="getAnchors" sig="getAnchors(annotation: Annotation): Array.<Anchor>" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L776" sourceLabel="shapeAnnotators.js:776" />

Get the anchors (begin, end).

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.

**Returns**

- `Array.<`[`Anchor`](/anchor)`>` — The anchors.

<MemberHeading id="getconnectorpositions" depth="3" name="getConnectorPositions" sig="getConnectorPositions(annotation: Annotation): Array.<Point2D>" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L792" sourceLabel="shapeAnnotators.js:792" />

Get the connector positions (midpoint).

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.

**Returns**

- `Array.<`[`Point2D`](/point2d)`>` — The connector positions.

<MemberHeading id="getdefaultlabelposition" depth="3" name="getDefaultLabelPosition" sig="getDefaultLabelPosition(annotation: Annotation): Point2D" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L808" sourceLabel="shapeAnnotators.js:808" />

Get the default label position (lowest endpoint).

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.

**Returns**

- [`Point2D`](/point2d) — The position.

## Static Methods

<MemberHeading id="supports" depth="3" name="supports" sig="supports(mathShape: object): boolean" />

<MemberMeta badges="static" sourceHref="/source/src/tools/shapes/shapeannotators-js/#L664" sourceLabel="shapeAnnotators.js:664" />

Does this annotator support the input math shape.

**Parameters**

- `mathShape` (object) — The math shape.

**Returns**

- `boolean` — True if supported.
