---
title: ArrowKonvaPainter
kind: class
longname: ArrowKonvaPainter
description: Konva entry for an arrow annotation (line + filled arrowhead).
---

# ArrowKonvaPainter

<SourceLink href="/source/src/tools/shapes/shapepainters-js/#L313" label="shapePainters.js:313" />

Konva entry for an arrow annotation (line + filled arrowhead).

---

## Constructor

<Signature code="new ArrowKonvaPainter(): ArrowKonvaPainter" />

---

## Instance Methods

<MemberHeading id="createshape" depth="3" name="createShape" sig="createShape(annotation: Annotation, style: Style): Konva.Line" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapepainters-js/#L320" sourceLabel="shapePainters.js:320" />

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `style` ([Style](/style)) — The drawing style.

**Returns**

- `Konva.Line` — The Konva node.

<MemberHeading
  id="updateshape"
  depth="3"
  name="updateShape"
  sig="updateShape(
	node: Konva.Line,
	annotation: Annotation,
	style: Style,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/shapepainters-js/#L345" sourceLabel="shapePainters.js:345" />

**Parameters**

- `node` (Konva.Line) — The Konva node.
- `annotation` ([Annotation](/annotation)) — The updated annotation.
- `style` ([Style](/style)) — The drawing style.

<MemberHeading
  id="createextras"
  depth="3"
  name="createExtras"
  sig="createExtras(
	annotation: Annotation,
	style: Style,
): Array.<Konva.Shape>"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/shapepainters-js/#L366" sourceLabel="shapePainters.js:366" />

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `style` ([Style](/style)) — The drawing style.

**Returns**

- `Array.<Konva.Shape>` — The arrowhead triangle.

<MemberHeading
  id="updateextras"
  depth="3"
  name="updateExtras"
  sig="updateExtras(
	group: Konva.Group,
	annotation: Annotation,
	style: Style,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/shapepainters-js/#L397" sourceLabel="shapePainters.js:397" />

**Parameters**

- `group` (Konva.Group) — The shape group.
- `annotation` ([Annotation](/annotation)) — The updated annotation.
- `style` ([Style](/style)) — The drawing style.
