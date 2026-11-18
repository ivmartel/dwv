---
title: DrawLayer
kind: class
longname: DrawLayer
description: Draw layer. Not an EventTarget in order to forward native DOM events while preserving preventDefault() for tools (see '#fireDomEvent').
---

# DrawLayer

<SourceLink href="/source/src/gui/drawlayer-js/#L60" label="drawLayer.js:60" />

Draw layer.

Not an EventTarget in order to forward native DOM events while preserving `preventDefault()` for tools (see '#fireDomEvent').

---

## Constructor

<Signature code="new DrawLayer(containerDiv: HTMLDivElement): DrawLayer" />

**Parameters**

- `containerDiv` (HTMLDivElement) — The layer div, its id will be used as this layer id.

---

## Instance Methods

<MemberHeading id="setshapehandler" depth="3" name="setShapeHandler" sig="setShapeHandler(handler: DrawShapeHandler | undefined)" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L217" sourceLabel="drawLayer.js:217" />

Set the draw shape handler.

**Parameters**

- `handler` ([DrawShapeHandler](/drawshapehandler) | undefined) — The shape handler.

<MemberHeading id="getdataid" depth="3" name="getDataId" sig="getDataId(): string" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L226" sourceLabel="drawLayer.js:226" />

Get the associated data id.

**Returns**

- `string` — The id.

<MemberHeading id="getreferencelayerid" depth="3" name="getReferenceLayerId" sig="getReferenceLayerId(): string" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L235" sourceLabel="drawLayer.js:235" />

Get the reference layer id.

**Returns**

- `string` — The id.

<MemberHeading id="getkonvastage" depth="3" name="getKonvaStage" sig="getKonvaStage(): Konva.Stage" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L251" sourceLabel="drawLayer.js:251" />

Get the Konva stage.

**Returns**

- `Konva.Stage` — The stage.

<MemberHeading id="getkonvalayer" depth="3" name="getKonvaLayer" sig="getKonvaLayer(): Konva.Layer" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L260" sourceLabel="drawLayer.js:260" />

Get the Konva layer.

**Returns**

- `Konva.Layer` — The layer.

<MemberHeading id="getdrawcontroller" depth="3" name="getDrawController" sig="getDrawController(): DrawController" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L270" sourceLabel="drawLayer.js:270" />

Get the draw controller.

**Returns**

- [`DrawController`](/drawcontroller) — The controller.

<MemberHeading id="setplanehelper" depth="3" name="setPlaneHelper" sig="setPlaneHelper(helper: PlaneHelper)" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L279" sourceLabel="drawLayer.js:279" />

Set the plane helper.

**Parameters**

- `helper` ([PlaneHelper](/planehelper)) — The helper.

<MemberHeading id="getid" depth="3" name="getId" sig="getId(): string" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L290" sourceLabel="drawLayer.js:290" />

Get the id of the layer.

**Returns**

- `string` — The string id.

<MemberHeading id="removefromdom" depth="3" name="removeFromDOM" sig="removeFromDOM()" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L297" sourceLabel="drawLayer.js:297" />

Remove the HTML element from the DOM.

<MemberHeading id="getbasesize" depth="3" name="getBaseSize" sig="getBaseSize(): Scalar2D" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L306" sourceLabel="drawLayer.js:306" />

Get the layer base size (without scale).

**Returns**

- [`Scalar2D`](/scalar2d) — The size as {x,y}.

<MemberHeading id="getopacity" depth="3" name="getOpacity" sig="getOpacity(): number" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L315" sourceLabel="drawLayer.js:315" />

Get the layer opacity.

**Returns**

- `number` — The opacity (\[0:1] range).

<MemberHeading id="setopacity" depth="3" name="setOpacity" sig="setOpacity(alpha: number)" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L324" sourceLabel="drawLayer.js:324" />

Set the layer opacity.

**Parameters**

- `alpha` (number) — The opacity (\[0:1] range).

<MemberHeading id="addflipoffsetx" depth="3" name="addFlipOffsetX" sig="addFlipOffsetX()" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L352" sourceLabel="drawLayer.js:352" />

Add a flip offset along the layer X axis.

<MemberHeading id="addflipoffsety" depth="3" name="addFlipOffsetY" sig="addFlipOffsetY()" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L366" sourceLabel="drawLayer.js:366" />

Add a flip offset along the layer Y axis.

<MemberHeading id="flipscalex" depth="3" name="flipScaleX" sig="flipScaleX()" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L380" sourceLabel="drawLayer.js:380" />

Flip the scale along the layer X axis.

<MemberHeading id="flipscaley" depth="3" name="flipScaleY" sig="flipScaleY()" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L387" sourceLabel="drawLayer.js:387" />

Flip the scale along the layer Y axis.

<MemberHeading id="flipscalez" depth="3" name="flipScaleZ" sig="flipScaleZ()" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L394" sourceLabel="drawLayer.js:394" />

Flip the scale along the layer Z axis.

<MemberHeading id="setscale" depth="3" name="setScale" sig="setScale(newScale: Scalar3D, center?: Point3D)" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L404" sourceLabel="drawLayer.js:404" />

