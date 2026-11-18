---
title: DrawShapeHandler
kind: class
longname: DrawShapeHandler
description: "Draw shape handler: handle action on existing shapes."
---

# DrawShapeHandler

<SourceLink href="/source/src/tools/shapes/drawshapehandler-js/#L46" label="drawShapeHandler.js:46" />

Draw shape handler: handle action on existing shapes.

---

## Constructor

<Signature code="new DrawShapeHandler(app: App): DrawShapeHandler" />

**Parameters**

- `app` ([App](/app)) — The associated application.

---

## Instance Methods

<MemberHeading id="seteditorshape" depth="3" name="setEditorShape" sig="setEditorShape(shape: Konva.Shape, drawLayer: DrawLayer)" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawshapehandler-js/#L122" sourceLabel="drawShapeHandler.js:122" />

Set the draw editor shape.

**Parameters**

- `shape` (Konva.Shape) — The shape to edit.
- `drawLayer` ([DrawLayer](/drawlayer)) — The layer the shape belongs to.

<MemberHeading id="geteditorshapegroup" depth="3" name="getEditorShapeGroup" sig="getEditorShapeGroup(): Konva.Group | undefined" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawshapehandler-js/#L153" sourceLabel="drawShapeHandler.js:153" />

Get the currently edited shape group.

**Returns**

- `Konva.Group | undefined` — The edited group.

<MemberHeading id="geteditorannotation" depth="3" name="getEditorAnnotation" sig="getEditorAnnotation(): Annotation | undefined" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawshapehandler-js/#L169" sourceLabel="drawShapeHandler.js:169" />

Get the currently edited annotation.

**Returns**

- [`Annotation`](/annotation)` | undefined` — The edited annotation.

<MemberHeading id="disableandreseteditor" depth="3" name="disableAndResetEditor" sig="disableAndResetEditor()" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawshapehandler-js/#L180" sourceLabel="drawShapeHandler.js:180" />

Disable and reset the shape editor.

<MemberHeading id="storemouseovercursor" depth="3" name="storeMouseOverCursor" sig="storeMouseOverCursor(cursor: string)" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawshapehandler-js/#L206" sourceLabel="drawShapeHandler.js:206" />

Store specific mouse over cursor.

**Parameters**

- `cursor` (string) — The cursor name.

<MemberHeading id="onmouseoutshapegroup" depth="3" name="onMouseOutShapeGroup" sig="onMouseOutShapeGroup()" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawshapehandler-js/#L228" sourceLabel="drawShapeHandler.js:228" />

Handle shape group mouseout.

<MemberHeading
  id="addshapegrouplisteners"
  depth="3"
  name="addShapeGroupListeners"
  sig="addShapeGroupListeners(
	shapeGroup: Konva.Group,
	annotation: Annotation,
	drawLayer: DrawLayer,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/drawshapehandler-js/#L278" sourceLabel="drawShapeHandler.js:278" />

Add shape group listeners.

**Parameters**

- `shapeGroup` (Konva.Group) — The shape group to set on.
- `annotation` ([Annotation](/annotation)) — The associated annotation.
- `drawLayer` ([DrawLayer](/drawlayer)) — The origin draw layer.

<MemberHeading id="removeshapelisteners" depth="3" name="removeShapeListeners" sig="removeShapeListeners(shapeGroup: Konva.Group)" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawshapehandler-js/#L595" sourceLabel="drawShapeHandler.js:595" />

Remove shape group listeners.

**Parameters**

- `shapeGroup` (Konva.Group) — The shape group to set off.
