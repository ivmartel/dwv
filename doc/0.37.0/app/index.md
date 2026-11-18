---
title: App
kind: class
longname: App
description: Main application class.
---

# App

<SourceLink href="/source/src/app/application-js/#L222" label="application.js:222" />

Main application class.

**Example**

<Playground providers="codepen">
  ```js
  import {App, AppOptions, ViewConfig} from '//esm.sh/dwv';
  // create the dwv app
  const app = new App();
  // initialise
  const viewConfig0 = new ViewConfig('layerGroup0');
  const viewConfigs = {'*': [viewConfig0]};
  const options = new AppOptions(viewConfigs);
  app.init(options);
  // load dicom data
  app.loadURLs([
    'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm'
  ]);
  ```
</Playground>

---

## Constructor

<Signature code="new App(): App" />

---

## Instance Methods

<MemberHeading id="getdatacontroller" depth="3" name="getDataController" sig="getDataController(): DataController" />

<MemberMeta sourceHref="/source/src/app/application-js/#L285" sourceLabel="application.js:285" />

Get the data controller.

**Returns**

- [`DataController`](/datacontroller) — The data controller.

<MemberHeading id="getdata" depth="3" name="getData" sig="getData(dataId: string): DicomData | undefined" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L296" sourceLabel="application.js:296" />

Get a DicomData.

<Callout type="error">
  &#x20;Since v0.37, please use via app.getDataController.
</Callout>

**Parameters**

- `dataId` (string) — The data id.

**Returns**

- [`DicomData`](/dicomdata)` | undefined` — The data.

<MemberHeading id="getimage" depth="3" name="getImage" sig="getImage(dataId: string): Image | undefined" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L311" sourceLabel="application.js:311" />

Get the image.

<Callout type="error">
  &#x20;Since v0.34, please use the getData method.
</Callout>

**Parameters**

- `dataId` (string) — The data id.

**Returns**

- [`Image`](/image)` | undefined` — The associated image.

<MemberHeading id="setimage" depth="3" name="setImage" sig="setImage(dataId: string, img: Image)" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L329" sourceLabel="application.js:329" />

Set the image at the given id.

<Callout type="error">
  &#x20;Since v0.37, please use via app.getDataController.
</Callout>

**Parameters**

- `dataId` (string) — The data id.
- `img` ([Image](/image)) — The associated image.

<MemberHeading id="getnextdataid" depth="3" name="getNextDataId" sig="getNextDataId(): string" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L343" sourceLabel="application.js:343" />

Get the next data id.

<Callout type="error">
  &#x20;Since v0.37, please use via app.getDataController.
</Callout>

**Returns**

- `string` — The data id.

<MemberHeading id="adddata" depth="3" name="addData" sig="addData(dataId: string, data: DicomData): boolean" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L359" sourceLabel="application.js:359" />

Add a new DicomData.

<Callout type="error">
  &#x20;Since v0.37, please use via app.getDataController.
</Callout>

**Parameters**

- `dataId` (string) — The data id.
- `data` ([DicomData](/dicomdata)) — The new data.

**Returns**

- `boolean` — False if the data cannot be added.

<MemberHeading
  id="getmetadata"
  depth="3"
  name="getMetaData"
  sig="getMetaData(
	dataId: string,
): Record.<string, DataElement> | undefined"
/>

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L374" sourceLabel="application.js:374" />

Get the meta data.

<Callout type="error">
  &#x20;Since v0.37, please use via app.getDataController.
</Callout>

**Parameters**

- `dataId` (string) — The data id.

**Returns**

- `Record.<string, `[`DataElement`](/dataelement)`> | undefined` — The list of meta data.

<MemberHeading id="getdataids" depth="3" name="getDataIds" sig="getDataIds(): Array.<string>" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L392" sourceLabel="application.js:392" />

Get the list of ids in the data storage.

<Callout type="error">
  &#x20;Since v0.37, please use via app.getDataController.
</Callout>

**Returns**

- `Array.<string>` — The list of data ids.

<MemberHeading id="getdataidsfromsopuids" depth="3" name="getDataIdsFromSopUids" sig="getDataIdsFromSopUids(uids: Array.<string>): Array.<string>" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L407" sourceLabel="application.js:407" />

Get the list of dataIds that contain the input UIDs.

<Callout type="error">
  &#x20;Since v0.37, please use via app.getDataController.
</Callout>

**Parameters**

- `uids` (Array.\<string>) — A list of UIDs.

**Returns**

- `Array.<string>` — The list of dataIds that contain the UIDs.

<MemberHeading id="getdataidfromseriesuid" depth="3" name="getDataIdFromSeriesUid" sig="getDataIdFromSeriesUid(uid: string): string" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L422" sourceLabel="application.js:422" />

Get the first data id with the given SeriesInstanceUID.

