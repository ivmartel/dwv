---
title: KonvaShapePainter
kind: interface
longname: KonvaShapePainter
description: Base class for Konva shape entries. Provides default no-op implementations of createExtras and updateExtras so that subclasses only override what they need.
---

# KonvaShapePainter

<SourceLink href="/source/src/tools/shapes/shapepainters-js/#L28" label="shapePainters.js:28" />

Base class for Konva shape entries.

Provides default no-op implementations of `createExtras` and `updateExtras` so that subclasses only override what they need.

---

## Instance Methods

<MemberHeading id="createshape" depth="3" name="createShape" sig="createShape(_annotation: Annotation, _style: Style): Konva.Shape" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapepainters-js/#L38" sourceLabel="shapePainters.js:38" />

Create the main Konva shape node for an annotation. Must be overridden by subclasses.

**Parameters**

- `_annotation` ([Annotation](/annotation)) — The annotation.
- `_style` ([Style](/style)) — The drawing style.

**Returns**

- `Konva.Shape` — The created shape.

<MemberHeading
  id="updateshape"
  depth="3"
  name="updateShape"
  sig="updateShape(
	_node: Konva.Node,
	_annotation: Annotation,
	_style: Style,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/shapepainters-js/#L50" sourceLabel="shapePainters.js:50" />

Update the main Konva shape node in-place. Must be overridden by subclasses.

**Parameters**

- `_node` (Konva.Node) — The existing Konva node.
- `_annotation` ([Annotation](/annotation)) — The updated annotation.
- `_style` ([Style](/style)) — The drawing style.

<MemberHeading
  id="createextras"
  depth="3"
  name="createExtras"
  sig="createExtras(
	_annotation: Annotation,
	_style: Style,
): Array.<Konva.Shape>"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/shapepainters-js/#L62" sourceLabel="shapePainters.js:62" />

Create auxiliary Konva nodes (ticks, arrowhead, arc, …). Default: no extras.

**Parameters**

- `_annotation` ([Annotation](/annotation)) — The annotation.
- `_style` ([Style](/style)) — The drawing style.

**Returns**

- `Array.<Konva.Shape>` — Empty array.

<MemberHeading
  id="updateextras"
  depth="3"
  name="updateExtras"
  sig="updateExtras(
	_group: Konva.Group,
	_annotation: Annotation,
	_style: Style,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/shapepainters-js/#L74" sourceLabel="shapePainters.js:74" />

Update auxiliary Konva nodes in-place. Default: nothing to update.

**Parameters**

- `_group` (Konva.Group) — The shape group.
- `_annotation` ([Annotation](/annotation)) — The updated annotation.
- `_style` ([Style](/style)) — The drawing style.
