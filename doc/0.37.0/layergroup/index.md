---
title: LayerGroup
kind: class
longname: LayerGroup
description: "Layer group. Display position: {x,y}, Plane position: Index (access: get(i)), (world) Position: Point3D (access: getX, getY, getZ). Display -&gt; World: planePos = viewLayer.displayToPlanePos(displayPos) -&gt; compensate for layer scale and offset, pos = viewController.getPositionFromPlanePoint(planePos). World -&gt; Display: planePos = viewController.getOffset3DFromPlaneOffset(pos) no need yet for a planePos to displayPos..."
---

# LayerGroup

<SourceLink href="/source/src/gui/layergroup-js/#L115" label="layerGroup.js:115" />

Layer group.

- Display position: {x,y},
- Plane position: Index (access: get(i)),
- (world) Position: Point3D (access: getX, getY, getZ).

Display -> World:

- planePos = viewLayer.displayToPlanePos(displayPos) -> compensate for layer scale and offset,
- pos = viewController.getPositionFromPlanePoint(planePos).

World -> Display:

- planePos = viewController.getOffset3DFromPlaneOffset(pos) no need yet for a planePos to displayPos...

---

## Constructor

<Signature
  code="new LayerGroup(
	containerDiv: HTMLElement,
	withInfoLayer?: boolean,
	canvasSizeChecker?: CanvasSizeChecker,
): LayerGroup"
/>

**Parameters**

- `containerDiv` (HTMLElement) — The associated HTML div.
- `withInfoLayer` (boolean, optional) — Optional with info layer flag, default to false.
- `canvasSizeChecker` ([CanvasSizeChecker](/canvassizechecker), optional) — Optional canvas size checker, shared with the view layers; defaults to a new one.

---

## Instance Methods

<MemberHeading id="getpositionhelper" depth="3" name="getPositionHelper" sig="getPositionHelper(): PositionHelper | undefined" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L231" sourceLabel="layerGroup.js:231" />

Get the position helper.

**Returns**

- [`PositionHelper`](/positionhelper)` | undefined` — The position helper or undefined if no layers.

<MemberHeading id="getshowcrosshair" depth="3" name="getShowCrosshair" sig="getShowCrosshair(): boolean" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L279" sourceLabel="layerGroup.js:279" />

Get the showCrosshair flag.

**Returns**

- `boolean` — True to display the crosshair.

<MemberHeading id="setshowcrosshair" depth="3" name="setShowCrosshair" sig="setShowCrosshair(flag: boolean)" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L288" sourceLabel="layerGroup.js:288" />

Set the showCrosshair flag.

**Parameters**

- `flag` (boolean) — True to display the crosshair.

<MemberHeading id="setimagesmoothing" depth="3" name="setImageSmoothing" sig="setImageSmoothing(flag: boolean)" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L310" sourceLabel="layerGroup.js:310" />

Set the imageSmoothing flag value.

**Parameters**

- `flag` (boolean) — True to enable smoothing.

<MemberHeading id="getdivid" depth="3" name="getDivId" sig="getDivId(): string | undefined" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L334" sourceLabel="layerGroup.js:334" />

Get the Id of the container div.

**Returns**

- `string | undefined` — The id of the div.

<MemberHeading id="getscale" depth="3" name="getScale" sig="getScale(): Scalar3D" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L348" sourceLabel="layerGroup.js:348" />

Get the layer scale.

**Returns**

- [`Scalar3D`](/scalar3d) — The scale as {x,y,z}.

<MemberHeading id="getbasescale" depth="3" name="getBaseScale" sig="getBaseScale(): Scalar3D" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L357" sourceLabel="layerGroup.js:357" />

Get the base scale.

**Returns**

- [`Scalar3D`](/scalar3d) — The scale as {x,y,z}.

<MemberHeading id="getaddedscale" depth="3" name="getAddedScale" sig="getAddedScale(): Scalar3D" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L367" sourceLabel="layerGroup.js:367" />

Get the added scale: the scale added to the base scale.

**Returns**

- [`Scalar3D`](/scalar3d) — The scale as {x,y,z}.

<MemberHeading id="getoffset" depth="3" name="getOffset" sig="getOffset(): Scalar3D" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L380" sourceLabel="layerGroup.js:380" />

Get the layer offset.

**Returns**

- [`Scalar3D`](/scalar3d) — The offset as {x,y,z}.

