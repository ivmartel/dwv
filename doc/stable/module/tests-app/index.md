---
title: tests/app
kind: module
longname: module:tests/app
---

# tests/app

<SourceLink href="/source/tests/app/datacontroller-test-js/#L24" label="dataController.test.js:24" />

---

## Instance Methods

<MemberHeading id="apploaddatacreationerror" depth="3" name="appLoadDataCreationError" sig="appLoadDataCreationError()" />

<MemberMeta sourceHref="/source/tests/app/application-test-js/#L27" sourceLabel="application.test.js:27" />

Tests for [App](/app) load with a data creation error.

<MemberHeading id="makedataelement" depth="3" name="makeDataElement" sig="makeDataElement(vr: string, value: Array): DataElement" />

<MemberMeta sourceHref="/source/tests/app/datacontroller-test-js/#L40" sourceLabel="dataController.test.js:40" />

Create a data element with a given VR and value.

**Parameters**

- `vr` (string) — The value representation.
- `value` (Array) — The element value.

**Returns**

- [`DataElement`](/dataelement) — The data element.

<MemberHeading
  id="makeslicedata"
  depth="3"
  name="makeSliceData"
  sig="makeSliceData(
	z: number,
	uid: string,
	meta: Record.<string, DataElement>,
): DicomData"
/>

<MemberMeta sourceHref="/source/tests/app/datacontroller-test-js/#L55" sourceLabel="dataController.test.js:55" />

Create a single slice DicomData at a given z origin with the given meta tags.

**Parameters**

- `z` (number) — The slice z origin.
- `uid` (string) — The slice image uid.
- `meta` (Record.\<string, [DataElement](/dataelement)>) — The slice meta data.

**Returns**

- [`DicomData`](/dicomdata) — The slice data.

<MemberHeading id="datacontrollerclass" depth="3" name="datacontrollerClass" sig="datacontrollerClass()" />

<MemberMeta sourceHref="/source/tests/app/datacontroller-test-js/#L79" sourceLabel="dataController.test.js:79" />

Tests for [DataController](/datacontroller).

<MemberHeading id="datacontrollermultiframemultivolume" depth="3" name="datacontrollerMultiFrameMultiVolume" sig="datacontrollerMultiFrameMultiVolume()" />

<MemberMeta sourceHref="/source/tests/app/datacontroller-test-js/#L132" sourceLabel="dataController.test.js:132" />

Tests for [DataController](/datacontroller) with multi-frame multi-volume files.

<MemberHeading id="datacontrollermultiframemultivolumeperfile" depth="3" name="datacontrollerMultiFrameMultiVolumePerFile" sig="datacontrollerMultiFrameMultiVolumePerFile()" />

<MemberMeta sourceHref="/source/tests/app/datacontroller-test-js/#L196" sourceLabel="dataController.test.js:196" />

Tests for [DataController](/datacontroller) with multi-frame files that each contain multiple volumes.

<MemberHeading id="dicomslicedatalistbuilddata" depth="3" name="dicomSliceDataListBuildData" sig="dicomSliceDataListBuildData()" />

<MemberMeta sourceHref="/source/tests/app/datacontroller-test-js/#L278" sourceLabel="dataController.test.js:278" />

