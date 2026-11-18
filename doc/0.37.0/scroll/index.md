---
title: Scroll
kind: class
longname: Scroll
description: Scroll class. A tap sets the current position and fires a tap event with the annotations and segments under it (see {@link PositionSetTapBehavior}).
---

# Scroll

<SourceLink href="/source/src/tools/scroll-js/#L86" label="scroll.js:86" />

Scroll class. A tap sets the current position and fires a `tap` event with the annotations and segments under it (see [PositionSetTapBehavior](/positionsettapbehavior)).

**Example**

<Playground providers="codepen">
  ```js
  import {App, AppOptions, ViewConfig, ToolConfig} from '//esm.sh/dwv';
  // create the dwv app
  const app = new App();
  // initialise
  const viewConfig0 = new ViewConfig('layerGroup0');
  const viewConfigs = {'*': [viewConfig0]};
  const options = new AppOptions(viewConfigs);
  options.tools = {Scroll: new ToolConfig()};
  app.init(options);
  // activate tool
  app.addEventListener('load', function () {
    app.setTool('Scroll');
  });
  // load dicom data
  app.loadURLs([
    'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm',
    'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323707.dcm',
    'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323563.dcm'
  ]);
  ```
</Playground>

Example with slider

<Playground providers="codepen">
  ```js
  import {App, AppOptions, ViewConfig, ToolConfig, Index} from '//esm.sh/dwv';
  // create the dwv app
  const app = new App();
  // initialise
  const viewConfig0 = new ViewConfig('layerGroup0');
  const viewConfigs = {'*': [viewConfig0]};
  const options = new AppOptions(viewConfigs);
  options.tools = {Scroll: new ToolConfig()};
  app.init(options);
  // create range
  const range = document.createElement('input');
  range.type = 'range';
  range.min = 0;
  range.id = 'sliceRange';
  document.body.appendChild(range);
  // update app on slider change
  range.oninput = function () {
    const stgCtrl = app.getStageController();
    const lg = stgCtrl.getLayerGroupByDivId('layerGroup0');
    const vl = lg.getBaseViewLayer();
    const vc = vl.getViewController();
    const index = vc.getCurrentIndex();
    const values = index.getValues();
    values[2] = this.value;
    vc.setCurrentIndex(new Index(values));
  }
  // activate tool and update range max on load
  app.addEventListener('load', function () {
    app.setTool('Scroll');
    const dataCtrl = app.getDataController();
    const size = dataCtrl.get(0).image.getGeometry().getSize();
    range.max = size.get(2) - 1;
  });
  // update slider on slice change (for ex via mouse wheel)
  app.addEventListener('positionchange', function () {
    const stgCtrl = app.getStageController();
    const lg = stgCtrl.getLayerGroupByDivId('layerGroup0');
    const vl = lg.getBaseViewLayer();
    const vc = vl.getViewController();
    range.value = vc.getCurrentIndex().get(2);
  });
  // load dicom data
  app.loadURLs([
    'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm',
    'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323707.dcm',
    'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323563.dcm'
  ]);
  ```
</Playground>

---

## Constructor

<Signature code="new Scroll(app: App): Scroll" />

**Parameters**

- `app` ([App](/app)) — The associated application.

---

## Instance Methods

<MemberHeading id="activate" depth="3" name="activate" sig="activate(bool: boolean)" />

<MemberMeta sourceHref="/source/src/tools/scroll-js/#L141" sourceLabel="scroll.js:141" />

Activate the tool.

**Parameters**

- `bool` (boolean) — The flag to activate or not.

<MemberHeading id="setfeatures" depth="3" name="setFeatures" sig="setFeatures(features: object)" />

<MemberMeta sourceHref="/source/src/tools/scroll-js/#L153" sourceLabel="scroll.js:153" />

Set the tool live features: slice tooltip on hover.

**Parameters**

- `features` (object) — The list of features.
  - `features.displayTooltip` (boolean, optional) — Show tooltip on mouse move.

<MemberHeading id="init" depth="3" name="init" sig="init()" />

<MemberMeta sourceHref="/source/src/tools/scroll-js/#L162" sourceLabel="scroll.js:162" />

Initialise the tool.

<MemberHeading id="geteventnames" depth="3" name="getEventNames" sig="getEventNames(): Array.<string>" />

<MemberMeta sourceHref="/source/src/tools/scroll-js/#L171" sourceLabel="scroll.js:171" />

Get the list of event names that this tool can fire.

**Returns**

- `Array.<string>` — The list of event names.

## Instance Fields

<MemberHeading id="keydown" depth="3" name="keydown" sig="keydown" />

<MemberMeta sourceHref="/source/src/tools/scroll-js/#L131" sourceLabel="scroll.js:131" />

Handle key down event.

**Parameters**

- `event` (object) — The key down event.
