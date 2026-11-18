---
title: ViewController
kind: class
longname: ViewController
description: View controller.
---

# ViewController

<SourceLink href="/source/src/app/viewcontroller-js/#L34" label="viewController.js:34" />

View controller.

---

## Constructor

<Signature code="new ViewController(view: View): ViewController" />

**Parameters**

- `view` ([View](/view)) — The associated view.

---

## Instance Methods

<MemberHeading id="getplanehelper" depth="3" name="getPlaneHelper" sig="getPlaneHelper(): PlaneHelper" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L80" sourceLabel="viewController.js:80" />

Get the plane helper.

**Returns**

- [`PlaneHelper`](/planehelper) — The helper.

<MemberHeading id="updateplanehelper" depth="3" name="updatePlaneHelper" sig="updatePlaneHelper()" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L87" sourceLabel="viewController.js:87" />

Update the plane helper if there is a change in the image geometry.

<MemberHeading id="ismask" depth="3" name="isMask" sig="isMask(): boolean" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L99" sourceLabel="viewController.js:99" />

Check is the associated image is a mask.

**Returns**

- `boolean` — True if the associated image is a mask.

<MemberHeading id="initialise" depth="3" name="initialise" sig="initialise()" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L106" sourceLabel="viewController.js:106" />

Initialise the controller.

<MemberHeading id="resetwindowlevel" depth="3" name="resetWindowLevel" sig="resetWindowLevel()" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L116" sourceLabel="viewController.js:116" />

Reset the window level.

<MemberHeading id="resetposition" depth="3" name="resetPosition" sig="resetPosition()" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L124" sourceLabel="viewController.js:124" />

Reset the position.

<MemberHeading id="getmodality" depth="3" name="getModality" sig="getModality(): string" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L136" sourceLabel="viewController.js:136" />

Get the image modality.

**Returns**

- `string` — The modality.

<MemberHeading id="getsopclassuid" depth="3" name="getSopClassUid" sig="getSopClassUid(): string | undefined" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L145" sourceLabel="viewController.js:145" />

Get the image SOP class UID.

**Returns**

- `string | undefined` — The uid.

<MemberHeading id="getwindowlevelpresetsnames" depth="3" name="getWindowLevelPresetsNames" sig="getWindowLevelPresetsNames(): Array.<string>" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L154" sourceLabel="viewController.js:154" />

Get the window/level presets names.

**Returns**

- `Array.<string>` — The presets names.

<MemberHeading
  id="addwindowlevelpresets"
  depth="3"
  name="addWindowLevelPresets"
  sig="addWindowLevelPresets(
	presets: Record.<string, WindowPreset>,
): object"
/>

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L164" sourceLabel="viewController.js:164" />

Add window/level presets to the view.

**Parameters**

- `presets` (Record.\<string, [WindowPreset](/windowpreset)>) — A preset object.

**Returns**

- `object` — The list of presets.

<MemberHeading id="setwindowlevelpreset" depth="3" name="setWindowLevelPreset" sig="setWindowLevelPreset(name: string)" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L173" sourceLabel="viewController.js:173" />

Set the window level to the preset with the input name.

**Parameters**

- `name` (string) — The name of the preset to activate.

<MemberHeading id="setwindowlevelpresetbyid" depth="3" name="setWindowLevelPresetById" sig="setWindowLevelPresetById(id: number)" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L182" sourceLabel="viewController.js:182" />

Set the window level to the preset with the input id.

**Parameters**

- `id` (number) — The id of the preset to activate.

<MemberHeading id="isplaying" depth="3" name="isPlaying" sig="isPlaying(): boolean" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L191" sourceLabel="viewController.js:191" />

Check if the controller is playing.

**Returns**

- `boolean` — True if the controler is playing.

<MemberHeading id="getpositionhelper" depth="3" name="getPositionHelper" sig="getPositionHelper(): PositionHelper" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L201" sourceLabel="viewController.js:201" />

Get a position helper: returns a new helper based on the current view.

**Returns**

