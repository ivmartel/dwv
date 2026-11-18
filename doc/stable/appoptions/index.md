---
title: AppOptions
kind: class
longname: AppOptions
description: Application options.
---

# AppOptions

<SourceLink href="/source/src/app/application-js/#L142" label="application.js:142" />

Application options.

---

## Constructor

<Signature
  code="new AppOptions(
	dataViewConfigs?: Record.<string, Array.<ViewConfig>>,
): AppOptions"
/>

**Parameters**

- `dataViewConfigs` (Record.\<string, Array.\<[ViewConfig](/viewconfig)>>, optional) — Optional dataId indexed object containing the data view configurations.

---

## Instance Fields

<MemberHeading id="dataviewconfigs" depth="3" name="dataViewConfigs" sig="dataViewConfigs: Record.<string, Array.<ViewConfig>> | undefined" />

<MemberMeta sourceHref="/source/src/app/application-js/#L148" sourceLabel="application.js:148" />

DataId indexed object containing the data view configurations.

<MemberHeading id="tools" depth="3" name="tools" sig="tools: Record.<string, ToolConfig> | undefined" />

<MemberMeta sourceHref="/source/src/app/application-js/#L154" sourceLabel="application.js:154" />

Tool name indexed object containing individual tool configurations.

<MemberHeading id="binders" depth="3" name="binders" sig="binders: Array.<string> | undefined" />

<MemberMeta sourceHref="/source/src/app/application-js/#L160" sourceLabel="application.js:160" />

Optional array of layerGroup binder names.

<MemberHeading id="viewonfirstloaditem" depth="3" name="viewOnFirstLoadItem" sig="viewOnFirstLoadItem: boolean | undefined" />

<MemberMeta sourceHref="/source/src/app/application-js/#L167" sourceLabel="application.js:167" />

Optional boolean flag to trigger the first data render after the first loaded data or not. Defaults to true.

<MemberHeading id="defaultcharacterset" depth="3" name="defaultCharacterSet" sig="defaultCharacterSet: string | undefined" />

<MemberMeta sourceHref="/source/src/app/application-js/#L176" sourceLabel="application.js:176" />

Optional default chraracterset string used for DICOM parsing if not passed in DICOM file.

Valid values: [https://developer.mozilla.org/en-US/docs/Web/API/Encoding\_API/Encodings](https://developer.mozilla.org/en-US/docs/Web/API/Encoding_API/Encodings).

<MemberHeading id="overlayconfig" depth="3" name="overlayConfig" sig="overlayConfig: object | undefined" />

<MemberMeta sourceHref="/source/src/app/application-js/#L182" sourceLabel="application.js:182" />

Optional overlay layer config.

<MemberHeading id="rootdocument" depth="3" name="rootDocument" sig="rootDocument: DocumentFragment" />

<MemberMeta sourceHref="/source/src/app/application-js/#L188" sourceLabel="application.js:188" />

DOM root document.
