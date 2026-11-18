---
title: TagInfo
kind: class
longname: TagInfo
description: "DICOM tag info: vr, multiplicity, name."
---

# TagInfo

<SourceLink href="/source/src/dicom/dicomtaginfo-js/#L10" label="dicomTagInfo.js:10" />

DICOM tag info: vr, multiplicity, name.

---

## Constructor

<Signature
  code="new TagInfo(
	vr: string,
	multiplicity: number,
	name: string,
): TagInfo"
/>

**Parameters**

- `vr` (string) — The tag Value Representation (VR).
- `multiplicity` (number) — The tag multiplicity.
- `name` (string) — The tag name.

---

## Instance Methods

<MemberHeading id="getvr" depth="3" name="getVr" sig="getVr(): string" />

<MemberMeta sourceHref="/source/src/dicom/dicomtaginfo-js/#L44" sourceLabel="dicomTagInfo.js:44" />

Get the tag Value Representation (VR).

**Returns**

- `string` — The tag vr.

<MemberHeading id="getmultiplicity" depth="3" name="getMultiplicity" sig="getMultiplicity(): number" />

<MemberMeta sourceHref="/source/src/dicom/dicomtaginfo-js/#L52" sourceLabel="dicomTagInfo.js:52" />

Get the tag multiplicity.

**Returns**

- `number` — The multiplicity.

<MemberHeading id="getname" depth="3" name="getName" sig="getName(): string" />

<MemberMeta sourceHref="/source/src/dicom/dicomtaginfo-js/#L60" sourceLabel="dicomTagInfo.js:60" />

Get the tag name.

**Returns**

- `string` — The name.
