---
title: Annotation
kind: class
longname: Annotation
description: Image annotation.
---

# Annotation

<SourceLink href="/source/src/image/annotation-js/#L21" label="annotation.js:21" />

Image annotation.

---

## Constructor

<Signature code="new Annotation(): Annotation" />

Constructor: set default annotation id and uid.

---

## Instance Methods

<MemberHeading id="getmetaconceptids" depth="3" name="getMetaConceptIds" sig="getMetaConceptIds(): Array.<string>" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L145" sourceLabel="annotation.js:145" />

Get the concepts ids of the annotation meta data.

**Returns**

- `Array.<string>` — The ids.

<MemberHeading id="getmetaitem" depth="3" name="getMetaItem" sig="getMetaItem(conceptId: string): object | undefined" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L156" sourceLabel="annotation.js:156" />

Get an annotation meta data.

**Parameters**

- `conceptId` (string) — The value of the concept dicom code.

**Returns**

- `object | undefined` — The corresponding meta data item as {concept, value} or undefined.

<MemberHeading id="addmetaitem" depth="3" name="addMetaItem" sig="addMetaItem(concept: DicomCode, value: DicomCode | string)" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L166" sourceLabel="annotation.js:166" />

Add annotation meta data.

**Parameters**

- `concept` ([DicomCode](/dicomcode)) — The concept code.
- `value` ([DicomCode](/dicomcode) | string) — The value code.

<MemberHeading id="removemetaitem" depth="3" name="removeMetaItem" sig="removeMetaItem(conceptId: string)" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L179" sourceLabel="annotation.js:179" />

Remove an annotation meta data.

**Parameters**

- `conceptId` (string) — The value of the concept dicom code.

<MemberHeading id="getorientationname" depth="3" name="getOrientationName" sig="getOrientationName(): string | undefined" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L191" sourceLabel="annotation.js:191" />

Get the orientation name for this annotation.

**Returns**

- `string | undefined` — The orientation name, undefined if same as reference data.

<MemberHeading id="init" depth="3" name="init" sig="init(viewController: ViewController)" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L207" sourceLabel="annotation.js:207" />

Initialise the annotation.

**Parameters**

- `viewController` ([ViewController](/viewcontroller)) — The associated view controller.

<MemberHeading id="canview" depth="3" name="canView" sig="canView(): boolean" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L240" sourceLabel="annotation.js:240" />

Check if the annotation can be displayed: true if it has an associated view controller.

**Returns**

- `boolean` — True if the annotation can be displayed.

<MemberHeading id="iscompatibleview" depth="3" name="isCompatibleView" sig="isCompatibleView(planeHelper: PlaneHelper): boolean" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L250" sourceLabel="annotation.js:250" />

Check if an input view is compatible with the annotation.

**Parameters**

- `planeHelper` ([PlaneHelper](/planehelper)) — The input view to check.

**Returns**

- `boolean` — True if compatible view.

<MemberHeading id="setviewcontroller" depth="3" name="setViewController" sig="setViewController(viewController: ViewController)" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L287" sourceLabel="annotation.js:287" />

Set the associated view controller if it is compatible.

**Parameters**

- `viewController` ([ViewController](/viewcontroller)) — The view controller.

<MemberHeading id="getcentroid" depth="3" name="getCentroid" sig="getCentroid(): Point | undefined" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L345" sourceLabel="annotation.js:345" />

Get the centroid of the math shape.

**Returns**

- [`Point`](/point)` | undefined` — The 3D centroid point.

<MemberHeading id="contains" depth="3" name="contains" sig="contains(point: Point2D, tolerance?: number): boolean" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L389" sourceLabel="annotation.js:389" />

Check if a plane point is on the annotation math shape, within a tolerance.

**Parameters**

- `point` ([Point2D](/point2d)) — The plane point to check.
- `tolerance` (number, optional, default: 0) — Optional maximum distance to the shape, defaults to 0.

