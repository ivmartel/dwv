---
title: StageController
kind: class
longname: StageController
description: "Stage controller: manages the link between the data view configs and the stage (layer groups, layers, rendering)."
---

# StageController

<SourceLink href="/source/src/app/stagecontroller-js/#L49" label="stageController.js:49" />

Stage controller: manages the link between the data view configs and the stage (layer groups, layers, rendering).

---

## Constructor

<Signature
  code="new StageController(
	dataController: DataController,
	options: object,
): StageController"
/>

**Parameters**

- `dataController` ([DataController](/datacontroller)) — The data controller.
- `options` (object) — The app options.

---

## Instance Methods

<MemberHeading id="settoolboxcontroller" depth="3" name="setToolboxController" sig="setToolboxController(tc: ToolboxController)" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L112" sourceLabel="stageController.js:112" />

Set the toolbox controller.

**Parameters**

- `tc` ([ToolboxController](/toolboxcontroller)) — The toolbox controller.

<MemberHeading id="setaddtoundostack" depth="3" name="setAddToUndoStack" sig="setAddToUndoStack(fn: function)" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L121" sourceLabel="stageController.js:121" />

Set the add-to-undo-stack callback.

**Parameters**

- `fn` (function) — The callback.

<MemberHeading id="setgetinfodata" depth="3" name="setGetInfoData" sig="setGetInfoData(fn: function)" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L130" sourceLabel="stageController.js:130" />

Set the info data getter callback.

**Parameters**

- `fn` (function) — A function `(dataId) => InfoData`.

<MemberHeading
  id="getviewconfigs"
  depth="3"
  name="getViewConfigs"
  sig="getViewConfigs(
	dataId: string,
	excludeStarConfig?: boolean,
): Array.<ViewConfig>"
/>

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L144" sourceLabel="stageController.js:144" />

Get the layer group configuration from a data id.

**Parameters**

- `dataId` (string) — The data id.
- `excludeStarConfig` (boolean, optional) — Exclude the star config (default to false).

**Returns**

- `Array.<`[`ViewConfig`](/viewconfig)`>` — The list of associated configs.

<MemberHeading
  id="getviewconfig"
  depth="3"
  name="getViewConfig"
  sig="getViewConfig(
	dataId: string,
	groupDivId: string,
	excludeStarConfig?: boolean,
): ViewConfig | undefined"
/>

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L172" sourceLabel="stageController.js:172" />

Get the layer group configuration for a data id and group div id.

**Parameters**

- `dataId` (string) — The data id.
- `groupDivId` (string) — The layer group div id.
- `excludeStarConfig` (boolean, optional) — Exclude the star config (default to false).

**Returns**

- [`ViewConfig`](/viewconfig)` | undefined` — The associated config.

<MemberHeading id="getdataviewconfigs" depth="3" name="getDataViewConfigs" sig="getDataViewConfigs(): Record.<string, Array.<ViewConfig>>" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L185" sourceLabel="stageController.js:185" />

Get the data view config. Careful, returns a reference; do not modify without resetting.

**Returns**

- `Record.<string, Array.<`[`ViewConfig`](/viewconfig)`>>` — The configuration list.

<MemberHeading id="setdataviewconfigs" depth="3" name="setDataViewConfigs" sig="setDataViewConfigs(configs: Record.<string, Array.<ViewConfig>>)" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L195" sourceLabel="stageController.js:195" />

Set the data view configuration. Resets the stage and recreates all the views.

**Parameters**

- `configs` (Record.\<string, Array.\<[ViewConfig](/viewconfig)>>) — The configuration list.

<MemberHeading
  id="adddataviewconfig"
  depth="3"
  name="addDataViewConfig"
  sig="addDataViewConfig(
	dataId: string,
	config: ViewConfig,
	doRender?: boolean,
)"
/>

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L212" sourceLabel="stageController.js:212" />

Add a data view config.

**Parameters**

- `dataId` (string) — The data id.
- `config` ([ViewConfig](/viewconfig)) — The view configuration.
- `doRender` (boolean, optional) — Render data after configuration add. Defaults to true.

<MemberHeading id="removedataviewconfig" depth="3" name="removeDataViewConfig" sig="removeDataViewConfig(dataId: string, divId: string)" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L252" sourceLabel="stageController.js:252" />

