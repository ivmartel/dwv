---
title: View
kind: class
longname: View
description: View class. Need to set the window lookup table once created (either directly or with helper methods).
---

# View

<SourceLink href="/source/src/image/view-js/#L103" label="view.js:103" />

View class.

Need to set the window lookup table once created (either directly or with helper methods).

**Example**

<Playground providers="codepen">
  ```js
  import {DicomParser, demoCreateImage, demoCreateView} from '//esm.sh/dwv';
  // XMLHttpRequest onload callback
  const onload = function (event) {
    // parse the dicom buffer
    const dicomParser = new DicomParser();
    dicomParser.parse(event.target.response);
    // create the image object
    const image = demoCreateImage(dicomParser.getDicomElements());
    // create the view
    const view = demoCreateView(dicomParser.getDicomElements(), image);
    // setup canvas
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    // update the image data
    const imageData = ctx.createImageData(256, 256);
    view.generateImageData(imageData);
    ctx.putImageData(imageData, 0, 0);
    // update html
    const div = document.getElementById('dwv');
    div.appendChild(canvas);
  };
  // DICOM file request
  const request = new XMLHttpRequest();
  const url = 'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm';
  request.open('GET', url);
  request.responseType = 'arraybuffer';
  request.onload = onload;
  request.send();
  ```
</Playground>

---

## Constructor

<Signature code="new View(image: Image): View" />

**Parameters**

- `image` ([Image](/image)) — The associated image.

---

## Instance Methods

<MemberHeading id="getimage" depth="3" name="getImage" sig="getImage(): Image" />

<MemberMeta sourceHref="/source/src/image/view-js/#L305" sourceLabel="view.js:305" />

Get the associated image.

**Returns**

- [`Image`](/image) — The associated image.

<MemberHeading id="setimage" depth="3" name="setImage" sig="setImage(image: Image)" />

<MemberMeta sourceHref="/source/src/image/view-js/#L314" sourceLabel="view.js:314" />

Set the associated image.

**Parameters**

- `image` ([Image](/image)) — The associated image.

<MemberHeading id="ismask" depth="3" name="isMask" sig="isMask(): boolean" />

<MemberMeta sourceHref="/source/src/image/view-js/#L359" sourceLabel="view.js:359" />

Check is the associated image is a mask.

**Returns**

- `boolean` — True if the associated image is a mask.

<MemberHeading id="setmaskviewhelper" depth="3" name="setMaskViewHelper" sig="setMaskViewHelper(helper: MaskSegmentViewHelper)" />

<MemberMeta sourceHref="/source/src/image/view-js/#L369" sourceLabel="view.js:369" />

Set the mask segment view helper to handle hidden segments.

**Parameters**

- `helper` ([MaskSegmentViewHelper](/masksegmentviewhelper)) — The helper.

<MemberHeading id="getsegmenthighlight" depth="3" name="getSegmentHighlight" sig="getSegmentHighlight(): Object | undefined" />

<MemberMeta sourceHref="/source/src/image/view-js/#L381" sourceLabel="view.js:381" />

Get the segment highlight.

**Returns**

- `Object | undefined` — The highlighted segment number and its opacity factor.

<MemberHeading id="setsegmenthighlight" depth="3" name="setSegmentHighlight" sig="setSegmentHighlight(segmentNumber?: number, opacity?: number)" />

<MemberMeta sourceHref="/source/src/image/view-js/#L397" sourceLabel="view.js:397" />

Set the segment highlight: the opacity of the given segment is multiplied by the input factor. Only one segment can be highlighted at a time. This only has an effect on segmentation views.

**Parameters**

- `segmentNumber` (number, optional) — The segment number, undefined to remove the highlight.
- `opacity` (number, optional) — The opacity factor (between 0 and 1), defaults to 1.

**Fires**

- `View#event:segmenthighlightchange`

<MemberHeading id="getorientation" depth="3" name="getOrientation" sig="getOrientation(): Matrix33" />

