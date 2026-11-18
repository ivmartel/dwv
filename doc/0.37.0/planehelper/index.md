---
title: PlaneHelper
kind: class
longname: PlaneHelper
description: Plane geometry helper.
---

# PlaneHelper

<SourceLink href="/source/src/image/planehelper-js/#L23" label="planeHelper.js:23" />

Plane geometry helper.

---

## Constructor

<Signature
  code="new PlaneHelper(
	imageGeometry: Geometry,
	viewOrientation: Matrix33,
): PlaneHelper"
/>

**Parameters**

- `imageGeometry` ([Geometry](/geometry)) — The image geometry.
- `viewOrientation` ([Matrix33](/matrix33)) — The view orientation.

---

## Instance Methods

<MemberHeading id="getvieworientation" depth="3" name="getViewOrientation" sig="getViewOrientation(): Matrix33" />

<MemberMeta sourceHref="/source/src/image/planehelper-js/#L79" sourceLabel="planeHelper.js:79" />

Get the view orientation.

**Returns**

- [`Matrix33`](/matrix33) — The orientation matrix.

<MemberHeading id="gettargetorientation" depth="3" name="getTargetOrientation" sig="getTargetOrientation(): Matrix33" />

<MemberMeta sourceHref="/source/src/image/planehelper-js/#L88" sourceLabel="planeHelper.js:88" />

Get the target orientation.

**Returns**

- [`Matrix33`](/matrix33) — The orientation matrix.

<MemberHeading id="getoffset3dfromplaneoffset" depth="3" name="getOffset3DFromPlaneOffset" sig="getOffset3DFromPlaneOffset(offset2D: Scalar2D): Vector3D" />

<MemberMeta sourceHref="/source/src/image/planehelper-js/#L98" sourceLabel="planeHelper.js:98" />

Get a 3D offset from a plane one.

**Parameters**

- `offset2D` ([Scalar2D](/scalar2d)) — The plane offset as {x,y}.

**Returns**

- [`Vector3D`](/vector3d) — The 3D world offset.

<MemberHeading id="getplaneoffsetfromoffset3d" depth="3" name="getPlaneOffsetFromOffset3D" sig="getPlaneOffsetFromOffset3D(offset3D: Scalar3D): Scalar2D" />

<MemberMeta sourceHref="/source/src/image/planehelper-js/#L117" sourceLabel="planeHelper.js:117" />

Get a plane offset from a 3D one.

**Parameters**

- `offset3D` ([Scalar3D](/scalar3d)) — The 3D offset as {x,y,z}.

**Returns**

- [`Scalar2D`](/scalar2d) — The plane offset as {x,y}.

<MemberHeading id="gettargetorientedvector3d" depth="3" name="getTargetOrientedVector3D" sig="getTargetOrientedVector3D(vector: Vector3D): Vector3D" />

<MemberMeta sourceHref="/source/src/image/planehelper-js/#L138" sourceLabel="planeHelper.js:138" />

Orient an input vector from real to target space.

**Parameters**

- `vector` ([Vector3D](/vector3d)) — The input vector.

**Returns**

- [`Vector3D`](/vector3d) — The oriented vector.

<MemberHeading id="gettargetdeorientedvector3d" depth="3" name="getTargetDeOrientedVector3D" sig="getTargetDeOrientedVector3D(planeVector: Vector3D): Vector3D" />

<MemberMeta sourceHref="/source/src/image/planehelper-js/#L153" sourceLabel="planeHelper.js:153" />

De-orient an input vector from target to real space.

**Parameters**

- `planeVector` ([Vector3D](/vector3d)) — The input vector.

**Returns**

- [`Vector3D`](/vector3d) — The de-orienteded vector.

<MemberHeading id="gettargetdeorientedpoint3d" depth="3" name="getTargetDeOrientedPoint3D" sig="getTargetDeOrientedPoint3D(planePoint: Point3D): Point3D" />

<MemberMeta sourceHref="/source/src/image/planehelper-js/#L167" sourceLabel="planeHelper.js:167" />

De-orient an input point from target to real space.

**Parameters**

- `planePoint` ([Point3D](/point3d)) — The input point.

**Returns**

- [`Point3D`](/point3d) — The de-orienteded point.

<MemberHeading id="getimageorientedvector3d" depth="3" name="getImageOrientedVector3D" sig="getImageOrientedVector3D(planeVector: Vector3D): Vector3D" />

<MemberMeta sourceHref="/source/src/image/planehelper-js/#L181" sourceLabel="planeHelper.js:181" />

Orient an input vector from target to image space.

**Parameters**

- `planeVector` ([Vector3D](/vector3d)) — The input vector.

**Returns**

- [`Vector3D`](/vector3d) — The orienteded vector.

<MemberHeading id="getimageorientedpoint3d" depth="3" name="getImageOrientedPoint3D" sig="getImageOrientedPoint3D(planePoint: Point3D): Point3D" />

<MemberMeta sourceHref="/source/src/image/planehelper-js/#L207" sourceLabel="planeHelper.js:207" />

Orient an input point from target to image space.

**Parameters**

- `planePoint` ([Point3D](/point3d)) — The input vector.

**Returns**

- [`Point3D`](/point3d) — The orienteded vector.

<MemberHeading id="getimagedeorientedvector3d" depth="3" name="getImageDeOrientedVector3D" sig="getImageDeOrientedVector3D(vector: Vector3D): Vector3D" />

<MemberMeta sourceHref="/source/src/image/planehelper-js/#L233" sourceLabel="planeHelper.js:233" />

