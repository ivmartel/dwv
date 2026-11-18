---
title: Image
kind: class
longname: Image
description: "Image class. Usable once created, optional are: rescale slope and intercept (default 1:0), photometric interpretation (default MONOCHROME2), planar configuration (default RGBRGB...)."
---

# Image

<SourceLink href="/source/src/image/image-js/#L107" label="image.js:107" />

Image class. Usable once created, optional are:

- rescale slope and intercept (default 1:0),
- photometric interpretation (default MONOCHROME2),
- planar configuration (default RGBRGB...).

**Example**

<Playground providers="codepen">
  ```js
  import {DicomParser, demoCreateImage} from '//esm.sh/dwv';
  // XMLHttpRequest onload callback
  const onload = function (event) {
    // parse the dicom buffer
    const dicomParser = new DicomParser();
    dicomParser.parse(event.target.response);
    // create the image object
    const image = demoCreateImage(dicomParser.getDicomElements());
    // result div
    const div = document.getElementById('dwv');
    // display the image size
    const size = image.getGeometry().getSize();
    div.appendChild(document.createTextNode(
      'Size: ' + size.toString() +
      ' (should be 256,256,1)'));
    // break line
    div.appendChild(document.createElement('br'));
    // display a pixel value
    div.appendChild(document.createTextNode(
      'Pixel @ [128,40,0]: ' +
      image.getRescaledValue(128,40,0) +
      ' (should be 101)'));
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

<Signature
  code="new Image(
	geometry: Geometry,
	buffer: TypedArray,
	imageUids?: Array.<string>,
): Image"
/>

**Parameters**

- `geometry` ([Geometry](/geometry)) — The geometry of the image.
- `buffer` ([TypedArray](/typedarray)) — The image data as a one dimensional buffer.
- `imageUids` (Array.\<string>, optional) — An array of Uids indexed to slice number.

---

## Instance Methods

<MemberHeading id="setcomplete" depth="3" name="setComplete" sig="setComplete(flag: boolean)" />

<MemberMeta sourceHref="/source/src/image/image-js/#L291" sourceLabel="image.js:291" />

Set the image complete flag.

**Parameters**

- `flag` (boolean) — True if the data is complete.

<MemberHeading id="getcomplete" depth="3" name="getComplete" sig="getComplete(): boolean" />

<MemberMeta sourceHref="/source/src/image/image-js/#L303" sourceLabel="image.js:303" />

Get the image complete flag.

**Returns**

- `boolean` — True if the data is complete.

<MemberHeading id="getinitialindex" depth="3" name="getInitialIndex" sig="getInitialIndex(): Index" />

<MemberMeta sourceHref="/source/src/image/image-js/#L313" sourceLabel="image.js:313" />

Get the initial index, used as default position by views: the middle of the image (first frame for 4D).

**Returns**

- [`Index`](/index) — The index.

<MemberHeading id="gethasoverlap" depth="3" name="getHasOverlap" sig="getHasOverlap(): boolean" />

<MemberMeta badges="deprecated" sourceHref="/source/src/image/image-js/#L330" sourceLabel="image.js:330" />

Check whether the image has overlapping segments. Always false for a plain image; [MaskImage](/maskimage) overrides this with a real check.

<Callout type="error">
  &#x20;Since v0.37, please use \`instanceof MaskImage\` and \`MaskImage#getHasOverlap\` instead.
</Callout>

**Returns**

- `boolean` — False.

<MemberHeading id="getimageuid" depth="3" name="getImageUid" sig="getImageUid(index?: Index): string" />

<MemberMeta sourceHref="/source/src/image/image-js/#L340" sourceLabel="image.js:340" />

Get the image UID at a given index.

**Parameters**

- `index` ([Index](/index), optional) — The index at which to get the id.

**Returns**

- `string` — The UID.

<MemberHeading id="getoriginforimageuid" depth="3" name="getOriginForImageUid" sig="getOriginForImageUid(uid: string): Point3D | undefined" />

<MemberMeta sourceHref="/source/src/image/image-js/#L354" sourceLabel="image.js:354" />

Get the image origin for a image UID.

**Parameters**

- `uid` (string) — The UID.

**Returns**

- [`Point3D`](/point3d)` | undefined` — The origin.

<MemberHeading id="includesimageuid" depth="3" name="includesImageUid" sig="includesImageUid(uid: string): boolean" />

<MemberMeta sourceHref="/source/src/image/image-js/#L370" sourceLabel="image.js:370" />

Check if the image includes an UID.

**Parameters**

- `uid` (string) — The UID.

**Returns**

- `boolean` — True if present.

<MemberHeading id="containsimageuids" depth="3" name="containsImageUids" sig="containsImageUids(uids: Array.<string>): boolean" />

<MemberMeta sourceHref="/source/src/image/image-js/#L380" sourceLabel="image.js:380" />

Check if this image includes the input uids.

**Parameters**

- `uids` (Array.\<string>) — UIDs to test for presence.

**Returns**

- `boolean` — True if all uids are in this image uids.

<MemberHeading id="getgeometry" depth="3" name="getGeometry" sig="getGeometry(): Geometry" />

<MemberMeta sourceHref="/source/src/image/image-js/#L389" sourceLabel="image.js:389" />

Get the geometry of the image.

**Returns**

- [`Geometry`](/geometry) — The geometry.

<MemberHeading id="getbuffer" depth="3" name="getBuffer" sig="getBuffer(): TypedArray" />

<MemberMeta sourceHref="/source/src/image/image-js/#L399" sourceLabel="image.js:399" />

Get the data buffer of the image.

**Returns**

- [`TypedArray`](/typedarray) — The data buffer of the image.

* **TODO:**
  - Dangerous...

<MemberHeading id="canquantify" depth="3" name="canQuantify" sig="canQuantify(): boolean" />

<MemberMeta sourceHref="/source/src/image/image-js/#L408" sourceLabel="image.js:408" />

Can the image values be quantified?

**Returns**

- `boolean` — True if only one component.

<MemberHeading id="canwindowlevel" depth="3" name="canWindowLevel" sig="canWindowLevel(): boolean" />

<MemberMeta badges="deprecated" sourceHref="/source/src/image/image-js/#L418" sourceLabel="image.js:418" />

Can window and level be applied to the data?

<Callout type="error">
  &#x20;Since v0.33, please use isMonochrome instead.
</Callout>

**Returns**

- `boolean` — True if the data is monochrome.

<MemberHeading id="ismonochrome" depth="3" name="isMonochrome" sig="isMonochrome(): boolean" />

<MemberMeta sourceHref="/source/src/image/image-js/#L427" sourceLabel="image.js:427" />

Is the data monochrome.

**Returns**

- `boolean` — True if the data is monochrome.

<MemberHeading id="ismask" depth="3" name="isMask" sig="isMask(): boolean" />

<MemberMeta badges="deprecated" sourceHref="/source/src/image/image-js/#L437" sourceLabel="image.js:437" />

Check is the image is a mask.

<Callout type="error">
  &#x20;Since v0.37, please use \`instanceof MaskImage\` instead.
</Callout>

**Returns**

- `boolean` — True if mask.

<MemberHeading id="canscroll" depth="3" name="canScroll" sig="canScroll(viewOrientation: Matrix33): boolean" />

<MemberMeta sourceHref="/source/src/image/image-js/#L448" sourceLabel="image.js:448" />

Can the data be scrolled?

**Parameters**

- `viewOrientation` ([Matrix33](/matrix33)) — The view orientation.

**Returns**

- `boolean` — True if the data has a third dimension greater than one after applying the view orientation.

<MemberHeading id="getsecondaryoffset" depth="3" name="getSecondaryOffset" sig="getSecondaryOffset(index: Index): number" />

<MemberMeta sourceHref="/source/src/image/image-js/#L474" sourceLabel="image.js:474" />

Get the secondary offset: an offset that takes into account the slice and above dimension numbers.

**Parameters**

- `index` ([Index](/index)) — The index.

**Returns**

- `number` — The offset.

<MemberHeading
  id="getrescaleslopeandintercept"
  depth="3"
  name="getRescaleSlopeAndIntercept"
  sig="getRescaleSlopeAndIntercept(
	index?: Index,
): RescaleSlopeAndIntercept"
/>

<MemberMeta sourceHref="/source/src/image/image-js/#L484" sourceLabel="image.js:484" />

Get the rescale slope and intercept.

**Parameters**

- `index` ([Index](/index), optional) — The index (only needed for non constant rsi).

**Returns**

- [`RescaleSlopeAndIntercept`](/rescaleslopeandintercept) — The rescale slope and intercept.

<MemberHeading
  id="setrescaleslopeandintercept"
  depth="3"
  name="setRescaleSlopeAndIntercept"
  sig="setRescaleSlopeAndIntercept(
	inRsi: RescaleSlopeAndIntercept,
	offset?: number,
)"
/>

<MemberMeta sourceHref="/source/src/image/image-js/#L517" sourceLabel="image.js:517" />

Set the rescale slope and intercept.

**Parameters**

- `inRsi` ([RescaleSlopeAndIntercept](/rescaleslopeandintercept)) — The input rescale slope and intercept.
- `offset` (number, optional) — The rsi offset (only needed for non constant rsi).

<MemberHeading id="isidentityrsi" depth="3" name="isIdentityRSI" sig="isIdentityRSI(): boolean" />

<MemberMeta sourceHref="/source/src/image/image-js/#L552" sourceLabel="image.js:552" />

Are all the RSIs identity (1,0).

**Returns**

- `boolean` — True if they are.

<MemberHeading id="isconstantrsi" depth="3" name="isConstantRSI" sig="isConstantRSI(): boolean" />

<MemberMeta sourceHref="/source/src/image/image-js/#L561" sourceLabel="image.js:561" />

Are all the RSIs equal.

**Returns**

- `boolean` — True if they are.

<MemberHeading id="getphotometricinterpretation" depth="3" name="getPhotometricInterpretation" sig="getPhotometricInterpretation(): string" />

<MemberMeta sourceHref="/source/src/image/image-js/#L570" sourceLabel="image.js:570" />

Get the photometricInterpretation of the image.

**Returns**

- `string` — The photometricInterpretation of the image.

<MemberHeading id="setphotometricinterpretation" depth="3" name="setPhotometricInterpretation" sig="setPhotometricInterpretation(interp: string)" />

<MemberMeta sourceHref="/source/src/image/image-js/#L579" sourceLabel="image.js:579" />

Set the photometricInterpretation of the image.

**Parameters**

- `interp` (string) — The photometricInterpretation of the image.

<MemberHeading id="setpalettecolourmap" depth="3" name="setPaletteColourMap" sig="setPaletteColourMap(map: ColourMap)" />

<MemberMeta sourceHref="/source/src/image/image-js/#L588" sourceLabel="image.js:588" />

Set the palette colour map.

**Parameters**

- `map` ([ColourMap](/colourmap)) — The colour map.

<MemberHeading id="getpalettecolourmap" depth="3" name="getPaletteColourMap" sig="getPaletteColourMap(): ColourMap" />

<MemberMeta sourceHref="/source/src/image/image-js/#L599" sourceLabel="image.js:599" />

Get the palette colour map.

**Returns**

- [`ColourMap`](/colourmap) — The colour map.

<MemberHeading id="updatepalettecolourmap" depth="3" name="updatePaletteColourMap" sig="updatePaletteColourMap(index: number, colour: RGB)" />

<MemberMeta sourceHref="/source/src/image/image-js/#L609" sourceLabel="image.js:609" />

Update the palette colour map.

**Parameters**

- `index` (number) — The index to change the colour of.
- `colour` ([RGB](/rgb)) — The colour to use at index.

<MemberHeading id="getplanarconfiguration" depth="3" name="getPlanarConfiguration" sig="getPlanarConfiguration(): number" />

<MemberMeta sourceHref="/source/src/image/image-js/#L622" sourceLabel="image.js:622" />

Get the planarConfiguration of the image.

**Returns**

- `number` — The planarConfiguration of the image.

<MemberHeading id="setplanarconfiguration" depth="3" name="setPlanarConfiguration" sig="setPlanarConfiguration(config: number)" />

<MemberMeta sourceHref="/source/src/image/image-js/#L631" sourceLabel="image.js:631" />

Set the planarConfiguration of the image.

**Parameters**

- `config` (number) — The planarConfiguration of the image.

<MemberHeading id="getnumberofcomponents" depth="3" name="getNumberOfComponents" sig="getNumberOfComponents(): number" />

<MemberMeta sourceHref="/source/src/image/image-js/#L640" sourceLabel="image.js:640" />

Get the numberOfComponents of the image.

**Returns**

- `number` — The numberOfComponents of the image.

<MemberHeading id="getmeta" depth="3" name="getMeta" sig="getMeta(): Record.<string, any>" />

<MemberMeta sourceHref="/source/src/image/image-js/#L649" sourceLabel="image.js:649" />

Get the meta information of the image.

**Returns**

- `Record.<string, any>` — The meta information of the image.

<MemberHeading id="setmeta" depth="3" name="setMeta" sig="setMeta(rhs: Record.<string, any>)" />

<MemberMeta sourceHref="/source/src/image/image-js/#L658" sourceLabel="image.js:658" />

Set the meta information of the image.

**Parameters**

- `rhs` (Record.\<string, any>) — The meta information of the image.

<MemberHeading id="getvalueatoffset" depth="3" name="getValueAtOffset" sig="getValueAtOffset(offset: number): number" />

<MemberMeta sourceHref="/source/src/image/image-js/#L668" sourceLabel="image.js:668" />

Get value at offset. Warning: No size check...

**Parameters**

- `offset` (number) — The desired offset.

**Returns**

- `number` — The value at offset.

<MemberHeading id="hasvalues" depth="3" name="hasValues" sig="hasValues(values: Array): Array.<boolean>" />

<MemberMeta sourceHref="/source/src/image/image-js/#L680" sourceLabel="image.js:680" />

Check if the input values are in the buffer. Could loop through the whole volume, can get long for big data...

**Parameters**

- `values` (Array) — The values to check.

**Returns**

- `Array.<boolean>` — A list of booleans for each input value, set to true if the value is present in the buffer.

<MemberHeading id="clone" depth="3" name="clone" sig="clone(): Image" />

<MemberMeta sourceHref="/source/src/image/image-js/#L761" sourceLabel="image.js:761" />

Clone the image.

**Returns**

- [`Image`](/image) — A clone of this image.

<MemberHeading id="replacebuffer" depth="3" name="replaceBuffer" sig="replaceBuffer(newBuffer: TypedArray)" />

<MemberMeta sourceHref="/source/src/image/image-js/#L796" sourceLabel="image.js:796" />

Replace the inner buffer wholesale (as opposed to editing its content in place). Primarily intended for subclass use, where a private (`#`) field on this class isn't reachable directly.

