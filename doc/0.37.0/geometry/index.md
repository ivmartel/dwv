---
title: Geometry
kind: class
longname: Geometry
description: 2D/3D Geometry class.
---

# Geometry

<SourceLink href="/source/src/image/geometry-js/#L114" label="geometry.js:114" />

2D/3D Geometry class.

---

## Constructor

<Signature
  code="new Geometry(
	origins: Array.<Point3D>,
	size: Size,
	spacing: Spacing,
	orientation?: Matrix33,
	time?: VolumeId,
): Geometry"
/>

**Parameters**

- `origins` (Array.\<[Point3D](/point3d)>) — The object origins.
- `size` ([Size](/size)) — The object size.
- `spacing` ([Spacing](/spacing)) — The object spacing.
- `orientation` ([Matrix33](/matrix33), optional) — The object orientation (&#x33;_&#x33; matrix, default to &#x33;_&#x33; identity).
- `time` ([VolumeId](/volumeid), optional) — Optional time: a volume id or, without source, a frame index (for example `{id: {value: 2}}`).

---

## Instance Methods

<MemberHeading id="clone" depth="3" name="clone" sig="clone(): Geometry" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L213" sourceLabel="geometry.js:213" />

Clone the geometry.

**Returns**

- [`Geometry`](/geometry) — A clone of this geometry.

<MemberHeading id="getinitialtime" depth="3" name="getInitialTime" sig="getInitialTime(): VolumeId | undefined" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L228" sourceLabel="geometry.js:228" />

Get the time that was passed at construction.

**Returns**

- [`VolumeId`](/volumeid)` | undefined` — The time.

<MemberHeading id="setinitialtime" depth="3" name="setInitialTime" sig="setInitialTime(time: VolumeId)" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L238" sourceLabel="geometry.js:238" />

Set the initial time.

**Parameters**

- `time` ([VolumeId](/volumeid)) — The new time: a volume id or, without source, a frame index.

<MemberHeading id="setvolumevalues" depth="3" name="setVolumeValues" sig="setVolumeValues(values: Array.<SourcedNumberValue>)" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L255" sourceLabel="geometry.js:255" />

Set the associated values of the volume ids, for example once guessed after load (see dicomVolume getVolumeValues).

**Parameters**

- `values` (Array.\<[SourcedNumberValue](/sourcednumbervalue)>) — The associated values, one per volume id, in volume id order.

**Throws**

- `Error` — If the number of values is not the number of volume ids.

<MemberHeading id="getvolumeids" depth="3" name="getVolumeIds" sig="getVolumeIds(): Array.<VolumeId> | undefined" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L280" sourceLabel="geometry.js:280" />

Get the volume ids: the time of each volume, sorted by ascending id, the array index being the volume index. Times are volume ids if their id has a source.

**Returns**

- `Array.<`[`VolumeId`](/volumeid)`> | undefined` — The volume ids, undefined if the times are not volume ids.

<MemberHeading id="setvolumeids" depth="3" name="setVolumeIds" sig="setVolumeIds(volumeIds: Array.<VolumeId>)" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L322" sourceLabel="geometry.js:322" />

Set the volume ids of a geometry without times (for example a resampled one): the volumes all have the current origins.

**Parameters**

- `volumeIds` (Array.\<[VolumeId](/volumeid)>) — The volume ids, sorted by ascending id, one per volume (fourth dimension).

<MemberHeading id="getvolumeindex" depth="3" name="getVolumeIndex" sig="getVolumeIndex(id: number): number" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L336" sourceLabel="geometry.js:336" />

Get the index of a volume id.

**Parameters**

- `id` (number) — The volume id.

**Returns**

- `number` — The volume index, -1 if not found.

<MemberHeading id="cansyncvolume" depth="3" name="canSyncVolume" sig="canSyncVolume(geometry: Geometry, value: number): boolean" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L356" sourceLabel="geometry.js:356" />

Check if the volume of this geometry can follow the one of another geometry: both volume ids have the same origin and the input volume id value is one of this geometry.

**Parameters**

- `geometry` ([Geometry](/geometry)) — The geometry to follow.
- `value` (number) — The volume id value to follow.

**Returns**

- `boolean` — True if the volume can follow.

<MemberHeading id="getcurrenttotalnumberofslices" depth="3" name="getCurrentTotalNumberOfSlices" sig="getCurrentTotalNumberOfSlices(): number" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L436" sourceLabel="geometry.js:436" />

Get the total number of slices. Can be different from what is stored in the size object during a volume with time points creation process.

**Returns**

- `number` — The total count.

<MemberHeading id="hasslicesattime" depth="3" name="hasSlicesAtTime" sig="hasSlicesAtTime(time: number): boolean" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L453" sourceLabel="geometry.js:453" />

Check if a time point has associated slices.

**Parameters**

- `time` (number) — The time id to check.

**Returns**

- `boolean` — True if slices are present.

<MemberHeading
  id="getcurrentnumberofslicesbeforetime"
  depth="3"
  name="getCurrentNumberOfSlicesBeforeTime"
  sig="getCurrentNumberOfSlicesBeforeTime(
	time: number,
): number | undefined"
/>