Set the layer scale.

**Parameters**

- `newScale` ([Scalar3D](/scalar3d)) — The scale as {x,y,z}.
- `center` ([Point3D](/point3d), optional) — The scale center.

<MemberHeading id="initscale" depth="3" name="initScale" sig="initScale(newScale: Scalar3D, absoluteZoomOffset: Scalar2D)" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L467" sourceLabel="drawLayer.js:467" />

Initialise the layer scale.

**Parameters**

- `newScale` ([Scalar3D](/scalar3d)) — The scale as {x,y,z}.
- `absoluteZoomOffset` ([Scalar2D](/scalar2d)) — The zoom offset as {x,y} without the fit scale (as provided by getAbsoluteZoomOffset).

<MemberHeading id="setoffset" depth="3" name="setOffset" sig="setOffset(newOffset: Scalar3D)" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L495" sourceLabel="drawLayer.js:495" />

Set the layer offset.

**Parameters**

- `newOffset` ([Scalar3D](/scalar3d)) — The offset as {x,y,z}.

<MemberHeading
  id="setbaseoffset"
  depth="3"
  name="setBaseOffset"
  sig="setBaseOffset(
	scrollOffset: Vector3D,
	planeOffset: Vector3D,
): boolean"
/>

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L513" sourceLabel="drawLayer.js:513" />

Set the base layer offset. Updates the layer offset.

**Parameters**

- `scrollOffset` ([Vector3D](/vector3d)) — The scroll offset vector.
- `planeOffset` ([Vector3D](/vector3d)) — The plane offset vector.

**Returns**

- `boolean` — True if the offset was updated.

<MemberHeading id="display" depth="3" name="display" sig="display(flag: boolean)" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L539" sourceLabel="drawLayer.js:539" />

Display the layer.

**Parameters**

- `flag` (boolean) — Whether to display the layer or not.

<MemberHeading id="isvisible" depth="3" name="isVisible" sig="isVisible(): boolean" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L548" sourceLabel="drawLayer.js:548" />

Check if the layer is visible.

**Returns**

- `boolean` — True if the layer is visible.

<MemberHeading id="draw" depth="3" name="draw" sig="draw()" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L556" sourceLabel="drawLayer.js:556" />

Draw the content (imageData) of the layer. The imageData variable needs to be set.

<MemberHeading
  id="initialise"
  depth="3"
  name="initialise"
  sig="initialise(
	size: Scalar2D,
	spacing: Scalar2D,
	refLayerId: string,
)"
/>

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L567" sourceLabel="drawLayer.js:567" />

Initialise the layer: set the canvas and context.

**Parameters**

- `size` ([Scalar2D](/scalar2d)) — The image size as {x,y}.
- `spacing` ([Scalar2D](/scalar2d)) — The image spacing as {x,y}.
- `refLayerId` (string) — The reference image dataId.

<MemberHeading
  id="setannotationgroup"
  depth="3"
  name="setAnnotationGroup"
  sig="setAnnotationGroup(
	annotationGroup: AnnotationGroup,
	dataId: string,
	exeCallback: object,
)"
/>

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L599" sourceLabel="drawLayer.js:599" />

Set the annotation group.

**Parameters**

- `annotationGroup` ([AnnotationGroup](/annotationgroup)) — The annotation group.
- `dataId` (string) — The associated data id.
- `exeCallback` (object) — The undo stack callback.

<MemberHeading id="activatecurrentpositionshapes" depth="3" name="activateCurrentPositionShapes" sig="activateCurrentPositionShapes(flag: boolean)" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L650" sourceLabel="drawLayer.js:650" />

Activate shapes at current position.

**Parameters**

- `flag` (boolean) — The flag to activate or not.

<MemberHeading
  id="fittocontainer"
  depth="3"
  name="fitToContainer"
  sig="fitToContainer(
	containerSize: Scalar2D,
	divToWorldSizeRatio: number,
	fitOffset: Scalar2D,
)"
/>

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L877" sourceLabel="drawLayer.js:877" />

Fit the layer to its parent container.

**Parameters**

- `containerSize` ([Scalar2D](/scalar2d)) — The container size as {x,y}.
- `divToWorldSizeRatio` (number) — The div to world size ratio.
- `fitOffset` ([Scalar2D](/scalar2d)) — The fit offset as {x,y}.

<MemberHeading
  id="getannotationat"
  depth="3"
  name="getAnnotationAt"
  sig="getAnnotationAt(
	planePoint: Point2D,
	tolerance?: number,
): Annotation | undefined"
/>

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L969" sourceLabel="drawLayer.js:969" />

Get the top most visible annotation at the current position that contains the input plane point.

**Parameters**

- `planePoint` ([Point2D](/point2d)) — The plane point, in the reference view layer plane coordinates.
- `tolerance` (number, optional, default: 0) — Optional maximum distance to a shape, in plane coordinates, defaults to 0.

**Returns**

- [`Annotation`](/annotation)` | undefined` — The annotation, undefined if none.