**Parameters**

- `newBuffer` ([TypedArray](/typedarray)) — The new buffer.

**Fires**

- `Image#event:imagecontentchange`

<MemberHeading id="canappendslice" depth="3" name="canAppendSlice" sig="canAppendSlice(rhs: Image): BooleanResult" />

<MemberMeta sourceHref="/source/src/image/image-js/#L877" sourceLabel="image.js:877" />

Check if another image can be appended to this one.

**Parameters**

- `rhs` ([Image](/image)) — The image to check.

**Returns**

- [`BooleanResult`](/booleanresult) — Result with success set to true if the image can be appended.

<MemberHeading id="appendslice" depth="3" name="appendSlice" sig="appendSlice(rhs: Image)" />

<MemberMeta sourceHref="/source/src/image/image-js/#L946" sourceLabel="image.js:946" />

Append a slice to the image.

**Parameters**

- `rhs` ([Image](/image)) — The slice to append.

**Fires**

- `Image#event:imagegeometrychange`

<MemberHeading id="appendframebuffer" depth="3" name="appendFrameBuffer" sig="appendFrameBuffer(frameBuffer: object, frameIndex: number)" />

<MemberMeta sourceHref="/source/src/image/image-js/#L1087" sourceLabel="image.js:1087" />

Append a frame buffer to the image.

