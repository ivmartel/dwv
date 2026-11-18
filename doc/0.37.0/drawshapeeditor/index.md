---
title: DrawShapeEditor
kind: class
longname: DrawShapeEditor
description: Draw shape editor.
---

# DrawShapeEditor

<SourceLink href="/source/src/tools/shapes/drawshapeeditor-js/#L16" label="drawShapeEditor.js:16" />

Draw shape editor.

---

## Constructor

<Signature
  code="new DrawShapeEditor(
	app: App,
	emitEvent: function,
): DrawShapeEditor"
/>

**Parameters**

- `app` ([App](/app)) — The associated application.
- `emitEvent` (function) — Event emitter.

---

## Instance Methods

<MemberHeading
  id="setshape"
  depth="3"
  name="setShape"
  sig="setShape(
	inshape: Konva.Shape,
	drawLayer: DrawLayer,
	annotation: Annotation,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/drawshapeeditor-js/#L88" sourceLabel="drawShapeEditor.js:88" />

Set the shape to edit.

**Parameters**

- `inshape` (Konva.Shape) — The shape to edit.
- `drawLayer` ([DrawLayer](/drawlayer)) — The associated draw layer.
- `annotation` ([Annotation](/annotation)) — The associated annotation.

<MemberHeading id="getshape" depth="3" name="getShape" sig="getShape(): Konva.Shape | undefined" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawshapeeditor-js/#L112" sourceLabel="drawShapeEditor.js:112" />

Get the edited shape.

**Returns**

- `Konva.Shape | undefined` — The edited shape.

<MemberHeading id="getannotation" depth="3" name="getAnnotation" sig="getAnnotation(): Annotation" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawshapeeditor-js/#L121" sourceLabel="drawShapeEditor.js:121" />

Get the edited annotation.

**Returns**

- [`Annotation`](/annotation) — The annotation.

<MemberHeading id="isactive" depth="3" name="isActive" sig="isActive(): boolean" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawshapeeditor-js/#L130" sourceLabel="drawShapeEditor.js:130" />

Get the active flag.

**Returns**

- `boolean` — The active flag.

<MemberHeading id="enable" depth="3" name="enable" sig="enable()" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawshapeeditor-js/#L137" sourceLabel="drawShapeEditor.js:137" />

Enable the editor. Redraws the layer.

<MemberHeading id="disable" depth="3" name="disable" sig="disable()" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawshapeeditor-js/#L150" sourceLabel="drawShapeEditor.js:150" />

Disable the editor. Redraws the layer.

<MemberHeading id="reset" depth="3" name="reset" sig="reset()" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawshapeeditor-js/#L163" sourceLabel="drawShapeEditor.js:163" />

Reset the editor.

<MemberHeading id="resetanchors" depth="3" name="resetAnchors" sig="resetAnchors()" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawshapeeditor-js/#L172" sourceLabel="drawShapeEditor.js:172" />

Reset the anchors.

<MemberHeading id="setanchorsactive" depth="3" name="setAnchorsActive" sig="setAnchorsActive(flag: boolean)" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawshapeeditor-js/#L209" sourceLabel="drawShapeEditor.js:209" />

Set anchors active.

**Parameters**

- `flag` (boolean) — The active (on/off) flag.
