---
title: ViewLayer
kind: class
longname: ViewLayer
description: View layer. Not an EventTarget in order to forward native DOM events while preserving preventDefault() for tools (see '#fireDomEvent').
---

# ViewLayer

<SourceLink href="/source/src/gui/viewlayer-js/#L26" label="viewLayer.js:26" />

View layer.

Not an EventTarget in order to forward native DOM events while preserving `preventDefault()` for tools (see '#fireDomEvent').

---

## Constructor

<Signature
  code="new ViewLayer(
	containerDiv: HTMLElement,
	canvasSizeChecker?: CanvasSizeChecker,
): ViewLayer"
/>

**Parameters**

- `containerDiv` (HTMLElement) — The layer div, its id will be used as this layer id.
- `canvasSizeChecker` ([CanvasSizeChecker](/canvassizechecker), optional) — Optional canvas size checker, to share with other layers; defaults to a new one.

---

## Instance Methods

<MemberHeading id="getdataid" depth="3" name="getDataId" sig="getDataId(): string" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L261" sourceLabel="viewLayer.js:261" />

Get the associated data id.

**Returns**

- `string` — The data id.

<MemberHeading id="getscale" depth="3" name="getScale" sig="getScale(): Scalar2D" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L270" sourceLabel="viewLayer.js:270" />

Get the layer scale.

**Returns**

- [`Scalar2D`](/scalar2d) — The scale as {x,y}.

<MemberHeading id="getabsolutezoomoffset" depth="3" name="getAbsoluteZoomOffset" sig="getAbsoluteZoomOffset(): Scalar2D" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L279" sourceLabel="viewLayer.js:279" />

Get the layer zoom offset without the fit scale.

**Returns**

- [`Scalar2D`](/scalar2d) — The offset as {x,y}.

<MemberHeading id="setimagesmoothing" depth="3" name="setImageSmoothing" sig="setImageSmoothing(flag: boolean)" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L291" sourceLabel="viewLayer.js:291" />

Set the imageSmoothing flag value.

**Parameters**

- `flag` (boolean) — True to enable smoothing.

<MemberHeading id="setview" depth="3" name="setView" sig="setView(view: object, dataId: string)" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L301" sourceLabel="viewLayer.js:301" />

Set the associated view.

**Parameters**

- `view` (object) — The view.
- `dataId` (string) — The associated data id.

<MemberHeading id="getviewcontroller" depth="3" name="getViewController" sig="getViewController(): ViewController" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L326" sourceLabel="viewLayer.js:326" />

Get the view controller.

**Returns**

- [`ViewController`](/viewcontroller) — The controller.

<MemberHeading id="getimagedata" depth="3" name="getImageData" sig="getImageData(): object" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L335" sourceLabel="viewLayer.js:335" />

Get the canvas image data.

**Returns**

- `object` — The image data.

<MemberHeading id="onimageset" depth="3" name="onimageset" sig="onimageset(event: CustomEvent)" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L345" sourceLabel="viewLayer.js:345" />

Handle an image set event.

**Parameters**

- `event` (CustomEvent) — The event.

<MemberHeading id="bindimage" depth="3" name="bindImage" sig="bindImage()" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L359" sourceLabel="viewLayer.js:359" />

Bind this layer to the view image.

<MemberHeading id="unbindimage" depth="3" name="unbindImage" sig="unbindImage()" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L368" sourceLabel="viewLayer.js:368" />

Unbind this layer to the view image.

<MemberHeading id="onimagecontentchange" depth="3" name="onimagecontentchange" sig="onimagecontentchange(event: CustomEvent)" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L380" sourceLabel="viewLayer.js:380" />

Handle an image content change event.

**Parameters**

- `event` (CustomEvent) — The event.

<MemberHeading id="onimagegeometrychange" depth="3" name="onimagegeometrychange" sig="onimagegeometrychange(event: CustomEvent)" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L397" sourceLabel="viewLayer.js:397" />

Handle an image change event.

**Parameters**

- `event` (CustomEvent) — The event.

<MemberHeading id="onimageresampled" depth="3" name="onimageresampled" sig="onimageresampled(event: CustomEvent)" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L470" sourceLabel="viewLayer.js:470" />

Handle an image resampled event.

**Parameters**