<MemberMeta sourceHref="/source/src/image/view-js/#L426" sourceLabel="view.js:426" />

Get the view orientation.

**Returns**

- [`Matrix33`](/matrix33) — The orientation matrix.

<MemberHeading id="setorientation" depth="3" name="setOrientation" sig="setOrientation(mat33: Matrix33)" />

<MemberMeta sourceHref="/source/src/image/view-js/#L435" sourceLabel="view.js:435" />

Set the view orientation.

**Parameters**

- `mat33` ([Matrix33](/matrix33)) — The orientation matrix.

<MemberHeading id="getfillopacity" depth="3" name="getFillOpacity" sig="getFillOpacity(): number" />

<MemberMeta sourceHref="/source/src/image/view-js/#L444" sourceLabel="view.js:444" />

Get the fill opacity relative to the global opacity.

**Returns**

- `number` — The fill opacity (between 0 and 1).

<MemberHeading id="setfillopacity" depth="3" name="setFillOpacity" sig="setFillOpacity(opacity: number)" />

<MemberMeta sourceHref="/source/src/image/view-js/#L455" sourceLabel="view.js:455" />

Set the fill opacity relative to the global opacity. This only has an effect on segmentation views, or any other alpha function that makes use of it.

**Parameters**

- `opacity` (number) — The fill opacity (between 0 and 1).

<MemberHeading id="getcontourthickness" depth="3" name="getContourThickness" sig="getContourThickness(): number" />

<MemberMeta sourceHref="/source/src/image/view-js/#L483" sourceLabel="view.js:483" />

Get the thickness of the contour in pixels.

**Returns**

- `number` — The contour thickness (0 \<= integer \<= MAX\_CONTOUR\_SIZE).

<MemberHeading id="setcontourthickness" depth="3" name="setContourThickness" sig="setContourThickness(thickness: number)" />

<MemberMeta sourceHref="/source/src/image/view-js/#L495" sourceLabel="view.js:495" />

Set the thickness of the contour in pixels. This only has an effect on segmentation views, or any other alpha function that makes use of it.

**Parameters**

- `thickness` (number) — The contour thickness (0 \<= integer \<= MAX\_CONTOUR\_SIZE).

<MemberHeading
  id="getplaybackmilliseconds"
  depth="3"
  name="getPlaybackMilliseconds"
  sig="getPlaybackMilliseconds(
	recommendedDisplayFrameRate: number,
): number"
/>

<MemberMeta sourceHref="/source/src/image/view-js/#L516" sourceLabel="view.js:516" />

Get the milliseconds per frame from frame rate.

**Parameters**

- `recommendedDisplayFrameRate` (number) — Recommended Display Frame Rate.

**Returns**

- `number` — The milliseconds per frame.

<MemberHeading id="getalphafunction" depth="3" name="getAlphaFunction" sig="getAlphaFunction(): alphaFn" />

<MemberMeta sourceHref="/source/src/image/view-js/#L530" sourceLabel="view.js:530" />

Get the alpha function.

**Returns**

- [`alphaFn`](/alphafn) — The function.

<MemberHeading id="setalphafunction" depth="3" name="setAlphaFunction" sig="setAlphaFunction(func: alphaFn)" />

<MemberMeta sourceHref="/source/src/image/view-js/#L540" sourceLabel="view.js:540" />

Set alpha function.

**Parameters**

- `func` ([alphaFn](/alphafn)) — The function.

**Fires**

- `View#event:alphafuncchange`

<MemberHeading id="getwindowpresets" depth="3" name="getWindowPresets" sig="getWindowPresets(): Record.<string, WindowPreset>" />

<MemberMeta sourceHref="/source/src/image/view-js/#L683" sourceLabel="view.js:683" />

Get the window presets.

**Returns**

- `Record.<string, `[`WindowPreset`](/windowpreset)`>` — The window presets.

