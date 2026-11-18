---
title: Stage
kind: class
longname: Stage
description: "Stage: controls a list of layer groups and their synchronisation."
---

# Stage

<SourceLink href="/source/src/gui/stage-js/#L14" label="stage.js:14" />

Stage: controls a list of layer groups and their synchronisation.

---

## Constructor

<Signature code="new Stage(): Stage" />

---

## Instance Methods

<MemberHeading id="getlayergroup" depth="3" name="getLayerGroup" sig="getLayerGroup(index: number): LayerGroup | undefined" />

<MemberMeta sourceHref="/source/src/gui/stage-js/#L55" sourceLabel="stage.js:55" />

Get the layer group at the given index.

**Parameters**

- `index` (number) — The index.

**Returns**

- [`LayerGroup`](/layergroup)` | undefined` — The layer group.

<MemberHeading id="getnumberoflayergroups" depth="3" name="getNumberOfLayerGroups" sig="getNumberOfLayerGroups(): number" />

<MemberMeta sourceHref="/source/src/gui/stage-js/#L64" sourceLabel="stage.js:64" />

Get the number of layer groups that form the stage.

**Returns**

- `number` — The number of layer groups.

<MemberHeading id="getactivelayergroup" depth="3" name="getActiveLayerGroup" sig="getActiveLayerGroup(): LayerGroup | undefined" />

<MemberMeta sourceHref="/source/src/gui/stage-js/#L73" sourceLabel="stage.js:73" />

Get the active layer group.

**Returns**

- [`LayerGroup`](/layergroup)` | undefined` — The layer group.

<MemberHeading id="setactivelayergroup" depth="3" name="setActiveLayerGroup" sig="setActiveLayerGroup(index: number)" />

<MemberMeta sourceHref="/source/src/gui/stage-js/#L82" sourceLabel="stage.js:82" />

Set the active layer group.

**Parameters**

- `index` (number) — The layer group index.

<MemberHeading id="getviewlayersbydataid" depth="3" name="getViewLayersByDataId" sig="getViewLayersByDataId(dataId: string): Array.<ViewLayer>" />

<MemberMeta sourceHref="/source/src/gui/stage-js/#L97" sourceLabel="stage.js:97" />

Get the view layers associated to a data id.

**Parameters**

- `dataId` (string) — The data id.

**Returns**

- `Array.<`[`ViewLayer`](/viewlayer)`>` — The layers.

<MemberHeading id="getviewlayers" depth="3" name="getViewLayers" sig="getViewLayers(callbackFn?: function): Array.<ViewLayer>" />

<MemberMeta sourceHref="/source/src/gui/stage-js/#L114" sourceLabel="stage.js:114" />

Get a list of view layers according to an input callback function.

**Parameters**

- `callbackFn` (function, optional) — A function that takes a ViewLayer as input and returns a boolean. If undefined, returns all view layers.

**Returns**

- `Array.<`[`ViewLayer`](/viewlayer)`>` — The layers that satisfy the callbackFn.

<MemberHeading id="getdrawlayersbydataid" depth="3" name="getDrawLayersByDataId" sig="getDrawLayersByDataId(dataId: string): Array.<DrawLayer>" />

<MemberMeta sourceHref="/source/src/gui/stage-js/#L128" sourceLabel="stage.js:128" />

Get the draw layers associated to a data id.

**Parameters**

- `dataId` (string) — The data id.

**Returns**

- `Array.<`[`DrawLayer`](/drawlayer)`>` — The layers.

<MemberHeading id="getdrawlayers" depth="3" name="getDrawLayers" sig="getDrawLayers(callbackFn?: function): Array.<DrawLayer>" />

<MemberMeta sourceHref="/source/src/gui/stage-js/#L145" sourceLabel="stage.js:145" />

Get a list of draw layers according to an input callback function.

**Parameters**

- `callbackFn` (function, optional) — A function that takes a DrawLayer as input and returns a boolean. If undefined, returns all draw layers.

**Returns**

- `Array.<`[`DrawLayer`](/drawlayer)`>` — The layers that satisfy the callbackFn.

<MemberHeading
  id="addlayergroup"
  depth="3"
  name="addLayerGroup"
  sig="addLayerGroup(
	htmlElement: object,
	withInfoOverlay?: boolean,
): LayerGroup"
/>

<MemberMeta sourceHref="/source/src/gui/stage-js/#L163" sourceLabel="stage.js:163" />