- `event` (CustomEvent) — The event.

<MemberHeading id="getid" depth="3" name="getId" sig="getId(): string" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L491" sourceLabel="viewLayer.js:491" />

Get the id of the layer.

**Returns**

- `string` — The string id.

<MemberHeading id="removefromdom" depth="3" name="removeFromDOM" sig="removeFromDOM()" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L498" sourceLabel="viewLayer.js:498" />

Remove the HTML element from the DOM.

<MemberHeading id="getbasesize" depth="3" name="getBaseSize" sig="getBaseSize(): Scalar2D" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L507" sourceLabel="viewLayer.js:507" />

Get the layer base size (without scale).

**Returns**

- [`Scalar2D`](/scalar2d) — The size as {x,y}.

<MemberHeading id="getimageworldsize" depth="3" name="getImageWorldSize" sig="getImageWorldSize(): Scalar2D" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L516" sourceLabel="viewLayer.js:516" />

Get the image world (mm) 2D size.

**Returns**

- [`Scalar2D`](/scalar2d) — The 2D size as {x,y}.

<MemberHeading id="getopacity" depth="3" name="getOpacity" sig="getOpacity(): number" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L525" sourceLabel="viewLayer.js:525" />

Get the layer opacity.

**Returns**

- `number` — The opacity (\[0:1] range).

<MemberHeading id="setopacity" depth="3" name="setOpacity" sig="setOpacity(alpha: number)" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L534" sourceLabel="viewLayer.js:534" />

Set the layer opacity.

**Parameters**

- `alpha` (number) — The opacity (\[0:1] range).

<MemberHeading
  id="highlightsegment"
  depth="3"
  name="highlightSegment"
  sig="highlightSegment(
	segmentNumber: number,
	duration?: number,
): boolean"
/>

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L569" sourceLabel="viewLayer.js:569" />

Temporarily highlight a segment: its opacity progressively dims and comes back to normal in one pulse. Only one segment is highlighted at a time: a new call resets the previous highlight.

**Parameters**

- `segmentNumber` (number) — The segment number.
- `duration` (number, optional) — The highlight duration in milliseconds, defaults to 750.

**Returns**

- `boolean` — False if the layer is not a segmentation one.

<MemberHeading id="getfillopacity" depth="3" name="getFillOpacity" sig="getFillOpacity(): number" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L623" sourceLabel="viewLayer.js:623" />

Get the fill opacity relative to the global opacity.

**Returns**

- `number` — The fill opacity (between 0 and 1).

<MemberHeading id="setfillopacity" depth="3" name="setFillOpacity" sig="setFillOpacity(opacity: number)" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L634" sourceLabel="viewLayer.js:634" />

Set the fill opacity relative to the global opacity. This only has an effect on segmentation views, or any other alpha function that makes use of it.

**Parameters**

- `opacity` (number) — The fill opacity (between 0 and 1).

<MemberHeading id="getcontourthickness" depth="3" name="getContourThickness" sig="getContourThickness(): number" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L643" sourceLabel="viewLayer.js:643" />

Get the thickness of the contour in pixels.

**Returns**

- `number` — The contour thickness (integer >= 1).

<MemberHeading id="setcontourthickness" depth="3" name="setContourThickness" sig="setContourThickness(thickness: number)" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L654" sourceLabel="viewLayer.js:654" />

Set the thickness of the contour in pixels. This only has an effect on segmentation views, or any other alpha function that makes use of it.

**Parameters**

- `thickness` (number) — The contour thickness (integer >= 1).

<MemberHeading id="addflipoffsetx" depth="3" name="addFlipOffsetX" sig="addFlipOffsetX()" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L661" sourceLabel="viewLayer.js:661" />

Add a flip offset along the layer X axis.

<MemberHeading id="addflipoffsety" depth="3" name="addFlipOffsetY" sig="addFlipOffsetY()" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L669" sourceLabel="viewLayer.js:669" />

Add a flip offset along the layer Y axis.

<MemberHeading id="flipscalex" depth="3" name="flipScaleX" sig="flipScaleX()" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L677" sourceLabel="viewLayer.js:677" />

Flip the scale along the layer X axis.

<MemberHeading id="flipscaley" depth="3" name="flipScaleY" sig="flipScaleY()" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L684" sourceLabel="viewLayer.js:684" />

