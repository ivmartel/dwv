---
title: ViewConfig
kind: class
longname: ViewConfig
description: "View configuration: mainly defines the ´divId´ of the associated HTML div."
---

# ViewConfig

<SourceLink href="/source/src/app/application-js/#L51" label="application.js:51" />

View configuration: mainly defines the ´divId´ of the associated HTML div.

---

## Constructor

<Signature code="new ViewConfig(divId: string): ViewConfig" />

**Parameters**

- `divId` (string) — The associated HTML div id.

---

## Instance Fields

<MemberHeading id="divid" depth="3" name="divId" sig="divId: string" />

<MemberMeta sourceHref="/source/src/app/application-js/#L57" sourceLabel="application.js:57" />

Associated HTML div id.

<MemberHeading id="orientation" depth="3" name="orientation" sig="orientation: string | undefined" />

<MemberMeta sourceHref="/source/src/app/application-js/#L64" sourceLabel="application.js:64" />

Optional orientation of the data; 'axial', 'coronal' or 'sagittal'. If undefined, will use the data aquisition plane.

<MemberHeading id="colourmap" depth="3" name="colourMap" sig="colourMap: string | undefined" />

<MemberMeta sourceHref="/source/src/app/application-js/#L70" sourceLabel="application.js:70" />

Optional view colour map name.

<MemberHeading id="opacity" depth="3" name="opacity" sig="opacity: number | undefined" />

<MemberMeta sourceHref="/source/src/app/application-js/#L76" sourceLabel="application.js:76" />

Optional layer opacity; in \[0, 1] range.

<MemberHeading id="fillopacity" depth="3" name="fillOpacity" sig="fillOpacity: number | undefined" />

<MemberMeta sourceHref="/source/src/app/application-js/#L82" sourceLabel="application.js:82" />

Optional segmentation layer fill opacity; in \[0, 1] range.

<MemberHeading id="contourthickness" depth="3" name="contourThickness" sig="contourThickness: number | undefined" />

<MemberMeta sourceHref="/source/src/app/application-js/#L88" sourceLabel="application.js:88" />

Optional segmentation contour thickness; in \[0, 10] range.

<MemberHeading id="wlpresetname" depth="3" name="wlPresetName" sig="wlPresetName: string | undefined" />

<MemberMeta sourceHref="/source/src/app/application-js/#L96" sourceLabel="application.js:96" />

Optional layer window level preset name. If present, the preset name will be used and the window centre and width ignored.

<MemberHeading id="windowcenter" depth="3" name="windowCenter" sig="windowCenter: number | undefined" />

<MemberMeta sourceHref="/source/src/app/application-js/#L102" sourceLabel="application.js:102" />

Optional layer window center.

<MemberHeading id="windowwidth" depth="3" name="windowWidth" sig="windowWidth: number | undefined" />

<MemberMeta sourceHref="/source/src/app/application-js/#L108" sourceLabel="application.js:108" />

Optional layer window width.