- [`PositionHelper`](/positionhelper) — The helper.

<MemberHeading id="getcurrentposition" depth="3" name="getCurrentPosition" sig="getCurrentPosition(): Point" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L210" sourceLabel="viewController.js:210" />

Get the current position.

**Returns**

- [`Point`](/point) — The position.

<MemberHeading id="getcurrentindex" depth="3" name="getCurrentIndex" sig="getCurrentIndex(): Index" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L219" sourceLabel="viewController.js:219" />

Get the current index.

**Returns**

- [`Index`](/index) — The current index.

<MemberHeading
  id="cansyncvolume"
  depth="3"
  name="canSyncVolume"
  sig="canSyncVolume(
	viewController: ViewController,
	value: number,
): boolean"
/>

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L230" sourceLabel="viewController.js:230" />

Check if the volume of this view can follow the one of another view.

**Parameters**

- `viewController` ([ViewController](/viewcontroller)) — The view controller to follow.
- `value` (number) — The volume id value to follow.

**Returns**

- `boolean` — True if the volume can follow.

<MemberHeading id="getcurrentimageuid" depth="3" name="getCurrentImageUid" sig="getCurrentImageUid(): string" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L240" sourceLabel="viewController.js:240" />

Get the SOP image UID of the current image.

**Returns**

- `string` — The UID.

<MemberHeading id="getoriginforimageuid" depth="3" name="getOriginForImageUid" sig="getOriginForImageUid(uid: string): Point3D | undefined" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L250" sourceLabel="viewController.js:250" />

Get the image origin for a image UID.

**Parameters**

- `uid` (string) — The UID.

**Returns**

- [`Point3D`](/point3d)` | undefined` — The origin.

<MemberHeading id="includesimageuid" depth="3" name="includesImageUid" sig="includesImageUid(uid: string): boolean" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L260" sourceLabel="viewController.js:260" />

Check if the image includes an UID.

**Parameters**

- `uid` (string) — The UID.

**Returns**

- `boolean` — True if present.

<MemberHeading id="getcurrentorientedindex" depth="3" name="getCurrentOrientedIndex" sig="getCurrentOrientedIndex(): Index" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L269" sourceLabel="viewController.js:269" />

Get the current oriented index.

**Returns**

- [`Index`](/index) — The index.

<MemberHeading id="getscrolldimindex" depth="3" name="getScrollDimIndex" sig="getScrollDimIndex(): number" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L288" sourceLabel="viewController.js:288" />

Get the scroll dimension index.

**Returns**

- `number` — The index.

<MemberHeading id="getcurrentindexscrollvalue" depth="3" name="getCurrentIndexScrollValue" sig="getCurrentIndexScrollValue(): number" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L297" sourceLabel="viewController.js:297" />

Get the current index scroll value.

**Returns**

- `number` — The value.

<MemberHeading id="getorigin" depth="3" name="getOrigin" sig="getOrigin(position?: Point): Point3D" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L307" sourceLabel="viewController.js:307" />

Get the first origin or at a given position.

**Parameters**

- `position` ([Point](/point), optional) — Optional position.

**Returns**

- [`Point3D`](/point3d) — The origin.

<MemberHeading id="isaquisitionorientation" depth="3" name="isAquisitionOrientation" sig="isAquisitionOrientation(): boolean" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L316" sourceLabel="viewController.js:316" />

Is this view in the same orientation as the image aquisition.

**Returns**

- `boolean` — True if in aquisition plane.

<MemberHeading id="getplanepoints" depth="3" name="getPlanePoints" sig="getPlanePoints(position: Point): Array.<Point3D>" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L327" sourceLabel="viewController.js:327" />

Get a list of points that define the plane at input position, given this classes orientation.

**Parameters**

- `position` ([Point](/point)) — The position.

**Returns**

- `Array.<`[`Point3D`](/point3d)`>` — An origin and 2 cosines vectors.

<MemberHeading id="getcurrentscrollposition" depth="3" name="getCurrentScrollPosition" sig="getCurrentScrollPosition(): number" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L336" sourceLabel="viewController.js:336" />