Flip the scale along the layer Y axis.

<MemberHeading id="flipscalez" depth="3" name="flipScaleZ" sig="flipScaleZ()" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L691" sourceLabel="viewLayer.js:691" />

Flip the scale along the layer Z axis.

<MemberHeading id="setscale" depth="3" name="setScale" sig="setScale(newScale: Scalar3D, center?: Point3D)" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L701" sourceLabel="viewLayer.js:701" />

Set the layer scale.

**Parameters**

- `newScale` ([Scalar3D](/scalar3d)) — The scale as {x,y,z}.
- `center` ([Point3D](/point3d), optional) — The scale center.

<MemberHeading id="initscale" depth="3" name="initScale" sig="initScale(newScale: Scalar3D, absoluteZoomOffset: Scalar2D)" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L761" sourceLabel="viewLayer.js:761" />

Initialise the layer scale.

**Parameters**

- `newScale` ([Scalar3D](/scalar3d)) — The scale as {x,y,z}.
- `absoluteZoomOffset` ([Scalar2D](/scalar2d)) — The zoom offset as {x,y} without the fit scale (as provided by getAbsoluteZoomOffset).

<MemberHeading
  id="setbaseoffset"
  depth="3"
  name="setBaseOffset"
  sig="setBaseOffset(
	scrollOffset: Vector3D,
	planeOffset: Vector3D,
	layerGroupOrigin?: Point3D,
	layerGroupOrigin0?: Point3D,
): boolean"
/>

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L793" sourceLabel="viewLayer.js:793" />

Set the base layer offset. Updates the layer offset.

**Parameters**

- `scrollOffset` ([Vector3D](/vector3d)) — The scroll offset vector.
- `planeOffset` ([Vector3D](/vector3d)) — The plane offset vector.
- `layerGroupOrigin` ([Point3D](/point3d), optional) — The layer group origin.
- `layerGroupOrigin0` ([Point3D](/point3d), optional) — The layer group first origin.

**Returns**

- `boolean` — True if the offset was updated.

<MemberHeading id="setoffset" depth="3" name="setOffset" sig="setOffset(newOffset: Scalar3D)" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L827" sourceLabel="viewLayer.js:827" />

Set the layer offset.

**Parameters**

- `newOffset` ([Scalar3D](/scalar3d)) — The offset as {x,y,z}.

<MemberHeading id="displaytoplaneindex" depth="3" name="displayToPlaneIndex" sig="displayToPlaneIndex(point2D: Point2D): Index" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L843" sourceLabel="viewLayer.js:843" />

Transform a display position to a 2D index.

**Parameters**

- `point2D` ([Point2D](/point2d)) — The input point.

**Returns**

- [`Index`](/index) — The equivalent 2D index.

<MemberHeading id="displaytoplanescale" depth="3" name="displayToPlaneScale" sig="displayToPlaneScale(point2D: Point2D): Point2D" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L857" sourceLabel="viewLayer.js:857" />

Remove scale from a display position.

**Parameters**

- `point2D` ([Point2D](/point2d)) — The input point.

**Returns**

- [`Point2D`](/point2d) — The de-scaled point.

<MemberHeading id="displaytoplanepos" depth="3" name="displayToPlanePos" sig="displayToPlanePos(point2D: Point2D): Point2D" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L870" sourceLabel="viewLayer.js:870" />

Get a plane position from a display position.

**Parameters**

- `point2D` ([Point2D](/point2d)) — The input point.

**Returns**

- [`Point2D`](/point2d) — The plane position.

<MemberHeading id="planepostodisplay" depth="3" name="planePosToDisplay" sig="planePosToDisplay(point2D: Point2D): Point2D" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L885" sourceLabel="viewLayer.js:885" />

Get a display position from a plane position.

**Parameters**

- `point2D` ([Point2D](/point2d)) — The input point.

**Returns**

- [`Point2D`](/point2d) — The display position, can be individually undefined if out of bounds.

<MemberHeading id="displaytomainplanepos" depth="3" name="displayToMainPlanePos" sig="displayToMainPlanePos(point2D: Point2D): Point2D" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L906" sourceLabel="viewLayer.js:906" />

Get a main plane position from a display position.