**Parameters**

- `frameBuffer` (object) — The frame buffer to append.
- `frameIndex` (number) — The frame index.

<MemberHeading id="appendframe" depth="3" name="appendFrame" sig="appendFrame(time: VolumeId, origin: Point3D)" />

<MemberMeta sourceHref="/source/src/image/image-js/#L1117" sourceLabel="image.js:1117" />

Append a frame to the image.

**Parameters**

- `time` ([VolumeId](/volumeid)) — The frame time: a volume id or, without source, a frame index.
- `origin` ([Point3D](/point3d)) — The origin of the frame.

<MemberHeading id="getdatarange" depth="3" name="getDataRange" sig="getDataRange(): NumberRange" />

<MemberMeta sourceHref="/source/src/image/image-js/#L1135" sourceLabel="image.js:1135" />

Get the data range.

**Returns**

- [`NumberRange`](/numberrange) — The data range.

<MemberHeading id="getrescaleddatarange" depth="3" name="getRescaledDataRange" sig="getRescaledDataRange(): NumberRange" />

<MemberMeta sourceHref="/source/src/image/image-js/#L1147" sourceLabel="image.js:1147" />

Get the rescaled data range.

**Returns**

- [`NumberRange`](/numberrange) — The rescaled data range.

<MemberHeading id="gethistogram" depth="3" name="getHistogram" sig="getHistogram(): ImageHistogram" />