Get the current scroll position value.

**Returns**

- `number` — The value.

<MemberHeading id="generateimagedata" depth="3" name="generateImageData" sig="generateImageData(array: ImageData, index?: Index)" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L348" sourceLabel="viewController.js:348" />

Generate display image data to be given to a canvas.

**Parameters**

- `array` (ImageData) — The array to fill in.
- `index` ([Index](/index), optional) — Optional index at which to generate, otherwise generates at current index.

<MemberHeading id="setimage" depth="3" name="setImage" sig="setImage(img: Image)" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L357" sourceLabel="viewController.js:357" />

Set the associated image.

**Parameters**

- `img` ([Image](/image)) — The associated image.

<MemberHeading id="get2dspacing" depth="3" name="get2DSpacing" sig="get2DSpacing(): Scalar2D" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L376" sourceLabel="viewController.js:376" />

Get the current view (2D) spacing.

**Returns**

- [`Scalar2D`](/scalar2d) — The spacing as a 2D array.

<MemberHeading id="getrescaledimagevalue" depth="3" name="getRescaledImageValue" sig="getRescaledImageValue(position: Point): number | undefined" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L389" sourceLabel="viewController.js:389" />

Get the image rescaled value at the input position.

**Parameters**

- `position` ([Point](/point)) — The input position.

**Returns**

- `number | undefined` — The image value or undefined if out of bounds or no quantifiable (for ex RGB).

<MemberHeading id="getsegmentnumbersatposition" depth="3" name="getSegmentNumbersAtPosition" sig="getSegmentNumbersAtPosition(position: Point): Array.<number>" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L410" sourceLabel="viewController.js:410" />

Get the numbers of the mask segments at the input position.

**Parameters**

- `position` ([Point](/point)) — The input position.

**Returns**

- `Array.<number>` — The list of segment numbers, empty if the image is not a mask, for background or if out of bounds.

<MemberHeading id="getpixelunit" depth="3" name="getPixelUnit" sig="getPixelUnit(): string" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L428" sourceLabel="viewController.js:428" />

Get the image pixel unit.

**Returns**

- `string` — The unit.

<MemberHeading id="getlengthunit" depth="3" name="getLengthUnit" sig="getLengthUnit(): string" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L437" sourceLabel="viewController.js:437" />

Get the image length unit.

**Returns**

- `string` — The unit.

<MemberHeading
  id="getimageregionvalues"
  depth="3"
  name="getImageRegionValues"
  sig="getImageRegionValues(
	min: Point2D,
	max: Point2D,
	index: Index,
): Array"
/>

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L486" sourceLabel="viewController.js:486" />

Get some values from the associated image in a region.

**Parameters**

- `min` ([Point2D](/point2d)) — Minimum point.
- `max` ([Point2D](/point2d)) — Maximum point.
- `index` ([Index](/index)) — The index at which to get the image values (combined with min/max).

**Returns**

- `Array` — A list of values.

<MemberHeading
  id="getimagevariableregionvalues"
  depth="3"
  name="getImageVariableRegionValues"
  sig="getImageVariableRegionValues(
	regions: Array.<Array.<Array.<number>>>,
	index: Index,
): Array"
/>

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L518" sourceLabel="viewController.js:518" />

Get some values from the associated image in variable regions.

**Parameters**

- `regions` (Array.\<Array.\<Array.\<number>>>) — A list of \[x, y] pairs (min, max).
- `index` ([Index](/index)) — The index at which to get the image values (combined with regions min/max).

**Returns**

- `Array` — A list of values.

<MemberHeading id="canquantifyimage" depth="3" name="canQuantifyImage" sig="canQuantifyImage(): boolean" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L547" sourceLabel="viewController.js:547" />

Can the image values be quantified?

**Returns**

- `boolean` — True if possible.

<MemberHeading id="canwindowlevel" depth="3" name="canWindowLevel" sig="canWindowLevel(): boolean" />

