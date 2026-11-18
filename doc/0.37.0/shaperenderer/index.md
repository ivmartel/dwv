---
title: ShapeRenderer
kind: class
longname: ShapeRenderer
description: Generic Konva shape renderer. Delegates all annotation logic to the injected annotator and all shape-specific Konva operations to the shapePainters registry. This single class replaces the per-factory createShapeGroup / updateShapeGroupOnAnchorMove implementations for all shapes except BidimensionalFactory (which retains its own renderer due to its unique interactive behaviour).
---

# ShapeRenderer

<SourceLink href="/source/src/tools/shapes/shaperenderer-js/#L25" label="shapeRenderer.js:25" />

Generic Konva shape renderer.

Delegates all annotation logic to the injected annotator and all shape-specific Konva operations to the shapePainters registry. This single class replaces the per-factory `createShapeGroup` / `updateShapeGroupOnAnchorMove` implementations for all shapes except BidimensionalFactory (which retains its own renderer due to its unique interactive behaviour).

---

## Constructor

<Signature code="new ShapeRenderer(annotator: object): ShapeRenderer" />

**Parameters**

- `annotator` (object) — The annotator whose shapes this renderer draws.

---

## Instance Methods

<MemberHeading
  id="createshapegroup"
  depth="3"
  name="createShapeGroup"
  sig="createShapeGroup(
	annotation: Annotation,
	style: Style,
): Konva.Group"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/shaperenderer-js/#L60" sourceLabel="shapeRenderer.js:60" />

Create a complete Konva group for an annotation. The group is tagged with the annotation reference so that `getAnchors` and `updateConnector` can retrieve it later.

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

<MemberMeta sourceHref="/source/src/tools/shapes/shaperenderer-js/#L94" sourceLabel="shapeRenderer.js:94" />

Return Konva anchor ellipses for an annotation.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `style` ([Style](/style)) — The drawing style.

**Returns**

- `Array.<Konva.Ellipse>` — The anchor nodes.

<MemberHeading
  id="constrainanchormove"
  depth="3"
  name="constrainAnchorMove"
  sig="constrainAnchorMove(
	konvaAnchor: Konva.Ellipse,
	annotation: Annotation,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/shaperenderer-js/#L112" sourceLabel="shapeRenderer.js:112" />

Constrain an anchor's movement. Converts the active Konva anchor to a generic Anchor, calls the annotator (which may mutate its position), then writes the result back.

**Parameters**

- `konvaAnchor` (Konva.Ellipse) — The active Konva anchor.
- `annotation` ([Annotation](/annotation)) — The annotation.

<MemberHeading
  id="onanchormoveend"
  depth="3"
  name="onAnchorMoveEnd"
  sig="onAnchorMoveEnd(
	konvaAnchor: Konva.Ellipse,
	annotation: Annotation,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/shaperenderer-js/#L126" sourceLabel="shapeRenderer.js:126" />

Handle anchor movement end.

**Parameters**

- `konvaAnchor` (Konva.Ellipse) — The active anchor.
- `annotation` ([Annotation](/annotation)) — The associated annotation.

<MemberHeading
  id="updateannotationonanchormove"
  depth="3"
  name="updateAnnotationOnAnchorMove"
  sig="updateAnnotationOnAnchorMove(
	annotation: Annotation,
	konvaAnchor: Konva.Shape,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/shaperenderer-js/#L154" sourceLabel="shapeRenderer.js:154" />

Update the annotation math shape after a Konva anchor move. Converts the Konva anchor to a generic Anchor before delegating to the annotator.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `konvaAnchor` (Konva.Shape) — The active Konva anchor.

<MemberHeading
  id="updateshapegrouponanchormove"
  depth="3"
  name="updateShapeGroupOnAnchorMove"
  sig="updateShapeGroupOnAnchorMove(
	annotation: Annotation,
	anchor: Konva.Shape,
	style: Style,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/shaperenderer-js/#L170" sourceLabel="shapeRenderer.js:170" />

Update the entire shape group after an anchor has been moved. By the time this is called, `updateAnnotationOnAnchorMove` has already been called by the factory adapter, so `annotation.mathShape` reflects the new geometry.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The updated annotation.
- `anchor` (Konva.Shape) — The active Konva anchor.
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

<MemberMeta sourceHref="/source/src/tools/shapes/shaperenderer-js/#L212" sourceLabel="shapeRenderer.js:212" />

Update the label text inside a shape group.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `group` (Konva.Group) — The shape group.
- `_style` ([Style](/style)) — The drawing style (unused, kept for API symmetry).

<MemberHeading id="updateconnector" depth="3" name="updateConnector" sig="updateConnector(annotation: Annotation, group: Konva.Group)" />

<MemberMeta sourceHref="/source/src/tools/shapes/shaperenderer-js/#L223" sourceLabel="shapeRenderer.js:223" />

Update the connector line between the label and the shape.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation (used for connector positions).
- `group` (Konva.Group) — The shape group.
