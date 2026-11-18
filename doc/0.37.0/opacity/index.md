---
title: Opacity
kind: class
longname: Opacity
description: Opacity class.
---

# Opacity

<SourceLink href="/source/src/tools/opacity-js/#L31" label="opacity.js:31" />

Opacity class.

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
  options.tools = {Opacity: new ToolConfig()};
  app.init(options);
  // activate tool
  app.addEventListener('load', function () {
    app.setTool('Opacity');
  });
  // load dicom data
  app.loadURLs([
    'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm'
  ]);
  ```
</Playground>

---

## Constructor

<Signature code="new Opacity(app: App): Opacity" />

**Parameters**

- `app` ([App](/app)) — The associated application.

---

## Instance Methods

<MemberHeading id="activate" depth="3" name="activate" sig="activate(bool: boolean)" />

<MemberMeta sourceHref="/source/src/tools/opacity-js/#L67" sourceLabel="opacity.js:67" />

Activate the tool.

**Parameters**

- `bool` (boolean) — The flag to activate or not.

<MemberHeading id="init" depth="3" name="init" sig="init()" />

<MemberMeta sourceHref="/source/src/tools/opacity-js/#L76" sourceLabel="opacity.js:76" />

Initialise the tool.

<MemberHeading id="setfeatures" depth="3" name="setFeatures" sig="setFeatures(_features: object)" />

<MemberMeta sourceHref="/source/src/tools/opacity-js/#L85" sourceLabel="opacity.js:85" />

Set the tool live features: does nothing.

**Parameters**

- `_features` (object) — The list of features.

## Instance Fields

<MemberHeading id="keydown" depth="3" name="keydown" sig="keydown" />

<MemberMeta sourceHref="/source/src/tools/opacity-js/#L57" sourceLabel="opacity.js:57" />

Handle key down event.

**Parameters**

- `event` (object) — The key down event.