<MemberMeta badges="deprecated" sourceHref="/source/src/app/viewcontroller-js/#L557" sourceLabel="viewController.js:557" />

Can window and level be applied to the data?

<Callout type="error">
  &#x20;Since v0.33, please use isMonochrome instead.
</Callout>

**Returns**

- `boolean` — True if possible.

<MemberHeading id="ismonochrome" depth="3" name="isMonochrome" sig="isMonochrome(): boolean" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L566" sourceLabel="viewController.js:566" />

Is the data monochrome.

**Returns**

- `boolean` — True if the data is monochrome.

<MemberHeading id="canscroll" depth="3" name="canScroll" sig="canScroll(): boolean" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L576" sourceLabel="viewController.js:576" />

Can the data be scrolled?

**Returns**

- `boolean` — True if the data has either the third dimension or above greater than one.

<MemberHeading id="getimagesize" depth="3" name="getImageSize" sig="getImageSize(): Size" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L585" sourceLabel="viewController.js:585" />

Get the oriented image size.

**Returns**

- [`Size`](/size) — The size.

<MemberHeading id="getimagespacing" depth="3" name="getImageSpacing" sig="getImageSpacing(): Spacing" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L595" sourceLabel="viewController.js:595" />

Get the oriented image spacing.

**Returns**

- [`Spacing`](/spacing) — The spacing.

<MemberHeading id="morethanone" depth="3" name="moreThanOne" sig="moreThanOne(dim: number): boolean" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L607" sourceLabel="viewController.js:607" />

Is the data size larger than one in the given dimension?

**Parameters**

- `dim` (number) — The dimension.

**Returns**

- `boolean` — True if the image size is larger than one in the given dimension.

<MemberHeading id="getimageworldsize" depth="3" name="getImageWorldSize" sig="getImageWorldSize(): Scalar2D" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L616" sourceLabel="viewController.js:616" />

Get the image world (mm) 2D size.

**Returns**

- [`Scalar2D`](/scalar2d) — The 2D size as {x,y}.

<MemberHeading id="getimagerescaleddatarange" depth="3" name="getImageRescaledDataRange" sig="getImageRescaledDataRange(): object" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L631" sourceLabel="viewController.js:631" />

Get the image rescaled data range.

**Returns**

- `object` — The range as {min, max}.

<MemberHeading id="equalimagemeta" depth="3" name="equalImageMeta" sig="equalImageMeta(meta: object): boolean" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L641" sourceLabel="viewController.js:641" />

Compare the input meta data to the associated image one.

**Parameters**

- `meta` (object) — The meta data.

**Returns**

- `boolean` — True if the associated image has equal meta data.

<MemberHeading id="ispositioninbounds" depth="3" name="isPositionInBounds" sig="isPositionInBounds(position?: Point): boolean" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L664" sourceLabel="viewController.js:664" />

Check if the current position (default) or the provided position is in bounds.

**Parameters**

- `position` ([Point](/point), optional) — Optional position.

**Returns**

- `boolean` — True is the position is in bounds.

<MemberHeading id="setcurrentposition" depth="3" name="setCurrentPosition" sig="setCurrentPosition(pos: Point, silent?: boolean): boolean" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L676" sourceLabel="viewController.js:676" />

Set the current position.

**Parameters**

- `pos` ([Point](/point)) — The position.
- `silent` (boolean, optional) — If true, does not fire a positionchange event.

**Returns**

- `boolean` — False if not in bounds.

<MemberHeading id="getpositionfromplanepoint" depth="3" name="getPositionFromPlanePoint" sig="getPositionFromPlanePoint(point2D: Point2D, k?: number): Point" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L688" sourceLabel="viewController.js:688" />

Get a world position from a 2D plane position.

**Parameters**

- `point2D` ([Point2D](/point2d)) — The input point.
- `k` (number, optional) — Optional slice index, if undefined, uses the current one.

**Returns**

- [`Point`](/point) — The associated position.

<MemberHeading id="validateplanepoint" depth="3" name="validatePlanePoint" sig="validatePlanePoint(point2D: Point2D): boolean" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L709" sourceLabel="viewController.js:709" />