<Callout type="error">
  &#x20;Since v0.37, please use via app.getDataController.
</Callout>

**Parameters**

- `uid` (string) — The SeriesInstanceUID.

**Returns**

- `string` — The data id.

<MemberHeading id="canscroll" depth="3" name="canScroll" sig="canScroll(): boolean" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L437" sourceLabel="application.js:437" />

Can the data (of the active view of the active layer) be scrolled?

<Callout type="error">
  &#x20;Since v0.33, please use the ViewController equivalent directly instead.
</Callout>

**Returns**

- `boolean` — True if the data has a third dimension greater than one.

<MemberHeading id="canwindowlevel" depth="3" name="canWindowLevel" sig="canWindowLevel(): boolean" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L455" sourceLabel="application.js:455" />

Can window and level be applied to the data (of the active view of the active layer)?

<Callout type="error">
  &#x20;Since v0.33, please use the ViewController equivalent directly instead.
</Callout>

**Returns**

- `boolean` — True if the data is monochrome.

<MemberHeading id="getaddedscale" depth="3" name="getAddedScale" sig="getAddedScale(): Scalar3D" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L471" sourceLabel="application.js:471" />

Get the active layer group scale on top of the base scale.

<Callout type="error">
  &#x20;Since v0.37, please access from the active layer group.
</Callout>

**Returns**

- [`Scalar3D`](/scalar3d) — The scale as {x,y,z}.

<MemberHeading id="getbasescale" depth="3" name="getBaseScale" sig="getBaseScale(): Scalar3D" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L484" sourceLabel="application.js:484" />

Get the base scale of the active layer group.

<Callout type="error">
  &#x20;Since v0.37, please access from the active layer group.
</Callout>

**Returns**

- [`Scalar3D`](/scalar3d) — The scale as {x,y,z}.

<MemberHeading id="getoffset" depth="3" name="getOffset" sig="getOffset(): Scalar3D" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L497" sourceLabel="application.js:497" />

Get the layer offset of the active layer group.

<Callout type="error">
  &#x20;Since v0.37, please access from the active layer group.
</Callout>

**Returns**

- [`Scalar3D`](/scalar3d) — The offset as {x,y,z}.

<MemberHeading id="gettoolboxcontroller" depth="3" name="getToolboxController" sig="getToolboxController(): ToolboxController" />

<MemberMeta sourceHref="/source/src/app/application-js/#L509" sourceLabel="application.js:509" />

Get the toolbox controller.

**Returns**

- [`ToolboxController`](/toolboxcontroller) — The controller.

<MemberHeading id="getstagecontroller" depth="3" name="getStageController" sig="getStageController(): StageController" />

<MemberMeta sourceHref="/source/src/app/application-js/#L518" sourceLabel="application.js:518" />

Get the stage controller.

**Returns**

- [`StageController`](/stagecontroller) — The stage controller.

<MemberHeading id="getundocontroller" depth="3" name="getUndoController" sig="getUndoController(): UndoController" />

<MemberMeta sourceHref="/source/src/app/application-js/#L527" sourceLabel="application.js:527" />

Get the undo controller.

**Returns**

- [`UndoController`](/undocontroller) — The undo controller.

<MemberHeading id="getactivelayergroup" depth="3" name="getActiveLayerGroup" sig="getActiveLayerGroup(): LayerGroup | undefined" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L539" sourceLabel="application.js:539" />

Get the active layer group. The layer is available after the first loaded item.

<Callout type="error">
  &#x20;Since v0.37, use \`app.getStageController().getActiveLayerGroup()\` instead.
</Callout>

**Returns**

- [`LayerGroup`](/layergroup)` | undefined` — The layer group.

<MemberHeading id="setactivelayergroup" depth="3" name="setActiveLayerGroup" sig="setActiveLayerGroup(index: number)" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L553" sourceLabel="application.js:553" />

Set the active layer group.

<Callout type="error">
  &#x20;Since v0.37, use \`app.getStageController().setActiveLayerGroup()\` instead.
</Callout>

**Parameters**

- `index` (number) — The layer group index.

<MemberHeading id="getviewlayersbydataid" depth="3" name="getViewLayersByDataId" sig="getViewLayersByDataId(dataId: string): Array.<ViewLayer>" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L569" sourceLabel="application.js:569" />

Get the view layers associated to a data id. The layer are available after the first loaded item.

<Callout type="error">
  &#x20;Since v0.37, use \`app.getStageController().getViewLayersByDataId()\` instead.
</Callout>

**Parameters**

- `dataId` (string) — The data id.

**Returns**

- `Array.<`[`ViewLayer`](/viewlayer)`>` — The layers.

<MemberHeading id="getviewlayers" depth="3" name="getViewLayers" sig="getViewLayers(callbackFn?: function): Array.<ViewLayer>" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L587" sourceLabel="application.js:587" />