<MemberHeading id="isannotationvisible" depth="3" name="isAnnotationVisible" sig="isAnnotationVisible(id: string): boolean" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L995" sourceLabel="drawLayer.js:995" />

Check the visibility of an annotation.

**Parameters**

- `id` (string) — The id of the annotation.

**Returns**

- `boolean` — True if the annotation is visible.

<MemberHeading id="setannotationvisibility" depth="3" name="setAnnotationVisibility" sig="setAnnotationVisibility(id: string, visible?: boolean): boolean" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L1013" sourceLabel="drawLayer.js:1013" />

Set the visibility of an annotation.

**Parameters**

- `id` (string) — The id of the annotation.
- `visible` (boolean, optional) — True to set to visible, will toggle visibility if not defined.

**Returns**

- `boolean` — False if the annotation shape cannot be found.

<MemberHeading id="highlightannotation" depth="3" name="highlightAnnotation" sig="highlightAnnotation(id: string, duration?: number): boolean" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L1042" sourceLabel="drawLayer.js:1042" />

Temporarily highlight an annotation: its opacity progressively dims to 20% and comes back to normal in one pulse. Only one annotation is highlighted at a time: a new call resets the previous highlight.

**Parameters**

- `id` (string) — The id of the annotation.
- `duration` (number, optional) — The highlight duration in milliseconds, defaults to 500.

**Returns**

- `boolean` — False if the annotation shape cannot be found.

<MemberHeading id="setlabelsvisibility" depth="3" name="setLabelsVisibility" sig="setLabelsVisibility(visible?: boolean)" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L1094" sourceLabel="drawLayer.js:1094" />

Set the visibility of all labels.

**Parameters**

- `visible` (boolean, optional) — True to set to visible, will toggle visibility if not defined.

<MemberHeading id="setlabelvisibility" depth="3" name="setLabelVisibility" sig="setLabelVisibility(shapeGroup: Konva.Group)" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L1144" sourceLabel="drawLayer.js:1144" />

Set a shape group label visibility according to this layer setting.

**Parameters**

- `shapeGroup` (Konva.Group) — The shape group.

<MemberHeading id="deletedraw" depth="3" name="deleteDraw" sig="deleteDraw(_id: string, _exeCallback: function)" />

<MemberMeta badges="deprecated" sourceHref="/source/src/gui/drawlayer-js/#L1156" sourceLabel="drawLayer.js:1156" />

Delete a Draw from the stage.

<Callout type="error">
  &#x20;Since v0.34, please switch to \`annotationGroup.remove\`.
</Callout>

**Parameters**

- `_id` (string) — The id of the group to delete.
- `_exeCallback` (function) — The callback to call once the DeleteCommand has been executed.

<MemberHeading id="deletedraws" depth="3" name="deleteDraws" sig="deleteDraws(_exeCallback: function)" />

<MemberMeta badges="deprecated" sourceHref="/source/src/gui/drawlayer-js/#L1167" sourceLabel="drawLayer.js:1167" />

Delete all Draws from the stage.

<Callout type="error">
  &#x20;Since v0.34, please switch to \`annotationGroup.remove\`.
</Callout>

**Parameters**

- `_exeCallback` (function) — The callback to call once the DeleteCommand has been executed.

<MemberHeading id="getnumberofdraws" depth="3" name="getNumberOfDraws" sig="getNumberOfDraws(): number | undefined" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L1177" sourceLabel="drawLayer.js:1177" />

Get the total number of draws of this layer (at all positions).

**Returns**

- `number | undefined` — The total number of draws.

<MemberHeading id="bindinteraction" depth="3" name="bindInteraction" sig="bindInteraction()" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L1191" sourceLabel="drawLayer.js:1191" />

Enable and listen to container interaction events.

<MemberHeading id="unbindinteraction" depth="3" name="unbindInteraction" sig="unbindInteraction()" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L1206" sourceLabel="drawLayer.js:1206" />

Disable and stop listening to container interaction events.

<MemberHeading id="setcurrentposition" depth="3" name="setCurrentPosition" sig="setCurrentPosition(position: Point, index?: Index): boolean" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L1224" sourceLabel="drawLayer.js:1224" />

Set the current position.

**Parameters**

- `position` ([Point](/point)) — The new position.
- `index` ([Index](/index), optional) — Optional coresponding index.

**Returns**

- `boolean` — True if the position was updated.

<MemberHeading id="addeventlistener" depth="3" name="addEventListener" sig="addEventListener(type: string, callback: function)" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L1337" sourceLabel="drawLayer.js:1337" />

Add an event listener to this class.

**Parameters**

- `type` (string) — The event type.
- `callback` (function) — The function associated with the provided event type, will be called with the fired event.

<MemberHeading id="removeeventlistener" depth="3" name="removeEventListener" sig="removeEventListener(type: string, callback: function)" />

<MemberMeta sourceHref="/source/src/gui/drawlayer-js/#L1348" sourceLabel="drawLayer.js:1348" />

Remove an event listener from this class.

**Parameters**

- `type` (string) — The event type.
- `callback` (function) — The function associated with the provided event type.