**Parameters**

- `point2D` ([Point2D](/point2d)) — The input point.

**Returns**

- [`Point2D`](/point2d) — The main plane position.

<MemberHeading id="display" depth="3" name="display" sig="display(flag: boolean)" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L919" sourceLabel="viewLayer.js:919" />

Display the layer.

**Parameters**

- `flag` (boolean) — Whether to display the layer or not.

<MemberHeading id="isvisible" depth="3" name="isVisible" sig="isVisible(): boolean" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L928" sourceLabel="viewLayer.js:928" />

Check if the layer is visible.

**Returns**

- `boolean` — True if the layer is visible.

<MemberHeading id="draw" depth="3" name="draw" sig="draw()" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L939" sourceLabel="viewLayer.js:939" />

Draw the content (imageData) of the layer. The imageData variable needs to be set.

**Fires**

- `App#event:renderstart`
- `App#event:renderend`

<MemberHeading id="initialise" depth="3" name="initialise" sig="initialise(size: Scalar2D, spacing: Scalar2D, alpha: number)" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L1016" sourceLabel="viewLayer.js:1016" />

Initialise the layer: set the canvas and context.

**Parameters**

- `size` ([Scalar2D](/scalar2d)) — The image size as {x,y}.
- `spacing` ([Scalar2D](/scalar2d)) — The image spacing as {x,y}.
- `alpha` (number) — The initial data opacity.

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

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L1093" sourceLabel="viewLayer.js:1093" />

Fit the layer to its parent container.

**Parameters**

- `containerSize` ([Scalar2D](/scalar2d)) — The fit size as {x,y}.
- `divToWorldSizeRatio` (number) — The div to world size ratio.
- `fitOffset` ([Scalar2D](/scalar2d)) — The fit offset as {x,y}.

<MemberHeading id="bindinteraction" depth="3" name="bindInteraction" sig="bindInteraction()" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L1200" sourceLabel="viewLayer.js:1200" />

Enable and listen to container interaction events.

<MemberHeading id="unbindinteraction" depth="3" name="unbindInteraction" sig="unbindInteraction()" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L1214" sourceLabel="viewLayer.js:1214" />

Disable and stop listening to container interaction events.

<MemberHeading id="addeventlistener" depth="3" name="addEventListener" sig="addEventListener(type: string, callback: function)" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L1231" sourceLabel="viewLayer.js:1231" />

Add an event listener to this class.

**Parameters**

- `type` (string) — The event type.
- `callback` (function) — The function associated with the provided event type, will be called with the fired event.

<MemberHeading id="removeeventlistener" depth="3" name="removeEventListener" sig="removeEventListener(type: string, callback: function)" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L1242" sourceLabel="viewLayer.js:1242" />

Remove an event listener from this class.

**Parameters**

- `type` (string) — The event type.
- `callback` (function) — The function associated with the provided event type.

<MemberHeading id="isvalidposition" depth="3" name="isValidPosition" sig="isValidPosition(): boolean" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L1361" sourceLabel="viewLayer.js:1361" />

Check if the position is valid.

**Returns**

- `boolean` — True if the position is valid.

<MemberHeading id="setcurrentposition" depth="3" name="setCurrentPosition" sig="setCurrentPosition(position: Point, _index?: Index): boolean" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L1408" sourceLabel="viewLayer.js:1408" />

Set the current position.

**Parameters**

- `position` ([Point](/point)) — The new position.
- `_index` ([Index](/index), optional) — The new index (not used).

**Returns**

- `boolean` — True if the position was updated.

<MemberHeading id="clear" depth="3" name="clear" sig="clear()" />

<MemberMeta sourceHref="/source/src/gui/viewlayer-js/#L1415" sourceLabel="viewLayer.js:1415" />

Clear the context.

## Events

<MemberHeading id="basesizechange" depth="3" name="basesizechange" sig="basesizechange: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/gui/viewlayer-js/#L455" sourceLabel="viewLayer.js:455" />

Base size change event: the layer world size changed, the stage needs to be fitted to its container again.

**Properties**

- `detail` (object) — The event detail.
  - `detail.srclayerid` (string) — The source layer id.
  - `detail.dataid` (string) — The data id.
  - `detail.value` (Array) — The new base size as \[x, y].