<MemberMeta sourceHref="/source/src/image/image-js/#L1159" sourceLabel="image.js:1159" />

Get the histogram.

**Returns**

- [`ImageHistogram`](/imagehistogram) — The histogram.

<MemberHeading id="getvalue" depth="3" name="getValue" sig="getValue(i: number, j: number, k: number, f?: number): number" />

<MemberMeta sourceHref="/source/src/image/image-js/#L1178" sourceLabel="image.js:1178" />

Get the value of the image at a specific coordinate.

**Parameters**

- `i` (number) — The X index.
- `j` (number) — The Y index.
- `k` (number) — The Z index.
- `f` (number, optional) — Optional frame number.

**Returns**

- `number` — The value at the desired position. Warning: No size check...

<MemberHeading id="getvalueatindex" depth="3" name="getValueAtIndex" sig="getValueAtIndex(index: Index): number" />

<MemberMeta sourceHref="/source/src/image/image-js/#L1195" sourceLabel="image.js:1195" />

Get the value of the image at a specific index.

**Parameters**

- `index` ([Index](/index)) — The index.

**Returns**

- `number` — The value at the desired position. Warning: No size check...

<MemberHeading
  id="getrescaledvalue"
  depth="3"
  name="getRescaledValue"
  sig="getRescaledValue(
	i: number,
	j: number,
	k: number,
	f?: number,
): number"
/>