<MemberHeading id="getnumberoflayers" depth="3" name="getNumberOfLayers" sig="getNumberOfLayers(): number" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L389" sourceLabel="layerGroup.js:389" />

Get the number of layers handled by this class.

**Returns**

- `number` — The number of layers.

<MemberHeading id="includes" depth="3" name="includes" sig="includes(id: string): boolean" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L406" sourceLabel="layerGroup.js:406" />

Check if this layerGroup contains a layer with the input id.

**Parameters**

- `id` (string) — The layer id to look for.

**Returns**

- `boolean` — True if this group contains a layer with the input id.

<MemberHeading id="getviewlayers" depth="3" name="getViewLayers" sig="getViewLayers(callbackFn?: function): Array.<ViewLayer>" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L428" sourceLabel="layerGroup.js:428" />

Get the view layers that satisfy the input callback function.

**Parameters**

- `callbackFn` (function, optional) — A function that takes a ViewLayer as input and returns a boolean. If undefined, returns all view layers.

**Returns**

- `Array.<`[`ViewLayer`](/viewlayer)`>` — The layers that satisfy the callbackFn.

<MemberHeading
  id="getviewlayersfromactive"
  depth="3"
  name="getViewLayersFromActive"
  sig="getViewLayersFromActive(
	callbackFn?: function,
): Array.<ViewLayer>"
/>

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L454" sourceLabel="layerGroup.js:454" />

Get the view layers that satisfy the input callback function starting from the active layer.

**Parameters**

- `callbackFn` (function, optional) — A function that takes a ViewLayer as input and returns a boolean. If undefined, returns all view layers.

**Returns**

- `Array.<`[`ViewLayer`](/viewlayer)`>` — The layers that satisfy the callbackFn.

<MemberHeading id="someviewlayer" depth="3" name="someViewLayer" sig="someViewLayer(callbackFn: function): boolean" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L496" sourceLabel="layerGroup.js:496" />

Test if one of the view layers satisfies an input callbackFn.

**Parameters**

- `callbackFn` (function) — A function that takes a ViewLayer as input and returns a boolean.

**Returns**

- `boolean` — True if one of the ViewLayers satisfies the callbackFn.

<MemberHeading id="getdrawlayers" depth="3" name="getDrawLayers" sig="getDrawLayers(callbackFn?: function): Array.<DrawLayer>" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L517" sourceLabel="layerGroup.js:517" />

Get a list of draw layers according to an input callback function.

**Parameters**

- `callbackFn` (function, optional) — A function that takes a DrawLayer as input and returns a boolean. If undefined, returns all draw layers.

**Returns**

- `Array.<`[`DrawLayer`](/drawlayer)`>` — The layers that satisfy the callbackFn.

<MemberHeading id="getnumberofviewlayers" depth="3" name="getNumberOfViewLayers" sig="getNumberOfViewLayers(): number" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L538" sourceLabel="layerGroup.js:538" />

Get the number of view layers handled by this class.

**Returns**

- `number` — The number of layers.

<MemberHeading id="getactivelayer" depth="3" name="getActiveLayer" sig="getActiveLayer(): ViewLayer | DrawLayer | undefined" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L554" sourceLabel="layerGroup.js:554" />

Get the active image layer.

**Returns**

- [`ViewLayer`](/viewlayer)`  |  `[`DrawLayer`](/drawlayer)` | undefined` — The layer.

<MemberHeading id="getactiveviewlayer" depth="3" name="getActiveViewLayer" sig="getActiveViewLayer(): ViewLayer | undefined" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L567" sourceLabel="layerGroup.js:567" />

Get the active image layer.

**Returns**

- [`ViewLayer`](/viewlayer)` | undefined` — The layer.

<MemberHeading id="getbaseviewlayer" depth="3" name="getBaseViewLayer" sig="getBaseViewLayer(): ViewLayer | undefined" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L582" sourceLabel="layerGroup.js:582" />

Get the base view layer.

**Returns**

- [`ViewLayer`](/viewlayer)` | undefined` — The layer.

<MemberHeading id="getviewlayerbyid" depth="3" name="getViewLayerById" sig="getViewLayerById(id: string): ViewLayer | undefined" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L601" sourceLabel="layerGroup.js:601" />

Get a view layer associated to a data id.

**Parameters**

- `id` (string) — The layer id.

**Returns**

- [`ViewLayer`](/viewlayer)` | undefined` — The layer.