Get a list of view layers according to an input callback function.

<Callout type="error">
  &#x20;Since v0.37, use \`app.getStageController().getViewLayers()\` instead.
</Callout>

**Parameters**

- `callbackFn` (function, optional) — A function that takes a ViewLayer as input and returns a boolean. If undefined, returns all view layers.

**Returns**

- `Array.<`[`ViewLayer`](/viewlayer)`>` — The layers that satisfy the callbackFn.

<MemberHeading id="getdrawlayersbydataid" depth="3" name="getDrawLayersByDataId" sig="getDrawLayersByDataId(dataId: string): Array.<DrawLayer>" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L603" sourceLabel="application.js:603" />

Get the draw layers associated to a data id. The layer are available after the first loaded item.

<Callout type="error">
  &#x20;Since v0.37, use \`app.getStageController().getDrawLayersByDataId()\` instead.
</Callout>

**Parameters**

- `dataId` (string) — The data id.

**Returns**

- `Array.<`[`DrawLayer`](/drawlayer)`>` — The layers.

<MemberHeading id="getdrawlayers" depth="3" name="getDrawLayers" sig="getDrawLayers(callbackFn?: function): Array.<DrawLayer>" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L621" sourceLabel="application.js:621" />

Get a list of draw layers according to an input callback function.

<Callout type="error">
  &#x20;Since v0.37, use \`app.getStageController().getDrawLayers()\` instead.
</Callout>

**Parameters**

- `callbackFn` (function, optional) — A function that takes a DrawLayer as input and returns a boolean. If undefined, returns all draw layers.

**Returns**

- `Array.<`[`DrawLayer`](/drawlayer)`>` — The layers that satisfy the callbackFn.

<MemberHeading id="getlayergroupbydivid" depth="3" name="getLayerGroupByDivId" sig="getLayerGroupByDivId(divId: string): LayerGroup | undefined" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L637" sourceLabel="application.js:637" />

Get a layer group by div id. The layer is available after the first loaded item.

<Callout type="error">
  &#x20;Since v0.37, use \`app.getStageController().getLayerGroupByDivId()\` instead.
</Callout>

**Parameters**

- `divId` (string) — The div id.

**Returns**

- [`LayerGroup`](/layergroup)` | undefined` — The layer group.

<MemberHeading id="getnumberoflayergroups" depth="3" name="getNumberOfLayerGroups" sig="getNumberOfLayerGroups(): number" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L651" sourceLabel="application.js:651" />

Get the number of layer groups.

<Callout type="error">
  &#x20;Since v0.37, use \`app.getStageController().getNumberOfLayerGroups()\` instead.
</Callout>

**Returns**

- `number` — The number of groups.

<MemberHeading id="getstyle" depth="3" name="getStyle" sig="getStyle(): object" />

<MemberMeta sourceHref="/source/src/app/application-js/#L663" sourceLabel="application.js:663" />

Get the app style.

**Returns**

- `object` — The app style.

<MemberHeading id="addtoundostack" depth="3" name="addToUndoStack" sig="addToUndoStack(cmd: Command)" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L675" sourceLabel="application.js:675" />

Add a command to the undo stack.

<Callout type="error">
  &#x20;Since v0.37, please use via app.getUndoController.
</Callout>

**Parameters**

- `cmd` ([Command](/command)) — The command to add.

**Fires**

- `UndoStack#event:undoadd`

<MemberHeading id="removefromundostack" depth="3" name="removeFromUndoStack" sig="removeFromUndoStack(name: string): boolean" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L694" sourceLabel="application.js:694" />

Remove a command from the undo stack.

<Callout type="error">
  &#x20;Since v0.37, please use via app.getUndoController.
</Callout>

**Parameters**

- `name` (string) — The name of the command to remove.

**Returns**

- `boolean` — True if the command was found and removed.

**Fires**

- `UndoStack#event:undoremove`

<MemberHeading id="init" depth="3" name="init" sig="init(opt: AppOptions)" />

<MemberMeta sourceHref="/source/src/app/application-js/#L739" sourceLabel="application.js:739" />

Initialise the application.

**Parameters**

- `opt` ([AppOptions](/appoptions)) — The application options.

**Example**

<Playground providers="codepen">
  ```js
  import {App, AppOptions, ViewConfig} from '//esm.sh/dwv';
  // create the dwv app
  const app = new App();
  // initialise
  const viewConfig0 = new ViewConfig('layerGroup0');
  const viewConfigs = {'*': [viewConfig0]};
  const options = new AppOptions(viewConfigs);
  options.viewOnFirstLoadItem = false;
  app.init(options);
  // render button
  const button = document.createElement('button');
  button.id = 'render';
  button.disabled = true;
  button.appendChild(document.createTextNode('render'));
  document.body.appendChild(button);
  app.addEventListener('load', function () {
    const button = document.getElementById('render');
    button.disabled = false;
    button.onclick = function () {
      // render data #0
      app.getStageController().render(0);
    };
  });
  // load dicom data
  app.loadURLs([
    'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm'
  ]);
  ```