<MemberHeading id="getwindowpresetsnames" depth="3" name="getWindowPresetsNames" sig="getWindowPresetsNames(): Array.<string>" />

<MemberMeta sourceHref="/source/src/image/view-js/#L692" sourceLabel="view.js:692" />

Get the window presets names.

**Returns**

- `Array.<string>` — The list of window presets names.

<MemberHeading id="setwindowpresets" depth="3" name="setWindowPresets" sig="setWindowPresets(presets: Record.<string, WindowPreset>)" />

<MemberMeta sourceHref="/source/src/image/view-js/#L701" sourceLabel="view.js:701" />

Set the window presets.

**Parameters**

- `presets` (Record.\<string, [WindowPreset](/windowpreset)>) — The window presets.

<MemberHeading id="addwindowpresets" depth="3" name="addWindowPresets" sig="addWindowPresets(presets: Record.<string, WindowPreset>)" />

<MemberMeta sourceHref="/source/src/image/view-js/#L710" sourceLabel="view.js:710" />

Add window presets to the existing ones.

**Parameters**

- `presets` (Record.\<string, [WindowPreset](/windowpreset)>) — The window presets.

<MemberHeading id="getcurrentwindowpresetname" depth="3" name="getCurrentWindowPresetName" sig="getCurrentWindowPresetName(): string | undefined" />

<MemberMeta sourceHref="/source/src/image/view-js/#L745" sourceLabel="view.js:745" />

Get the current window level preset name.

**Returns**

- `string | undefined` — The preset name.

<MemberHeading id="getcolourmap" depth="3" name="getColourMap" sig="getColourMap(): string" />

<MemberMeta sourceHref="/source/src/image/view-js/#L754" sourceLabel="view.js:754" />

Get the colour map of the image.

**Returns**

- `string` — The colour map name.

<MemberHeading id="setcolourmap" depth="3" name="setColourMap" sig="setColourMap(name: string)" />

<MemberMeta sourceHref="/source/src/image/view-js/#L773" sourceLabel="view.js:773" />

Set the colour map of the image.

**Parameters**

- `name` (string) — The colour map name.

**Fires**

- `View#event:colourmapchange`

<MemberHeading id="getcurrentposition" depth="3" name="getCurrentPosition" sig="getCurrentPosition(): Point | undefined" />

<MemberMeta sourceHref="/source/src/image/view-js/#L799" sourceLabel="view.js:799" />

Get the current position.

**Returns**

- [`Point`](/point)` | undefined` — The current position.

<MemberHeading id="getcurrentindex" depth="3" name="getCurrentIndex" sig="getCurrentIndex(): Index | undefined" />

<MemberMeta sourceHref="/source/src/image/view-js/#L808" sourceLabel="view.js:808" />

Get the current index.

**Returns**

- [`Index`](/index)` | undefined` — The current index.

<MemberHeading id="getcurrentimageuid" depth="3" name="getCurrentImageUid" sig="getCurrentImageUid(): string" />

<MemberMeta sourceHref="/source/src/image/view-js/#L822" sourceLabel="view.js:822" />

Get the SOP image UID of the current image.

**Returns**

- `string` — The UID.

<MemberHeading id="getoriginforimageuid" depth="3" name="getOriginForImageUid" sig="getOriginForImageUid(uid: string): Point3D | undefined" />

<MemberMeta sourceHref="/source/src/image/view-js/#L832" sourceLabel="view.js:832" />

Get the image origin for a image UID.

**Parameters**

- `uid` (string) — The UID.

**Returns**

- [`Point3D`](/point3d)` | undefined` — The origin.

<MemberHeading id="includesimageuid" depth="3" name="includesImageUid" sig="includesImageUid(uid: string): boolean" />

<MemberMeta sourceHref="/source/src/image/view-js/#L842" sourceLabel="view.js:842" />

Check if the image includes an UID.

**Parameters**