<MemberMeta sourceHref="/source/src/image/geometry-js/#L464" sourceLabel="geometry.js:464" />

Get the number of slices stored for time points preceding the input one.

**Parameters**

- `time` (number) — The time id to check.

**Returns**

- `number | undefined` — The count.

<MemberHeading id="checktimeorigins" depth="3" name="checkTimeOrigins" sig="checkTimeOrigins(): BooleanResult" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L486" sourceLabel="geometry.js:486" />

Check that all time points have the same origins as the initial time point (same number and same values in the same order).

**Returns**

- [`BooleanResult`](/booleanresult) — Result with success set to true if the time origins are consistent.

<MemberHeading id="getorigin" depth="3" name="getOrigin" sig="getOrigin(): Point3D" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L518" sourceLabel="geometry.js:518" />

Get the object origin. This should be the lowest origin to ease calculations (?).

**Returns**

- [`Point3D`](/point3d) — The object origin.

<MemberHeading id="getorigins" depth="3" name="getOrigins" sig="getOrigins(): Array.<Point3D>" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L527" sourceLabel="geometry.js:527" />

Get the object origins.

**Returns**

- `Array.<`[`Point3D`](/point3d)`>` — The object origins.

<MemberHeading id="sortorigins" depth="3" name="sortOrigins" sig="sortOrigins()" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L534" sourceLabel="geometry.js:534" />

Sort origins by Z position ascending.

<MemberHeading id="includesorigin" depth="3" name="includesOrigin" sig="includesOrigin(point3D: Point3D, tol?: number): boolean" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L546" sourceLabel="geometry.js:546" />

Check if a point is in the origin list.

**Parameters**

- `point3D` ([Point3D](/point3d)) — The point to check.
- `tol` (number, optional) — Optional number comparison tolerance defaults to Number.EPSILON.

**Returns**

- `boolean` — True if in list.

<MemberHeading id="getsize" depth="3" name="getSize" sig="getSize(viewOrientation?: Matrix33): Size" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L563" sourceLabel="geometry.js:563" />

Get the object size. Warning: the size comes as stored in DICOM, meaning that it could be oriented.

**Parameters**

- `viewOrientation` ([Matrix33](/matrix33), optional) — The view orientation (optional).

**Returns**

- [`Size`](/size) — The object size.

<MemberHeading id="updateslicespacing" depth="3" name="updateSliceSpacing" sig="updateSliceSpacing()" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L583" sourceLabel="geometry.js:583" />

Calculate slice spacing from origins and replace current if needed.

<MemberHeading id="getspacing" depth="3" name="getSpacing" sig="getSpacing(viewOrientation?: Matrix33): Spacing" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L607" sourceLabel="geometry.js:607" />

Get the object spacing. Warning: the spacing comes as stored in DICOM, meaning that it could be oriented.