</Playground>

<MemberHeading id="reset" depth="3" name="reset" sig="reset()" />

<MemberMeta sourceHref="/source/src/app/application-js/#L888" sourceLabel="application.js:888" />

Reset the application.

<MemberHeading id="resetlayout" depth="3" name="resetLayout" sig="resetLayout()" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L903" sourceLabel="application.js:903" />

Reset the layout of the application.

<Callout type="error">
  &#x20;Since v0.35, prefer resetZoomPan.
</Callout>

<MemberHeading id="resetzoompan" depth="3" name="resetZoomPan" sig="resetZoomPan()" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L915" sourceLabel="application.js:915" />

Reset the zoom and pan of the stage.

<Callout type="error">
  &#x20;Since v0.37, use \`app.getStageController().resetZoomPan()\` instead.
</Callout>

<MemberHeading id="resetviews" depth="3" name="resetViews" sig="resetViews()" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L928" sourceLabel="application.js:928" />

Reset the position and window level of the stage.

<Callout type="error">
  &#x20;Since v0.37, use \`app.getStageController().resetViews()\` instead.
</Callout>

<MemberHeading id="loadfiles" depth="3" name="loadFiles" sig="loadFiles(files: Array.<File>): string" />

<MemberMeta sourceHref="/source/src/app/application-js/#L1046" sourceLabel="application.js:1046" />

Load a list of image files.

**Parameters**

- `files` (Array.\<File>) — The list of files to load.

**Returns**

- `string` — The data ID, '-1' if problem.

**Fires**

- `App#event:loadstart`
- `App#event:loadprogress`
- `App#event:loaditem`
- `App#event:loadend`
- `App#event:error`
- `App#event:abort`

<MemberHeading id="loadurls" depth="3" name="loadURLs" sig="loadURLs(urls: Array.<string>, options?: object): string" />

<MemberMeta sourceHref="/source/src/app/application-js/#L1073" sourceLabel="application.js:1073" />

Load a list of image URLs.

**Parameters**

- `urls` (Array.\<string>) — The list of urls to load.
- `options` (object, optional) — The options object, can contain:

**Returns**

- `string` — The data ID, '-1' if problem.

**Fires**

- `App#event:loadstart`
- `App#event:loadprogress`
- `App#event:loaditem`
- `App#event:loadend`
- `App#event:error`
- `App#event:abort`

<MemberHeading id="loadfromuri" depth="3" name="loadFromUri" sig="loadFromUri(uri: string, options?: object)" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L1092" sourceLabel="application.js:1092" />

Load from an input uri.

<Callout type="error">
  &#x20;Since v0.36, please extract the file list and pass it to loadURLs. State from uri is no longer supported.
</Callout>

**Parameters**

- `uri` (string) — The input uri, for example: 'window\.location.href'.
- `options` (object, optional) — Optional url request options.

<MemberHeading id="loadimageobject" depth="3" name="loadImageObject" sig="loadImageObject(data: Array): string" />

<MemberMeta sourceHref="/source/src/app/application-js/#L1119" sourceLabel="application.js:1119" />

Load a list of ArrayBuffers.

**Parameters**

- `data` (Array) — The list of ArrayBuffers to load in the form of \[{name: "", filename: "", data: data}].

**Returns**

- `string` — The data ID.

**Fires**

- `App#event:loadstart`
- `App#event:loadprogress`
- `App#event:loaditem`
- `App#event:loadend`
- `App#event:error`
- `App#event:abort`

<MemberHeading id="abortallloads" depth="3" name="abortAllLoads" sig="abortAllLoads()" />

<MemberMeta sourceHref="/source/src/app/application-js/#L1128" sourceLabel="application.js:1128" />

Abort all the current loads.

<MemberHeading id="abortload" depth="3" name="abortLoad" sig="abortLoad(dataId: string)" />

<MemberMeta sourceHref="/source/src/app/application-js/#L1140" sourceLabel="application.js:1140" />

Abort an individual data load.

**Parameters**

- `dataId` (string) — The data to stop loading.

<MemberHeading id="fittocontainer" depth="3" name="fitToContainer" sig="fitToContainer()" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L1158" sourceLabel="application.js:1158" />

Fit the display to the data of each layer group. To be called once the image is loaded.

<Callout type="error">
  &#x20;Since v0.37, use \`app.getStageController().fitToContainer()\` instead.
</Callout>