- `uid` (string) — The UID.

**Returns**

- `boolean` — True if present.

<MemberHeading id="ispositioninbounds" depth="3" name="isPositionInBounds" sig="isPositionInBounds(position?: Point): boolean" />

<MemberMeta sourceHref="/source/src/image/view-js/#L853" sourceLabel="view.js:853" />

Check if the current position (default) or the provided position is in bounds.

**Parameters**

- `position` ([Point](/point), optional) — Optional position.

**Returns**

- `boolean` — True is the position is in bounds.

<MemberHeading id="getorigin" depth="3" name="getOrigin" sig="getOrigin(position?: Point): Point3D" />

<MemberMeta sourceHref="/source/src/image/view-js/#L872" sourceLabel="view.js:872" />

Get the first origin or at a given position.

**Parameters**

- `position` ([Point](/point), optional) — Optional position.

**Returns**

- [`Point3D`](/point3d) — The origin.

<MemberHeading id="setcurrentindex" depth="3" name="setCurrentIndex" sig="setCurrentIndex(index: Index, silent?: boolean): boolean" />

<MemberMeta sourceHref="/source/src/image/view-js/#L891" sourceLabel="view.js:891" />

Set the current position via an index.

**Parameters**

- `index` ([Index](/index)) — The new index.
- `silent` (boolean, optional) — Flag to fire event or not.

**Returns**

- `boolean` — False if not in bounds.

**Fires**

- `View#event:positionchange`

<MemberHeading id="setcurrentposition" depth="3" name="setCurrentPosition" sig="setCurrentPosition(inPosition: Point, silent?: boolean): boolean" />

<MemberMeta sourceHref="/source/src/image/view-js/#L905" sourceLabel="view.js:905" />

Set current position.

**Parameters**

- `inPosition` ([Point](/point)) — The new position.
- `silent` (boolean, optional) — Flag to fire event or not.

**Returns**

- `boolean` — False if not in bounds.

**Fires**

- `View#event:positionchange`

<MemberHeading id="setwindowlevel" depth="3" name="setWindowLevel" sig="setWindowLevel(wl: WindowLevel, name?: string, silent?: boolean)" />

<MemberMeta sourceHref="/source/src/image/view-js/#L1009" sourceLabel="view.js:1009" />

Set the view window/level.

**Parameters**

- `wl` ([WindowLevel](/windowlevel)) — The window and level.
- `name` (string, optional) — Associated preset name, defaults to 'manual'. Warning: uses the latest set rescale LUT or the default linear one.
- `silent` (boolean, optional) — Flag to launch events with skipGenerate.

**Fires**

- `View#event:wlchange`

<MemberHeading id="getwindowlevel" depth="3" name="getWindowLevel" sig="getWindowLevel(): WindowLevel" />

<MemberMeta sourceHref="/source/src/image/view-js/#L1079" sourceLabel="view.js:1079" />

Get the window/level.

**Returns**

- [`WindowLevel`](/windowlevel) — The window and level.

<MemberHeading id="setwindowlevelpreset" depth="3" name="setWindowLevelPreset" sig="setWindowLevelPreset(name: string, silent?: boolean)" />

<MemberMeta sourceHref="/source/src/image/view-js/#L1091" sourceLabel="view.js:1091" />

Set the window level to the preset with the input name.

**Parameters**

- `name` (string) — The name of the preset to activate.
- `silent` (boolean, optional) — Flag to launch events with skipGenerate.

<MemberHeading id="setwindowlevelpresetbyid" depth="3" name="setWindowLevelPresetById" sig="setWindowLevelPresetById(id: number, silent?: boolean)" />

<MemberMeta sourceHref="/source/src/image/view-js/#L1123" sourceLabel="view.js:1123" />

Set the window level to the preset with the input id.

**Parameters**

- `id` (number) — The id of the preset to activate.
- `silent` (boolean, optional) — Flag to launch events with skipGenerate.