Check if an input plane point is in the geometrys' bounds.

**Parameters**

- `point2D` ([Point2D](/point2d)) — The point to check.

**Returns**

- `boolean` — True if in bounds.

<MemberHeading id="getplanepositionfromposition" depth="3" name="getPlanePositionFromPosition" sig="getPlanePositionFromPosition(point: Point): Point2D" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L721" sourceLabel="viewController.js:721" />

Get a 2D plane position from a world position.

**Parameters**

- `point` ([Point](/point)) — The 3D position.

**Returns**

- [`Point2D`](/point2d) — The 2D position.

<MemberHeading id="getindexfromposition" depth="3" name="getIndexFromPosition" sig="getIndexFromPosition(point: Point): Index" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L740" sourceLabel="viewController.js:740" />

Get the index of a world position.

**Parameters**

- `point` ([Point](/point)) — The 3D position.

**Returns**

- [`Index`](/index) — The index.

<MemberHeading id="getpositionfromindex" depth="3" name="getPositionFromIndex" sig="getPositionFromIndex(index: Index): Point" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L753" sourceLabel="viewController.js:753" />

Get the world position of an index.

**Parameters**

- `index` ([Index](/index)) — The index.

**Returns**

- [`Point`](/point) — The position.

<MemberHeading id="setcurrentindex" depth="3" name="setCurrentIndex" sig="setCurrentIndex(index: Index, silent?: boolean): boolean" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L765" sourceLabel="viewController.js:765" />

Set the current index.

**Parameters**

- `index` ([Index](/index)) — The index.
- `silent` (boolean, optional) — If true, does not fire a positionchange event.

**Returns**

- `boolean` — False if not in bounds.

<MemberHeading id="getplanepositionfromplanepoint" depth="3" name="getPlanePositionFromPlanePoint" sig="getPlanePositionFromPlanePoint(point2D: Point2D): Point3D" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L776" sourceLabel="viewController.js:776" />

Get a plane 3D position from a plane 2D position: does not compensate for the image origin. Needed for setting the scale center...

**Parameters**

- `point2D` ([Point2D](/point2d)) — The 2D position.

**Returns**

- [`Point3D`](/point3d) — The 3D point.

<MemberHeading id="getoffset3dfromplaneoffset" depth="3" name="getOffset3DFromPlaneOffset" sig="getOffset3DFromPlaneOffset(offset2D: Scalar2D): Vector3D" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L797" sourceLabel="viewController.js:797" />

Get a 3D offset from a plane one.

**Parameters**

- `offset2D` ([Scalar2D](/scalar2d)) — The plane offset as {x,y}.

**Returns**

- [`Vector3D`](/vector3d) — The 3D world offset.

<MemberHeading id="play" depth="3" name="play" sig="play()" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L804" sourceLabel="viewController.js:804" />

Scroll play: loop through all slices.

<MemberHeading id="stop" depth="3" name="stop" sig="stop()" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L849" sourceLabel="viewController.js:849" />

Stop scroll playing.

<MemberHeading id="getwindowlevel" depth="3" name="getWindowLevel" sig="getWindowLevel(): WindowLevel" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L861" sourceLabel="viewController.js:861" />

Get the window/level.

**Returns**

- [`WindowLevel`](/windowlevel) — The window and level.

<MemberHeading id="getcurrentwindowpresetname" depth="3" name="getCurrentWindowPresetName" sig="getCurrentWindowPresetName(): string" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L870" sourceLabel="viewController.js:870" />

Get the current window level preset name.

**Returns**

- `string` — The preset name.

<MemberHeading id="setwindowlevel" depth="3" name="setWindowLevel" sig="setWindowLevel(wl: WindowLevel)" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L879" sourceLabel="viewController.js:879" />

Set the window and level.

**Parameters**

- `wl` ([WindowLevel](/windowlevel)) — The window and level.

<MemberHeading id="getcolourmap" depth="3" name="getColourMap" sig="getColourMap(): string" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L888" sourceLabel="viewController.js:888" />