**Parameters**

- `viewOrientation` ([Matrix33](/matrix33), optional) — The view orientation (optional).

**Returns**

- [`Spacing`](/spacing) — The object spacing.

<MemberHeading id="getrealspacing" depth="3" name="getRealSpacing" sig="getRealSpacing(): Spacing" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L628" sourceLabel="geometry.js:628" />

Get the image spacing in real world.

**Returns**

- [`Spacing`](/spacing) — The object spacing.

<MemberHeading id="getorientation" depth="3" name="getOrientation" sig="getOrientation(): Matrix33" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L640" sourceLabel="geometry.js:640" />

Get the object orientation.

**Returns**

- [`Matrix33`](/matrix33) — The object orientation.

<MemberHeading id="getsliceindex" depth="3" name="getSliceIndex" sig="getSliceIndex(origin: Point3D, time?: number): number" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L671" sourceLabel="geometry.js:671" />

Get the slice position of an origin in the current slice layout. Slice indices increase with decreasing origins (high index -> low origin), this simplified the handling of reconstruction since it means the displayed data is in the same 'direction' as the extracted data. As seen in the getOrigin method, the main origin is the lowest one. This implies that the index to world and reverse method do some flipping magic...

Limitation: the codirectional (before/after) refinement below is a strict sign check on the normal-projected residual, with no tolerance - unlike worldToIndex's magnitude-based half-spacing gate. That is safe for this method's one real caller (Image#appendSlice, which only ever compares exact, already-known slice origins - a clean, large residual, never close to zero), but this method should not be used for an arbitrary point with a large in-plane offset from its closest origin (eg a click position): float noise in that offset, amplified by a lower-precision orientation (eg gantry-tilt direction cosines with few decimal digits), can flip the sign of a residual that should be exactly zero. Use worldToIndex (or a plain Point3D#getClosest) instead for that case.

**Parameters**

- `origin` ([Point3D](/point3d)) — The origin to locate.
- `time` (number, optional) — Optional time id.

**Returns**

- `number` — The slice index.

<MemberHeading id="canappendslice" depth="3" name="canAppendSlice" sig="canAppendSlice(rhs: Geometry): BooleanResult" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L703" sourceLabel="geometry.js:703" />

Check if another geometry is compatible with this one, ie that slices with these geometries can be merged into one volume.

**Parameters**

- `rhs` ([Geometry](/geometry)) — The geometry to check.

**Returns**

- [`BooleanResult`](/booleanresult) — Result with success set to true if the geometry is compatible.

<MemberHeading id="canappendorigin" depth="3" name="canAppendOrigin" sig="canAppendOrigin(origin: Point3D, time?: number): BooleanResult" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L751" sourceLabel="geometry.js:751" />

Check if an origin can be appended to this geometry.

**Parameters**

- `origin` ([Point3D](/point3d)) — The origin to append.
- `time` (number, optional) — Optional time id.

**Returns**

- [`BooleanResult`](/booleanresult) — Result with success set to true if the origin is compatible.

<MemberHeading id="appendorigin" depth="3" name="appendOrigin" sig="appendOrigin(origin: Point3D, index: number, time?: number)" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L788" sourceLabel="geometry.js:788" />

Append an origin to the geometry.

**Parameters**

- `origin` ([Point3D](/point3d)) — The origin to append.
- `index` (number) — The index at which to append.
- `time` (number, optional) — Optional time id.

<MemberHeading id="appendframe" depth="3" name="appendFrame" sig="appendFrame(origin: Point3D, time: VolumeId)" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L816" sourceLabel="geometry.js:816" />

Append a frame to the geometry.

**Parameters**

- `origin` ([Point3D](/point3d)) — The origin to append.
- `time` ([VolumeId](/volumeid)) — The frame time: a volume id or, without source, a frame index.

<MemberHeading id="tostring" depth="3" name="toString" sig="toString(): string" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L837" sourceLabel="geometry.js:837" />

Get a string representation of the geometry.

**Returns**

- `string` — The geometry as a string.

<MemberHeading id="equals" depth="3" name="equals" sig="equals(rhs: Geometry): boolean" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L850" sourceLabel="geometry.js:850" />

Check for equality.

**Parameters**

- `rhs` ([Geometry](/geometry)) — The object to compare to.

**Returns**

- `boolean` — True if both objects are equal.

<MemberHeading id="issimilar" depth="3" name="isSimilar" sig="isSimilar(rhs: Geometry, tol?: number): boolean" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L868" sourceLabel="geometry.js:868" />

Check for similarity for origin and orientation, equality for size and spacing.

**Parameters**

- `rhs` ([Geometry](/geometry)) — The object to compare to.
- `tol` (number, optional) — Optional number comparison tolerance, defaults to Number.EPSILON.

**Returns**

- `boolean` — True if both objects are equal.

<MemberHeading id="isinbounds" depth="3" name="isInBounds" sig="isInBounds(point: Point): boolean" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L883" sourceLabel="geometry.js:883" />

Check that a point is within bounds.

**Parameters**

- `point` ([Point](/point)) — The point to check.

**Returns**

- `boolean` — True if the given coordinates are within bounds.

<MemberHeading id="isindexinbounds" depth="3" name="isIndexInBounds" sig="isIndexInBounds(index: Index, dirs?: Array.<number>): boolean" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L894" sourceLabel="geometry.js:894" />

Check that a index is within bounds.

**Parameters**

- `index` ([Index](/index)) — The index to check.
- `dirs` (Array.\<number>, optional) — Optional list of directions to check.

**Returns**

- `boolean` — True if the given coordinates are within bounds.

<MemberHeading id="getrange" depth="3" name="getRange" sig="getRange(): Array.<Point>" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L904" sourceLabel="geometry.js:904" />

Get the geometrical range, ie the minimum and maximum positions.

**Returns**

- `Array.<`[`Point`](/point)`>` — The min and max positions.

<MemberHeading id="indextoworld" depth="3" name="indexToWorld" sig="indexToWorld(index: Index): Point" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L922" sourceLabel="geometry.js:922" />

Convert an index into world coordinates.

**Parameters**

- `index` ([Index](/index)) — The index to convert.

**Returns**

- [`Point`](/point) — The corresponding point.

<MemberHeading id="pointtoworld" depth="3" name="pointToWorld" sig="pointToWorld(point: Point3D): Point3D" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L954" sourceLabel="geometry.js:954" />

Convert a 3D point into world coordinates.

**Parameters**

- `point` ([Point3D](/point3d)) — The 3D point to convert.

**Returns**

- [`Point3D`](/point3d) — The corresponding world 3D point.

<MemberHeading id="worldtoindex" depth="3" name="worldToIndex" sig="worldToIndex(point: Point): Index" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L992" sourceLabel="geometry.js:992" />

Convert world coordinates into an index.

Always returns an index, even for a point outside the geometry: this does not itself mean the point is in bounds, use isIndexInBounds/isInBounds for that. In-plane (row/column), an out-of-bounds point extrapolates freely (eg -5 or size+12). On the scroll axis, a point close to a real per-slice origin snaps to it; further away, it is pinned to just past the first/last known origin (ie the origins array length, or -1) rather than left to drift arbitrarily far via linear extrapolation - except when there are few or no real origins to compare against (eg a root geometry with only its first slice known), where it still falls back to that unclamped extrapolation.

**Parameters**

- `point` ([Point](/point)) — The point to convert.

**Returns**

- [`Index`](/index) — The corresponding index.

<MemberHeading id="worldtopoint" depth="3" name="worldToPoint" sig="worldToPoint(point: Point): Point3D" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L1068" sourceLabel="geometry.js:1068" />

Convert world coordinates into an point.

**Parameters**

- `point` ([Point](/point)) — The world point to convert.

**Returns**

- [`Point3D`](/point3d) — The corresponding point.
