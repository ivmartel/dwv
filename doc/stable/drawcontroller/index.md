---
title: DrawController
kind: class
longname: DrawController
description: Draw controller.
---

# DrawController

<SourceLink href="/source/src/app/drawcontroller-js/#L15" label="drawController.js:15" />

Draw controller.

---

## Constructor

<Signature code="new DrawController(group?: AnnotationGroup): DrawController" />

**Parameters**

- `group` ([AnnotationGroup](/annotationgroup), optional) — Optional annotation group.

---

## Instance Methods

<MemberHeading id="getannotation" depth="3" name="getAnnotation" sig="getAnnotation(uid: string): Annotation | undefined" />

<MemberMeta sourceHref="/source/src/app/drawcontroller-js/#L30" sourceLabel="drawController.js:30" />

Get an annotation.

**Parameters**

- `uid` (string) — The annotation UID.

**Returns**

- [`Annotation`](/annotation)` | undefined` — The annotation.

<MemberHeading id="getannotationgroup" depth="3" name="getAnnotationGroup" sig="getAnnotationGroup(): AnnotationGroup" />

<MemberMeta sourceHref="/source/src/app/drawcontroller-js/#L39" sourceLabel="drawController.js:39" />

Get the annotation group.

**Returns**

- [`AnnotationGroup`](/annotationgroup) — The list.

<MemberHeading id="isannotationgroupeditable" depth="3" name="isAnnotationGroupEditable" sig="isAnnotationGroupEditable(): boolean" />

<MemberMeta sourceHref="/source/src/app/drawcontroller-js/#L48" sourceLabel="drawController.js:48" />

Check if the annotation group is editable.

**Returns**

- `boolean` — True if editable.

<MemberHeading id="setannotationgroupeditable" depth="3" name="setAnnotationGroupEditable" sig="setAnnotationGroupEditable(flag: boolean)" />

<MemberMeta sourceHref="/source/src/app/drawcontroller-js/#L57" sourceLabel="drawController.js:57" />

Set the annotation group editability.

**Parameters**

- `flag` (boolean) — True to make the annotation group editable.

<MemberHeading id="addannotation" depth="3" name="addAnnotation" sig="addAnnotation(annotation: Annotation)" />

<MemberMeta sourceHref="/source/src/app/drawcontroller-js/#L66" sourceLabel="drawController.js:66" />

Add an annotation.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation to add.

<MemberHeading
  id="updateannotation"
  depth="3"
  name="updateAnnotation"
  sig="updateAnnotation(
	annotation: Annotation,
	propKeys?: Array.<string>,
	propagate?: boolean,
)"
/>

<MemberMeta sourceHref="/source/src/app/drawcontroller-js/#L78" sourceLabel="drawController.js:78" />

Update an anotation from the list.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation to update.
- `propKeys` (Array.\<string>, optional) — Optional properties that got updated.
- `propagate` (boolean, optional) — Whether the update event propagates outside of dwv or not, defaults to true.

<MemberHeading id="removeannotation" depth="3" name="removeAnnotation" sig="removeAnnotation(uid: string)" />

<MemberMeta sourceHref="/source/src/app/drawcontroller-js/#L87" sourceLabel="drawController.js:87" />

Remove an anotation for the list.

**Parameters**

- `uid` (string) — The UID of the annotation to remove.

<MemberHeading id="removeannotationwithcommand" depth="3" name="removeAnnotationWithCommand" sig="removeAnnotationWithCommand(uid: string, exeCallback: function)" />

<MemberMeta sourceHref="/source/src/app/drawcontroller-js/#L97" sourceLabel="drawController.js:97" />

Remove an annotation via a remove command (triggers draw actions).

**Parameters**

- `uid` (string) — The annotation UID.
- `exeCallback` (function) — The undo stack callback.

<MemberHeading
  id="updateannotationwithcommand"
  depth="3"
  name="updateAnnotationWithCommand"
  sig="updateAnnotationWithCommand(
	uid: string,
	originalProps: object,
	newProps: object,
	exeCallback: function,
)"
/>

<MemberMeta sourceHref="/source/src/app/drawcontroller-js/#L122" sourceLabel="drawController.js:122" />

Update an annotation via an update command (triggers draw actions).

**Parameters**

- `uid` (string) — The annotation UID.
- `originalProps` (object) — The original annotation properties that will be updated.
- `newProps` (object) — The new annotation properties that will replace the original ones.
- `exeCallback` (function) — The undo stack callback.

<MemberHeading id="removeallannotationswithcommand" depth="3" name="removeAllAnnotationsWithCommand" sig="removeAllAnnotationsWithCommand(exeCallback: function)" />

<MemberMeta sourceHref="/source/src/app/drawcontroller-js/#L143" sourceLabel="drawController.js:143" />

Remove all annotations via remove commands (triggers draw actions).

**Parameters**

- `exeCallback` (function) — The undo stack callback.

<MemberHeading id="hasannotationmeta" depth="3" name="hasAnnotationMeta" sig="hasAnnotationMeta(key: string): boolean" />

<MemberMeta sourceHref="/source/src/app/drawcontroller-js/#L166" sourceLabel="drawController.js:166" />

Check if the annotation group contains a meta data value.

**Parameters**

- `key` (string) — The key to check.

**Returns**

- `boolean` — True if the meta data is present.

<MemberHeading id="setannotationmeta" depth="3" name="setAnnotationMeta" sig="setAnnotationMeta(key: string, value: string)" />

<MemberMeta sourceHref="/source/src/app/drawcontroller-js/#L176" sourceLabel="drawController.js:176" />

Set an annotation meta data.

**Parameters**

- `key` (string) — The meta data to set.
- `value` (string) — The value of the meta data.
