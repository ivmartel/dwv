---
title: RoiKonvaPainter
kind: class
longname: RoiKonvaPainter
description: Konva entry for an ROI (region of interest) annotation.
---

# RoiKonvaPainter

<SourceLink href="/source/src/tools/shapes/shapepainters-js/#L423" label="shapePainters.js:423" />

Konva entry for an ROI (region of interest) annotation.

---

## Constructor

<Signature code="new RoiKonvaPainter(): RoiKonvaPainter" />

---

## Instance Methods

<MemberHeading id="createshape" depth="3" name="createShape" sig="createShape(annotation: Annotation, style: Style): Konva.Line" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapepainters-js/#L430" sourceLabel="shapePainters.js:430" />

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.
- `style` ([Style](/style)) — The drawing style.

**Returns**

- `Konva.Line` — The Konva node.

<MemberHeading id="updateshape" depth="3" name="updateShape" sig="updateShape(node: Konva.Line, annotation: Annotation)" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapepainters-js/#L450" sourceLabel="shapePainters.js:450" />

**Parameters**

- `node` (Konva.Line) — The Konva node.
- `annotation` ([Annotation](/annotation)) — The updated annotation.
