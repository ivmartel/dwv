---
title: RulerKonvaPainter
kind: class
longname: RulerKonvaPainter
description: Konva entry for a ruler annotation (line + end ticks).
---

# RulerKonvaPainter

<SourceLink href="/source/src/tools/shapes/shapepainters-js/#L193" label="shapePainters.js:193" />

Konva entry for a ruler annotation (line + end ticks).

---

## Constructor

<Signature code="new RulerKonvaPainter(): RulerKonvaPainter" />

---

## Instance Methods

<MemberHeading id="createshape" depth="3" name="createShape" sig="createShape(annotation: Annotation, style: Style): Konva.Line" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapepainters-js/#L200" sourceLabel="shapePainters.js:200" />

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

<MemberMeta sourceHref="/source/src/tools/shapes/shapepainters-js/#L223" sourceLabel="shapePainters.js:223" />

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

<MemberMeta sourceHref="/source/src/tools/shapes/shapepainters-js/#L242" sourceLabel="shapePainters.js:242" />

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `style` ([Style](/style)) — The drawing style.

**Returns**

- `Array.<Konva.Shape>` — The tick lines at begin and end.

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

<MemberMeta sourceHref="/source/src/tools/shapes/shapepainters-js/#L281" sourceLabel="shapePainters.js:281" />

**Parameters**

- `group` (Konva.Group) — The shape group.
- `annotation` ([Annotation](/annotation)) — The updated annotation.
- `style` ([Style](/style)) — The drawing style.
