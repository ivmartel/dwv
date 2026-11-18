---
title: Tag
kind: class
longname: Tag
description: Immutable tag.
---

# Tag

<SourceLink href="/source/src/dicom/dicomtag-js/#L8" label="dicomTag.js:8" />

Immutable tag.

---

## Constructor

<Signature code="new Tag(group: string, element: string): Tag" />

**Parameters**

- `group` (string) — The tag group as '####'.
- `element` (string) — The tag element as '####'.

---

## Instance Methods

<MemberHeading id="getgroup" depth="3" name="getGroup" sig="getGroup(): string" />

<MemberMeta sourceHref="/source/src/dicom/dicomtag-js/#L50" sourceLabel="dicomTag.js:50" />

Get the tag group.

**Returns**

- `string` — The tag group.

<MemberHeading id="getelement" depth="3" name="getElement" sig="getElement(): string" />

<MemberMeta sourceHref="/source/src/dicom/dicomtag-js/#L59" sourceLabel="dicomTag.js:59" />

Get the tag element.

**Returns**

- `string` — The tag element.

<MemberHeading id="tostring" depth="3" name="toString" sig="toString(): string" />

<MemberMeta sourceHref="/source/src/dicom/dicomtag-js/#L68" sourceLabel="dicomTag.js:68" />

Get as string representation of the tag: '(group,element)'.

**Returns**

- `string` — A string representing the tag.

<MemberHeading id="equals" depth="3" name="equals" sig="equals(rhs: Tag): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomtag-js/#L78" sourceLabel="dicomTag.js:78" />

Check for Tag equality.

**Parameters**

- `rhs` ([Tag](/tag)) — The other tag to compare to.

**Returns**

- `boolean` — True if both tags are equal.

<MemberHeading id="getkey" depth="3" name="getKey" sig="getKey(): string" />

<MemberMeta sourceHref="/source/src/dicom/dicomtag-js/#L90" sourceLabel="dicomTag.js:90" />

Get the group-element key used to store DICOM elements.

**Returns**

- `string` — The key as '########'.

<MemberHeading id="iswithvr" depth="3" name="isWithVR" sig="isWithVR(): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomtag-js/#L101" sourceLabel="dicomTag.js:101" />

Does this tag have a VR. Basically not the Item, ItemDelimitationItem nor SequenceDelimitationItem tags.

**Returns**

- `boolean` — True if this tag has a VR.

<MemberHeading id="isprivate" depth="3" name="isPrivate" sig="isPrivate(): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomtag-js/#L117" sourceLabel="dicomTag.js:117" />

Is the tag group a private tag group ?

See: [http://dicom.nema.org/medical/dicom/2024a/output/html/part05.html#sect\_7.8](http://dicom.nema.org/medical/dicom/2024a/output/html/part05.html#sect_7.8).

**Returns**

- `boolean` — True if the tag group is private, ie if its group is an odd number.