Get the colour map.

**Returns**

- `string` — The colour map name.

<MemberHeading id="setcolourmap" depth="3" name="setColourMap" sig="setColourMap(name: string)" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L897" sourceLabel="viewController.js:897" />

Set the colour map.

**Parameters**

- `name` (string) — The colour map name.

<MemberHeading id="setviewalphafunction" depth="3" name="setViewAlphaFunction" sig="setViewAlphaFunction(func: alphaFn)" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L913" sourceLabel="viewController.js:913" />

Set the view per value alpha function.

**Parameters**

- `func` ([alphaFn](/alphafn)) — The function.

<MemberHeading id="setmaskviewhelper" depth="3" name="setMaskViewHelper" sig="setMaskViewHelper(helper: MaskSegmentViewHelper)" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L923" sourceLabel="viewController.js:923" />

Set the mask segment view helper to handle hidden segments.

**Parameters**

- `helper` ([MaskSegmentViewHelper](/masksegmentviewhelper)) — The helper.

<MemberHeading id="getsegmenthighlight" depth="3" name="getSegmentHighlight" sig="getSegmentHighlight(): Object | undefined" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L933" sourceLabel="viewController.js:933" />

Get the segment highlight.

**Returns**

- `Object | undefined` — The highlighted segment number and its opacity factor.

<MemberHeading id="setsegmenthighlight" depth="3" name="setSegmentHighlight" sig="setSegmentHighlight(segmentNumber?: number, opacity?: number)" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L948" sourceLabel="viewController.js:948" />

Set the segment highlight: the opacity of the given segment is multiplied by the input factor. Only one segment can be highlighted at a time. This only has an effect on segmentation views.

**Parameters**

- `segmentNumber` (number, optional) — The segment number, undefined to remove the highlight.
- `opacity` (number, optional) — The opacity factor (between 0 and 1), defaults to 1.

<MemberHeading id="getfillopacity" depth="3" name="getFillOpacity" sig="getFillOpacity(): number" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L957" sourceLabel="viewController.js:957" />

Get the fill opacity relative to the global opacity.

**Returns**

- `number` — The fill opacity (between 0 and 1).

<MemberHeading id="setfillopacity" depth="3" name="setFillOpacity" sig="setFillOpacity(opacity: number)" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L968" sourceLabel="viewController.js:968" />

Set the fill opacity relative to the global opacity. This only has an effect on segmentation views, or any other alpha function that makes use of it.

**Parameters**

- `opacity` (number) — The fill opacity (between 0 and 1).

<MemberHeading id="getcontourthickness" depth="3" name="getContourThickness" sig="getContourThickness(): number" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L977" sourceLabel="viewController.js:977" />

Get the thickness of the contour in pixels.

**Returns**

- `number` — The contour thickness (integer >= 1).

<MemberHeading id="setcontourthickness" depth="3" name="setContourThickness" sig="setContourThickness(thickness: number)" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L988" sourceLabel="viewController.js:988" />

Set the thickness of the contour in pixels. This only has an effect on segmentation views, or any other alpha function that makes use of it.

**Parameters**

- `thickness` (number) — The contour thickness (integer >= 1).

<MemberHeading id="bindimageandlayer" depth="3" name="bindImageAndLayer" sig="bindImageAndLayer(viewLayer: ViewLayer)" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L997" sourceLabel="viewController.js:997" />

Bind the view image to the provided layer.

**Parameters**

- `viewLayer` ([ViewLayer](/viewlayer)) — The layer to bind.

<MemberHeading id="unbindimageandlayer" depth="3" name="unbindImageAndLayer" sig="unbindImageAndLayer(viewLayer: ViewLayer)" />

<MemberMeta sourceHref="/source/src/app/viewcontroller-js/#L1015" sourceLabel="viewController.js:1015" />

Unbind the view image to the provided layer.

**Parameters**

- `viewLayer` ([ViewLayer](/viewlayer)) — The layer to bind.