Remove a data view config. Removes the associated layer if found, removes the layer group if empty.

**Parameters**

- `dataId` (string) — The data id.
- `divId` (string) — The div id.

<MemberHeading
  id="updatedataviewconfig"
  depth="3"
  name="updateDataViewConfig"
  sig="updateDataViewConfig(
	dataId: string,
	divId: string,
	config: ViewConfig,
)"
/>

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L301" sourceLabel="stageController.js:301" />

Update an existing data view config. Removes and re-creates the layer if found.

**Parameters**

- `dataId` (string) — The data id.
- `divId` (string) — The div id.
- `config` ([ViewConfig](/viewconfig)) — The view configuration.

<MemberHeading id="getactivelayergroup" depth="3" name="getActiveLayerGroup" sig="getActiveLayerGroup(): LayerGroup | undefined" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L352" sourceLabel="stageController.js:352" />

Get the active layer group.

**Returns**

- [`LayerGroup`](/layergroup)` | undefined` — The layer group.

<MemberHeading id="setactivelayergroup" depth="3" name="setActiveLayerGroup" sig="setActiveLayerGroup(index: number)" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L361" sourceLabel="stageController.js:361" />

Set the active layer group.

**Parameters**

- `index` (number) — The layer group index.

<MemberHeading id="getlayergroup" depth="3" name="getLayerGroup" sig="getLayerGroup(index: number): LayerGroup" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L371" sourceLabel="stageController.js:371" />

Get a layer group by index.

**Parameters**

- `index` (number) — The index.

**Returns**

- [`LayerGroup`](/layergroup) — The layer group.

<MemberHeading id="getnumberoflayergroups" depth="3" name="getNumberOfLayerGroups" sig="getNumberOfLayerGroups(): number" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L380" sourceLabel="stageController.js:380" />

Get the number of layer groups.

**Returns**

- `number` — The number of groups.

<MemberHeading id="getviewlayersbydataid" depth="3" name="getViewLayersByDataId" sig="getViewLayersByDataId(dataId: string): Array.<ViewLayer>" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L390" sourceLabel="stageController.js:390" />

Get the view layers associated to a data id.

**Parameters**

- `dataId` (string) — The data id.

**Returns**

- `Array.<`[`ViewLayer`](/viewlayer)`>` — The layers.

<MemberHeading id="getviewlayers" depth="3" name="getViewLayers" sig="getViewLayers(callbackFn?: function): Array.<ViewLayer>" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L402" sourceLabel="stageController.js:402" />

Get a list of view layers according to an input callback function.

**Parameters**

- `callbackFn` (function, optional) — A function that takes a ViewLayer as input and returns a boolean. If undefined, returns all view layers.

**Returns**

- `Array.<`[`ViewLayer`](/viewlayer)`>` — The layers that satisfy the callbackFn.

<MemberHeading id="getdrawlayersbydataid" depth="3" name="getDrawLayersByDataId" sig="getDrawLayersByDataId(dataId: string): Array.<DrawLayer>" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L412" sourceLabel="stageController.js:412" />

Get the draw layers associated to a data id.

**Parameters**

- `dataId` (string) — The data id.

**Returns**

- `Array.<`[`DrawLayer`](/drawlayer)`>` — The layers.

<MemberHeading id="getdrawlayers" depth="3" name="getDrawLayers" sig="getDrawLayers(callbackFn?: function): Array.<DrawLayer>" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L424" sourceLabel="stageController.js:424" />

Get a list of draw layers according to an input callback function.

**Parameters**

- `callbackFn` (function, optional) — A function that takes a DrawLayer as input and returns a boolean. If undefined, returns all draw layers.

**Returns**

- `Array.<`[`DrawLayer`](/drawlayer)`>` — The layers that satisfy the callbackFn.

<MemberHeading id="getlayergroupbydivid" depth="3" name="getLayerGroupByDivId" sig="getLayerGroupByDivId(divId: string): LayerGroup | undefined" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L434" sourceLabel="stageController.js:434" />

Get a layer group by div id.

**Parameters**

- `divId` (string) — The div id.

**Returns**

- [`LayerGroup`](/layergroup)` | undefined` — The layer group.

<MemberHeading id="getaddedscale" depth="3" name="getAddedScale" sig="getAddedScale(): Scalar3D" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/stagecontroller-js/#L444" sourceLabel="stageController.js:444" />