<MemberHeading id="getviewlayersbydataid" depth="3" name="getViewLayersByDataId" sig="getViewLayersByDataId(dataId: string): Array.<ViewLayer>" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L619" sourceLabel="layerGroup.js:619" />

Get the view layers associated to a data id.

**Parameters**

- `dataId` (string) — The data id.

**Returns**

- `Array.<`[`ViewLayer`](/viewlayer)`>` — The layers.

<MemberHeading id="searchviewlayers" depth="3" name="searchViewLayers" sig="searchViewLayers(meta: object): Array.<ViewLayer>" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L632" sourceLabel="layerGroup.js:632" />

Search view layers for equal image meta data.

**Parameters**

- `meta` (object) — The meta data to find.

**Returns**

- `Array.<`[`ViewLayer`](/viewlayer)`>` — The list of view layers that contain matched data.

<MemberHeading id="getviewdataindices" depth="3" name="getViewDataIndices" sig="getViewDataIndices(): Array.<string>" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L678" sourceLabel="layerGroup.js:678" />

Get the view layers data indices.

**Returns**

- `Array.<string>` — The list of indices.

<MemberHeading id="getactivedrawlayer" depth="3" name="getActiveDrawLayer" sig="getActiveDrawLayer(): DrawLayer | undefined" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L693" sourceLabel="layerGroup.js:693" />

Get the active draw layer.

**Returns**

- [`DrawLayer`](/drawlayer)` | undefined` — The layer.

<MemberHeading id="getdrawlayerbyid" depth="3" name="getDrawLayerById" sig="getDrawLayerById(id: string): DrawLayer | undefined" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L709" sourceLabel="layerGroup.js:709" />

Get a draw layer associated to a data id.

**Parameters**

- `id` (string) — The layer id.

**Returns**

- [`DrawLayer`](/drawlayer)` | undefined` — The layer.

<MemberHeading id="getdrawlayersbydataid" depth="3" name="getDrawLayersByDataId" sig="getDrawLayersByDataId(dataId: string): Array.<DrawLayer>" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L727" sourceLabel="layerGroup.js:727" />

Get the draw layers associated to a data id.

**Parameters**

- `dataId` (string) — The data id.

**Returns**

- `Array.<`[`DrawLayer`](/drawlayer)`>` — The layers.

<MemberHeading id="setactivelayer" depth="3" name="setActiveLayer" sig="setActiveLayer(index: number)" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L739" sourceLabel="layerGroup.js:739" />

Set the active layer.

**Parameters**

- `index` (number) — The index of the layer to set as active.

<MemberHeading id="setactivelayerbyid" depth="3" name="setActiveLayerById" sig="setActiveLayerById(id: string)" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L776" sourceLabel="layerGroup.js:776" />

Set the active layer with a layer id.

**Parameters**

- `id` (string) — The layer id.

<MemberHeading id="setactivelayerbydataid" depth="3" name="setActiveLayerByDataId" sig="setActiveLayerByDataId(dataId: string)" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L798" sourceLabel="layerGroup.js:798" />

Set the active layer with a data id.

**Parameters**

- `dataId` (string) — The data id.

<MemberHeading id="addviewlayer" depth="3" name="addViewLayer" sig="addViewLayer(): ViewLayer" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L823" sourceLabel="layerGroup.js:823" />

Add a view layer.

The new layer will be marked as the active view layer.

**Returns**

- [`ViewLayer`](/viewlayer) — The created layer.

<MemberHeading id="adddrawlayer" depth="3" name="addDrawLayer" sig="addDrawLayer(): DrawLayer" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L854" sourceLabel="layerGroup.js:854" />

Add a draw layer.

The new layer will be marked as the active draw layer.

**Returns**

- [`DrawLayer`](/drawlayer) — The created layer.

<MemberHeading id="addinfodata" depth="3" name="addInfoData" sig="addInfoData(data: InfoData, dataId: string)" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L948" sourceLabel="layerGroup.js:948" />

Add info data.

**Parameters**

- `data` ([InfoData](/infodata)) — The data to add.
- `dataId` (string) — The associated data ID.

<MemberHeading id="bindinfodata" depth="3" name="bindInfoData" sig="bindInfoData(dataId: string)" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L957" sourceLabel="layerGroup.js:957" />

Bind info data.

**Parameters**

- `dataId` (string) — The associated data ID.