Tests for [DicomSliceDataList#buildData](/dicomslicedatalist#builddata).

<MemberHeading id="makeannotation" depth="3" name="makeAnnotation" sig="makeAnnotation(uid: string): object" />

<MemberMeta sourceHref="/source/tests/app/drawcontroller-test-js/#L21" sourceLabel="drawController.test.js:21" />

Build a minimal annotation-like stub with a given tracking UID.

**Parameters**

- `uid` (string) — The tracking UID.

**Returns**

- `object` — Annotation stub.

<MemberHeading id="recordevents" depth="3" name="recordEvents" sig="recordEvents(group: AnnotationGroup): Array" />

<MemberMeta sourceHref="/source/tests/app/drawcontroller-test-js/#L38" sourceLabel="drawController.test.js:38" />

Listen to the annotation events of a group.

**Parameters**

- `group` ([AnnotationGroup](/annotationgroup)) — The annotation group.

**Returns**

- `Array` — The list of received {type, detail}, filled on the go.

<MemberHeading id="recordevents" depth="3" name="recordEvents" sig="recordEvents(controller: LoadController): Array" />

<MemberMeta sourceHref="/source/tests/app/loadcontroller-test-js/#L91" sourceLabel="loadController.test.js:91" />

Listen to all load events of a controller.

**Parameters**

- `controller` ([LoadController](/loadcontroller)) — The controller.

**Returns**

- `Array` — The list of received {type, detail}, filled on the go.

<MemberHeading id="lastloader" depth="3" name="lastLoader" sig="lastLoader(): MockLoader" />

<MemberMeta sourceHref="/source/tests/app/loadcontroller-test-js/#L109" sourceLabel="loadController.test.js:109" />

Get the last created mock loader.

**Returns**

- `MockLoader` — The loader.

<MemberHeading id="touchevent" depth="3" name="touchEvent" sig="touchEvent(type: string, nTargetTouches?: number): Event" />

<MemberMeta sourceHref="/source/tests/app/toolboxcontroller-test-js/#L152" sourceLabel="toolboxController.test.js:152" />

Create a touch-like event.

**Parameters**

- `type` (string) — The event type.
- `nTargetTouches` (number, optional, default: 0) — The number of touches still on the event target.

**Returns**

- `Event` — The event.

<MemberHeading id="makecontroller" depth="3" name="makeController" sig="makeController(rootDocument?: EventTarget): object" />

<MemberMeta sourceHref="/source/tests/app/toolboxcontroller-test-js/#L166" sourceLabel="toolboxController.test.js:166" />

Create a controller with two test tools.

**Parameters**

- `rootDocument` (EventTarget, optional) — Optional root document.

**Returns**

- `object` — The controller and its tools.

<MemberHeading id="recordevents" depth="3" name="recordEvents" sig="recordEvents(controller: UndoController): Array" />

<MemberMeta sourceHref="/source/tests/app/undocontroller-test-js/#L56" sourceLabel="undoController.test.js:56" />

Listen to all undo events of a controller.

**Parameters**

- `controller` ([UndoController](/undocontroller)) — The controller.

**Returns**

- `Array` — The list of received {type, detail}, filled on the go.

## Other

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/tests/app/datacontroller-test-js/#L27" sourceLabel="dataController.test.js:27" />

Related DICOM tag keys.

<MemberHeading id="testtool" depth="3" name="TestTool" sig="TestTool" />

<MemberMeta sourceHref="/source/tests/app/toolboxcontroller-test-js/#L13" sourceLabel="toolboxController.test.js:13" />

Test tool that records its calls.

<MemberHeading id="testlayer" depth="3" name="TestLayer" sig="TestLayer" />

<MemberMeta sourceHref="/source/tests/app/toolboxcontroller-test-js/#L59" sourceLabel="toolboxController.test.js:59" />

Test layer: an event target with interaction bind counters.

**Parameters**

- `id` (string) — The layer id.

<MemberHeading id="testelement" depth="3" name="TestElement" sig="TestElement" />

<MemberMeta sourceHref="/source/tests/app/toolboxcontroller-test-js/#L99" sourceLabel="toolboxController.test.js:99" />

Test element: an event target with a tag name.

**Parameters**

- `tagName` (string) — The tag name.

<MemberHeading id="testlayergroup" depth="3" name="TestLayerGroup" sig="TestLayerGroup" />

<MemberMeta sourceHref="/source/tests/app/toolboxcontroller-test-js/#L114" sourceLabel="toolboxController.test.js:114" />

Test layer group: an event target with a div id.

**Parameters**

- `divId` (string) — The div id.

<MemberHeading id="testcommand" depth="3" name="TestCommand" sig="TestCommand" />

<MemberMeta sourceHref="/source/tests/app/undocontroller-test-js/#L15" sourceLabel="undoController.test.js:15" />

Test command that records its execute/undo calls.

**Parameters**

- `name` (string) — The command name.