De-orient an input vector from image to target space.

**Parameters**

- `vector` ([Vector3D](/vector3d)) — The input vector.

**Returns**

- [`Vector3D`](/vector3d) — The de-orienteded vector.

<MemberHeading id="getimagedeorientedpoint3d" depth="3" name="getImageDeOrientedPoint3D" sig="getImageDeOrientedPoint3D(point: Point3D): Point3D" />

<MemberMeta sourceHref="/source/src/image/planehelper-js/#L259" sourceLabel="planeHelper.js:259" />

De-orient an input point from image to target space.

**Parameters**

- `point` ([Point3D](/point3d)) — The input point.

**Returns**

- [`Point3D`](/point3d) — The de-orienteded point.

<MemberHeading id="getpositionfromplanepoint" depth="3" name="getPositionFromPlanePoint" sig="getPositionFromPlanePoint(point2D: Point2D, k: number): Point3D" />

<MemberMeta sourceHref="/source/src/image/planehelper-js/#L286" sourceLabel="planeHelper.js:286" />

Get a world position from a 2D plane position.

**Parameters**

- `point2D` ([Point2D](/point2d)) — The plane point.
- `k` (number) — The slice index.

**Returns**

- [`Point3D`](/point3d) — The world position.

<MemberHeading id="getplanepointfromposition" depth="3" name="getPlanePointFromPosition" sig="getPlanePointFromPosition(point: Point): Point3D" />

<MemberMeta sourceHref="/source/src/image/planehelper-js/#L300" sourceLabel="planeHelper.js:300" />

Get a 2D plane position from a world position.

**Parameters**

- `point` ([Point](/point)) — The world position.

**Returns**

- [`Point3D`](/point3d) — The plane point.

<MemberHeading id="getcosines" depth="3" name="getCosines" sig="getCosines(): Array.<number>" />

<MemberMeta sourceHref="/source/src/image/planehelper-js/#L310" sourceLabel="planeHelper.js:310" />

Get the cosines of this plane.

**Returns**

- `Array.<number>` — The 2 cosines vectors (3D).

<MemberHeading id="getlegacycosines" depth="3" name="getLegacyCosines" sig="getLegacyCosines(): Array.<number>" />

<MemberMeta sourceHref="/source/src/image/planehelper-js/#L320" sourceLabel="planeHelper.js:320" />

Get the cosines of this plane as saved in annotations by previous versions, see getLegacyTargetOrientation.

**Returns**

- `Array.<number>` — The 2 cosines vectors (3D).

<MemberHeading id="getplanepoints" depth="3" name="getPlanePoints" sig="getPlanePoints(position: Point): Array.<Point3D>" />

<MemberMeta sourceHref="/source/src/image/planehelper-js/#L332" sourceLabel="planeHelper.js:332" />

Get a list of points that define the plane at input position, given this classes orientation.

**Parameters**

- `position` ([Point](/point)) — The position.

**Returns**

- `Array.<`[`Point3D`](/point3d)`>` — An origin and 2 cosines vectors.

<MemberHeading id="worldtoindex" depth="3" name="worldToIndex" sig="worldToIndex(point: Point): Index" />

<MemberMeta sourceHref="/source/src/image/planehelper-js/#L369" sourceLabel="planeHelper.js:369" />

Image world to index.

**Parameters**

- `point` ([Point](/point)) — The input point.

**Returns**

- [`Index`](/index) — The corresponding index.

<MemberHeading id="indextoworld" depth="3" name="indexToWorld" sig="indexToWorld(index: Index): Point" />

<MemberMeta sourceHref="/source/src/image/planehelper-js/#L379" sourceLabel="planeHelper.js:379" />

Image index to world.

**Parameters**

- `index` ([Index](/index)) — The input index.

**Returns**

- [`Point`](/point) — The corresponding point.

<MemberHeading id="isaquisitionorientation" depth="3" name="isAquisitionOrientation" sig="isAquisitionOrientation(): boolean" />

<MemberMeta sourceHref="/source/src/image/planehelper-js/#L388" sourceLabel="planeHelper.js:388" />

Is this view in the same orientation as the image aquisition.

**Returns**

- `boolean` — True if in aquisition plane.

<MemberHeading id="gettargetorientedpositivexyz" depth="3" name="getTargetOrientedPositiveXYZ" sig="getTargetOrientedPositiveXYZ(values: Scalar3D): Scalar3D" />

<MemberMeta sourceHref="/source/src/image/planehelper-js/#L398" sourceLabel="planeHelper.js:398" />

Reorder values to follow target orientation.

**Parameters**

- `values` ([Scalar3D](/scalar3d)) — Values as {x,y,z}.

**Returns**

- [`Scalar3D`](/scalar3d) — Reoriented values as {x,y,z}.

<MemberHeading id="getscrolldimindex" depth="3" name="getScrollDimIndex" sig="getScrollDimIndex(): number" />

<MemberMeta sourceHref="/source/src/image/planehelper-js/#L418" sourceLabel="planeHelper.js:418" />

Get the (view) scroll dimension index.

**Returns**

- `number` — The index.

<MemberHeading id="getnativescrolldimindex" depth="3" name="getNativeScrollDimIndex" sig="getNativeScrollDimIndex(): number" />

<MemberMeta sourceHref="/source/src/image/planehelper-js/#L433" sourceLabel="planeHelper.js:433" />

Get the native (image) scroll dimension index.

**Returns**

- `number` — The index.