<MemberHeading id="initwldisplay" depth="3" name="initWLDisplay" sig="initWLDisplay()" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L1172" sourceLabel="application.js:1172" />

Init the Window/Level display (of the active layer of the active layer group).

<Callout type="error">
  &#x20;Since v0.33, please set the opacity of the desired view layer directly.
</Callout>

<MemberHeading id="setimagesmoothing" depth="3" name="setImageSmoothing" sig="setImageSmoothing(flag: boolean)" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L1189" sourceLabel="application.js:1189" />

Set the imageSmoothing flag value. Default is false.

<Callout type="error">
  &#x20;Since v0.37, use \`app.getStageController().setImageSmoothing()\` instead.
</Callout>

**Parameters**

- `flag` (boolean) — True to enable smoothing.

<MemberHeading
  id="getviewconfigs"
  depth="3"
  name="getViewConfigs"
  sig="getViewConfigs(
	dataId: string,
	excludeStarConfig?: boolean,
): Array.<ViewConfig>"
/>

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L1206" sourceLabel="application.js:1206" />

Get the layer group configuration from a data id.

<Callout type="error">
  &#x20;Since v0.37, use \`app.getStageController().getViewConfigs()\` instead.
</Callout>

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

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L1224" sourceLabel="application.js:1224" />

Get the layer group configuration for a data id and group div id.

<Callout type="error">
  &#x20;Since v0.37, use \`app.getStageController().getViewConfig()\` instead.
</Callout>

**Parameters**

- `dataId` (string) — The data id.
- `groupDivId` (string) — The layer group div id.
- `excludeStarConfig` (boolean, optional) — Exclude the star config (default to false).

**Returns**

- [`ViewConfig`](/viewconfig)` | undefined` — The associated config.

<MemberHeading id="getdataviewconfigs" depth="3" name="getDataViewConfigs" sig="getDataViewConfigs(): Record.<string, Array.<ViewConfig>>" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L1240" sourceLabel="application.js:1240" />

Get the data view config. Careful, returns a reference; do not modify without resetting.

<Callout type="error">
  &#x20;Since v0.37, use \`app.getStageController().getDataViewConfigs()\` instead.
</Callout>

**Returns**

- `Record.<string, Array.<`[`ViewConfig`](/viewconfig)`>>` — The configuration list.

<MemberHeading id="setdataviewconfigs" depth="3" name="setDataViewConfigs" sig="setDataViewConfigs(configs: Record.<string, Array.<ViewConfig>>)" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L1255" sourceLabel="application.js:1255" />

Set the data view configuration. Resets the stage and recreates all the views.

<Callout type="error">
  &#x20;Since v0.37, use \`app.getStageController().setDataViewConfigs()\` instead.
</Callout>

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

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L1272" sourceLabel="application.js:1272" />

Add a data view config.

<Callout type="error">
  &#x20;Since v0.37, use \`app.getStageController().addDataViewConfig()\` instead.
</Callout>

**Parameters**

- `dataId` (string) — The data id.
- `config` ([ViewConfig](/viewconfig)) — The view configuration.
- `doRender` (boolean, optional) — Render data after configuration add. Defaults to true.

<MemberHeading id="removedataviewconfig" depth="3" name="removeDataViewConfig" sig="removeDataViewConfig(dataId: string, divId: string)" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L1289" sourceLabel="application.js:1289" />

Remove a data view config. Removes the associated layer if found, removes the layer group if empty.

<Callout type="error">
  &#x20;Since v0.37, use \`app.getStageController().removeDataViewConfig()\` instead.
</Callout>

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

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L1306" sourceLabel="application.js:1306" />

Update an existing data view config. Removes and re-creates the layer if found.

<Callout type="error">
  &#x20;Since v0.37, use \`app.getStageController().updateDataViewConfig()\` instead.
</Callout>

**Parameters**

- `dataId` (string) — The data id.
- `divId` (string) — The div id.
- `config` ([ViewConfig](/viewconfig)) — The view configuration.

<MemberHeading id="setlayergroupsbinders" depth="3" name="setLayerGroupsBinders" sig="setLayerGroupsBinders(list: Array.<string>)" />

<MemberMeta sourceHref="/source/src/app/application-js/#L1318" sourceLabel="application.js:1318" />

Set the layer groups binders.

**Parameters**

- `list` (Array.\<string>) — The list of binder names.

<MemberHeading id="render" depth="3" name="render" sig="render(dataId: string, viewConfigs?: Array.<ViewConfig>)" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L1336" sourceLabel="application.js:1336" />

Render the current data.

<Callout type="error">
  &#x20;Since v0.37, use \`app.getStageController().render()\` instead.
</Callout>

**Parameters**

- `dataId` (string) — The data id to render.
- `viewConfigs` (Array.\<[ViewConfig](/viewconfig)>, optional) — The list of configs to render.