<MemberMeta sourceHref="/source/src/image/image-js/#L1210" sourceLabel="image.js:1210" />

Get the rescaled value of the image at a specific position.

**Parameters**

- `i` (number) — The X index.
- `j` (number) — The Y index.
- `k` (number) — The Z index.
- `f` (number, optional) — Optional frame number.

**Returns**

- `number` — The rescaled value at the desired position. Warning: No size check...

<MemberHeading id="getrescaledvalueatindex" depth="3" name="getRescaledValueAtIndex" sig="getRescaledValueAtIndex(index: Index): number" />

<MemberMeta sourceHref="/source/src/image/image-js/#L1234" sourceLabel="image.js:1234" />

Get the rescaled value of the image at a specific index.

**Parameters**

- `index` ([Index](/index)) — The index.

**Returns**

- `number` — The rescaled value at the desired position. Warning: No size check...

<MemberHeading id="getrescaledvalueatoffset" depth="3" name="getRescaledValueAtOffset" sig="getRescaledValueAtOffset(offset: number): number" />

<MemberMeta sourceHref="/source/src/image/image-js/#L1247" sourceLabel="image.js:1247" />

Get the rescaled value of the image at a specific offset.

**Parameters**

- `offset` (number) — The desired offset.

**Returns**

- `number` — The rescaled value at the desired offset. Warning: No size check...

