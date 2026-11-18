---
title: ZoomAndPan
kind: class
longname: ZoomAndPan
description: ZoomAndPan class. A tap sets the current position and fires a tap event with the annotations and segments under it (see {@link PositionSetTapBehavior}).
---

# ZoomAndPan

<SourceLink href="/source/src/tools/zoompan-js/#L37" label="zoomPan.js:37" />

ZoomAndPan class. A tap sets the current position and fires a `tap` event with the annotations and segments under it (see [PositionSetTapBehavior](/positionsettapbehavior)).

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
  options.tools = {ZoomAndPan: new ToolConfig()};
  app.init(options);
  // activate tool
  app.addEventListener('load', function () {
    app.setTool('ZoomAndPan');
  });
  // load dicom data
  app.loadURLs([
    'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm'
  ]);
  ```
</Playground>

---

## Constructor

<Signature code="new ZoomAndPan(app: App): ZoomAndPan" />

**Parameters**

- `app` ([App](/app)) — The associated application.

---

## Instance Methods

<MemberHeading id="activate" depth="3" name="activate" sig="activate(bool: boolean)" />

<MemberMeta sourceHref="/source/src/tools/zoompan-js/#L83" sourceLabel="zoomPan.js:83" />

Activate the tool.

**Parameters**

- `bool` (boolean) — The flag to activate or not.

<MemberHeading id="init" depth="3" name="init" sig="init()" />

<MemberMeta sourceHref="/source/src/tools/zoompan-js/#L92" sourceLabel="zoomPan.js:92" />

Initialise the tool.

<MemberHeading id="setfeatures" depth="3" name="setFeatures" sig="setFeatures(_features: object)" />

<MemberMeta sourceHref="/source/src/tools/zoompan-js/#L101" sourceLabel="zoomPan.js:101" />

Set the tool live features: does nothing.

**Parameters**

- `_features` (object) — The list of features.

<MemberHeading id="geteventnames" depth="3" name="getEventNames" sig="getEventNames(): Array.<string>" />

<MemberMeta sourceHref="/source/src/tools/zoompan-js/#L110" sourceLabel="zoomPan.js:110" />

Get the list of event names that this tool can fire.

**Returns**

- `Array.<string>` — The list of event names.

## Instance Fields

<MemberHeading id="keydown" depth="3" name="keydown" sig="keydown" />

<MemberMeta sourceHref="/source/src/tools/zoompan-js/#L73" sourceLabel="zoomPan.js:73" />

Handle key down event.

**Parameters**

- `event` (object) — The key down event.