<MemberHeading id="unbindinfodata" depth="3" name="unbindInfoData" sig="unbindInfoData()" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L973" sourceLabel="layerGroup.js:973" />

Unbind info data.

<MemberHeading id="empty" depth="3" name="empty" sig="empty()" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L999" sourceLabel="layerGroup.js:999" />

Empty the layer list.

<MemberHeading id="removelayersbydataid" depth="3" name="removeLayersByDataId" sig="removeLayersByDataId(dataId: string)" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L1015" sourceLabel="layerGroup.js:1015" />

Remove all layers for a specific data.

**Parameters**

- `dataId` (string) — The data to remove its layers.

<MemberHeading id="removelayer" depth="3" name="removeLayer" sig="removeLayer(layer: ViewLayer | DrawLayer)" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L1033" sourceLabel="layerGroup.js:1033" />

Remove a layer from this layer group. Warning: if current active layer, the index will be set to `undefined`. Call one of the setActive methods to define the active index.

**Parameters**

- `layer` ([ViewLayer](/viewlayer) | [DrawLayer](/drawlayer)) — The layer to remove.

**Fires**

- `LayerGroup#event:removelayer`

<MemberHeading id="showtooltip" depth="3" name="showTooltip" sig="showTooltip(point: Point2D)" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L1146" sourceLabel="layerGroup.js:1146" />

Displays a tooltip in a temporary `span`. Works with css to hide/show the span only on mouse hover.

**Parameters**

- `point` ([Point2D](/point2d)) — The update point.

<MemberHeading id="removetooltipdiv" depth="3" name="removeTooltipDiv" sig="removeTooltipDiv()" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L1179" sourceLabel="layerGroup.js:1179" />

Remove the tooltip html div.

<MemberHeading id="ispositioninbounds" depth="3" name="isPositionInBounds" sig="isPositionInBounds(position: Point): boolean" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L1192" sourceLabel="layerGroup.js:1192" />

Can the input position be set on one of the view layers.

**Parameters**

- `position` ([Point](/point)) — The input position.

**Returns**

- `boolean` — True if one view layer accepts the input position.

<MemberHeading id="canscroll" depth="3" name="canScroll" sig="canScroll(): boolean" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L1203" sourceLabel="layerGroup.js:1203" />

Can one of the view layers be scrolled.

**Returns**

- `boolean` — True if one view layer can be scrolled.

<MemberHeading id="shouldbind" depth="3" name="shouldBind" sig="shouldBind(): boolean" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L1232" sourceLabel="layerGroup.js:1232" />

Returns whether or not a layer group should have its zoom/pan/etc synced to other views. Used for things like Secondary Capture where there is no meaningful real-world scale.

**Returns**

- `boolean` — Whether to sync the zoom/pan.

<MemberHeading id="morethanone" depth="3" name="moreThanOne" sig="moreThanOne(dim: number): boolean" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L1248" sourceLabel="layerGroup.js:1248" />

Does one of the view layer have more than one slice in the given dimension.

**Parameters**

- `dim` (number) — The input dimension.

**Returns**

- `boolean` — True if one view layer has more than one slice.

<MemberHeading id="hasanylayerwithvalidposition" depth="3" name="hasAnyLayerWithValidPosition" sig="hasAnyLayerWithValidPosition(): boolean" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L1259" sourceLabel="layerGroup.js:1259" />

Check if any layer has a valid position.

**Returns**

- `boolean` — True if any layer has a valid position.

<MemberHeading id="updatelayerstopositionchange" depth="3" name="updateLayersToPositionChange" sig="updateLayersToPositionChange(event: CustomEvent)" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L1284" sourceLabel="layerGroup.js:1284" />

Update layers (but not the event source layer) to a position change.

**Parameters**

- `event` (CustomEvent) — The position change event.

<MemberHeading id="getdivtoworldsizeratio" depth="3" name="getDivToWorldSizeRatio" sig="getDivToWorldSizeRatio(): number | undefined" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L1406" sourceLabel="layerGroup.js:1406" />

Calculate the div to world size ratio needed to fit the largest data.

**Returns**

- `number | undefined` — The ratio.

<MemberHeading id="fittocontainer" depth="3" name="fitToContainer" sig="fitToContainer(divToWorldSizeRatio: number)" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L1439" sourceLabel="layerGroup.js:1439" />

Fit to container: set the layers div to world size ratio.

**Parameters**

