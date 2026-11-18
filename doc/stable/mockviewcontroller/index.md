---
title: MockViewController
kind: class
longname: MockViewController
description: Minimal ViewController mock for annotation tests. All methods return safe defaults; individual tests override as needed.
---

# MockViewController

<SourceLink href="/source/tests/image/annotation-test-js/#L21" label="annotation.test.js:21" />

Minimal ViewController mock for annotation tests. All methods return safe defaults; individual tests override as needed.

---

## Constructor

<Signature code="new MockViewController(opts: object): MockViewController" />

**Parameters**

- `opts` (object) — Configuration options.
  - `opts.uid` (string) — Image SOP instance UID.
  - `opts.modality` (string, optional) — Modality string (default 'CT').
  - `opts.acquisitionOrientation` (boolean, optional) — Acquisition orientation flag.
  - `opts.planeHelper` (object, optional) — Plane helper mock.

---

## Instance Methods

<MemberHeading id="getcurrentposition" depth="3" name="getCurrentPosition" sig="getCurrentPosition(): Object" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L48" sourceLabel="annotation.test.js:48" />

**Returns**

- `Object` — Position-like object.

<MemberHeading id="getcurrentimageuid" depth="3" name="getCurrentImageUid" sig="getCurrentImageUid(): string" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L53" sourceLabel="annotation.test.js:53" />

**Returns**

- `string` — The SOP instance UID.

<MemberHeading id="getsopclassuid" depth="3" name="getSopClassUid" sig="getSopClassUid(): string" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L58" sourceLabel="annotation.test.js:58" />

**Returns**

- `string` — SOP class UID.

<MemberHeading id="getoriginforimageuid" depth="3" name="getOriginForImageUid" sig="getOriginForImageUid(_uid: string): Point3D" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L66" sourceLabel="annotation.test.js:66" />

**Parameters**

- `_uid` (string) — The UID to look up.

**Returns**

- [`Point3D`](/point3d) — The plane origin.

<MemberHeading id="isaquisitionorientation" depth="3" name="isAquisitionOrientation" sig="isAquisitionOrientation(): boolean" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L71" sourceLabel="annotation.test.js:71" />

**Returns**

- `boolean` — Whether in acquisition orientation.

<MemberHeading id="getplanepoints" depth="3" name="getPlanePoints" sig="getPlanePoints(_position: object): Array.<Point3D>" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L79" sourceLabel="annotation.test.js:79" />

**Parameters**

- `_position` (object) — Current position.

**Returns**

- `Array.<`[`Point3D`](/point3d)`>` — Plane points.

<MemberHeading id="includesimageuid" depth="3" name="includesImageUid" sig="includesImageUid(uid: string): boolean" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L91" sourceLabel="annotation.test.js:91" />

**Parameters**

- `uid` (string) — UID to check.

**Returns**

- `boolean` — True if this controller owns that UID.

<MemberHeading id="getplanehelper" depth="3" name="getPlaneHelper" sig="getPlaneHelper(): object" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L96" sourceLabel="annotation.test.js:96" />

**Returns**

- `object` — The plane helper.

<MemberHeading id="getmodality" depth="3" name="getModality" sig="getModality(): string" />

<MemberMeta sourceHref="/source/tests/image/annotation-test-js/#L101" sourceLabel="annotation.test.js:101" />

**Returns**

- `string` — The modality.
