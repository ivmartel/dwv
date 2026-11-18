---
title: ProtractorKonvaPainter
kind: class
longname: ProtractorKonvaPainter
description: Konva entry for a protractor annotation (two-segment angle + arc).
---

# ProtractorKonvaPainter

<SourceLink href="/source/src/tools/shapes/shapepainters-js/#L466" label="shapePainters.js:466" />

Konva entry for a protractor annotation (two-segment angle + arc).

---

## Constructor

<Signature code="new ProtractorKonvaPainter(): ProtractorKonvaPainter" />

---

## Instance Methods

<MemberHeading id="createshape" depth="3" name="createShape" sig="createShape(annotation: Annotation, style: Style): Konva.Line" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapepainters-js/#L473" sourceLabel="shapePainters.js:473" />

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `style` ([Style](/style)) — The drawing style.

**Returns**

- `Konva.Line` — The Konva node.

<MemberHeading id="updateshape" depth="3" name="updateShape" sig="updateShape(node: Konva.Line, annotation: Annotation)" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapepainters-js/#L496" sourceLabel="shapePainters.js:496" />

**Parameters**

- `node` (Konva.Line) — The Konva node.
- `annotation` ([Annotation](/annotation)) — The updated annotation.

<MemberHeading
  id="createextras"
  depth="3"
  name="createExtras"
  sig="createExtras(
	annotation: Annotation,
	style: Style,
): Array.<Konva.Shape>"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/shapepainters-js/#L519" sourceLabel="shapePainters.js:519" />

Creates the arc indicating the angle (only when complete).

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `style` ([Style](/style)) — The drawing style.

**Returns**

- `Array.<Konva.Shape>` — The arc node (or empty when incomplete).

<MemberHeading
  id="updateextras"
  depth="3"
  name="updateExtras"
  sig="updateExtras(
	group: Konva.Group,
	annotation: Annotation,
	_style: Style,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/shapepainters-js/#L532" sourceLabel="shapePainters.js:532" />

**Parameters**

- `group` (Konva.Group) — The shape group.
- `annotation` ([Annotation](/annotation)) — The updated annotation.
- `_style` ([Style](/style)) — The drawing style (unused).