**Returns**

- `boolean` — True if the point is on the shape.

<MemberHeading id="settextexpr" depth="3" name="setTextExpr" sig="setTextExpr(labelText: Record.<string, string>)" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L408" sourceLabel="annotation.js:408" />

Set the annotation text expression.

**Parameters**

- `labelText` (Record.\<string, string>) — The list of label texts indexed by modality.

<MemberHeading id="gettext" depth="3" name="getText" sig="getText(): string" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L428" sourceLabel="annotation.js:428" />

Get the annotation label text by applying the text expression on the current quantification.

**Returns**

- `string` — The resulting text.

<MemberHeading id="updatequantification" depth="3" name="updateQuantification" sig="updateQuantification()" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L435" sourceLabel="annotation.js:435" />

Update the annotation quantification.

<MemberHeading id="getfactory" depth="3" name="getFactory" sig="getFactory(): object | undefined" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L451" sourceLabel="annotation.js:451" />

Get the math shape associated draw factory.

**Returns**

- `object | undefined` — The factory.

## Instance Fields

<MemberHeading id="trackingid" depth="3" name="trackingId" sig="trackingId: string" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L27" sourceLabel="annotation.js:27" />

Tracking id, unique within domain.

<MemberHeading id="trackinguid" depth="3" name="trackingUid" sig="trackingUid: string" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L34" sourceLabel="annotation.js:34" />

Tracking Unique id.

<MemberHeading id="referencedsopinstanceuid" depth="3" name="referencedSopInstanceUID" sig="referencedSopInstanceUID: string" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L41" sourceLabel="annotation.js:41" />

Referenced image SOP instance UID.

<MemberHeading id="referencedsopclassuid" depth="3" name="referencedSopClassUID" sig="referencedSopClassUID: string" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L48" sourceLabel="annotation.js:48" />

Referenced image SOP class UID.

<MemberHeading id="referencedframenumber" depth="3" name="referencedFrameNumber" sig="referencedFrameNumber: number | undefined" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L57" sourceLabel="annotation.js:57" />

Referenced frame number, 1-based as the DICOM Referenced Frame Number: frame number 1 is the first frame (time index 0).

<MemberHeading id="mathshape" depth="3" name="mathShape" sig="mathShape: object" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L64" sourceLabel="annotation.js:64" />

Mathematical shape.

<MemberHeading id="referencepoints" depth="3" name="referencePoints" sig="referencePoints: Array.<Point2D> | undefined" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L71" sourceLabel="annotation.js:71" />

Additional points used to define the annotation.

<MemberHeading id="colour" depth="3" name="colour" sig="colour: string" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L78" sourceLabel="annotation.js:78" />

Colour: for example 'green', '#00ff00' or 'rgb(0,255,0)'.

<MemberHeading id="quantification" depth="3" name="quantification" sig="quantification: Record.<string, NumberValue> | undefined" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L85" sourceLabel="annotation.js:85" />

Annotation quantification.

<MemberHeading id="textexpr" depth="3" name="textExpr" sig="textExpr: string" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L93" sourceLabel="annotation.js:93" />

Text expression. Can contain variables surrounded with '{}' that will be extracted from the quantification object.

<MemberHeading id="labelposition" depth="3" name="labelPosition" sig="labelPosition: Point2D | undefined" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L101" sourceLabel="annotation.js:101" />

Label position. If undefined, the default shape label position will be used.

<MemberHeading id="planeorigin" depth="3" name="planeOrigin" sig="planeOrigin: Point3D | undefined" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L108" sourceLabel="annotation.js:108" />

Plane origin: 3D position of index \[0, 0, k].

<MemberHeading id="planepoints" depth="3" name="planePoints" sig="planePoints: Array.<Point3D> | undefined" />

<MemberMeta sourceHref="/source/src/image/annotation-js/#L115" sourceLabel="annotation.js:115" />

A couple of points that help define the annotation plane.