<MemberHeading
  id="getrescaledvaluesatposition"
  depth="3"
  name="getRescaledValuesAtPosition"
  sig="getRescaledValuesAtPosition(
	position: Point,
): Array.<VolumeValue>"
/>

<MemberMeta sourceHref="/source/src/image/image-js/#L1270" sourceLabel="image.js:1270" />

Get the rescaled values of all volumes (fourth dimension) at a position.

**Parameters**

- `position` ([Point](/point)) — The world position, only its first three dimensions are used.

**Returns**

- `Array.<`[`VolumeValue`](/volumevalue)`>` — The values with their unit and volume id, ordered by volume index, empty if the position is out of bounds or if the image cannot be quantified (more than one component).

<MemberHeading id="calculatedatarange" depth="3" name="calculateDataRange" sig="calculateDataRange(): object" />

<MemberMeta sourceHref="/source/src/image/image-js/#L1317" sourceLabel="image.js:1317" />

Calculate the data range of the image. WARNING: for speed reasons, only calculated on the first frame...

**Returns**

- `object` — The range {min, max}.

<MemberHeading id="calculaterescaleddatarange" depth="3" name="calculateRescaledDataRange" sig="calculateRescaledDataRange(): object" />

<MemberMeta sourceHref="/source/src/image/image-js/#L1346" sourceLabel="image.js:1346" />

Calculate the rescaled data range of the image. WARNING: for speed reasons, only calculated on the first frame...

**Returns**

- `object` — The range {min, max}.

<MemberHeading id="convolute2d" depth="3" name="convolute2D" sig="convolute2D(weights: Array.<number>): Image" />

<MemberMeta sourceHref="/source/src/image/image-js/#L1410" sourceLabel="image.js:1410" />

Convolute the image with a given 2D kernel.

Note: Uses raw buffer values.

**Parameters**

- `weights` (Array.\<number>) — The weights of the 2D kernel as a 3x3 matrix.

**Returns**

- [`Image`](/image) — The convoluted image.

<MemberHeading
  id="convolutebuffer"
  depth="3"
  name="convoluteBuffer"
  sig="convoluteBuffer(
	weights: Array.<number>,
	buffer: TypedArray,
	startOffset: number,
)"
/>

<MemberMeta sourceHref="/source/src/image/image-js/#L1438" sourceLabel="image.js:1438" />

Convolute an image buffer with a given 2D kernel.

Note: Uses raw buffer values.

**Parameters**

- `weights` (Array.\<number>) — The weights of the 2D kernel as a 3x3 matrix.
- `buffer` ([TypedArray](/typedarray)) — The buffer to convolute.
- `startOffset` (number) — The index to start at.

<MemberHeading id="transform" depth="3" name="transform" sig="transform(operator: function): Image" />