- `divToWorldSizeRatio` (number) — The ratio.

<MemberHeading id="getmaxworldsize" depth="3" name="getMaxWorldSize" sig="getMaxWorldSize(): Scalar2D | undefined" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L1477" sourceLabel="layerGroup.js:1477" />

Get the largest data world (mm) size.

**Returns**

- [`Scalar2D`](/scalar2d)` | undefined` — The largest size as {x,y}.

<MemberHeading id="flipscalez" depth="3" name="flipScaleZ" sig="flipScaleZ()" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L1499" sourceLabel="layerGroup.js:1499" />

Flip all layers along the Z axis without offset compensation.

<MemberHeading id="addscale" depth="3" name="addScale" sig="addScale(scaleStep: number, center: Point3D)" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L1510" sourceLabel="layerGroup.js:1510" />

Add scale to the layers. Scale cannot go lower than 0.1.

**Parameters**

- `scaleStep` (number) — The scale to add.
- `center` ([Point3D](/point3d)) — The scale center Point3D.

<MemberHeading id="setscale" depth="3" name="setScale" sig="setScale(newScale: Scalar3D, center?: Point3D)" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L1526" sourceLabel="layerGroup.js:1526" />

Set the layers' scale.

**Parameters**

- `newScale` ([Scalar3D](/scalar3d)) — The scale to apply as {x,y,z}.
- `center` ([Point3D](/point3d), optional) — The scale center Point3D.

**Fires**

- `LayerGroup#event:zoomchange`

<MemberHeading id="addtranslation" depth="3" name="addTranslation" sig="addTranslation(translation: Scalar3D)" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L1563" sourceLabel="layerGroup.js:1563" />

Add translation to the layers.

**Parameters**

- `translation` ([Scalar3D](/scalar3d)) — The translation as {x,y,z}.

<MemberHeading id="setoffset" depth="3" name="setOffset" sig="setOffset(newOffset: Scalar3D)" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L1577" sourceLabel="layerGroup.js:1577" />

Set the layers' offset.

**Parameters**

- `newOffset` ([Scalar3D](/scalar3d)) — The offset as {x,y,z}.

**Fires**

- `LayerGroup#event:offsetchange`

<MemberHeading id="reset" depth="3" name="reset" sig="reset()" />

<MemberMeta badges="deprecated" sourceHref="/source/src/gui/layergroup-js/#L1605" sourceLabel="layerGroup.js:1605" />

Reset the stage to its initial scale and no offset.

<Callout type="error">
  &#x20;Since v0.35, prefer resetZoomPan.
</Callout>

<MemberHeading id="resetzoompan" depth="3" name="resetZoomPan" sig="resetZoomPan()" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L1613" sourceLabel="layerGroup.js:1613" />

Reset the zoom and pan of all layers.

<MemberHeading id="resetviews" depth="3" name="resetViews" sig="resetViews()" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L1621" sourceLabel="layerGroup.js:1621" />

Reset the position and window level of all view layers.

<MemberHeading id="draw" depth="3" name="draw" sig="draw()" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L1641" sourceLabel="layerGroup.js:1641" />

Draw the layer.

<MemberHeading id="display" depth="3" name="display" sig="display(flag: boolean)" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L1654" sourceLabel="layerGroup.js:1654" />

Display the layer.

**Parameters**

- `flag` (boolean) — Whether to display the layer or not.

## Events

<MemberHeading id="activelayerchange" depth="3" name="activelayerchange" sig="activelayerchange: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/gui/layergroup-js/#L766" sourceLabel="layerGroup.js:766" />

Active layer change event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.value` (Array) — The changed value.

<MemberHeading id="removelayer" depth="3" name="removelayer" sig="removelayer: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/gui/layergroup-js/#L1065" sourceLabel="layerGroup.js:1065" />

Remove layer event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.layerid` (string) — The layer id.
  - `detail.layergroupid` (string) — The layer group id.

<MemberHeading id="zoomchange" depth="3" name="zoomchange" sig="zoomchange: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/gui/layergroup-js/#L1555" sourceLabel="layerGroup.js:1555" />

Zoom change event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.value` (Array) — The changed value.

<MemberHeading id="offsetchange" depth="3" name="offsetchange" sig="offsetchange: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/gui/layergroup-js/#L1595" sourceLabel="layerGroup.js:1595" />

Offset change event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.value` (Array) — The changed value.
