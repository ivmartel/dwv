---
title: AnnotationGroup
kind: class
longname: AnnotationGroup
description: Annotation group.
---

# AnnotationGroup

<SourceLink href="/source/src/image/annotationgroup-js/#L23" label="annotationGroup.js:23" />

Annotation group.

---

## Constructor

<Signature code="new AnnotationGroup(list?: Array.<Annotation>): AnnotationGroup" />

**Parameters**

- `list` (Array.\<[Annotation](/annotation)>, optional) — Optional list, will create new if not provided.

---

## Instance Methods

<MemberHeading id="getlist" depth="3" name="getList" sig="getList(): Array.<Annotation>" />

<MemberMeta sourceHref="/source/src/image/annotationgroup-js/#L70" sourceLabel="annotationGroup.js:70" />

Get the annotation group as an array.

**Returns**

- `Array.<`[`Annotation`](/annotation)`>` — The array.

<MemberHeading id="getlength" depth="3" name="getLength" sig="getLength(): number" />

<MemberMeta sourceHref="/source/src/image/annotationgroup-js/#L79" sourceLabel="annotationGroup.js:79" />

Get the number of annotations of this list.

**Returns**

- `number` — The number of annotations.

<MemberHeading id="iseditable" depth="3" name="isEditable" sig="isEditable(): boolean" />

<MemberMeta sourceHref="/source/src/image/annotationgroup-js/#L88" sourceLabel="annotationGroup.js:88" />

Check if the annotation group is editable.

**Returns**

- `boolean` — True if editable.

<MemberHeading id="seteditable" depth="3" name="setEditable" sig="setEditable(flag: boolean)" />

<MemberMeta sourceHref="/source/src/image/annotationgroup-js/#L97" sourceLabel="annotationGroup.js:97" />

Set the annotation group editability.

**Parameters**

- `flag` (boolean) — True to make the annotation group editable.

<MemberHeading id="getcolour" depth="3" name="getColour" sig="getColour(): string" />

<MemberMeta sourceHref="/source/src/image/annotationgroup-js/#L117" sourceLabel="annotationGroup.js:117" />

Get the group colour.

**Returns**

- `string` — The colour as hex string.

<MemberHeading id="setcolour" depth="3" name="setColour" sig="setColour(colour: string)" />

<MemberMeta sourceHref="/source/src/image/annotationgroup-js/#L126" sourceLabel="annotationGroup.js:126" />

Set the group colour.

**Parameters**

- `colour` (string) — The colour as hex string.

<MemberHeading id="add" depth="3" name="add" sig="add(annotation: Annotation, propagate?: boolean)" />

<MemberMeta sourceHref="/source/src/image/annotationgroup-js/#L137" sourceLabel="annotationGroup.js:137" />

Add a new annotation.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation to add.
- `propagate` (boolean, optional) — Whether the event propagates outside of dwv or not, defaults to true.

<MemberHeading
  id="update"
  depth="3"
  name="update"
  sig="update(
	annotation: Annotation,
	propKeys?: Array.<string>,
	propagate?: boolean,
)"
/>

<MemberMeta sourceHref="/source/src/image/annotationgroup-js/#L160" sourceLabel="annotationGroup.js:160" />

Update an existing annotation.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation to update.
- `propKeys` (Array.\<string>, optional) — Optional properties that got updated.
- `propagate` (boolean, optional) — Whether the event propagates outside of dwv or not, defaults to true.

<MemberHeading id="remove" depth="3" name="remove" sig="remove(uid: string, propagate?: boolean)" />

<MemberMeta sourceHref="/source/src/image/annotationgroup-js/#L195" sourceLabel="annotationGroup.js:195" />

Remove an annotation.

**Parameters**

- `uid` (string) — The UID of the annotation to remove.
- `propagate` (boolean, optional) — Whether the event propagates outside of dwv or not, defaults to true.

<MemberHeading id="setviewcontroller" depth="3" name="setViewController" sig="setViewController(viewController: ViewController)" />

<MemberMeta sourceHref="/source/src/image/annotationgroup-js/#L221" sourceLabel="annotationGroup.js:221" />

Set the associated view controller.

**Parameters**

- `viewController` ([ViewController](/viewcontroller)) — The associated view controller.

<MemberHeading id="find" depth="3" name="find" sig="find(uid: string): Annotation | undefined" />

<MemberMeta sourceHref="/source/src/image/annotationgroup-js/#L234" sourceLabel="annotationGroup.js:234" />

Find an annotation.

**Parameters**

- `uid` (string) — The UID of the annotation to find.

**Returns**

- [`Annotation`](/annotation)` | undefined` — The found annotation.

<MemberHeading id="getmeta" depth="3" name="getMeta" sig="getMeta(): Record.<string, any>" />

<MemberMeta sourceHref="/source/src/image/annotationgroup-js/#L243" sourceLabel="annotationGroup.js:243" />

Get the meta data.

**Returns**

- `Record.<string, any>` — The meta data.

<MemberHeading id="hasmeta" depth="3" name="hasMeta" sig="hasMeta(key: string): boolean" />

<MemberMeta sourceHref="/source/src/image/annotationgroup-js/#L253" sourceLabel="annotationGroup.js:253" />

Check if this list contains a meta data value.

**Parameters**

- `key` (string) — The key to check.

**Returns**

- `boolean` — True if the meta data is present.

<MemberHeading id="getmetavalue" depth="3" name="getMetaValue" sig="getMetaValue(key: string): string | object | undefined" />

<MemberMeta sourceHref="/source/src/image/annotationgroup-js/#L263" sourceLabel="annotationGroup.js:263" />

Get a meta data value.

**Parameters**

- `key` (string) — The meta data key.

**Returns**

- `string | object | undefined` — The meta data value.

<MemberHeading id="setmetavalue" depth="3" name="setMetaValue" sig="setMetaValue(key: string, value: string | object)" />

<MemberMeta sourceHref="/source/src/image/annotationgroup-js/#L273" sourceLabel="annotationGroup.js:273" />

Set a meta data.

**Parameters**

- `key` (string) — The meta data key.
- `value` (string | object) — The value of the meta data.

## Events

<MemberHeading id="annotationgroupeditablechange" depth="3" name="annotationgroupeditablechange" sig="annotationgroupeditablechange: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/image/annotationgroup-js/#L107" sourceLabel="annotationGroup.js:107" />

Annotation group editable flag change event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.data` (boolean) — The value of the editable flag.

<MemberHeading id="annotationadd" depth="3" name="annotationadd" sig="annotationadd: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/image/annotationgroup-js/#L147" sourceLabel="annotationGroup.js:147" />

Annotation add event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.data` ([Annotation](/annotation)) — The added annotation.

<MemberHeading id="annotationupdate" depth="3" name="annotationupdate" sig="annotationupdate: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/image/annotationgroup-js/#L180" sourceLabel="annotationGroup.js:180" />

Annotation update event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.data` ([Annotation](/annotation)) — The updated annotation.
  - `detail.keys` (Array.\<string>) — The properties that were updated.

<MemberHeading id="annotationremove" depth="3" name="annotationremove" sig="annotationremove: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/image/annotationgroup-js/#L208" sourceLabel="annotationGroup.js:208" />

Annotation remove event.

**Properties**

- `detail` (object) — The event detail.
  - `detail.data` ([Annotation](/annotation)) — The removed annotation.