<MemberHeading id="zoom" depth="3" name="zoom" sig="zoom(step: number, cx: number, cy: number)" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L1351" sourceLabel="application.js:1351" />

Zoom the layers of the active layer group.

<Callout type="error">
  &#x20;Since v0.37, please access from the active layer group.
</Callout>

**Parameters**

- `step` (number) — The step to add to the current zoom.
- `cx` (number) — The zoom center X coordinate.
- `cy` (number) — The zoom center Y coordinate.

<MemberHeading id="translate" depth="3" name="translate" sig="translate(tx: number, ty: number)" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L1365" sourceLabel="application.js:1365" />

Apply a translation to the layers of the active layer group.

<Callout type="error">
  &#x20;Since v0.37, please access from the active layer group.
</Callout>

**Parameters**

- `tx` (number) — The translation along X.
- `ty` (number) — The translation along Y.

<MemberHeading id="resamplematch" depth="3" name="resampleMatch" sig="resampleMatch(dataIdTarget: string, dataIdSource: string)" />

<MemberMeta sourceHref="/source/src/app/application-js/#L1379" sourceLabel="application.js:1379" />

Resample one image to match the orientation of another.

**Parameters**

- `dataIdTarget` (string) — The target image id to resample.
- `dataIdSource` (string) — The source image id to copy the orientation from.

<MemberHeading id="resample" depth="3" name="resample" sig="resample(dataIdTarget: string, orientation: Matrix33)" />

<MemberMeta sourceHref="/source/src/app/application-js/#L1429" sourceLabel="application.js:1429" />

Resample an image to match an arbitrary orientation.

**Parameters**

- `dataIdTarget` (string) — The target image id to resample.
- `orientation` ([Matrix33](/matrix33)) — The orientation to resample to.

<MemberHeading id="revertresample" depth="3" name="revertResample" sig="revertResample(dataIdTarget: string)" />

<MemberMeta sourceHref="/source/src/app/application-js/#L1490" sourceLabel="application.js:1490" />

Revert an image back to its original orientation.

**Parameters**

- `dataIdTarget` (string) — The target image id to revert.

<MemberHeading id="setopacity" depth="3" name="setOpacity" sig="setOpacity(alpha: number)" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L1550" sourceLabel="application.js:1550" />

Set the active view layer (of the active layer group) opacity.

<Callout type="error">
  &#x20;Since v0.33, pplease set the opacity of the desired view layer directly.
</Callout>

**Parameters**

- `alpha` (number) — The opacity (\[0:1] range).

<MemberHeading id="onresize" depth="3" name="onResize" sig="onResize()" />

<MemberMeta sourceHref="/source/src/app/application-js/#L1569" sourceLabel="application.js:1569" />

Handle resize: fit the display to the window. To be called once the image is loaded. Can be connected to a window 'resize' event.

<MemberHeading id="onkeydown" depth="3" name="onKeydown" sig="onKeydown(event: object)" />

<MemberMeta sourceHref="/source/src/app/application-js/#L1581" sourceLabel="application.js:1581" />

Key down callback. Meant to be used in tools.

**Parameters**

- `event` (object) — The KeyboardEvent down event augmented with a context.

**Fires**

- `App#event:keydown`

<MemberHeading id="defaultonkeydown" depth="3" name="defaultOnKeydown" sig="defaultOnKeydown(event: KeyboardEvent)" />

<MemberMeta sourceHref="/source/src/app/application-js/#L1623" sourceLabel="application.js:1623" />

Key down event handler example.

- CRTL-Z: undo,
- CRTL-Y: redo,
- CRTL-ARROW\_LEFT: next element on fourth dim,
- CRTL-ARROW\_UP: next element on third dim,
- CRTL-ARROW\_RIGHT: previous element on fourth dim,
- CRTL-ARROW\_DOWN: previous element on third dim.

Applies to the active view of the active layer group.

**Parameters**

- `event` (KeyboardEvent) — The key down event.

**Fires**

- `UndoStack#event:undo`
- `UndoStack#event:redo`

<MemberHeading id="resetdisplay" depth="3" name="resetDisplay" sig="resetDisplay()" />

<MemberMeta sourceHref="/source/src/app/application-js/#L1665" sourceLabel="application.js:1665" />

Reset the display.

<MemberHeading id="resetzoom" depth="3" name="resetZoom" sig="resetZoom()" />

<MemberMeta sourceHref="/source/src/app/application-js/#L1673" sourceLabel="application.js:1673" />

Reset the app zoom.

<MemberHeading id="setcolourmap" depth="3" name="setColourMap" sig="setColourMap(name: string)" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L1684" sourceLabel="application.js:1684" />

Set the colour map of the active view of the active layer group.

<Callout type="error">
  &#x20;Since v0.33, please use the ViewController equivalent directly instead.