Add a layer group to the list.

The new layer group will be marked as the active layer group.

**Parameters**

- `htmlElement` (object) — The HTML element of the layer group.
- `withInfoOverlay` (boolean, optional) — Optional with info overlay flag, default to false.

**Returns**

- [`LayerGroup`](/layergroup) — The newly created layer group.

<MemberHeading id="getlayergroupbydivid" depth="3" name="getLayerGroupByDivId" sig="getLayerGroupByDivId(id: string): LayerGroup | undefined" />

<MemberMeta sourceHref="/source/src/gui/stage-js/#L187" sourceLabel="stage.js:187" />

Get a layer group from an HTML element id.

**Parameters**

- `id` (string) — The element id to find.

**Returns**

- [`LayerGroup`](/layergroup)` | undefined` — The layer group.

<MemberHeading id="setbinders" depth="3" name="setBinders" sig="setBinders(list: Array)" />

<MemberMeta sourceHref="/source/src/gui/stage-js/#L198" sourceLabel="stage.js:198" />

Set the layer groups binders.

**Parameters**

- `list` (Array) — The list of binder objects.

<MemberHeading id="empty" depth="3" name="empty" sig="empty()" />

<MemberMeta sourceHref="/source/src/gui/stage-js/#L212" sourceLabel="stage.js:212" />

Empty the layer group list.

<MemberHeading id="removelayersbydataid" depth="3" name="removeLayersByDataId" sig="removeLayersByDataId(dataId: string)" />

<MemberMeta sourceHref="/source/src/gui/stage-js/#L226" sourceLabel="stage.js:226" />

Remove all layers for a specific data.

**Parameters**

- `dataId` (string) — The data to remove its layers.

<MemberHeading id="removelayergroup" depth="3" name="removeLayerGroup" sig="removeLayerGroup(layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/gui/stage-js/#L237" sourceLabel="stage.js:237" />

Remove a layer group from this stage.

**Parameters**

- `layerGroup` ([LayerGroup](/layergroup)) — The layer group to remove.

<MemberHeading id="reset" depth="3" name="reset" sig="reset()" />

<MemberMeta badges="deprecated" sourceHref="/source/src/gui/stage-js/#L262" sourceLabel="stage.js:262" />

Reset the stage: calls reset on all layer groups.

<Callout type="error">
  &#x20;Since v0.35, prefer resetZoomPan.
</Callout>

<MemberHeading id="resetzoompan" depth="3" name="resetZoomPan" sig="resetZoomPan()" />

<MemberMeta sourceHref="/source/src/gui/stage-js/#L271" sourceLabel="stage.js:271" />

Reset the zoom and pan of all layer groups.

<MemberHeading id="resetviews" depth="3" name="resetViews" sig="resetViews()" />

<MemberMeta sourceHref="/source/src/gui/stage-js/#L280" sourceLabel="stage.js:280" />

Reset the position and window level of all layer groups.

<MemberHeading id="draw" depth="3" name="draw" sig="draw()" />

<MemberMeta sourceHref="/source/src/gui/stage-js/#L289" sourceLabel="stage.js:289" />

Draw the stage: calls draw on all layer groups.

<MemberHeading id="fittocontainer" depth="3" name="fitToContainer" sig="fitToContainer()" />

<MemberMeta sourceHref="/source/src/gui/stage-js/#L299" sourceLabel="stage.js:299" />

Fit to container: synchronise the div to world size ratio of the group layers.

<MemberHeading id="bindlayergroups" depth="3" name="bindLayerGroups" sig="bindLayerGroups()" />

<MemberMeta sourceHref="/source/src/gui/stage-js/#L327" sourceLabel="stage.js:327" />

Bind the layer groups of the stage.

<MemberHeading id="unbindlayergroups" depth="3" name="unbindLayerGroups" sig="unbindLayerGroups()" />

<MemberMeta sourceHref="/source/src/gui/stage-js/#L348" sourceLabel="stage.js:348" />

Unbind the layer groups of the stage.

<MemberHeading id="setimagesmoothing" depth="3" name="setImageSmoothing" sig="setImageSmoothing(flag: boolean)" />

<MemberMeta sourceHref="/source/src/gui/stage-js/#L371" sourceLabel="stage.js:371" />

Set the imageSmoothing flag value.

**Parameters**

- `flag` (boolean) — True to enable smoothing.