<MemberHeading id="getwindowlevelminmax" depth="3" name="getWindowLevelMinMax" sig="getWindowLevelMinMax(): WindowLevel" />

<MemberMeta sourceHref="/source/src/image/view-js/#L1134" sourceLabel="view.js:1134" />

Get the image window/level that covers the full data range. Warning: uses the latest set rescale LUT or the default linear one.

**Returns**

- [`WindowLevel`](/windowlevel) — A min/max window level.

<MemberHeading id="setwindowlevelminmax" depth="3" name="setWindowLevelMinMax" sig="setWindowLevelMinMax()" />

<MemberMeta sourceHref="/source/src/image/view-js/#L1149" sourceLabel="view.js:1149" />

Set the image window/level to cover the full data range. Warning: uses the latest set rescale LUT or the default linear one.

<MemberHeading id="generateimagedata" depth="3" name="generateImageData" sig="generateImageData(data: ImageData, index: Index)" />

<MemberMeta sourceHref="/source/src/image/view-js/#L1163" sourceLabel="view.js:1163" />

Generate display image data to be given to a canvas.

**Parameters**

- `data` (ImageData) — The iamge data to fill in.
- `index` ([Index](/index)) — Optional index at which to generate, otherwise generates at current index.

<MemberHeading id="getscrolldimindex" depth="3" name="getScrollDimIndex" sig="getScrollDimIndex(): number" />

<MemberMeta sourceHref="/source/src/image/view-js/#L1243" sourceLabel="view.js:1243" />

Get the scroll dimension index.

**Returns**

- `number` — The index.

<MemberHeading id="isaquisitionorientation" depth="3" name="isAquisitionOrientation" sig="isAquisitionOrientation(): boolean" />

<MemberMeta sourceHref="/source/src/image/view-js/#L1259" sourceLabel="view.js:1259" />

Is this view in the same orientation as the image aquisition.

**Returns**

- `boolean` — True if in aquisition plane.

## Events

<MemberHeading id="segmenthighlightchange" depth="3" name="segmenthighlightchange" sig="segmenthighlightchange: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/image/view-js/#L418" sourceLabel="view.js:418" />

Segment highlight change event. Not propagated to the app (not part of `viewEventNames`) since it can be fired at each frame of a highlight animation.

<MemberHeading id="maskviewchange" depth="3" name="maskviewchange" sig="maskviewchange: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/image/view-js/#L473" sourceLabel="view.js:473" />

Mask view change event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.value` (Array) — The changed value.

<MemberHeading id="alphafuncchange" depth="3" name="alphafuncchange" sig="alphafuncchange: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/image/view-js/#L549" sourceLabel="view.js:549" />

Alpha func change event.

**Properties**

- `detail` (object) — The event detail.

<MemberHeading id="wlpresetadd" depth="3" name="wlpresetadd" sig="wlpresetadd: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/image/view-js/#L733" sourceLabel="view.js:733" />

Window/level add preset event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.name` (string) — The name of the preset.

<MemberHeading id="colourmapchange" depth="3" name="colourmapchange" sig="colourmapchange: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/image/view-js/#L789" sourceLabel="view.js:789" />

Color change event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.value` (Array) — The changed value.

<MemberHeading id="positionchange" depth="3" name="positionchange" sig="positionchange: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/image/view-js/#L987" sourceLabel="view.js:987" />

Position change event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.value` (Array) — The changed value as \[index, pixelValue].
  - `detail.diffDims` (Array.\<number>) — An array of modified indices.

<MemberHeading id="wlchange" depth="3" name="wlchange" sig="wlchange: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/image/view-js/#L1063" sourceLabel="view.js:1063" />

Window/level change event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.value` (Array) — The changed value.
  - `detail.wc` (number) — The new window center value.
  - `detail.ww` (number) — The new window width value.
  - `detail.skipGenerate` (boolean) — Flag to skip view generation.