</Callout>

**Parameters**

- `name` (string) — The colour map name.

<MemberHeading id="setwindowlevelpreset" depth="3" name="setWindowLevelPreset" sig="setWindowLevelPreset(preset: string)" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L1701" sourceLabel="application.js:1701" />

Set the window/level preset of the active view of the active layer group.

<Callout type="error">
  &#x20;Since v0.33, please use the ViewController equivalent directly instead.
</Callout>

**Parameters**

- `preset` (string) — The window/level preset.

<MemberHeading id="settool" depth="3" name="setTool" sig="setTool(tool: string)" />

<MemberMeta sourceHref="/source/src/app/application-js/#L1716" sourceLabel="application.js:1716" />

Set the tool.

**Parameters**

- `tool` (string) — The tool.

<MemberHeading id="settoolfeatures" depth="3" name="setToolFeatures" sig="setToolFeatures(list: object)" />

<MemberMeta sourceHref="/source/src/app/application-js/#L1734" sourceLabel="application.js:1734" />

Set the tool live features.

**Parameters**

- `list` (object) — The list of features.

<MemberHeading id="undo" depth="3" name="undo" sig="undo()" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L1744" sourceLabel="application.js:1744" />

Undo the last action.

<Callout type="error">
  &#x20;Since v0.37, please use via app.getUndoController.
</Callout>

**Fires**

- `UndoStack#event:undo`

<MemberHeading id="redo" depth="3" name="redo" sig="redo()" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L1758" sourceLabel="application.js:1758" />

Redo the last action.

<Callout type="error">
  &#x20;Since v0.37, please use via app.getUndoController.
</Callout>

**Fires**

- `UndoStack#event:redo`

<MemberHeading id="getstacksize" depth="3" name="getStackSize" sig="getStackSize(): number" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L1772" sourceLabel="application.js:1772" />

Get the undo stack size.

<Callout type="error">
  &#x20;Since v0.37, please use via app.getUndoController.
</Callout>

**Returns**

- `number` — The size of the stack.

<MemberHeading id="getcurrentstackindex" depth="3" name="getCurrentStackIndex" sig="getCurrentStackIndex(): number" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/application-js/#L1786" sourceLabel="application.js:1786" />

Get the current undo stack index.

<Callout type="error">
  &#x20;Since v0.37, please use via app.getUndoController.
</Callout>

**Returns**

- `number` — The stack index.

<MemberHeading id="getinfodata" depth="3" name="getInfoData" sig="getInfoData(dataId: string): InfoData | undefined" />

<MemberMeta sourceHref="/source/src/app/application-js/#L1800" sourceLabel="application.js:1800" />

Get the info data for a data id.

**Parameters**

- `dataId` (string) — The data id.

**Returns**

- [`InfoData`](/infodata)` | undefined` — The info data.

<MemberHeading id="toggleinfodatalisteners" depth="3" name="toggleInfoDataListeners" sig="toggleInfoDataListeners(dataId: string)" />

<MemberMeta sourceHref="/source/src/app/application-js/#L1813" sourceLabel="application.js:1813" />

Toggle info data listeners.

**Parameters**

- `dataId` (string) — The data id.

<MemberHeading id="createannotationdata" depth="3" name="createAnnotationData" sig="createAnnotationData(refDataId: string): DicomData" />

<MemberMeta sourceHref="/source/src/app/application-js/#L1831" sourceLabel="application.js:1831" />

Create new annotation data based on the data of the active view layer.

**Parameters**

- `refDataId` (string) — The reference data id.

**Returns**

- [`DicomData`](/dicomdata) — The new data.

<MemberHeading
  id="addandrenderannotationdata"
  depth="3"
  name="addAndRenderAnnotationData"
  sig="addAndRenderAnnotationData(
	data: DicomData,
	divId: string,
	refDataId: string,
)"
/>

<MemberMeta sourceHref="/source/src/app/application-js/#L1879" sourceLabel="application.js:1879" />

Add new data and render it with a simple new data view config.

**Parameters**

- `data` ([DicomData](/dicomdata)) — The data to add.
- `divId` (string) — The div where to draw.
- `refDataId` (string) — The reference data id.

## Events

<MemberHeading id="loadstart" depth="3" name="loadstart" sig="loadstart: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/app/application-js/#L948" sourceLabel="application.js:948" />

Load start event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.dataid` (string) — The data id.
  - `detail.source` (\*) — The load source: string for an url, File for a file.

<MemberHeading id="loadprogress" depth="3" name="loadprogress" sig="loadprogress: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/app/application-js/#L961" sourceLabel="application.js:961" />

Load progress event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.dataid` (string) — The data id.
  - `detail.source` (\*) — The load source: string for an url, File for a file.
  - `detail.loaded` (number) — The loaded percentage.
  - `detail.total` (number) — The total percentage.