<MemberMeta sourceHref="/source/src/image/image-js/#L1570" sourceLabel="image.js:1570" />

Transform an image using a specific operator. WARNING: no size check!

**Parameters**

- `operator` (function) — The operator to use when transforming.

**Returns**

- [`Image`](/image) — The transformed image. Note: Uses the raw buffer values.

<MemberHeading id="compose" depth="3" name="compose" sig="compose(rhs: Image, operator: function): Image" />

<MemberMeta sourceHref="/source/src/image/image-js/#L1588" sourceLabel="image.js:1588" />

Compose this image with another one and using a specific operator. WARNING: no size check!

**Parameters**

- `rhs` ([Image](/image)) — The image to compose with.
- `operator` (function) — The operator to use when composing.

**Returns**

- [`Image`](/image) — The composed image. Note: Uses the raw buffer values.

<MemberHeading id="isresampled" depth="3" name="isResampled" sig="isResampled(): boolean" />

<MemberMeta sourceHref="/source/src/image/image-js/#L1606" sourceLabel="image.js:1606" />

Return if this image has been resampled.

**Returns**

- `boolean` — If the image has been resampled.

<MemberHeading
  id="resample"
  depth="3"
  name="resample"
  sig="resample(
	orientation: Matrix33,
	interpolated: boolean | undefined,
	centerOfRotation: Point | undefined,
)"
/>

<MemberMeta sourceHref="/source/src/image/image-js/#L1618" sourceLabel="image.js:1618" />

Resample this image to a new orientation.

**Parameters**

- `orientation` ([Matrix33](/matrix33)) — The orientation to resample to.
- `interpolated` (boolean | undefined) — Default true, if true use bilinear sampling, otherwise use nearest neighbor.
- `centerOfRotation` ([Point](/point) | undefined) — World space center of rotation.

<MemberHeading id="revert" depth="3" name="revert" sig="revert()" />

<MemberMeta sourceHref="/source/src/image/image-js/#L1684" sourceLabel="image.js:1684" />

Revert a resampled image to its original state.

## Instance Fields

<MemberHeading id="constructor" depth="3" name="constructor" sig="constructor: ImageConstructor" />

<MemberMeta sourceHref="/source/src/image/image-js/#L767" sourceLabel="image.js:767" />

## Events

<MemberHeading id="imagebufferrealloc" depth="3" name="imagebufferrealloc" sig="imagebufferrealloc: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/image/image-js/#L831" sourceLabel="image.js:831" />

Buffer reallocation event: internal-only signal (not part of [imageEventNames](/global#imageeventnames)) for a subclass to re-point any state aliased to the previous buffer instance, for example MaskImage's segment collection label map.

<MemberHeading id="imagesliceshift" depth="3" name="imagesliceshift" sig="imagesliceshift: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/image/image-js/#L865" sourceLabel="image.js:865" />

Buffer slice-shift event: internal-only signal (not part of [imageEventNames](/global#imageeventnames)) for a subclass to replicate the same shift on any of its own buffer-aliased state, for example MaskImage's contour.

**Properties**

- `detail` (object) — The event detail.

<MemberHeading id="imagegeometrychange" depth="3" name="imagegeometrychange" sig="imagegeometrychange: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/image/image-js/#L1078" sourceLabel="image.js:1078" />

Image geometry change event.

**Properties**

- `detail` (object) — The event detail.

<MemberHeading id="appendframe" depth="3" name="appendframe" sig="appendframe: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/image/image-js/#L1126" sourceLabel="image.js:1126" />

Append frame event.

**Properties**

- `detail` (object) — The event detail.

<MemberHeading id="imagecontentchange" depth="3" name="imagecontentchange" sig="imagecontentchange: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/image/maskimage-js/#L414" sourceLabel="maskImage.js:414" />

Image content change event.

**Properties**

- `detail` (object) — The event detail.