Get the active layer group scale on top of the base scale.

<Callout type="error">
  &#x20;Since v0.37, please access from the active layer group.
</Callout>

**Returns**

- [`Scalar3D`](/scalar3d) — The scale as {x,y,z}.

<MemberHeading id="getbasescale" depth="3" name="getBaseScale" sig="getBaseScale(): Scalar3D" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/stagecontroller-js/#L454" sourceLabel="stageController.js:454" />

Get the base scale of the active layer group.

<Callout type="error">
  &#x20;Since v0.37, please access from the active layer group.
</Callout>

**Returns**

- [`Scalar3D`](/scalar3d) — The scale as {x,y,z}.

<MemberHeading id="getoffset" depth="3" name="getOffset" sig="getOffset(): Scalar3D" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/stagecontroller-js/#L464" sourceLabel="stageController.js:464" />

Get the layer offset of the active layer group.

<Callout type="error">
  &#x20;Since v0.37, please access from the active layer group.
</Callout>

**Returns**

- [`Scalar3D`](/scalar3d) — The offset as {x,y,z}.

<MemberHeading id="empty" depth="3" name="empty" sig="empty()" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L471" sourceLabel="stageController.js:471" />

Empty the stage (remove all layer groups).

<MemberHeading id="removelayersbydataid" depth="3" name="removeLayersByDataId" sig="removeLayersByDataId(dataId: string)" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L480" sourceLabel="stageController.js:480" />

Remove layers for a specific data id.

**Parameters**

- `dataId` (string) — The data id.

<MemberHeading id="setbinders" depth="3" name="setBinders" sig="setBinders(instances: Array.<object>)" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L489" sourceLabel="stageController.js:489" />

Set the layer groups binders.

**Parameters**

- `instances` (Array.\<object>) — Binder instances.

<MemberHeading id="fittocontainer" depth="3" name="fitToContainer" sig="fitToContainer()" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L498" sourceLabel="stageController.js:498" />

Fit the display to the data of each layer group.

<MemberHeading id="draw" depth="3" name="draw" sig="draw()" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L505" sourceLabel="stageController.js:505" />

Draw all layer groups.

<MemberHeading id="resetlayout" depth="3" name="resetLayout" sig="resetLayout()" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/stagecontroller-js/#L514" sourceLabel="stageController.js:514" />

Reset zoom and pan of the stage.

<Callout type="error">
  &#x20;Since v0.35, prefer resetZoomPan.
</Callout>

<MemberHeading id="resetzoompan" depth="3" name="resetZoomPan" sig="resetZoomPan()" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L522" sourceLabel="stageController.js:522" />

Reset the zoom and pan of the stage.

<MemberHeading id="resetviews" depth="3" name="resetViews" sig="resetViews()" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L530" sourceLabel="stageController.js:530" />

Reset the position and window level of the stage.

<MemberHeading id="setimagesmoothing" depth="3" name="setImageSmoothing" sig="setImageSmoothing(flag: boolean)" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L539" sourceLabel="stageController.js:539" />

Set the imageSmoothing flag value. Default is false.

**Parameters**

- `flag` (boolean) — True to enable smoothing.

<MemberHeading id="zoom" depth="3" name="zoom" sig="zoom(step: number, cx: number, cy: number)" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/stagecontroller-js/#L552" sourceLabel="stageController.js:552" />

Zoom the layers of the active layer group.

<Callout type="error">
  &#x20;Since v0.37, please access from the active layer group.
</Callout>

**Parameters**

- `step` (number) — The step to add to the current zoom.
- `cx` (number) — The zoom center X coordinate.
- `cy` (number) — The zoom center Y coordinate.

<MemberHeading id="translate" depth="3" name="translate" sig="translate(tx: number, ty: number)" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L568" sourceLabel="stageController.js:568" />

Apply a translation to the layers of the active layer group.

**Parameters**

- `tx` (number) — The translation along X.
- `ty` (number) — The translation along Y.

<MemberHeading id="render" depth="3" name="render" sig="render(dataId: string, viewConfigs?: Array.<ViewConfig>)" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L582" sourceLabel="stageController.js:582" />

Render the current data.

**Parameters**

- `dataId` (string) — The data id to render.
- `viewConfigs` (Array.\<[ViewConfig](/viewconfig)>, optional) — The list of configs to render.