<MemberHeading id="loaditem" depth="3" name="loaditem" sig="loaditem: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/app/application-js/#L975" sourceLabel="application.js:975" />

Load item event: fired when an item has been successfully loaded.

**Properties**

- `detail` (object) — The event detail.
  - `detail.dataid` (string) — The data id.
  - `detail.source` (\*) — The load source: string for an url, File for a file.
  - `detail.data` (object) — The loaded meta data.
  - `detail.isfirstitem` (boolean) — True if the item is the first one loaded for the data id.

<MemberHeading id="load" depth="3" name="load" sig="load: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/app/application-js/#L986" sourceLabel="application.js:986" />

Load event: fired when a load finishes successfully.

**Properties**

- `detail` (object) — The event detail.
  - `detail.dataid` (string) — The data id.
  - `detail.source` (\*) — The load source: string for an url, File for a file.

<MemberHeading id="loadend" depth="3" name="loadend" sig="loadend: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/app/application-js/#L998" sourceLabel="application.js:998" />

Load end event: fired when the load finishes, successfully or not.

**Properties**

- `detail` (object) — The event detail.
  - `detail.dataid` (string) — The data id.
  - `detail.source` (\*) — The load source: string for an url, File for a file.

<MemberHeading id="error" depth="3" name="error" sig="error: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/app/application-js/#L1011" sourceLabel="application.js:1011" />

Load error event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.dataid` (string) — The data id.
  - `detail.source` (\*) — The load source: string for an url, File for a file.
  - `detail.error` (object) — The error.
  - `detail.target` (object) — The event target.

<MemberHeading id="timeout" depth="3" name="timeout" sig="timeout: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/app/application-js/#L1022" sourceLabel="application.js:1022" />

Load timeout event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.dataid` (string) — The data id.
  - `detail.source` (\*) — The load source: an url as a string.
  - `detail.target` (object) — The event target.

<MemberHeading id="abort" depth="3" name="abort" sig="abort: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/app/application-js/#L1033" sourceLabel="application.js:1033" />

Load abort event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.dataid` (string) — The data id.
  - `detail.source` (\*) — The load source: string for an url, File for a file.

<MemberHeading id="keydown" depth="3" name="keydown" sig="keydown: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/app/application-js/#L1595" sourceLabel="application.js:1595" />

Key down event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.key` (string) — The key value.
  - `detail.code` (string) — The code value.
  - `detail.ctrlKey` (boolean) — True if ctrl key is down.
  - `detail.altKey` (boolean) — True if alt key is down.
  - `detail.shiftKey` (boolean) — True if shift key is down.
  - `detail.context` (string) — The tool where the event originated.

<MemberHeading id="viewlayeradd" depth="3" name="viewlayeradd" sig="viewlayeradd: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/app/stagecontroller-js/#L958" sourceLabel="stageController.js:958" />

Add view layer event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.layerid` (string) — The layer id.
  - `detail.layergroupid` (string) — The layer group id.
  - `detail.dataid` (string) — The data id.

<MemberHeading id="drawlayeradd" depth="3" name="drawlayeradd" sig="drawlayeradd: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/app/stagecontroller-js/#L1098" sourceLabel="stageController.js:1098" />

Add draw layer event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.layerid` (string) — The layer id.
  - `detail.layergroupid` (string) — The layer group id.
  - `detail.dataid` (string) — The data id.

<MemberHeading id="opacitychange" depth="3" name="opacitychange" sig="opacitychange: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/gui/drawlayer-js/#L342" sourceLabel="drawLayer.js:342" />

Opacity change event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.srclayerid` (string) — The source layer id.
  - `detail.dataid` (string) — The data id.
  - `detail.value` (Array) — The changed value.

<MemberHeading id="opacitychange" depth="3" name="opacitychange" sig="opacitychange: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/gui/viewlayer-js/#L551" sourceLabel="viewLayer.js:551" />

Opacity change event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.srclayerid` (string) — The source layer id.
  - `detail.dataid` (string) — The data id.
  - `detail.value` (Array) — The changed value.

<MemberHeading id="renderstart" depth="3" name="renderstart" sig="renderstart: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/gui/viewlayer-js/#L955" sourceLabel="viewLayer.js:955" />

Render start event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.srclayerid` (string) — The source layer id.
  - `detail.dataid` (string) — The data id.
  - `detail.layerid` (string) — The layer id.

<MemberHeading id="renderend" depth="3" name="renderend" sig="renderend: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/gui/viewlayer-js/#L1002" sourceLabel="viewLayer.js:1002" />

Render end event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.srclayerid` (string) — The source layer id.
  - `detail.dataid` (string) — The data id.
  - `detail.layerid` (string) — The layer id.
