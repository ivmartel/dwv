---
title: Globals
kind: global
longname: Globals
---

# Globals

---

## Instance Methods

<MemberHeading
  id="mergemeta"
  depth="3"
  name="mergeMeta"
  sig="mergeMeta(
	meta0: Record.<string, DataElement>,
	meta1: Record.<string, DataElement>,
	secondIdGetter?: function,
): Record.<string, DataElement>"
/>

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L65" sourceLabel="dataController.js:65" />

Merge meta datas.

**Parameters**

- `meta0` (Record.\<string, [DataElement](/dataelement)>) — The first data to merge.
- `meta1` (Record.\<string, [DataElement](/dataelement)>) — The second data to merge.
- `secondIdGetter` (function, optional) — Function `(meta) => number|undefined` called on each raw (not yet merged) meta to get its second id, added as a suffix to disambiguate metas that would otherwise share the same base id.

**Returns**

- `Record.<string, `[`DataElement`](/dataelement)`>` — The merged data.

<MemberHeading id="iseditable" depth="3" name="isEditable" sig="isEditable(target: EventTarget | null): boolean" />

<MemberMeta sourceHref="/source/src/app/toolboxcontroller-js/#L16" sourceLabel="toolboxController.js:16" />

Check if an event target is an editable element (input, select, text area or content editable): keys typed in it are not shortcuts.

**Parameters**

- `target` (EventTarget | null) — The event target.

**Returns**

- `boolean` — True if editable.

<MemberHeading id="hasvalue" depth="3" name="hasValue" sig="hasValue(element: DataElement): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dataelement-js/#L86" sourceLabel="dataElement.js:86" />

Check an input data element, returns true if:

- the element is not undefined,
- the elements' value is not undefined,
- the elements' value has content.

**Parameters**

- `element` ([DataElement](/dataelement)) — The data element.

**Returns**

- `boolean` — True if there is a value.

<MemberHeading
  id="safeget"
  depth="3"
  name="safeGet"
  sig="safeGet(
	dataElements: Record.<string, DataElement>,
	key: string,
): any | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dataelement-js/#L99" sourceLabel="dataElement.js:99" />

Safely get an elements' first value from a list of elements.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — A list of data elements.
- `key` (string) — The tag key as for example '00100020'.

**Returns**

- `any | undefined` — The elements' value or undefined.

<MemberHeading
  id="safegetall"
  depth="3"
  name="safeGetAll"
  sig="safeGetAll(
	dataElements: Record.<string, DataElement>,
	key: string,
): Array.<any> | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dataelement-js/#L114" sourceLabel="dataElement.js:114" />

Safely get all of an elements' values from a list of elements.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — A list of data elements.
- `key` (string) — The tag key as for example '00100020'.

**Returns**

- `Array.<any> | undefined` — The elements' values or undefined.

<MemberHeading
  id="checkdataelement"
  depth="3"
  name="checkDataElement"
  sig="checkDataElement(
	element: DataElement,
	name: string,
	values?: Array,
): string"
/>

<MemberMeta sourceHref="/source/src/dicom/dataelement-js/#L134" sourceLabel="dataElement.js:134" />

Check a DICOM data element: checks

- if the element is not undefined,
- if the elements' value is not undefined,
- if the elements' value is not empty,
- (optional) if the elements' values have specific values.

**Parameters**

- `element` ([DataElement](/dataelement)) — The element to check.
- `name` (string) — The element name.
- `values` (Array, optional) — Optional list of expected values.

**Returns**

- `string` — A warning if the element is not as expected.

<MemberHeading id="isnativelittleendian" depth="3" name="isNativeLittleEndian" sig="isNativeLittleEndian(): boolean" />

<MemberMeta sourceHref="/source/src/dicom/datareader-js/#L6" sourceLabel="dataReader.js:6" />

Is the Native endianness Little Endian.

**Returns**

- `boolean` — True if little endian.

<MemberHeading id="fliparrayendianness" depth="3" name="flipArrayEndianness" sig="flipArrayEndianness(array: object)" />

<MemberMeta sourceHref="/source/src/dicom/datareader-js/#L16" sourceLabel="dataReader.js:16" />

Flip an array's endianness. Inspired from [DataStream.js](https://github.com/kig/DataStream.js).

**Parameters**

- `array` (object) — The array to flip (modified).

<MemberHeading id="isequalcode" depth="3" name="isEqualCode" sig="isEqualCode(code1: DicomCode, code2: DicomCode): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomcode-js/#L81" sourceLabel="dicomCode.js:81" />

Check if two code objects are equal: just checks schemeDesignator and value.

**Parameters**

- `code1` ([DicomCode](/dicomcode)) — The first code.
- `code2` ([DicomCode](/dicomcode)) — The second code.

**Returns**

- `boolean` — True if both codes are equal.

<MemberHeading id="getcode" depth="3" name="getCode" sig="getCode(dataElements: Record.<string, DataElement>): DicomCode" />

<MemberMeta sourceHref="/source/src/dicom/dicomcode-js/#L94" sourceLabel="dicomCode.js:94" />

Get a code object from a dicom element.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The dicom element.

**Returns**

- [`DicomCode`](/dicomcode) — A code object.

<MemberHeading id="getdicomcodeitem" depth="3" name="getDicomCodeItem" sig="getDicomCodeItem(code: DicomCode): SimpleTagValues" />

<MemberMeta sourceHref="/source/src/dicom/dicomcode-js/#L130" sourceLabel="dicomCode.js:130" />

Get a simple dicom element item from a code object.

**Parameters**

- `code` ([DicomCode](/dicomcode)) — The code object.

**Returns**

- [`SimpleTagValues`](/simpletagvalues) — The item as a list of (key, value) pairs.

<MemberHeading id="getdcmdicomcode" depth="3" name="getDcmDicomCode" sig="getDcmDicomCode(code: object): DicomCode" />

<MemberMeta sourceHref="/source/src/dicom/dicomcode-js/#L300" sourceLabel="dicomCode.js:300" />

Get a DICOM code from a value and meaning.

**Parameters**

- `code` (object) — The code value as {value, meaning}.

**Returns**

- [`DicomCode`](/dicomcode) — The DICOM code.

<MemberHeading
  id="getdicomcode"
  depth="3"
  name="getDicomCode"
  sig="getDicomCode(
	value: string,
	scheme: string,
): DicomCode | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomcode-js/#L314" sourceLabel="dicomCode.js:314" />

Get a DICOM code from a value (\~id).

**Parameters**

- `value` (string) — The code value.
- `scheme` (string) — The scheme designator.

**Returns**

- [`DicomCode`](/dicomcode)` | undefined` — The DICOM code.

<MemberHeading id="getsegmentationcode" depth="3" name="getSegmentationCode" sig="getSegmentationCode(): DicomCode" />

<MemberMeta sourceHref="/source/src/dicom/dicomcode-js/#L334" sourceLabel="dicomCode.js:334" />

Get a segmentation DICOM code.

**Returns**

- [`DicomCode`](/dicomcode) — The code.

<MemberHeading id="getcolourcode" depth="3" name="getColourCode" sig="getColourCode(): DicomCode" />

<MemberMeta sourceHref="/source/src/dicom/dicomcode-js/#L343" sourceLabel="dicomCode.js:343" />

Get a colour DICOM code.

**Returns**

- [`DicomCode`](/dicomcode) — The code.

<MemberHeading id="getconceptnamecode" depth="3" name="getConceptNameCode" sig="getConceptNameCode(name: string): DicomCode | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomcode-js/#L375" sourceLabel="dicomCode.js:375" />

Get a concept name DICOM code.

**Parameters**

- `name` (string) — The measurment name as defined in a quantification object.

**Returns**

- [`DicomCode`](/dicomcode)` | undefined` — The code.

<MemberHeading id="getquantificationname" depth="3" name="getQuantificationName" sig="getQuantificationName(code: DicomCode): string | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomcode-js/#L397" sourceLabel="dicomCode.js:397" />

Get the DICOM code for a quantification name.

**Parameters**

- `code` ([DicomCode](/dicomcode)) — The Dicom code.

**Returns**

- `string | undefined` — The quantification name.

<MemberHeading id="getmeasurementunitscode" depth="3" name="getMeasurementUnitsCode" sig="getMeasurementUnitsCode(name: string): DicomCode | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomcode-js/#L457" sourceLabel="dicomCode.js:457" />

Get a measurement units DICOM code.

**Parameters**

- `name` (string) — The unit name as defined in a quantification object.

**Returns**

- [`DicomCode`](/dicomcode)` | undefined` — The code.

<MemberHeading id="getquantificationunit" depth="3" name="getQuantificationUnit" sig="getQuantificationUnit(code: DicomCode): string" />

<MemberMeta sourceHref="/source/src/dicom/dicomcode-js/#L475" sourceLabel="dicomCode.js:475" />

Get a quantification unit name.

**Parameters**

- `code` ([DicomCode](/dicomcode)) — The code to get the unit from.

**Returns**

- `string` — The quantification unit.

<MemberHeading id="getdateobj" depth="3" name="getDateObj" sig="getDateObj(element: DataElement): DateObj | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomdate-js/#L30" sourceLabel="dicomDate.js:30" />

Get a 'date' object with {year, monthIndex, day} ready for the Date constructor from a DICOM element with vr=DA.

**Parameters**

- `element` ([DataElement](/dataelement)) — The DICOM element with date information.

**Returns**

- [`DateObj`](/dateobj)` | undefined` — The 'date' object.

<MemberHeading id="gettimeobj" depth="3" name="getTimeObj" sig="getTimeObj(element: DataElement): TimeObj | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomdate-js/#L61" sourceLabel="dicomDate.js:61" />

Get a time object with {hours, minutes, seconds} ready for the Date constructor from a DICOM element with vr=TM.

**Parameters**

- `element` ([DataElement](/dataelement)) — The DICOM element with date information.

**Returns**

- [`TimeObj`](/timeobj)` | undefined` — The time object.

<MemberHeading id="gettimeinseconds" depth="3" name="getTimeInSeconds" sig="getTimeInSeconds(element: DataElement): number | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomdate-js/#L106" sourceLabel="dicomDate.js:106" />

Get the number of seconds since midnight from a DICOM element with vr=TM.

**Parameters**

- `element` ([DataElement](/dataelement)) — The DICOM element with time information.

**Returns**

- `number | undefined` — The number of seconds, or undefined if the element is absent or not a valid time.

<MemberHeading id="getdate" depth="3" name="getDate" sig="getDate(dateObj: DateObj, timeObj?: TimeObj): Date | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomdate-js/#L125" sourceLabel="dicomDate.js:125" />

Get a javascript Date object from objects with date information.

**Parameters**

- `dateObj` ([DateObj](/dateobj)) — The date object.
- `timeObj` ([TimeObj](/timeobj), optional) — Optional time object.

**Returns**

- `Date | undefined` — The full date.

<MemberHeading id="getdatetimeobj" depth="3" name="getDateTimeObj" sig="getDateTimeObj(element: DataElement): Object | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomdate-js/#L166" sourceLabel="dicomDate.js:166" />

Get a 'dateTime' object with {date, time} ready for the Date constructor from a DICOM element with vr=DT.

**Parameters**

- `element` ([DataElement](/dataelement)) — The DICOM element with date-time information.

**Returns**

- `Object | undefined` — The time object.

<MemberHeading id="datetodateobj" depth="3" name="dateToDateObj" sig="dateToDateObj(date: Date): DateObj | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomdate-js/#L196" sourceLabel="dicomDate.js:196" />

Extract date values from a Date object.

**Parameters**

- `date` (Date) — The input date.

**Returns**

- [`DateObj`](/dateobj)` | undefined` — A 'date' object.

<MemberHeading id="datetotimeobj" depth="3" name="dateToTimeObj" sig="dateToTimeObj(date: Date): TimeObj | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomdate-js/#L214" sourceLabel="dicomDate.js:214" />

Extract time values from a Date object.

**Parameters**

- `date` (Date) — The input date.

**Returns**

- [`TimeObj`](/timeobj)` | undefined` — A 'time' object.

<MemberHeading id="getdicomdate" depth="3" name="getDicomDate" sig="getDicomDate(dateObj: DateObj): string | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomdate-js/#L233" sourceLabel="dicomDate.js:233" />

Get a DICOM formated date string 'YYYYMMDD'.

**Parameters**

- `dateObj` ([DateObj](/dateobj)) — The date to format.

**Returns**

- `string | undefined` — The formated date.

<MemberHeading id="getdicomtime" depth="3" name="getDicomTime" sig="getDicomTime(dateObj: TimeObj): string | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomdate-js/#L252" sourceLabel="dicomDate.js:252" />

Get a DICOM formated time string as 'HHMMSS'.

**Parameters**

- `dateObj` ([TimeObj](/timeobj)) — The date object to format.

**Returns**

- `string | undefined` — The formated time.

<MemberHeading id="getdicomdatetime" depth="3" name="getDicomDateTime" sig="getDicomDateTime(datetime: Object): string | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomdate-js/#L271" sourceLabel="dicomDate.js:271" />

Get a DICOM formated datetime string.

**Parameters**

- `datetime` (Object) — The datetime to format.

**Returns**

- `string | undefined` — The formated datetime.

<MemberHeading id="getfilelistfromdicomdir" depth="3" name="getFileListFromDicomDir" sig="getFileListFromDicomDir(data: object): Array | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomdir-js/#L35" sourceLabel="dicomDir.js:35" />

Get the file list from a DICOMDIR.

**Parameters**

- `data` (object) — The buffer data of the DICOMDIR.

**Returns**

- `Array | undefined` — The file list as an array ordered by STUDY > SERIES > IMAGES.

<MemberHeading
  id="getdicomdirfilelist"
  depth="3"
  name="getDicomDirFileList"
  sig="getDicomDirFileList(
	dicomElements: Record.<string, DataElement>,
): Array | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomdir-js/#L49" sourceLabel="dicomDir.js:49" />

Get a DICOMDIR file list.

**Parameters**

- `dicomElements` (Record.\<string, [DataElement](/dataelement)>) — The dicom elements.

**Returns**

- `Array | undefined` — The file list as an array ordered by STUDY > SERIES > IMAGES.

<MemberHeading id="dcmdump" depth="3" name="dcmdump" sig="dcmdump(dicomElements: Record.<string, DataElement>): string" />

<MemberMeta sourceHref="/source/src/dicom/dicomelementswrapper-js/#L35" sourceLabel="dicomElementsWrapper.js:35" />

Dump the DICOM tags to a string in the same way as the DCMTK `dcmdump` command (https\://support.dcmtk.org/docs-dcmrt/dcmdump.html).

**Parameters**

- `dicomElements` (Record.\<string, [DataElement](/dataelement)>) — The dicom elements.

**Returns**

- `string` — The dumped file.

<MemberHeading id="isbinaryvr" depth="3" name="isBinaryVR" sig="isBinaryVR(vr: string): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomelementswrapper-js/#L77" sourceLabel="dicomElementsWrapper.js:77" />

Is the input VR a binary VR: 'O'ther or Unknown (UN).

**Parameters**

- `vr` (string) — The value representation.

**Returns**

- `boolean` — True if binary.

<MemberHeading
  id="getelementvalueasstring"
  depth="3"
  name="getElementValueAsString"
  sig="getElementValueAsString(
	tag: Tag,
	dicomElement: DataElement,
	pretty?: boolean,
): string"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomelementswrapper-js/#L89" sourceLabel="dicomElementsWrapper.js:89" />

Get a data element value as a string.

**Parameters**

- `tag` ([Tag](/tag)) — The DICOM tag.
- `dicomElement` ([DataElement](/dataelement)) — The DICOM element.
- `pretty` (boolean, optional) — When set to true, returns a 'pretified' content.

**Returns**

- `string` — A string representation of the DICOM element.

<MemberHeading
  id="getvaluelength"
  depth="3"
  name="getValueLength"
  sig="getValueLength(
	tag: Tag,
	dicomElement: DataElement,
	isImplicit: boolean,
): number"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomelementswrapper-js/#L187" sourceLabel="dicomElementsWrapper.js:187" />

Get the value length (in bytes) of a data element, as it would be written. The parser does not keep the read value length, so it is computed from the parsed value. String lengths are computed using UTF-8, they can differ from the written ones for non ASCII characters with other character sets.

**Parameters**

- `tag` ([Tag](/tag)) — The DICOM tag.
- `dicomElement` ([DataElement](/dataelement)) — The DICOM element.
- `isImplicit` (boolean) — Does the data use implicit VR?

**Returns**

- `number` — The value length.

<MemberHeading
  id="getitemcontentlength"
  depth="3"
  name="getItemContentLength"
  sig="getItemContentLength(
	item: Record.<string, DataElement>,
	isImplicit: boolean,
): number"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomelementswrapper-js/#L238" sourceLabel="dicomElementsWrapper.js:238" />

Get the length (in bytes) of the content of a sequence item.

**Parameters**

- `item` (Record.\<string, [DataElement](/dataelement)>) — The sequence item.
- `isImplicit` (boolean) — Does the data use implicit VR?

**Returns**

- `number` — The item content length.

<MemberHeading
  id="getitemlength"
  depth="3"
  name="getItemLength"
  sig="getItemLength(
	item: Record.<string, DataElement>,
	isImplicit: boolean,
): number"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomelementswrapper-js/#L259" sourceLabel="dicomElementsWrapper.js:259" />

Get the length (in bytes) of a sequence item, including its item and item delimitation elements.

**Parameters**

- `item` (Record.\<string, [DataElement](/dataelement)>) — The sequence item.
- `isImplicit` (boolean) — Does the data use implicit VR?

**Returns**

- `number` — The item length.

<MemberHeading
  id="getline"
  depth="3"
  name="getLine"
  sig="getLine(
	prefix: string,
	tag: Tag,
	vr: string,
	value: string,
	length: string,
	multiplicity: number,
	name: string,
): string"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomelementswrapper-js/#L280" sourceLabel="dicomElementsWrapper.js:280" />

Get a dump line.

**Parameters**

- `prefix` (string) — A string to prepend to the line.
- `tag` ([Tag](/tag)) — The DICOM tag.
- `vr` (string) — The value representation.
- `value` (string) — The value string.
- `length` (string) — The value length string.
- `multiplicity` (number) — The value multiplicity.
- `name` (string) — The tag name.

**Returns**

- `string` — The line.

<MemberHeading
  id="getelementasstring"
  depth="3"
  name="getElementAsString"
  sig="getElementAsString(
	tag: Tag,
	dicomElement: DataElement,
	prefix: string,
	isImplicit: boolean,
): string"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomelementswrapper-js/#L298" sourceLabel="dicomElementsWrapper.js:298" />

Get a data element as a string.

**Parameters**

- `tag` ([Tag](/tag)) — The DICOM tag.
- `dicomElement` ([DataElement](/dataelement)) — The DICOM element.
- `prefix` (string) — A string to prepend this one.
- `isImplicit` (boolean) — Does the data use implicit VR?

**Returns**

- `string` — The element as a string.

<MemberHeading
  id="getdimensionorganization"
  depth="3"
  name="getDimensionOrganization"
  sig="getDimensionOrganization(
	dataElements: Record.<string, DataElement>,
): object"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomfunctionalgroup-js/#L50" sourceLabel="dicomFunctionalGroup.js:50" />

Check the dimension organization from a dicom element.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The root dicom element.

**Returns**

- `object` — The dimension organizations and indices.

<MemberHeading
  id="getfunctionalgroup"
  depth="3"
  name="getFunctionalGroup"
  sig="getFunctionalGroup(
	dataElements: Record.<string, DataElement>,
): DicomFunctionalGroup | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomfunctionalgroup-js/#L178" sourceLabel="dicomFunctionalGroup.js:178" />

Get a functional group object from a dicom element.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The dicom element.

**Returns**

- [`DicomFunctionalGroup`](/dicomfunctionalgroup)` | undefined` — A functional group object.

<MemberHeading
  id="getperframefunctionalgroups"
  depth="3"
  name="getPerFrameFunctionalGroups"
  sig="getPerFrameFunctionalGroups(
	dataElements: Record.<string, DataElement>,
	numberOfFrames?: number,
): Array.<DicomFunctionalGroup> | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomfunctionalgroup-js/#L297" sourceLabel="dicomFunctionalGroup.js:297" />

Get the list of per frame DicomFunctionalGroup from the root list of data elements.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The root dicom element.
- `numberOfFrames` (number, optional) — Optional number of frames to compare with per frame sequence size.

**Returns**

- `Array.<`[`DicomFunctionalGroup`](/dicomfunctionalgroup)`> | undefined` — The list of frame information object.

<MemberHeading
  id="isequalfunctionalgroup"
  depth="3"
  name="isEqualFunctionalGroup"
  sig="isEqualFunctionalGroup(
	group1: DicomFunctionalGroup,
	group2: DicomFunctionalGroup,
): boolean"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomfunctionalgroup-js/#L327" sourceLabel="dicomFunctionalGroup.js:327" />

Check if two functional group objects are equal.

**Parameters**

- `group1` ([DicomFunctionalGroup](/dicomfunctionalgroup)) — The first frame info.
- `group2` ([DicomFunctionalGroup](/dicomfunctionalgroup)) — The second frame info.

**Returns**

- `boolean` — True if both groups are equal.

<MemberHeading
  id="getdicomfunctionalgroupitem"
  depth="3"
  name="getDicomFunctionalGroupItem"
  sig="getDicomFunctionalGroupItem(
	funcGroup: DicomFunctionalGroup,
): SimpleTagValues"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomfunctionalgroup-js/#L368" sourceLabel="dicomFunctionalGroup.js:368" />

Get a dicom item from a functional group object.

**Parameters**

- `funcGroup` ([DicomFunctionalGroup](/dicomfunctionalgroup)) — The functional group object.

**Returns**

- [`SimpleTagValues`](/simpletagvalues) — The item as a list of (key, value) pairs.

<MemberHeading
  id="getconstantperframevalue"
  depth="3"
  name="getConstantPerFrameValue"
  sig="getConstantPerFrameValue(
	elements: Record.<string, DataElement>,
	valueGetter: function,
	name: string,
): any | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomfunctionalgroup-js/#L443" sourceLabel="dicomFunctionalGroup.js:443" />

Get a value that is constant across the frames of a multi-frame file. Frames without the value are ignored.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.
- `valueGetter` (function) — The per frame functional group value getter.
- `name` (string) — The value name, used for logging.

**Returns**

- `any | undefined` — The value, or undefined if absent or if it varies across frames: the file then does not represent a single volume and the value cannot be used as a volume id.

<MemberHeading
  id="getframeelements"
  depth="3"
  name="getFrameElements"
  sig="getFrameElements(
	elements: Record.<string, DataElement>,
	frameNumber: number,
): Record.<string, DataElement>"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomfunctionalgroup-js/#L474" sourceLabel="dicomFunctionalGroup.js:474" />

Get the DICOM tags of one frame of a multi-frame file: the root tags with a per frame functional groups sequence that only contains the frame item. Getters written for the root tags (for example using getConstantPerFrameValue) then return the frame value.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.
- `frameNumber` (number) — The frame number.

**Returns**

- `Record.<string, `[`DataElement`](/dataelement)`>` — The frame DICOM tags.

<MemberHeading
  id="getframeselements"
  depth="3"
  name="getFramesElements"
  sig="getFramesElements(
	elements: Record.<string, DataElement>,
): Array.<Record.<string, DataElement>>"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomfunctionalgroup-js/#L493" sourceLabel="dicomFunctionalGroup.js:493" />

Get the DICOM tags of each frame of a multi-frame file (see getFrameElements).

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.

**Returns**

- `Array.<Record.<string, `[`DataElement`](/dataelement)`>>` — The DICOM tags of each frame, the input tags if there are no per frame functional groups.

<MemberHeading id="getrootgeometry" depth="3" name="getRootGeometry" sig="getRootGeometry(dataElements: DataElements): Geometry" />

<MemberMeta sourceHref="/source/src/dicom/dicomgeometry-js/#L66" sourceLabel="dicomGeometry.js:66" />

Get the image geometry from root DICOM elements.

**Parameters**

- `dataElements` ([DataElements](/dataelements)) — The DICOM data elements.

**Returns**

- [`Geometry`](/geometry) — The image geometry.

<MemberHeading
  id="checkdistance"
  depth="3"
  name="checkDistance"
  sig="checkDistance(
	frameOrigin: Point3D,
	refOrigin: Point3D,
	index: number,
)"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomgeometry-js/#L129" sourceLabel="dicomGeometry.js:129" />

Check the distance between a frame origin and a reference origin.

**Parameters**

- `frameOrigin` ([Point3D](/point3d)) — The frame origin to check.
- `refOrigin` ([Point3D](/point3d)) — The reference origin to check against.
- `index` (number) — The frame index, used for error message.

**Throws**

- `Error` — If distance is too high.

<MemberHeading
  id="completeoriginsfromreference"
  depth="3"
  name="completeOriginsFromReference"
  sig="completeOriginsFromReference(
	frameOrigins: Array.<Point3D>,
	refOrigins: Array.<Point3D>,
): Array.<Point3D>"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomgeometry-js/#L157" sourceLabel="dicomGeometry.js:157" />

Complete origins using reference origins if with gaps.

`frameOrigins` are not assumed to be in reference (ascending) order: a DICOM file's `PerFrameFunctionalGroupsSequence` frame order is not guaranteed to be spatially sorted for any writer. Match each frame to its closest reference origin first, then rebuild the continuous run in ascending reference order, filling any true gaps from `refOrigins`.

**Parameters**

- `frameOrigins` (Array.\<[Point3D](/point3d)>) — The frame origins.
- `refOrigins` (Array.\<[Point3D](/point3d)>) — The reference image origins.

**Returns**

- `Array.<`[`Point3D`](/point3d)`>` — The continous origins, in ascending reference order.

<MemberHeading
  id="completeoriginsfromgeometry"
  depth="3"
  name="completeOriginsFromGeometry"
  sig="completeOriginsFromGeometry(
	frameOrigins: Array.<Point3D>,
	baseGeometry: Geometry,
): Array.<Point3D>"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomgeometry-js/#L191" sourceLabel="dicomGeometry.js:191" />

Complete origins using a base geometry if with gaps.

**Parameters**

- `frameOrigins` (Array.\<[Point3D](/point3d)>) — The frame origins.
- `baseGeometry` ([Geometry](/geometry)) — The base geometry.

**Returns**

- `Array.<`[`Point3D`](/point3d)`>` — The continous origins.

<MemberHeading
  id="getframesgeometry"
  depth="3"
  name="getFramesGeometry"
  sig="getFramesGeometry(
	dataElements: DataElements,
	perFrameFuncGroups: Array.<DicomFunctionalGroup>,
	completeOrigins?: boolean,
	refOrigins?: Array.<Point3D>,
): Geometry"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomgeometry-js/#L242" sourceLabel="dicomGeometry.js:242" />

Get the frames geometry from root DICOM elements and per-frame infos.

**Parameters**

- `dataElements` ([DataElements](/dataelements)) — The DICOM data elements.
- `perFrameFuncGroups` (Array.\<[DicomFunctionalGroup](/dicomfunctionalgroup)>) — The per-frame functional groups.
- `completeOrigins` (boolean, optional) — Flag to complete origins if gaps, defaults to false.
- `refOrigins` (Array.\<[Point3D](/point3d)>, optional) — Reference origins used to complete gaps, if not present the code will calculate them if completeOrigins is true.

**Returns**

- [`Geometry`](/geometry) — The geometry.

**Throws**

- `Error` — Error for missing or wrong data.

<MemberHeading
  id="getsortedframesgeometry"
  depth="3"
  name="getSortedFramesGeometry"
  sig="getSortedFramesGeometry(
	dataElements: DataElements,
): Array.<Geometry> | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomgeometry-js/#L392" sourceLabel="dicomGeometry.js:392" />

Get the geometry of each frame from the per-frame functional groups: a one slice geometry with the frame position and the frame time. The frame time is the data volume id (if any) if the frame positions are unique. If frames share positions (several volumes in one file), the frame time is the frame volume id (see dicomVolume guessVolumeIndices).

**Parameters**

- `dataElements` ([DataElements](/dataelements)) — The DICOM data elements.

**Returns**

- `Array.<`[`Geometry`](/geometry)`> | undefined` — The list of geometries indexed by frame (encoding order) number. Undefined if there are no per-frame functional groups or if their positions are not unique and cannot be grouped into volumes.

**Throws**

- `Error` — Error for missing or wrong data.

<MemberHeading
  id="getimage2dsize"
  depth="3"
  name="getImage2DSize"
  sig="getImage2DSize(
	elements: Record.<string, DataElement>,
): Array.<number> | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomimage-js/#L58" sourceLabel="dicomImage.js:58" />

Extract the 2D size from dicom elements.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM elements.

**Returns**

- `Array.<number> | undefined` — The sizes as \[columns, rows] or undefined if not present.

<MemberHeading
  id="get2dspacingvalues"
  depth="3"
  name="get2DSpacingValues"
  sig="get2DSpacingValues(
	elements: Record.<string, DataElement>,
	tagKey: string,
): Array.<number> | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomimage-js/#L76" sourceLabel="dicomImage.js:76" />

Get the 2D spacing values.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The dicom element.
- `tagKey` (string) — The tag key.

**Returns**

- `Array.<number> | undefined` — The values if present.

<MemberHeading
  id="get2dspacingvaluesfromfuncgroup"
  depth="3"
  name="get2DSpacingValuesFromFuncGroup"
  sig="get2DSpacingValuesFromFuncGroup(
	funcGroupElements: Record.<string, DataElement>,
): Array.<number> | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomimage-js/#L96" sourceLabel="dicomImage.js:96" />

Get the 2D spacing values from a functional group.

**Parameters**

- `funcGroupElements` (Record.\<string, [DataElement](/dataelement)>) — The dicom elements.

**Returns**

- `Array.<number> | undefined` — The values if present.

<MemberHeading
  id="getprojection2dspacingvalues"
  depth="3"
  name="getProjection2DSpacingValues"
  sig="getProjection2DSpacingValues(
	elements: Record.<string, DataElement>,
): Array.<number> | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomimage-js/#L114" sourceLabel="dicomImage.js:114" />

Get the pixel spacing for projection data.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM elements.

**Returns**

- `Array.<number> | undefined` — The values if present.

<MemberHeading
  id="getsecondarycapture2dspacingvalues"
  depth="3"
  name="getSecondaryCapture2DSpacingValues"
  sig="getSecondaryCapture2DSpacingValues(
	elements: Record.<string, DataElement>,
): Array.<number> | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomimage-js/#L148" sourceLabel="dicomImage.js:148" />

Get the pixel spacing for secondary capture data.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM elements.

**Returns**

- `Array.<number> | undefined` — The values if present.

<MemberHeading
  id="getmultiframe2dspacingvalues"
  depth="3"
  name="getMultiFrame2DSpacingValues"
  sig="getMultiFrame2DSpacingValues(
	elements: Record.<string, DataElement>,
): Array.<number> | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomimage-js/#L163" sourceLabel="dicomImage.js:163" />

Get the pixel spacing for multi-frame data.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM elements.

**Returns**

- `Array.<number> | undefined` — The values if present.

<MemberHeading
  id="getpixelspacing"
  depth="3"
  name="getPixelSpacing"
  sig="getPixelSpacing(
	elements: Record.<string, DataElement>,
): Array.<number> | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomimage-js/#L197" sourceLabel="dicomImage.js:197" />

Get the pixel spacing from the different spacing tags.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM elements.

**Returns**

- `Array.<number> | undefined` — The spacing as \[columnSapcing, rowSpacing] or undefined if not present.

<MemberHeading
  id="getpixelaspectratio"
  depth="3"
  name="getPixelAspectRatio"
  sig="getPixelAspectRatio(
	elements: Record.<string, DataElement>,
): Array.<number> | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomimage-js/#L223" sourceLabel="dicomImage.js:223" />

Get the pixel aspect ratio.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM elements.

**Returns**

- `Array.<number> | undefined` — The values if present.

<MemberHeading
  id="getspacingfrommeasure"
  depth="3"
  name="getSpacingFromMeasure"
  sig="getSpacingFromMeasure(
	dataElements: Record.<string, DataElement>,
): Spacing | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomimage-js/#L233" sourceLabel="dicomImage.js:233" />

Get a spacing object from a dicom measure element.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The dicom element.

**Returns**

- [`Spacing`](/spacing)` | undefined` — A spacing object.

<MemberHeading
  id="gettagpixelunit"
  depth="3"
  name="getTagPixelUnit"
  sig="getTagPixelUnit(
	elements: Record.<string, DataElement>,
): string | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomimage-js/#L253" sourceLabel="dicomImage.js:253" />

Get pixel data unit from a list of tags.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM elements.

**Returns**

- `string | undefined` — The unit value if available.

<MemberHeading
  id="defaultgettagpixelunit"
  depth="3"
  name="defaultGetTagPixelUnit"
  sig="defaultGetTagPixelUnit(
	elements: Record.<string, DataElement>,
): string | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomimage-js/#L266" sourceLabel="dicomImage.js:266" />

Default get pixel data unit.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM elements.

**Returns**

- `string | undefined` — The unit value if available.

<MemberHeading
  id="getorientationmatrix"
  depth="3"
  name="getOrientationMatrix"
  sig="getOrientationMatrix(
	dataElements: Record.<string, DataElement>,
): Matrix33 | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomimage-js/#L291" sourceLabel="dicomImage.js:291" />

Get an orientation matrix from a dicom orientation element.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The dicom element.

**Returns**

- [`Matrix33`](/matrix33)` | undefined` — The orientation matrix.

<MemberHeading id="getdicommeasureitem" depth="3" name="getDicomMeasureItem" sig="getDicomMeasureItem(spacing: Spacing): SimpleTagValues" />

<MemberMeta sourceHref="/source/src/dicom/dicomimage-js/#L312" sourceLabel="dicomImage.js:312" />

Get a dicom item from a measure sequence.

**Parameters**

- `spacing` ([Spacing](/spacing)) — The spacing object.

**Returns**

- [`SimpleTagValues`](/simpletagvalues) — The dicom item.

<MemberHeading
  id="getdicomplaneorientationitem"
  depth="3"
  name="getDicomPlaneOrientationItem"
  sig="getDicomPlaneOrientationItem(
	orientation: Matrix33,
): SimpleTagValues"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomimage-js/#L325" sourceLabel="dicomImage.js:325" />

Get a dicom element from a plane orientation sequence.

**Parameters**

- `orientation` ([Matrix33](/matrix33)) — The image orientation.

**Returns**

- [`SimpleTagValues`](/simpletagvalues) — The dicom element.

<MemberHeading
  id="getphotometricinterpretation"
  depth="3"
  name="getPhotometricInterpretation"
  sig="getPhotometricInterpretation(
	dataElements: Record.<string, DataElement>,
): string | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomimage-js/#L344" sourceLabel="dicomImage.js:344" />

Get the photometric interpretation from the data elements.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The data elements.

**Returns**

- `string | undefined` — The photometric interpretation value.

<MemberHeading id="ismonochrome" depth="3" name="isMonochrome" sig="isMonochrome(photometricInterpretation: string): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomimage-js/#L379" sourceLabel="dicomImage.js:379" />

Check if an input photometricInterpretation is monochrome.

**Parameters**

- `photometricInterpretation` (string) — The photometric interpretation.

**Returns**

- `boolean` — True if the input string starts with 'MONOCHROME'.

<MemberHeading id="issecondatycapture" depth="3" name="isSecondatyCapture" sig="isSecondatyCapture(SOPClassUID: string): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomimage-js/#L390" sourceLabel="dicomImage.js:390" />

Check if the received string represents a secondary capture.

**Parameters**

- `SOPClassUID` (string) — The sop class uid.

**Returns**

- `boolean` — True if it is secondary capture.

<MemberHeading
  id="getreferencedseriesuid"
  depth="3"
  name="getReferencedSeriesUID"
  sig="getReferencedSeriesUID(
	dataElements: Record.<string, DataElement>,
): string | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomimage-js/#L402" sourceLabel="dicomImage.js:402" />

Get the referenced series UID from the data elements.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The data elements.

**Returns**

- `string | undefined` — The referenced series UID.

<MemberHeading
  id="getreferencedseriesuidfromrtstruct"
  depth="3"
  name="getReferencedSeriesUIDFromRTStruct"
  sig="getReferencedSeriesUIDFromRTStruct(
	dataElements: Record.<string, DataElement>,
): string | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomimage-js/#L423" sourceLabel="dicomImage.js:423" />

Get the referenced series UID from an RT Structure Set.

Path: ReferencedFrameOfReferenceSequence (3006,0010) → RTReferencedStudySequence (3006,0012) → RTReferencedSeriesSequence (3006,0014) → SeriesInstanceUID (0020,000E).

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The data elements.

**Returns**

- `string | undefined` — The referenced series UID.

<MemberHeading
  id="getimagereference"
  depth="3"
  name="getImageReference"
  sig="getImageReference(
	dataElements: Record.<string, DataElement>,
): ImageReference"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomimagereference-js/#L62" sourceLabel="dicomImageReference.js:62" />

Get a reference object from a dicom element.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The dicom element.

**Returns**

- [`ImageReference`](/imagereference) — A reference object.

<MemberHeading id="getdicomimagereferenceitem" depth="3" name="getDicomImageReferenceItem" sig="getDicomImageReferenceItem(ref: ImageReference): SimpleTagValues" />

<MemberMeta sourceHref="/source/src/dicom/dicomimagereference-js/#L87" sourceLabel="dicomImageReference.js:87" />

Get a simple dicom element item from a reference object.

**Parameters**

- `ref` ([ImageReference](/imagereference)) — The reference object.

**Returns**

- [`SimpleTagValues`](/simpletagvalues) — The item as a list of (key, value) pairs.

<MemberHeading
  id="getmanufacturer"
  depth="3"
  name="getManufacturer"
  sig="getManufacturer(
	elements: Record.<string, DataElement>,
): string | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicommanufacturer-js/#L30" sourceLabel="dicomManufacturer.js:30" />

Get the manufacturer.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.

**Returns**

- `string | undefined` — The manufacturer.

<MemberHeading
  id="getnormalisedmanufacturer"
  depth="3"
  name="getNormalisedManufacturer"
  sig="getNormalisedManufacturer(
	elements: Record.<string, DataElement>,
): string | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicommanufacturer-js/#L41" sourceLabel="dicomManufacturer.js:41" />

Get the normalised manufacturer.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.

**Returns**

- `string | undefined` — The manufacturer as a unique all lower case string.

<MemberHeading
  id="getmeasuredvalue"
  depth="3"
  name="getMeasuredValue"
  sig="getMeasuredValue(
	dataElements: Record.<string, DataElement>,
): MeasuredValue"
/>

<MemberMeta sourceHref="/source/src/dicom/dicommeasuredvalue-js/#L72" sourceLabel="dicomMeasuredValue.js:72" />

Get a measured value object from a dicom element.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The dicom element.

**Returns**

- [`MeasuredValue`](/measuredvalue) — A measured value object.

<MemberHeading id="getdicommeasuredvalueitem" depth="3" name="getDicomMeasuredValueItem" sig="getDicomMeasuredValueItem(value: MeasuredValue): SimpleTagValues" />

<MemberMeta sourceHref="/source/src/dicom/dicommeasuredvalue-js/#L106" sourceLabel="dicomMeasuredValue.js:106" />

Get a simple dicom element item from a measured value object.

**Parameters**

- `value` ([MeasuredValue](/measuredvalue)) — The measured value object.

**Returns**

- [`SimpleTagValues`](/simpletagvalues) — The item as a list of (key, value) pairs.

<MemberHeading
  id="getnumericmeasurement"
  depth="3"
  name="getNumericMeasurement"
  sig="getNumericMeasurement(
	dataElements: Record.<string, DataElement>,
): NumericMeasurement"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomnumericmeasurement-js/#L64" sourceLabel="dicomNumericMeasurement.js:64" />

Get a measurement object from a dicom element.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The dicom element.

**Returns**

- [`NumericMeasurement`](/numericmeasurement) — A measurement object.

<MemberHeading
  id="getdicomnumericmeasurementitem"
  depth="3"
  name="getDicomNumericMeasurementItem"
  sig="getDicomNumericMeasurementItem(
	measurement: NumericMeasurement,
): SimpleTagValues"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomnumericmeasurement-js/#L86" sourceLabel="dicomNumericMeasurement.js:86" />

Get a simple dicom element item from a measurement object.

**Parameters**

- `measurement` ([NumericMeasurement](/numericmeasurement)) — The measurement object.

**Returns**

- [`SimpleTagValues`](/simpletagvalues) — The item as a list of (key, value) pairs.

<MemberHeading id="getdwvversion" depth="3" name="getDwvVersion" sig="getDwvVersion(): string" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L40" sourceLabel="dicomParser.js:40" />

Get the version of the library.

**Returns**

- `string` — The version of the library.

<MemberHeading id="getdwvversionui" depth="3" name="getDwvVersionUI" sig="getDwvVersionUI(): string" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L50" sourceLabel="dicomParser.js:50" />

Get the version of the library as a Unique Identifier (UI), meaning just numbers and dots.

**Returns**

- `string` — The UI version of the library.

<MemberHeading id="getdwvuidprefix" depth="3" name="getDwvUIDPrefix" sig="getDwvUIDPrefix(): string" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L62" sourceLabel="dicomParser.js:62" />

Get the dwv UID prefix. Issued by Medical Connections Ltd (www\.medicalconnections.co.uk) on 25/10/2017.

**Returns**

- `string` — The dwv UID prefix.

<MemberHeading id="getimplementationversionname" depth="3" name="getImplementationVersionName" sig="getImplementationVersionName(): string" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L71" sourceLabel="dicomParser.js:71" />

Get the value of the ImplementationVersionName tag.

**Returns**

- `string` — The name.

<MemberHeading id="getimplementationclassuid" depth="3" name="getImplementationClassUID" sig="getImplementationClassUID(): string" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L80" sourceLabel="dicomParser.js:80" />

Get the value of the ImplementationClassUID tag.

**Returns**

- `string` — The uid.

<MemberHeading
  id="getdwvversionfromimplementationclassuid"
  depth="3"
  name="getDwvVersionFromImplementationClassUID"
  sig="getDwvVersionFromImplementationClassUID(
	uid: string,
): string | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L91" sourceLabel="dicomParser.js:91" />

Get the dwv version from the value of the ImplementationClassUID tag.

**Parameters**

- `uid` (string) — The uid.

**Returns**

- `string | undefined` — The dwv version.

<MemberHeading id="splitversion" depth="3" name="splitVersion" sig="splitVersion(version: string): Array.<string>" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L109" sourceLabel="dicomParser.js:109" />

Split a string version into parts. The input version follows a 'm.n.p\[-beta.q]' version sheme (related to semantic versioning).

**Parameters**

- `version` (string) — The version.

**Returns**

- `Array.<string>` — The splited version.

<MemberHeading id="compareversions" depth="3" name="compareVersions" sig="compareVersions(a: string, b: string): number" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L128" sourceLabel="dicomParser.js:128" />

Compare versions. The input versions follow a 'm.n.p\[-beta.q]' version sheme (related to semantic versioning).

**Parameters**

- `a` (string) — The first version.
- `b` (string) — The second version.

**Returns**

- `number`

<MemberHeading
  id="isversioninbounds"
  depth="3"
  name="isVersionInBounds"
  sig="isVersionInBounds(
	version: string,
	min: string,
	max: string,
): boolean"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L169" sourceLabel="dicomParser.js:169" />

Check if a version in inside bounds (bounds inclusives). The input version follows a 'm.n.p\[-beta.q]' version sheme (related to semantic versioning).

**Parameters**

- `version` (string) — The version to check.
- `min` (string) — The minimum version.
- `max` (string) — The maximum version.

**Returns**

- `boolean` — True if the version in inside the bounds.

<MemberHeading id="hasdicomprefix" depth="3" name="hasDicomPrefix" sig="hasDicomPrefix(buffer: ArrayBuffer): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L184" sourceLabel="dicomParser.js:184" />

Check that an input buffer includes the DICOM prefix 'DICM' after the 128 bytes preamble.

Ref: [DICOM File Meta](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part10/chapter_7.html#sect_7.1).

**Parameters**

- `buffer` (ArrayBuffer) — The buffer to check.

**Returns**

- `boolean` — True if the buffer includes the prefix.

<MemberHeading id="cleanstring" depth="3" name="cleanString" sig="cleanString(inputStr: string): string" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L205" sourceLabel="dicomParser.js:205" />

Clean string: remove null characters (padding) and trim. Warning: no tests are done on the input, will fail if null or undefined or not string.

**Parameters**

- `inputStr` (string) — The string to clean.

**Returns**

- `string` — The cleaned string.

<MemberHeading id="getutflabel" depth="3" name="getUtfLabel" sig="getUtfLabel(charSetTerm: string): string" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L221" sourceLabel="dicomParser.js:221" />

Get the utfLabel (used by the TextDecoder) from a character set term.

References:

- DICOM [Value Encoding](http://dicom.nema.org/medical/dicom/2024a/output/chtml/part05/chapter_6.html),
- DICOM [Specific Character Set](http://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.12.html#sect_C.12.1.1.2),
- [TextDecoder#Parameters](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder/TextDecoder#Parameters).

**Parameters**

- `charSetTerm` (string) — The DICOM character set.

**Returns**

- `string` — The corresponding UTF label.

<MemberHeading id="removeescapesequences" depth="3" name="removeEscapeSequences" sig="removeEscapeSequences(buffer: Uint8Array): Uint8Array" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L277" sourceLabel="dicomParser.js:277" />

Remove the ISO 2022 escape sequences from a buffer: ESC (0x1B), intermediate bytes (0x20-0x2F) and a final byte. Needed for ISO 2022 IR 149 (Korean), where the escape sequence only designates KS X 1001 to G1, so the rest decodes as EUC-KR.

Ref: DICOM [Code Extensions](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part05/chapter_6.html#sect_6.1.2.5).

**Parameters**

- `buffer` (Uint8Array) — The input buffer.

**Returns**

- `Uint8Array` — The buffer without escape sequences.

<MemberHeading id="getreverseorientation" depth="3" name="getReverseOrientation" sig="getReverseOrientation(ori: string): string" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L325" sourceLabel="dicomParser.js:325" />

Get patient orientation label in the reverse direction.

**Parameters**

- `ori` (string) — Patient Orientation value.

**Returns**

- `string` — Reverse Orientation Label.

<MemberHeading id="isimplicittransfersyntax" depth="3" name="isImplicitTransferSyntax" sig="isImplicitTransferSyntax(syntax: string): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L357" sourceLabel="dicomParser.js:357" />

Tell if a given syntax is an implicit one (element with no VR).

**Parameters**

- `syntax` (string) — The transfer syntax to test.

**Returns**

- `boolean` — True if an implicit syntax.

<MemberHeading id="isbigendiantransfersyntax" depth="3" name="isBigEndianTransferSyntax" sig="isBigEndianTransferSyntax(syntax: string): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L367" sourceLabel="dicomParser.js:367" />

Tell if a given syntax is a big endian syntax.

**Parameters**

- `syntax` (string) — The transfer syntax to test.

**Returns**

- `boolean` — True if a big endian syntax.

<MemberHeading id="isjpegbaselinetransfersyntax" depth="3" name="isJpegBaselineTransferSyntax" sig="isJpegBaselineTransferSyntax(syntax: string): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L377" sourceLabel="dicomParser.js:377" />

Tell if a given syntax is a JPEG baseline one.

**Parameters**

- `syntax` (string) — The transfer syntax to test.

**Returns**

- `boolean` — True if a jpeg baseline syntax.

<MemberHeading id="isjpeglosslesstransfersyntax" depth="3" name="isJpegLosslessTransferSyntax" sig="isJpegLosslessTransferSyntax(syntax: string): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L388" sourceLabel="dicomParser.js:388" />

Tell if a given syntax is a JPEG Lossless one.

**Parameters**

- `syntax` (string) — The transfer syntax to test.

**Returns**

- `boolean` — True if a jpeg lossless syntax.

<MemberHeading id="isjpeg2000transfersyntax" depth="3" name="isJpeg2000TransferSyntax" sig="isJpeg2000TransferSyntax(syntax: string): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L399" sourceLabel="dicomParser.js:399" />

Tell if a given syntax is a JPEG 2000 one.

**Parameters**

- `syntax` (string) — The transfer syntax to test.

**Returns**

- `boolean` — True if a jpeg 2000 syntax.

<MemberHeading id="isrletransfersyntax" depth="3" name="isRleTransferSyntax" sig="isRleTransferSyntax(syntax: string): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L409" sourceLabel="dicomParser.js:409" />

Tell if a given syntax is a RLE (Run-length encoding) one.

**Parameters**

- `syntax` (string) — The transfer syntax to test.

**Returns**

- `boolean` — True if a RLE syntax.

<MemberHeading id="getsyntaxdecompressionname" depth="3" name="getSyntaxDecompressionName" sig="getSyntaxDecompressionName(syntax: string): string | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L419" sourceLabel="dicomParser.js:419" />

Tell if a given syntax needs decompression.

**Parameters**

- `syntax` (string) — The transfer syntax to test.

**Returns**

- `string | undefined` — The name of the decompression algorithm.

<MemberHeading id="isreadsupportedtransfersyntax" depth="3" name="isReadSupportedTransferSyntax" sig="isReadSupportedTransferSyntax(syntax: string): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L439" sourceLabel="dicomParser.js:439" />

Tell if a given syntax is supported for reading.

**Parameters**

- `syntax` (string) — The transfer syntax to test.

**Returns**

- `boolean` — True if a supported syntax.

<MemberHeading id="gettransfersyntaxname" depth="3" name="getTransferSyntaxName" sig="getTransferSyntaxName(syntax: string): string" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L455" sourceLabel="dicomParser.js:455" />

Get a transfer syntax name from its UID.

**Parameters**

- `syntax` (string) — The transfer syntax UID value.

**Returns**

- `string` — The transfer syntax name.

<MemberHeading id="guesstransfersyntax" depth="3" name="guessTransferSyntax" sig="guessTransferSyntax(firstDataElement: DataElement): DataElement" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L473" sourceLabel="dicomParser.js:473" />

Guess the transfer syntax from the first data element.

See [https://github.com/ivmartel/dwv/issues/188](https://github.com/ivmartel/dwv/issues/188) (Allow to load DICOM with no DICM preamble) for more details.

**Parameters**

- `firstDataElement` ([DataElement](/dataelement)) — The first data element of the DICOM header.

**Returns**

- [`DataElement`](/dataelement) — The transfer syntax data element.

<MemberHeading
  id="gettypedarray"
  depth="3"
  name="getTypedArray"
  sig="getTypedArray(
	bitsAllocated: number,
	pixelRepresentation: number,
	size: number,
): IntTypedArray"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L529" sourceLabel="dicomParser.js:529" />

Get the appropriate TypedArray in function of arguments.

**Parameters**

- `bitsAllocated` (number) — The number of bites used to store the data: \[8, 16, 32].
- `pixelRepresentation` (number) — The pixel representation, 0:unsigned;1:signed.
- `size` (number) — The size of the new array.

**Returns**

- [`IntTypedArray`](/inttypedarray) — The good typed array.

<MemberHeading id="gettypedarraylike" depth="3" name="getTypedArrayLike" sig="getTypedArrayLike(array: TypedArray, size: number): TypedArray" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L565" sourceLabel="dicomParser.js:565" />

Get a new TypedArray of the same type as the input one (preserves float arrays, unlike `getTypedArray`).

**Parameters**

- `array` ([TypedArray](/typedarray)) — The model array.
- `size` (number) — The size of the new array.

**Returns**

- [`TypedArray`](/typedarray) — The new array or null if the allocation failed.

<MemberHeading id="logallocationerror" depth="3" name="logAllocationError" sig="logAllocationError(error: Error, size: number)" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L583" sourceLabel="dicomParser.js:583" />

Log a typed array allocation error.

**Parameters**

- `error` (Error) — The allocation error.
- `size` (number) — The size of the array.

<MemberHeading
  id="getdataelementprefixbytesize"
  depth="3"
  name="getDataElementPrefixByteSize"
  sig="getDataElementPrefixByteSize(
	vr: string,
	isImplicit: boolean,
): number"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L618" sourceLabel="dicomParser.js:618" />

Get the number of bytes occupied by a data element prefix, (without its value).

WARNING: this is valid for tags with a VR, if not sure use the 'isTagWithVR' function first.

Reference:

- [Data Element explicit](http://dicom.nema.org/medical/dicom/2024a/output/chtml/part05/chapter_7.html#table_7.1-1),
- [Data Element implicit](http://dicom.nema.org/medical/dicom/2024a/output/chtml/part05/sect_7.5.2.html#table_7.5-1).

```
| Tag | VR  | VL | Value |
| 4   | 2   | 2  | X     | -> regular explicit: 8 + X
| 4   | 2+2 | 4  | X     | -> 32bit VL: 12 + X

| Tag | VL | Value |
| 4   | 4  | X     | -> implicit (32bit VL): 8 + X

| Tag | Len | Value |
| 4   | 4   | X     | -> item: 8 + X
```

**Parameters**

- `vr` (string) — The Value Representation of the element.
- `isImplicit` (boolean) — Does the data use implicit VR?

**Returns**

- `number` — The size of the element prefix.

<MemberHeading id="isknownvr" depth="3" name="isKnownVR" sig="isKnownVR(vr: string): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L628" sourceLabel="dicomParser.js:628" />

Is the input VR a known VR.

**Parameters**

- `vr` (string) — The vr to test.

**Returns**

- `boolean` — True if known.

<MemberHeading id="getdecayeddose" depth="3" name="getDecayedDose" sig="getDecayedDose(elements: Record.<string, DataElement>): object" />

<MemberMeta sourceHref="/source/src/dicom/dicompet-js/#L42" sourceLabel="dicomPet.js:42" />

Get the decayed dose (Bq).

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM elements to check.

**Returns**

- `object` — The value and a warning if the elements are not as expected.

<MemberHeading id="getsuvfactor" depth="3" name="getSuvFactor" sig="getSuvFactor(elements: Record.<string, DataElement>): object" />

<MemberMeta sourceHref="/source/src/dicom/dicompet-js/#L209" sourceLabel="dicomPet.js:209" />

Get the PET SUV factor.

Ref:

- [https://qibawiki.rsna.org/index.php/Standardized\_Uptake\_Value\_(SUV)#SUV\_Calculation](https://qibawiki.rsna.org/index.php/Standardized_Uptake_Value_\(SUV\)#SUV_Calculation),
- [https://qibawiki.rsna.org/images/6/62/SUV\_vendorneutral\_pseudocode\_happypathonly\_20180626\_DAC.pdf](https://qibawiki.rsna.org/images/6/62/SUV_vendorneutral_pseudocode_happypathonly_20180626_DAC.pdf),
- [https://qibawiki.rsna.org/images/8/86/SUV\_vendorneutral\_pseudocode\_20180626\_DAC.pdf](https://qibawiki.rsna.org/images/8/86/SUV_vendorneutral_pseudocode_20180626_DAC.pdf).

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM elements.

**Returns**

- `object` — The value and a warning if the elements are not as expected.

<MemberHeading
  id="getrtstructfromelements"
  depth="3"
  name="getRTStructFromElements"
  sig="getRTStructFromElements(
	dataElements: Record.<string, DataElement>,
): Array.<RTROI>"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomrtstruct-js/#L117" sourceLabel="dicomRTStruct.js:117" />

Get a list of [RTROI](/rtroi) objects from RTSTRUCT DICOM elements.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM data elements.

**Returns**

- `Array.<`[`RTROI`](/rtroi)`>` — The list of RT ROIs.

<MemberHeading
  id="getcontenttemplate"
  depth="3"
  name="getContentTemplate"
  sig="getContentTemplate(
	dataElements: Record.<string, DataElement>,
): string | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomsrcontent-js/#L129" sourceLabel="dicomSRContent.js:129" />

Get the content template value.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The dicom elements.

**Returns**

- `string | undefined` — The template as 'MappingResource'-'TemplateIdentifier'.

<MemberHeading
  id="isequalcontentitem"
  depth="3"
  name="isEqualContentItem"
  sig="isEqualContentItem(
	item1: DicomSRContent,
	item2: DicomSRContent,
): boolean"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomsrcontent-js/#L245" sourceLabel="dicomSRContent.js:245" />

Check if two content item objects are equal.

**Parameters**

- `item1` ([DicomSRContent](/dicomsrcontent)) — The first content item.
- `item2` ([DicomSRContent](/dicomsrcontent)) — The second content item.

**Returns**

- `boolean` — True if both content items are equal.

<MemberHeading
  id="getsrcontent"
  depth="3"
  name="getSRContent"
  sig="getSRContent(
	dataElements: Record.<string, DataElement>,
): DicomSRContent"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomsrcontent-js/#L259" sourceLabel="dicomSRContent.js:259" />

Get a content item object from a dicom element.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The dicom element.

**Returns**

- [`DicomSRContent`](/dicomsrcontent) — A content item object.

<MemberHeading id="getdicomsrcontentitem" depth="3" name="getDicomSRContentItem" sig="getDicomSRContentItem(content: DicomSRContent): SimpleTagValues" />

<MemberMeta sourceHref="/source/src/dicom/dicomsrcontent-js/#L322" sourceLabel="dicomSRContent.js:322" />

Get a simple dicom element item from a content item object.

**Parameters**

- `content` ([DicomSRContent](/dicomsrcontent)) — The content item object.

**Returns**

- [`SimpleTagValues`](/simpletagvalues) — The item as a list of (key, value) pairs.

<MemberHeading
  id="getsrcontentfromvalue"
  depth="3"
  name="getSRContentFromValue"
  sig="getSRContentFromValue(
	name: string,
	value: object,
	unit: string,
	relation?: string,
): DicomSRContent | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomsrcontent-js/#L399" sourceLabel="dicomSRContent.js:399" />

Get a DicomSRContent from a value.

**Parameters**

- `name` (string) — The value name.
- `value` (object) — The value.
- `unit` (string) — The values' unit.
- `relation` (string, optional) — Optional content relationhip.

**Returns**

- [`DicomSRContent`](/dicomsrcontent)` | undefined` — The SR content.

<MemberHeading
  id="getsegment"
  depth="3"
  name="getSegment"
  sig="getSegment(
	dataElements: Record.<string, DataElement>,
): MaskSegment"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomsegment-js/#L137" sourceLabel="dicomSegment.js:137" />

Get a segment object from a dicom element.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The dicom element.

**Returns**

- [`MaskSegment`](/masksegment) — A segment object.

<MemberHeading id="isequalsegment" depth="3" name="isEqualSegment" sig="isEqualSegment(seg1: MaskSegment, seg2: MaskSegment): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomsegment-js/#L212" sourceLabel="dicomSegment.js:212" />

Check if two segment objects are equal.

**Parameters**

- `seg1` ([MaskSegment](/masksegment)) — The first segment.
- `seg2` ([MaskSegment](/masksegment)) — The second segment.

**Returns**

- `boolean` — True if both segment are equal.

<MemberHeading id="issimilarsegment" depth="3" name="isSimilarSegment" sig="isSimilarSegment(seg1: MaskSegment, seg2: MaskSegment): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomsegment-js/#L256" sourceLabel="dicomSegment.js:256" />

Check if two segment objects are similar: either the number or the displayValue are equal.

**Parameters**

- `seg1` ([MaskSegment](/masksegment)) — The first segment.
- `seg2` ([MaskSegment](/masksegment)) — The second segment.

**Returns**

- `boolean` — True if both segment are similar.

<MemberHeading id="getdicomsegmentitem" depth="3" name="getDicomSegmentItem" sig="getDicomSegmentItem(segment: MaskSegment): SimpleTagValues" />

<MemberMeta sourceHref="/source/src/dicom/dicomsegment-js/#L287" sourceLabel="dicomSegment.js:287" />

Get a dicom simple tag from a segment object.

**Parameters**

- `segment` ([MaskSegment](/masksegment)) — The segment object.

**Returns**

- [`SimpleTagValues`](/simpletagvalues) — The item as a list of (key, value) pairs.

<MemberHeading
  id="getsopinstancereference"
  depth="3"
  name="getSopInstanceReference"
  sig="getSopInstanceReference(
	dataElements: Record.<string, DataElement>,
): SopInstanceReference"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomsopinstancereference-js/#L47" sourceLabel="dicomSopInstanceReference.js:47" />

Get a SOP reference object from a dicom element.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The dicom element.

**Returns**

- [`SopInstanceReference`](/sopinstancereference) — A SOP reference object.

<MemberHeading
  id="getdicomsopinstancereferenceitem"
  depth="3"
  name="getDicomSopInstanceReferenceItem"
  sig="getDicomSopInstanceReferenceItem(
	ref: SopInstanceReference,
): SimpleTagValues"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomsopinstancereference-js/#L68" sourceLabel="dicomSopInstanceReference.js:68" />

Get a simple dicom element item from a SOP reference object.

**Parameters**

- `ref` ([SopInstanceReference](/sopinstancereference)) — The SOP reference object.

**Returns**

- [`SimpleTagValues`](/simpletagvalues) — The item as a list of (key, value) pairs.

<MemberHeading
  id="getspatialcoordinate"
  depth="3"
  name="getSpatialCoordinate"
  sig="getSpatialCoordinate(
	dataElements: Record.<string, DataElement>,
): SpatialCoordinate"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomspatialcoordinate-js/#L81" sourceLabel="dicomSpatialCoordinate.js:81" />

Get a scoord object from a dicom element.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The dicom element.

**Returns**

- [`SpatialCoordinate`](/spatialcoordinate) — A scoord object.

<MemberHeading
  id="getdicomspatialcoordinateitem"
  depth="3"
  name="getDicomSpatialCoordinateItem"
  sig="getDicomSpatialCoordinateItem(
	scoord: SpatialCoordinate,
): SimpleTagValues"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomspatialcoordinate-js/#L106" sourceLabel="dicomSpatialCoordinate.js:106" />

Get a simple dicom element item from a scoord object.

**Parameters**

- `scoord` ([SpatialCoordinate](/spatialcoordinate)) — The scoord object.

**Returns**

- [`SimpleTagValues`](/simpletagvalues) — The item as a list of (key, value) pairs.

<MemberHeading
  id="getscoordfromshape"
  depth="3"
  name="getScoordFromShape"
  sig="getScoordFromShape(
	shape: Point2D | Line | Protractor | ROI | Circle | Ellipse | Rectangle | BidimensionalLine,
): SpatialCoordinate"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomspatialcoordinate-js/#L138" sourceLabel="dicomSpatialCoordinate.js:138" />

Get a DICOM spatial coordinate (SCOORD) from a mathematical shape. Supports all standard shapes, including BidimensionalLine (exported as a polyline with 4 points).

**Parameters**

- `shape` ([Point2D](/point2d) | [Line](/line) | [Protractor](/protractor) | [ROI](/roi) | [Circle](/circle) | [Ellipse](/ellipse) | [Rectangle](/rectangle) | [BidimensionalLine](/bidimensionalline)) — The math shape, including BidimensionalLine.

**Returns**

- [`SpatialCoordinate`](/spatialcoordinate) — The DICOM scoord.

<MemberHeading
  id="getshapefromscoord"
  depth="3"
  name="getShapeFromScoord"
  sig="getShapeFromScoord(
	scoord: SpatialCoordinate,
): Point2D | Line | Protractor | ROI | Circle | Ellipse | Rectangle | BidimensionalLine | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomspatialcoordinate-js/#L277" sourceLabel="dicomSpatialCoordinate.js:277" />

Get a mathematical shape from a DICOM spatial coordinate (SCOORD). Supports all standard shapes, including BidimensionalLine (polyline with 4 points).

**Parameters**

- `scoord` ([SpatialCoordinate](/spatialcoordinate)) — The DICOM scoord.

**Returns**

- [`Point2D`](/point2d)`  |  `[`Line`](/line)`  |  `[`Protractor`](/protractor)`  |  `[`ROI`](/roi)`  |  `[`Circle`](/circle)`  |  `[`Ellipse`](/ellipse)`  |  `[`Rectangle`](/rectangle)`  |  `[`BidimensionalLine`](/bidimensionalline)` | undefined` — The reconstructed math shape, including BidimensionalLine if applicable.

<MemberHeading
  id="getspatialcoordinate3d"
  depth="3"
  name="getSpatialCoordinate3D"
  sig="getSpatialCoordinate3D(
	dataElements: Record.<string, DataElement>,
): SpatialCoordinate3D"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomspatialcoordinate3d-js/#L58" sourceLabel="dicomSpatialCoordinate3D.js:58" />

Get a scoord3d object from a dicom element.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The dicom element.

**Returns**

- [`SpatialCoordinate3D`](/spatialcoordinate3d) — A scoord3d object.

<MemberHeading
  id="getdicomspatialcoordinate3ditem"
  depth="3"
  name="getDicomSpatialCoordinate3DItem"
  sig="getDicomSpatialCoordinate3DItem(
	scoord: SpatialCoordinate3D,
): SimpleTagValues"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomspatialcoordinate3d-js/#L84" sourceLabel="dicomSpatialCoordinate3D.js:84" />

Get a simple dicom element item from a scoord3d object.

**Parameters**

- `scoord` ([SpatialCoordinate3D](/spatialcoordinate3d)) — The scoord3d object.

**Returns**

- [`SimpleTagValues`](/simpletagvalues) — The item as a list of (key, value) pairs.

<MemberHeading id="tagcomparefunction" depth="3" name="tagCompareFunction" sig="tagCompareFunction(a: Tag, b: Tag): number" />

<MemberMeta sourceHref="/source/src/dicom/dicomtag-js/#L132" sourceLabel="dicomTag.js:132" />

Tag compare function.

**Parameters**

- `a` ([Tag](/tag)) — The first tag.
- `b` ([Tag](/tag)) — The second tag.

**Returns**

- `number` — The result of the tag comparison, positive for b before a, negative for a before b and zero to keep same order.

<MemberHeading id="gettagfromkey" depth="3" name="getTagFromKey" sig="getTagFromKey(key: string): Tag" />

<MemberMeta sourceHref="/source/src/dicom/dicomtag-js/#L148" sourceLabel="dicomTag.js:148" />

Split a group-element key used to store DICOM elements.

**Parameters**

- `key` (string) — The key in form "00280102" as generated by tag::getKey.

**Returns**

- [`Tag`](/tag) — The DICOM tag.

<MemberHeading id="gettransfersyntaxuidtag" depth="3" name="getTransferSyntaxUIDTag" sig="getTransferSyntaxUIDTag(): Tag" />

<MemberMeta sourceHref="/source/src/dicom/dicomtag-js/#L163" sourceLabel="dicomTag.js:163" />

Get the TransferSyntaxUID Tag.

**Returns**

- [`Tag`](/tag) — The tag.

<MemberHeading id="getfilemetainformationgrouplengthtag" depth="3" name="getFileMetaInformationGroupLengthTag" sig="getFileMetaInformationGroupLengthTag(): Tag" />

<MemberMeta sourceHref="/source/src/dicom/dicomtag-js/#L172" sourceLabel="dicomTag.js:172" />

Get the FileMetaInformationGroupLength Tag.

**Returns**

- [`Tag`](/tag) — The tag.

<MemberHeading id="isfilemetainformationgrouplengthtag" depth="3" name="isFileMetaInformationGroupLengthTag" sig="isFileMetaInformationGroupLengthTag(tag: Tag): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomtag-js/#L182" sourceLabel="dicomTag.js:182" />

Is the input tag the FileMetaInformationGroupLength Tag.

**Parameters**

- `tag` ([Tag](/tag)) — The tag to test.

**Returns**

- `boolean` — True if the asked tag.

<MemberHeading id="getitemtag" depth="3" name="getItemTag" sig="getItemTag(): Tag" />

<MemberMeta sourceHref="/source/src/dicom/dicomtag-js/#L191" sourceLabel="dicomTag.js:191" />

Get the Item Tag.

**Returns**

- [`Tag`](/tag) — The tag.

<MemberHeading id="isitemtag" depth="3" name="isItemTag" sig="isItemTag(tag: Tag): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomtag-js/#L201" sourceLabel="dicomTag.js:201" />

Is the input tag the Item Tag.

**Parameters**

- `tag` ([Tag](/tag)) — The tag to test.

**Returns**

- `boolean` — True if the asked tag.

<MemberHeading id="getitemdelimitationitemtag" depth="3" name="getItemDelimitationItemTag" sig="getItemDelimitationItemTag(): Tag" />

<MemberMeta sourceHref="/source/src/dicom/dicomtag-js/#L211" sourceLabel="dicomTag.js:211" />

Get the ItemDelimitationItem Tag.

**Returns**

- [`Tag`](/tag) — The tag.

<MemberHeading id="isitemdelimitationitemtag" depth="3" name="isItemDelimitationItemTag" sig="isItemDelimitationItemTag(tag: Tag): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomtag-js/#L221" sourceLabel="dicomTag.js:221" />

Is the input tag the ItemDelimitationItem Tag.

**Parameters**

- `tag` ([Tag](/tag)) — The tag to test.

**Returns**

- `boolean` — True if the asked tag.

<MemberHeading id="getsequencedelimitationitemtag" depth="3" name="getSequenceDelimitationItemTag" sig="getSequenceDelimitationItemTag(): Tag" />

<MemberMeta sourceHref="/source/src/dicom/dicomtag-js/#L231" sourceLabel="dicomTag.js:231" />

Get the SequenceDelimitationItem Tag.

**Returns**

- [`Tag`](/tag) — The tag.

<MemberHeading id="issequencedelimitationitemtag" depth="3" name="isSequenceDelimitationItemTag" sig="isSequenceDelimitationItemTag(tag: Tag): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomtag-js/#L241" sourceLabel="dicomTag.js:241" />

Is the input tag the SequenceDelimitationItem Tag.

**Parameters**

- `tag` ([Tag](/tag)) — The tag to test.

**Returns**

- `boolean` — True if the asked tag.

<MemberHeading id="getpixeldatatag" depth="3" name="getPixelDataTag" sig="getPixelDataTag(): Tag" />

<MemberMeta sourceHref="/source/src/dicom/dicomtag-js/#L251" sourceLabel="dicomTag.js:251" />

Get the PixelData Tag.

**Returns**

- [`Tag`](/tag) — The tag.

<MemberHeading id="getallpixeldatatagkeys" depth="3" name="getAllPixelDataTagKeys" sig="getAllPixelDataTagKeys(): Array.<string>" />

<MemberMeta sourceHref="/source/src/dicom/dicomtag-js/#L261" sourceLabel="dicomTag.js:261" />

Get the list of pixel data DICOM tag keys: PixelData, FloatPixelData and DoubleFloatPixelData.

**Returns**

- `Array.<string>` — The key list.

<MemberHeading id="isanypixeldatatag" depth="3" name="isAnyPixelDataTag" sig="isAnyPixelDataTag(tag: Tag): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomtag-js/#L271" sourceLabel="dicomTag.js:271" />

Is the input tag one of the pixel data tag.

**Parameters**

- `tag` ([Tag](/tag)) — The tag to test.

**Returns**

- `boolean` — True if input is a pixel data tag.

<MemberHeading
  id="getanypixeldataelement"
  depth="3"
  name="getAnyPixelDataElement"
  sig="getAnyPixelDataElement(
	elements: Record.<string, DataElement>,
): DataElement | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomtag-js/#L283" sourceLabel="dicomTag.js:283" />

Get the dicom data element for the pixel data (can be regular, float or double data).

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The data elements.

**Returns**

- [`DataElement`](/dataelement)` | undefined` — The pixel data element.

<MemberHeading
  id="hasanypixeldataelement"
  depth="3"
  name="hasAnyPixelDataElement"
  sig="hasAnyPixelDataElement(
	elements: Record.<string, DataElement>,
): boolean"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomtag-js/#L302" sourceLabel="dicomTag.js:302" />

Check if an input data elements contains a pixel data element.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — Data elements.

**Returns**

- `boolean` — True if the elements contain one of the pixel data tags.

<MemberHeading id="getdicomtaginfo" depth="3" name="getDicomTagInfo" sig="getDicomTagInfo(tag: Tag): TagInfo | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomtaginfo-js/#L72" sourceLabel="dicomTagInfo.js:72" />

Get the DICOM tag info for a tag using the local DICOM tag dictionary.

**Parameters**

- `tag` ([Tag](/tag)) — The DICOM tag.

**Returns**

- [`TagInfo`](/taginfo)` | undefined` — The info.

<MemberHeading id="getdicomtaggroupname" depth="3" name="getDicomTagGroupName" sig="getDicomTagGroupName(tag: Tag): string | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomtaginfo-js/#L97" sourceLabel="dicomTagInfo.js:97" />

Get the DICOM tag group name as defined in TagGroups.

**Parameters**

- `tag` ([Tag](/tag)) — The DICOM tag.

**Returns**

- `string | undefined` — The group name.

<MemberHeading id="gettagfromdictionary" depth="3" name="getTagFromDictionary" sig="getTagFromDictionary(tagName: string): Tag | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomtaginfo-js/#L108" sourceLabel="dicomTagInfo.js:108" />

Get a tag from the dictionary using a tag string name.

**Parameters**

- `tagName` (string) — The tag string name.

**Returns**

- [`Tag`](/tag)` | undefined` — The tag object or undefined if bad input or not found.

<MemberHeading
  id="createsourcedvalue"
  depth="3"
  name="createSourcedValue"
  sig="createSourcedValue(
	value: number | undefined,
	tagKey: string,
	unit?: string,
): SourcedNumberValue | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L183" sourceLabel="dicomVolume.js:183" />

Create a sourced number value.

**Parameters**

- `value` (number | undefined) — The value.
- `tagKey` (string) — The key of the tag the value is read from.
- `unit` (string, optional) — The value unit as an i18n key.

**Returns**

- [`SourcedNumberValue`](/sourcednumbervalue)` | undefined` — The sourced value, undefined if the value is undefined.

<MemberHeading
  id="getdiffusionbvaluefromfunctionalseq"
  depth="3"
  name="getDiffusionBValueFromFunctionalSeq"
  sig="getDiffusionBValueFromFunctionalSeq(
	elements: Record.<string, DataElement>,
): string | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L201" sourceLabel="dicomVolume.js:201" />

Get the diffusion b-value from a functional DICOM sequence.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.

**Returns**

- `string | undefined` — The value, if present.

<MemberHeading
  id="getstandarddiffusionbvaluefromemr"
  depth="3"
  name="getStandardDiffusionBValueFromEMR"
  sig="getStandardDiffusionBValueFromEMR(
	elements: Record.<string, DataElement>,
): string | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L217" sourceLabel="dicomVolume.js:217" />

Get the diffusion b-value from standard DICOM tag.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.

**Returns**

- `string | undefined` — The value, if present.

<MemberHeading
  id="getprivatetagvalue"
  depth="3"
  name="getPrivateTagValue"
  sig="getPrivateTagValue(
	elements: Record.<string, DataElement>,
	key: string,
): string | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L243" sourceLabel="dicomVolume.js:243" />

Get the first value of a private tag. Private tags read from implicit VR data are not in the dictionary and are parsed as 'UN', their value is then the raw bytes: decode them as an ASCII string.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.
- `key` (string) — The tag key.

**Returns**

- `string | undefined` — The value, if present.

<MemberHeading
  id="getnonstandarddiffusionbvaluefrommr"
  depth="3"
  name="getNonStandardDiffusionBValueFromMR"
  sig="getNonStandardDiffusionBValueFromMR(
	elements: Record.<string, DataElement>,
): Object | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L263" sourceLabel="dicomVolume.js:263" />

Get the diffusion b-value from MR from non standard and/or private DICOM tags.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.

**Returns**

- `Object | undefined` — The value and the key of the tag it was read from, if present.

<MemberHeading
  id="hasbvaluedimensionpointer"
  depth="3"
  name="hasBValueDimensionPointer"
  sig="hasBValueDimensionPointer(
	elements: Record.<string, DataElement>,
): boolean"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L313" sourceLabel="dicomVolume.js:313" />

Check if the dimension index sequence has a pointer to the b-value.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.

**Returns**

- `boolean` — True if a b-value pointer is present.

<MemberHeading
  id="getphilipsframebvalueindex"
  depth="3"
  name="getPhilipsFrameBValueIndex"
  sig="getPhilipsFrameBValueIndex(
	group: Record.<string, DataElement>,
): number | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L329" sourceLabel="dicomVolume.js:329" />

Get the b-value dimension index value of a frame. Hard coded logic based on real cases...

**Parameters**

- `group` (Record.\<string, [DataElement](/dataelement)>) — The per frame functional group.

**Returns**

- `number | undefined` — The value, if present.

<MemberHeading
  id="getphilipsdiffusionbvaluefromemr"
  depth="3"
  name="getPhilipsDiffusionBValueFromEMR"
  sig="getPhilipsDiffusionBValueFromEMR(
	elements: Record.<string, DataElement>,
): number | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L353" sourceLabel="dicomVolume.js:353" />

Get the b-value from the frame content sequence if the dimension index sequence has a pointer to the b-value. Note: the value is a dimension index, not the b-value itself.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.

**Returns**

- `number | undefined` — The value, if present.

<MemberHeading
  id="getnonstandarddiffusionbvaluefromemr"
  depth="3"
  name="getNonStandardDiffusionBValueFromEMR"
  sig="getNonStandardDiffusionBValueFromEMR(
	elements: Record.<string, DataElement>,
): number | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L369" sourceLabel="dicomVolume.js:369" />

Get the diffusion b-value from Enhanced MR from non standard and/or private DICOM tags.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.

**Returns**

- `number | undefined` — The value, if present.

<MemberHeading id="parsenumber" depth="3" name="parseNumber" sig="parseNumber(value: any, parse: function): number | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L389" sourceLabel="dicomVolume.js:389" />

Parse a tag value to a number.

**Parameters**

- `value` (any) — The value to parse.
- `parse` (function) — The string to number parser to use.

**Returns**

- `number | undefined` — The number, or undefined if the value is absent or not a number.

<MemberHeading
  id="getdiffusionbvaluevolumeid"
  depth="3"
  name="getDiffusionBValueVolumeId"
  sig="getDiffusionBValueVolumeId(
	elements: Record.<string, DataElement>,
): SourcedNumberValue | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L408" sourceLabel="dicomVolume.js:408" />

Get the diffusion b-value as a volume id: with the key of the tag it was read from and its unit (no unit if the value is not a b-value, for example a dimension index).

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.

**Returns**

- [`SourcedNumberValue`](/sourcednumbervalue)` | undefined` — The volume id, if present.

<MemberHeading
  id="getmrvolumeid"
  depth="3"
  name="getMRVolumeId"
  sig="getMRVolumeId(
	elements: Record.<string, DataElement>,
): SourcedNumberValue | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L461" sourceLabel="dicomVolume.js:461" />

Get the volume id for MR images (can be time, b-value...).

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.

**Returns**

- [`SourcedNumberValue`](/sourcednumbervalue)` | undefined` — The volume id, if present.

<MemberHeading
  id="getframetemporalpositionindex"
  depth="3"
  name="getFrameTemporalPositionIndex"
  sig="getFrameTemporalPositionIndex(
	group: Record.<string, DataElement>,
): number | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L485" sourceLabel="dicomVolume.js:485" />

Get the temporal position index of a frame.

**Parameters**

- `group` (Record.\<string, [DataElement](/dataelement)>) — The per frame functional group.

**Returns**

- `number | undefined` — The value, if present.

<MemberHeading
  id="gettemporalpositionindex"
  depth="3"
  name="getTemporalPositionIndex"
  sig="getTemporalPositionIndex(
	elements: Record.<string, DataElement>,
): SourcedNumberValue | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L503" sourceLabel="dicomVolume.js:503" />

Get the temporal position index for enhanced multi-frame images.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.

**Returns**

- [`SourcedNumberValue`](/sourcednumbervalue)` | undefined` — The volume id, if present.

<MemberHeading
  id="getframetemporalpositiontimeoffset"
  depth="3"
  name="getFrameTemporalPositionTimeOffset"
  sig="getFrameTemporalPositionTimeOffset(
	group: Record.<string, DataElement>,
): number | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L517" sourceLabel="dicomVolume.js:517" />

Get the temporal position time offset of a frame.

**Parameters**

- `group` (Record.\<string, [DataElement](/dataelement)>) — The per frame functional group.

**Returns**

- `number | undefined` — The value, if present.

<MemberHeading
  id="gettemporalpositiontimeoffset"
  depth="3"
  name="getTemporalPositionTimeOffset"
  sig="getTemporalPositionTimeOffset(
	elements: Record.<string, DataElement>,
): SourcedNumberValue | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L536" sourceLabel="dicomVolume.js:536" />

Get the temporal position time offset (in seconds) for enhanced multi-frame images.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.

**Returns**

- [`SourcedNumberValue`](/sourcednumbervalue)` | undefined` — The value, if present.

<MemberHeading
  id="makenumerictaggetter"
  depth="3"
  name="makeNumericTagGetter"
  sig="makeNumericTagGetter(
	key: string,
	parse: function,
	unit?: string,
): function"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L553" sourceLabel="dicomVolume.js:553" />

Create a getter that reads a numeric value from a single tag.

**Parameters**

- `key` (string) — The tag key.
- `parse` (function) — The string to number parser to use.
- `unit` (string, optional) — The value unit as an i18n key.

**Returns**

- `function` — The getter, returns undefined if the tag is absent or not a number.

<MemberHeading id="warndeprecatedonce" depth="3" name="warnDeprecatedOnce" sig="warnDeprecatedOnce(message: string)" />

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L572" sourceLabel="dicomVolume.js:572" />

Log a deprecation warning, only once per message.

**Parameters**

- `message` (string) — The deprecation message.

<MemberHeading
  id="getcandidatevolumeid"
  depth="3"
  name="getCandidateVolumeId"
  sig="getCandidateVolumeId(
	candidate: VolumeIdCandidate,
	elements: Record.<string, DataElement>,
): VolumeId | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L587" sourceLabel="dicomVolume.js:587" />

Get the volume id of a candidate, its id named after the candidate.

**Parameters**

- `candidate` ([VolumeIdCandidate](/volumeidcandidate)) — The candidate.
- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM elements.

**Returns**

- [`VolumeId`](/volumeid)` | undefined` — The volume id, if present with a number id.

<MemberHeading id="getdeprecatedcandidate" depth="3" name="getDeprecatedCandidate" sig="getDeprecatedCandidate(getter: function): VolumeIdCandidate" />

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L602" sourceLabel="dicomVolume.js:602" />

Get a deprecated custom volume id getter as a candidate: its getter returns a number.

**Parameters**

- `getter` (function) — The deprecated getter.

**Returns**

- [`VolumeIdCandidate`](/volumeidcandidate) — The candidate.

<MemberHeading
  id="getvolumeid"
  depth="3"
  name="getVolumeId"
  sig="getVolumeId(
	elements: Record.<string, DataElement>,
): VolumeId | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L620" sourceLabel="dicomVolume.js:620" />

Get the volume id from a list of tags, used while loading (before the full data is known): the first defined volume id of the candidates flagged with `preLoad` (see defaultVolumeIdCandidates).

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM elements.

**Returns**

- [`VolumeId`](/volumeid)` | undefined` — The volume id if available.

<MemberHeading
  id="getvolumeidtagvalue"
  depth="3"
  name="getVolumeIdTagValue"
  sig="getVolumeIdTagValue(
	elements: Record.<string, DataElement>,
): number | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L647" sourceLabel="dicomVolume.js:647" />

Get the volume id number from a list of tags, used while loading (see getVolumeId).

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM elements.

**Returns**

- `number | undefined` — The id if available.

<MemberHeading
  id="getdatetimeinseconds"
  depth="3"
  name="getDateTimeInSeconds"
  sig="getDateTimeInSeconds(
	elements: Record.<string, DataElement>,
	dateKey: string,
	timeKey: string,
): SourcedNumberValue | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L660" sourceLabel="dicomVolume.js:660" />

Get a time as a number of seconds. If the date is available, it is included so that times spanning midnight are correctly ordered.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.
- `dateKey` (string) — The date tag key.
- `timeKey` (string) — The time tag key.

**Returns**

- [`SourcedNumberValue`](/sourcednumbervalue)` | undefined` — The time, if present.

<MemberHeading
  id="getacquisitiontime"
  depth="3"
  name="getAcquisitionTime"
  sig="getAcquisitionTime(
	elements: Record.<string, DataElement>,
): SourcedNumberValue | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L683" sourceLabel="dicomVolume.js:683" />

Get the acquisition time as a number of seconds (see getDateTimeInSeconds).

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.

**Returns**

- [`SourcedNumberValue`](/sourcednumbervalue)` | undefined` — The time, if present.

<MemberHeading
  id="getcontenttime"
  depth="3"
  name="getContentTime"
  sig="getContentTime(
	elements: Record.<string, DataElement>,
): SourcedNumberValue | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L695" sourceLabel="dicomVolume.js:695" />

Get the content time as a number of seconds (see getDateTimeInSeconds).

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM tags.

**Returns**

- [`SourcedNumberValue`](/sourcednumbervalue)` | undefined` — The time, if present.

<MemberHeading id="getvolumeidcandidates" depth="3" name="getVolumeIdCandidates" sig="getVolumeIdCandidates(): Array.<VolumeIdCandidate>" />

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L707" sourceLabel="dicomVolume.js:707" />

Get the list of volume id candidates: the custom one if defined, the default one otherwise.

**Returns**

- `Array.<`[`VolumeIdCandidate`](/volumeidcandidate)`>` — The candidates.

<MemberHeading
  id="getvolumeidcandidate"
  depth="3"
  name="getVolumeIdCandidate"
  sig="getVolumeIdCandidate(
	name: string,
): VolumeIdCandidate | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L720" sourceLabel="dicomVolume.js:720" />

Get a volume id candidate from its name, including the deprecated custom getters (named 'custom').

**Parameters**

- `name` (string) — The candidate name.

**Returns**

- [`VolumeIdCandidate`](/volumeidcandidate)` | undefined` — The candidate, if found.

<MemberHeading
  id="getvolumeindices"
  depth="3"
  name="getVolumeIndices"
  sig="getVolumeIndices(
	values: Array.<any>,
	sliceIndices: Array.<number>,
	numberOfSlices: number,
): Array.<number> | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L747" sourceLabel="dicomVolume.js:747" />

Get the volume index of each item (file or frame) from its volume id. The grouping is valid if all items have a numeric id, there are at least two distinct ids and each (slice, volume) pair is unique with a total of slices times volumes items: every volume then contains every slice.

**Parameters**

- `values` (Array.\<any>) — The volume id of each item.
- `sliceIndices` (Array.\<number>) — The slice index of each item.
- `numberOfSlices` (number) — The number of distinct slices.

**Returns**

- `Array.<number> | undefined` — The volume index of each item (volumes ordered by ascending id), undefined if the grouping is not valid.

<MemberHeading
  id="getcandidatevolumevalues"
  depth="3"
  name="getCandidateVolumeValues"
  sig="getCandidateVolumeValues(
	candidate: VolumeIdCandidate,
	elementsList: Array.<Record.<string, DataElement>>,
	volumeIndices: Array.<number>,
): Array.<SourcedNumberValue> | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L796" sourceLabel="dicomVolume.js:796" />

Get the associated value of each volume from a value candidate: the smallest value of the volume (relative to the one of the first volume for `relative` candidates). Each volume spans from its smallest to its largest value, the spans must not overlap and must follow the volume order.

**Parameters**

- `candidate` ([VolumeIdCandidate](/volumeidcandidate)) — The candidate.
- `elementsList` (Array.\<Record.\<string, [DataElement](/dataelement)>>) — The DICOM tags of each item.
- `volumeIndices` (Array.\<number>) — The volume index of each item.

**Returns**

- `Array.<`[`SourcedNumberValue`](/sourcednumbervalue)`> | undefined` — The associated value of each volume, undefined if the candidate is not valid.

<MemberHeading
  id="guessvolumevalues"
  depth="3"
  name="guessVolumeValues"
  sig="guessVolumeValues(
	elementsList: Array.<Record.<string, DataElement>>,
	volumeIndices: Array.<number>,
): Array.<SourcedNumberValue> | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L840" sourceLabel="dicomVolume.js:840" />

Guess the associated value of each volume: value candidates are tried in order, the first valid one is kept (see volumeValueCandidates).

**Parameters**

- `elementsList` (Array.\<Record.\<string, [DataElement](/dataelement)>>) — The DICOM tags of each item.
- `volumeIndices` (Array.\<number>) — The volume index of each item.

**Returns**

- `Array.<`[`SourcedNumberValue`](/sourcednumbervalue)`> | undefined` — The associated value of each volume, undefined if no candidate is valid.

<MemberHeading
  id="getvolumevalues"
  depth="3"
  name="getVolumeValues"
  sig="getVolumeValues(
	volumeIds: Array.<VolumeId>,
	elementsList: Array.<Record.<string, DataElement>>,
): Array.<SourcedNumberValue> | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L866" sourceLabel="dicomVolume.js:866" />

Get the associated value of each volume, once all data is loaded: the id relative to the first one for `relative` candidates (for example AcquisitionTime), guessed for indices (ids without unit, for example TemporalPositionIdentifier, see volumeValueCandidates). Other ids have none.

**Parameters**

- `volumeIds` (Array.\<[VolumeId](/volumeid)>) — The volume ids, sorted by id (as returned by Geometry.getVolumeIds).
- `elementsList` (Array.\<Record.\<string, [DataElement](/dataelement)>>) — The DICOM tags of each item (file or frame).

**Returns**

- `Array.<`[`SourcedNumberValue`](/sourcednumbervalue)`> | undefined` — The associated value of each volume, undefined if not available.

<MemberHeading
  id="guessvolumeindices"
  depth="3"
  name="guessVolumeIndices"
  sig="guessVolumeIndices(
	elementsList: Array.<Record.<string, DataElement>>,
	sliceIndices: Array.<number>,
	numberOfSlices: number,
): Object | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L907" sourceLabel="dicomVolume.js:907" />

Guess the volume index of items (files or frames) that share slice positions: volume id candidates are tried in order, the first one that produces a valid grouping is kept (see getVolumeIndices). If the deprecated `custom.getPostLoadVolumeIdTagValue` is defined, it is used as the only candidate.

**Parameters**

- `elementsList` (Array.\<Record.\<string, [DataElement](/dataelement)>>) — The DICOM tags of each item.
- `sliceIndices` (Array.\<number>) — The slice index of each item.
- `numberOfSlices` (number) — The number of distinct slices.

**Returns**

- `Object | undefined` — The volume index and volume id of each item (without associated value, see getVolumeValues) and the volume id getter (`(elements) => number|undefined`) that produced them, undefined if no candidate produces a valid grouping.

<MemberHeading id="getruleelementvalue" depth="3" name="getRuleElementValue" sig="getRuleElementValue(value: any): Array" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L108" sourceLabel="dicomWriter.js:108" />

Get the element value from a replace rule value: an array value is used as the element value list, a single value is put in an array. The value is cloned to not modify the rule value when writing.

**Parameters**

- `value` (any) — The rule value.

**Returns**

- `Array` — The element value.

<MemberHeading id="clonerulevalue" depth="3" name="cloneRuleValue" sig="cloneRuleValue(value: any): any" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L121" sourceLabel="dicomWriter.js:121" />

Deep clone a writer rule value: arrays, typed arrays, data elements and plain objects (for example sequence items) are cloned, other values (strings, numbers, tags...) are returned as is.

**Parameters**

- `value` (any) — The value to clone.

**Returns**

- `any` — The cloned value.

<MemberHeading id="getdefaultanonymisationrules" depth="3" name="getDefaultAnonymisationRules" sig="getDefaultAnonymisationRules(): Record.<string, WriterRule>" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L148" sourceLabel="dicomWriter.js:148" />

Get simple (non official) DICOM anonymisation rules.

**Returns**

- `Record.<string, `[`WriterRule`](/writerrule)`>` — The rules.

<MemberHeading
  id="translatewriterrules"
  depth="3"
  name="translateWriterRules"
  sig="translateWriterRules(
	rules: Record.<string, WriterRule>,
): Record.<string, WriterRule>"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L170" sourceLabel="dicomWriter.js:170" />

Translate writer rules indexed by tag or group name into rules indexed by tag or group key, as expected by the writer. A group name is translated into all the groups that have it (for example 'Curve' gives '5000', '5002'...). Warning: group names are not defined by the DICOM standard, they come from the GDCM group name list (see `tagGroups`), which does not cover all groups. Prefer group keys. Rules already indexed by key (or `default`) are kept as is and take precedence over translated ones. Unknown names are dropped.

**Parameters**

- `rules` (Record.\<string, [WriterRule](/writerrule)>) — The name based rules.

**Returns**

- `Record.<string, `[`WriterRule`](/writerrule)`>` — The key based rules.

<MemberHeading id="iswriterrulekey" depth="3" name="isWriterRuleKey" sig="isWriterRuleKey(key: string): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L213" sourceLabel="dicomWriter.js:213" />

Check if a writer rule index is a tag key ('########') or a group key ('####'), possibly a range using 'x' as any hex digit (for example '60xx3000').

**Parameters**

- `key` (string) — The rule index.

**Returns**

- `boolean` — True if the index is a tag or group key.

<MemberHeading id="normalisewriterrulekey" depth="3" name="normaliseWriterRuleKey" sig="normaliseWriterRuleKey(key: string): string" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L224" sourceLabel="dicomWriter.js:224" />

Normalise a writer rule key: upper case hex digits and lower case 'x'.

**Parameters**

- `key` (string) — The rule key.

**Returns**

- `string` — The normalised key.

<MemberHeading id="iswriterrulerange" depth="3" name="isWriterRuleRange" sig="isWriterRuleRange(key: string): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L234" sourceLabel="dicomWriter.js:234" />

Check if a writer rule key is a range (contains 'x').

**Parameters**

- `key` (string) — The rule key.

**Returns**

- `boolean` — True if the key is a range.

<MemberHeading
  id="getwriterrangerules"
  depth="3"
  name="getWriterRangeRules"
  sig="getWriterRangeRules(
	rules: Record.<string, WriterRule>,
	length: number,
): Array.<WriterRangeRule>"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L254" sourceLabel="dicomWriter.js:254" />

Get the range rules of a given key length, sorted by specificity: the ones with less 'x' first.

**Parameters**

- `rules` (Record.\<string, [WriterRule](/writerrule)>) — The rules.
- `length` (number) — The key length: 8 for tags, 4 for groups.

**Returns**

- `Array.<`[`WriterRangeRule`](/writerrangerule)`>` — The sorted range rules.

<MemberHeading
  id="findwriterrangerule"
  depth="3"
  name="findWriterRangeRule"
  sig="findWriterRangeRule(
	rangeRules: Array.<WriterRangeRule>,
	key: string,
): WriterRule | undefined"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L272" sourceLabel="dicomWriter.js:272" />

Find the first range rule matching a key.

**Parameters**

- `rangeRules` (Array.\<[WriterRangeRule](/writerrangerule)>) — The sorted range rules.
- `key` (string) — The tag or group key.

**Returns**

- [`WriterRule`](/writerrule)` | undefined` — The matching rule if found.

<MemberHeading id="getuid" depth="3" name="getUID" sig="getUID(tagName: string): string" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L297" sourceLabel="dicomWriter.js:297" />

Get a UID for a DICOM tag.

Note: Use [https://github.com/uuidjs/uuid](https://github.com/uuidjs/uuid)?

Ref:

- [http://dicom.nema.org/medical/dicom/2024a/output/chtml/part05/chapter\_9.html](http://dicom.nema.org/medical/dicom/2024a/output/chtml/part05/chapter_9.html),
- [http://dicomiseasy.blogspot.com/2011/12/chapter-4-dicom-objects-in-chapter-3.html](http://dicomiseasy.blogspot.com/2011/12/chapter-4-dicom-objects-in-chapter-3.html),
- [https://stackoverflow.com/questions/46304306/how-to-generate-unique-dicom-uid](https://stackoverflow.com/questions/46304306/how-to-generate-unique-dicom-uid).

**Parameters**

- `tagName` (string) — The input tag.

**Returns**

- `string` — The corresponding UID.

<MemberHeading id="iseven" depth="3" name="isEven" sig="isEven(number: number): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L332" sourceLabel="dicomWriter.js:332" />

Return true if the input number is even.

**Parameters**

- `number` (number) — The number to check.

**Returns**

- `boolean` — True is the number is even.

<MemberHeading id="istypedarrayvr" depth="3" name="isTypedArrayVr" sig="isTypedArrayVr(vr: string): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L343" sourceLabel="dicomWriter.js:343" />

Is the input VR a VR that stores data in a typed array. TODO: include ox and xs?

**Parameters**

- `vr` (string) — The element VR.

**Returns**

- `boolean` — True if the VR is a typed array one.

<MemberHeading id="isstringvr" depth="3" name="isStringVr" sig="isStringVr(vr: string): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L355" sourceLabel="dicomWriter.js:355" />

Is the input VR a string VR.

**Parameters**

- `vr` (string) — The element VR.

**Returns**

- `boolean` — True if the VR is a string one.

<MemberHeading id="isvrtopad" depth="3" name="isVrToPad" sig="isVrToPad(vr: string): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L369" sourceLabel="dicomWriter.js:369" />

Is the input VR a VR that could need padding.

See [http://dicom.nema.org/medical/dicom/2024a/output/chtml/part05/sect\_6.2.html](http://dicom.nema.org/medical/dicom/2024a/output/chtml/part05/sect_6.2.html).

**Parameters**

- `vr` (string) — The element VR.

**Returns**

- `boolean` — True if the VR needs padding.

<MemberHeading id="getvrpad" depth="3" name="getVrPad" sig="getVrPad(vr: string): string" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L379" sourceLabel="dicomWriter.js:379" />

Get the VR specific padding value.

**Parameters**

- `vr` (string) — The element VR.

**Returns**

- `string` — The value used to pad.

<MemberHeading
  id="uint8arraypush"
  depth="3"
  name="uint8ArrayPush"
  sig="uint8ArrayPush(
	arr: Array | Uint8Array,
	value: Array | Uint8Array,
): Uint8Array"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L398" sourceLabel="dicomWriter.js:398" />

Push a value at the end of an input Uint8Array.

**Parameters**

- `arr` (Array | Uint8Array) — The input array.
- `value` (Array | Uint8Array) — The value to push.

**Returns**

- `Uint8Array` — The new array.

<MemberHeading id="padobvalue" depth="3" name="padOBValue" sig="padOBValue(value: Array | Uint8Array): Array | Uint8Array" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L411" sourceLabel="dicomWriter.js:411" />

Pad an input OB value.

**Parameters**

- `value` (Array | Uint8Array) — The input value.

**Returns**

- `Array | Uint8Array` — The padded input.

<MemberHeading id="flattenarrayoftypedarrays" depth="3" name="flattenArrayOfTypedArrays" sig="flattenArrayOfTypedArrays(initialArray: Array): object" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L444" sourceLabel="dicomWriter.js:444" />

Helper method to flatten an array of typed arrays to 2D typed array.

**Parameters**

- `initialArray` (Array) — Array of typed arrays.

**Returns**

- `object` — A typed array containing all values.

<MemberHeading
  id="checkandfixunknownvr"
  depth="3"
  name="checkAndFixUnknownVR"
  sig="checkAndFixUnknownVR(
	element: DataElement,
	isLittleEndian?: boolean,
)"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L1579" sourceLabel="dicomWriter.js:1579" />

Fix for broken DICOM elements: replace "UN" with correct VR if the element exists in dictionary.

**Parameters**

- `element` ([DataElement](/dataelement)) — The DICOM element.
- `isLittleEndian` (boolean, optional) — Flag to tell if the data is little or big endian (default: true).

<MemberHeading
  id="getuint8tovrvalue"
  depth="3"
  name="getUint8ToVrValue"
  sig="getUint8ToVrValue(
	value: object,
	vr: string,
	isLittleEndian?: boolean,
): object"
/>

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L1611" sourceLabel="dicomWriter.js:1611" />

Get the casted typed array value from Uint8 to vr type.

**Parameters**

- `value` (object) — The value to cast.
- `vr` (string) — The DICOM element VR.
- `isLittleEndian` (boolean, optional) — Flag to tell if the data is little or big endian (default: true).

**Returns**

- `object` — The element value casted to the vr type.

<MemberHeading id="getdataelement" depth="3" name="getDataElement" sig="getDataElement(tagName: string): DataElement" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L1646" sourceLabel="dicomWriter.js:1646" />

Get a DICOM element from its tag name (value set separatly).

**Parameters**

- `tagName` (string) — The string tag name.

**Returns**

- [`DataElement`](/dataelement) — The DICOM element.

<MemberHeading id="getbpeforvrtype" depth="3" name="getBpeForVrType" sig="getBpeForVrType(vrType: string): number" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L1660" sourceLabel="dicomWriter.js:1660" />

Get the number of bytes per element for a given VR type.

**Parameters**

- `vrType` (string) — The VR type as defined in the dictionary.

**Returns**

- `number` — The bytes per element.

<MemberHeading
  id="addtagstodictionary"
  depth="3"
  name="addTagsToDictionary"
  sig="addTagsToDictionary(
	group: string,
	tags: Record.<string, Array.<string>>,
)"
/>

<MemberMeta sourceHref="/source/src/dicom/dictionary-js/#L22" sourceLabel="dictionary.js:22" />

Add tags to the dictionary.

**Parameters**

- `group` (string) — The group key.
- `tags` (Record.\<string, Array.\<string>>) — The tags to add as an object indexed by element key with values as: \[VR, multiplicity, TagName] (all strings).

<MemberHeading id="is32bitvlvr" depth="3" name="is32bitVLVR" sig="is32bitVLVR(vr: string): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dictionary-js/#L157" sourceLabel="dictionary.js:157" />

Does the input Value Representation (VR) have a 32bit Value Length (VL).

**Parameters**

- `vr` (string) — The data Value Representation (VR).

**Returns**

- `boolean` — True if this VR has a 32-bit VL.

<MemberHeading id="ischarsetstringvr" depth="3" name="isCharSetStringVR" sig="isCharSetStringVR(vr: string): boolean" />

<MemberMeta sourceHref="/source/src/dicom/dictionary-js/#L185" sourceLabel="dictionary.js:185" />

Does the input Value Representation (VR) have an special character repertoire.

**Parameters**

- `vr` (string) — The data VR.

**Returns**

- `boolean` — True if this VR has a special char set.

<MemberHeading
  id="getdataelementsreducer"
  depth="3"
  name="getDataElementsReducer"
  sig="getDataElementsReducer(
	dataElements: Record.<string, DataElement>,
): function"
/>

<MemberMeta sourceHref="/source/src/dicom/simpletagvalues-js/#L25" sourceLabel="simpleTagValues.js:25" />

Get an array reducer to reduce an array of tag keys taken from the input dataElements and return as simple tag values.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The meta data index by tag keys.

**Returns**

- `function` — An array reducer callbackFn (accumulator, currentValue).

<MemberHeading
  id="getassimpletagvalues"
  depth="3"
  name="getAsSimpleTagValues"
  sig="getAsSimpleTagValues(
	dataElements: Record.<string, DataElement>,
): SimpleTagValues"
/>

<MemberMeta sourceHref="/source/src/dicom/simpletagvalues-js/#L74" sourceLabel="simpleTagValues.js:74" />

Get the meta data as simple tag values:

- indexed by tag names instead of tag keys,
- no element object, just value if not sequence nor merged item.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The data elements index by tag keys.

**Returns**

- [`SimpleTagValues`](/simpletagvalues) — The simple tag values.

<MemberHeading id="mergetagvalues" depth="3" name="mergeTagValues" sig="mergeTagValues(list1: SimpleTagValues, list2: SimpleTagValues)" />

<MemberMeta sourceHref="/source/src/dicom/simpletagvalues-js/#L86" sourceLabel="simpleTagValues.js:86" />

Merge a simple tag value list into another. Mutates the first input.

**Parameters**

- `list1` ([SimpleTagValues](/simpletagvalues)) — Base list, will be modified.
- `list2` ([SimpleTagValues](/simpletagvalues)) — List to merge into list1.

<MemberHeading
  id="getelementsfromsimpletagvalues"
  depth="3"
  name="getElementsFromSimpleTagValues"
  sig="getElementsFromSimpleTagValues(
	simpleTags: SimpleTagValues,
): Record.<string, DataElement>"
/>

<MemberMeta sourceHref="/source/src/dicom/simpletagvalues-js/#L106" sourceLabel="simpleTagValues.js:106" />

Get the DICOM elements from a 'simple' DICOM tags object. The input object is a simplified version of the oficial DICOM json with tag names instead of keys and direct values (no value property) for simple tags. See synthetic test data (in tests/dicom) for examples.

**Parameters**

- `simpleTags` ([SimpleTagValues](/simpletagvalues)) — The 'simple' DICOM tags object.

**Returns**

- `Record.<string, `[`DataElement`](/dataelement)`>` — The DICOM elements.

<MemberHeading id="isvolumeonlymove" depth="3" name="isVolumeOnlyMove" sig="isVolumeOnlyMove(diffDims?: Array.<number>): boolean" />

<MemberMeta sourceHref="/source/src/gui/binders-js/#L117" sourceLabel="binders.js:117" />

Check if only non spatial dimensions changed.

**Parameters**

- `diffDims` (Array.\<number>, optional) — The modified dimensions.

**Returns**

- `boolean` — True if only non spatial dimensions changed.

<MemberHeading id="isunchangedposition" depth="3" name="isUnchangedPosition" sig="isUnchangedPosition(diffDims?: Array.<number>): boolean" />

<MemberMeta sourceHref="/source/src/gui/binders-js/#L129" sourceLabel="binders.js:129" />

Check if the position index did not change.

**Parameters**

- `diffDims` (Array.\<number>, optional) — The modified dimensions.

**Returns**

- `boolean` — True if no index dimension changed.

<MemberHeading
  id="getboundposition"
  depth="3"
  name="getBoundPosition"
  sig="getBoundPosition(
	vc: ViewController,
	values: Array.<number>,
	keepVolume: boolean,
	diffDims?: Array.<number>,
): Point"
/>

<MemberMeta sourceHref="/source/src/gui/binders-js/#L142" sourceLabel="binders.js:142" />

Get the bound position of a target view.

**Parameters**

- `vc` ([ViewController](/viewcontroller)) — The target view controller.
- `values` (Array.\<number>) — The source position values.
- `keepVolume` (boolean) — True to keep the target volume.
- `diffDims` (Array.\<number>, optional) — The modified dimensions.

**Returns**

- [`Point`](/point) — The target position.

<MemberHeading
  id="getinteractioneventoptions"
  depth="3"
  name="getInteractionEventOptions"
  sig="getInteractionEventOptions(
	eventName: string,
): AddEventListenerOptions"
/>

<MemberMeta sourceHref="/source/src/gui/generic-js/#L41" sourceLabel="generic.js:41" />

Get the listener options of an interaction event: only the [NonPassiveInteractionEventNames](/global#nonpassiveinteractioneventnames) are not passive.

**Parameters**

- `eventName` (string) — The interaction event name.

**Returns**

- `AddEventListenerOptions` — The listener options.

<MemberHeading
  id="gettouchespositions"
  depth="3"
  name="getTouchesPositions"
  sig="getTouchesPositions(
	touches: TouchList,
	rect: DOMRect,
): Array.<Point2D>"
/>

<MemberMeta sourceHref="/source/src/gui/generic-js/#L54" sourceLabel="generic.js:54" />

Get the positions (without the parent offset) of a list of touch events.

**Parameters**

- `touches` (TouchList) — The list of touch events.
- `rect` (DOMRect) — The bounding client rect.

**Returns**

- `Array.<`[`Point2D`](/point2d)`>` — The list of positions of the touch events.

<MemberHeading id="gettouchpoints" depth="3" name="getTouchPoints" sig="getTouchPoints(event: TouchEvent): Array.<Point2D>" />

<MemberMeta sourceHref="/source/src/gui/generic-js/#L80" sourceLabel="generic.js:80" />

Get the offsets of an input touch event.

**Parameters**

- `event` (TouchEvent) — The event to get the offset from.

**Returns**

- `Array.<`[`Point2D`](/point2d)`>` — The array of points.

<MemberHeading id="getmousepoint" depth="3" name="getMousePoint" sig="getMousePoint(event: MouseEvent): Point2D" />

<MemberMeta sourceHref="/source/src/gui/generic-js/#L103" sourceLabel="generic.js:103" />

Get the offset of an input mouse event.

**Parameters**

- `event` (MouseEvent) — The event to get the offset from.

**Returns**

- [`Point2D`](/point2d) — The 2D point.

<MemberHeading
  id="cancreatecanvas"
  depth="3"
  name="canCreateCanvas"
  sig="canCreateCanvas(
	width: number,
	height: number,
	doc: Document,
): boolean"
/>

<MemberMeta sourceHref="/source/src/gui/generic-js/#L126" sourceLabel="generic.js:126" />

Test if a canvas with the input size can be created.

Ref:

- [https://github.com/ivmartel/dwv/issues/902](https://github.com/ivmartel/dwv/issues/902),
- [https://github.com/jhildenbiddle/canvas-size/blob/v1.2.4/src/canvas-test.js](https://github.com/jhildenbiddle/canvas-size/blob/v1.2.4/src/canvas-test.js).

**Parameters**

- `width` (number) — The canvas width.
- `height` (number) — The canvas height.
- `doc` (Document) — The document used to create the test canvases.

**Returns**

- `boolean` — True if the canvas can be created.

<MemberHeading id="fitsin" depth="3" name="fitsIn" sig="fitsIn(size: Scalar2D, other: Scalar2D): boolean" />

<MemberMeta sourceHref="/source/src/gui/generic-js/#L168" sourceLabel="generic.js:168" />

Check if a size is smaller or equal to another one in both dimensions.

**Parameters**

- `size` ([Scalar2D](/scalar2d)) — The size to check.
- `other` ([Scalar2D](/scalar2d)) — The size to compare to.

**Returns**

- `boolean` — True if size fits in other.

<MemberHeading id="getnumbertoprecision" depth="3" name="getNumberToPrecision" sig="getNumberToPrecision(precision: number): function" />

<MemberMeta sourceHref="/source/src/gui/infodata-js/#L54" sourceLabel="infoData.js:54" />

Get a number toprecision function with the provided precision.

**Parameters**

- `precision` (number) — The precision to achieve.

**Returns**

- `function` — The to precision function.

<MemberHeading id="createdefaultreplaceformat" depth="3" name="createDefaultReplaceFormat" sig="createDefaultReplaceFormat(length: number): string" />

<MemberMeta sourceHref="/source/src/gui/infodata-js/#L67" sourceLabel="infoData.js:67" />

Create a default replace format from a given length. For example: '{v0}, {v1}'.

**Parameters**

- `length` (number) — The length of the format.

**Returns**

- `string` — A replace format.

<MemberHeading id="replaceflags" depth="3" name="replaceFlags" sig="replaceFlags(inputStr: string, values: Array): string" />

<MemberMeta sourceHref="/source/src/gui/infodata-js/#L91" sourceLabel="infoData.js:91" />

Replace flags in a input string. Flags are keywords surrounded with curly braces in the form: '{v0}, {v1}'.

**Parameters**

- `inputStr` (string) — The input string.
- `values` (Array) — An array of values.

**Returns**

- `string` — The result string.

**Example**

<Playground providers="codepen">
  ```js
  var values = ["a", "b"];
     var str = "The length is: {v0}. The size is: {v1}";
     var res = replaceFlags(str, values);
     // "The length is: a. The size is: b"
  ```
</Playground>

<MemberHeading
  id="createinfodata"
  depth="3"
  name="createInfoData"
  sig="createInfoData(
	dicomElements: object,
	configs: Record.<string, Array.<InfoDataItem>>,
): Array.<InfoDataItem>"
/>

<MemberMeta sourceHref="/source/src/gui/infodata-js/#L376" sourceLabel="infoData.js:376" />

Create info data array for a DICOM image.

**Parameters**

- `dicomElements` (object) — DICOM elements of the image.
- `configs` (Record.\<string, Array.\<[InfoDataItem](/infodataitem)>>) — The info data configs.

**Returns**

- `Array.<`[`InfoDataItem`](/infodataitem)`>` — Info data array.

<MemberHeading
  id="createinfodatafordom"
  depth="3"
  name="createInfoDataForDom"
  sig="createInfoDataForDom(
	domElements: object,
	configs: Record.<string, Array.<InfoDataItem>>,
): Array.<InfoDataItem>"
/>

<MemberMeta sourceHref="/source/src/gui/infodata-js/#L463" sourceLabel="infoData.js:463" />

Create info data array for a DOM image.

**Parameters**

- `domElements` (object) — Meta data.
- `configs` (Record.\<string, Array.\<[InfoDataItem](/infodataitem)>>) — The info data configs.

**Returns**

- `Array.<`[`InfoDataItem`](/infodataitem)`>` — Info data array.

<MemberHeading id="getlikey" depth="3" name="getLiKey" sig="getLiKey(data: InfoDataItem): string" />

<MemberMeta sourceHref="/source/src/gui/infolayer-js/#L13" sourceLabel="infoLayer.js:13" />

Get the key of the HTML li element of a data.

**Parameters**

- `data` ([InfoDataItem](/infodataitem)) — The associated data.

**Returns**

- `string` — The key.

<MemberHeading id="getlayerdivid" depth="3" name="getLayerDivId" sig="getLayerDivId(groupDivId: string, layerIndex: number): string" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L28" sourceLabel="layerGroup.js:28" />

Get the layer div id. For example: 'layerGroup0-layer-0'.

**Parameters**

- `groupDivId` (string) — The layer group div id.
- `layerIndex` (number) — The layer index.

**Returns**

- `string` — A string id.

<MemberHeading id="getlayerdetailsfromlayerdivid" depth="3" name="getLayerDetailsFromLayerDivId" sig="getLayerDetailsFromLayerDivId(idString: string): object" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L39" sourceLabel="layerGroup.js:39" />

Get the layer details from a div id created by getLayerDivId.

**Parameters**

- `idString` (string) — The layer div id.

**Returns**

- `object` — The layer details as {groupDivId, layerIndex, layerId}.

<MemberHeading id="getlayerdetailsfromevent" depth="3" name="getLayerDetailsFromEvent" sig="getLayerDetailsFromEvent(event: object): object" />

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L59" sourceLabel="layerGroup.js:59" />

Get the layer details from a mouse event.

**Parameters**

- `event` (object) — The event to get the layer div id from. Expecting an event origininating from a canvas inside a layer HTML div with the 'layer' class and id generated with `getLayerDivId`.

**Returns**

- `object` — The layer details as {groupDivId, layerIndex, layerId}.

<MemberHeading
  id="getscaledoffset"
  depth="3"
  name="getScaledOffset"
  sig="getScaledOffset(
	offset: Scalar2D,
	scale: Scalar2D,
	newScale: Scalar2D,
	center: Scalar2D,
): Scalar2D"
/>

<MemberMeta sourceHref="/source/src/gui/layergroup-js/#L79" sourceLabel="layerGroup.js:79" />

Get a scaled offset to adapt to new scale and such as the input center stays at the same position.

**Parameters**

- `offset` ([Scalar2D](/scalar2d)) — The previous offset as {x,y}.
- `scale` ([Scalar2D](/scalar2d)) — The previous scale as {x,y}.
- `newScale` ([Scalar2D](/scalar2d)) — The new scale as {x,y}.
- `center` ([Scalar2D](/scalar2d)) — The scale center as {x,y}.

**Returns**

- [`Scalar2D`](/scalar2d) — The scaled offset as {x,y}.

<MemberHeading id="touid" depth="3" name="toUID" sig="toUID(str: string): string" />

<MemberMeta sourceHref="/source/src/image/domreader-js/#L16" sourceLabel="domReader.js:16" />

Convert a string into an UID.

**Parameters**

- `str` (string) — The input string.

**Returns**

- `string` — The input string converted to numbers using parseInt with a 36 radix (10 digits from 0 to 9 + 26 digits from a to z).

<MemberHeading id="imagedatatobuffer" depth="3" name="imageDataToBuffer" sig="imageDataToBuffer(imageData: object): Uint8Array" />

<MemberMeta sourceHref="/source/src/image/domreader-js/#L26" sourceLabel="domReader.js:26" />

Create a simple array buffer from an ImageData buffer.

**Parameters**

- `imageData` (object) — The ImageData taken from a context.

**Returns**

- `Uint8Array` — The image buffer.

<MemberHeading
  id="getdefaultimage"
  depth="3"
  name="getDefaultImage"
  sig="getDefaultImage(
	width: number,
	height: number,
	sliceIndex: number,
	imageBuffer: object,
	numberOfFrames: number,
	imageUid: string,
): object"
/>

<MemberMeta sourceHref="/source/src/image/domreader-js/#L52" sourceLabel="domReader.js:52" />

Get an image from an input context imageData.

**Parameters**

- `width` (number) — The width of the coresponding image.
- `height` (number) — The height of the coresponding image.
- `sliceIndex` (number) — The slice index of the imageData.
- `imageBuffer` (object) — The image buffer.
- `numberOfFrames` (number) — The final number of frames.
- `imageUid` (string) — The image UID.

**Returns**

- `object` — The corresponding view.

<MemberHeading
  id="getviewfromdomimage"
  depth="3"
  name="getViewFromDOMImage"
  sig="getViewFromDOMImage(
	domImage: HTMLImageElement,
	origin: string | File,
	index: number,
): object"
/>

<MemberMeta sourceHref="/source/src/image/domreader-js/#L87" sourceLabel="domReader.js:87" />

Get data from an input image using a canvas.

**Parameters**

- `domImage` (HTMLImageElement) — The DOM Image, an HTMLImageElement with extra info.
- `origin` (string | File) — The data origin.
- `index` (number) — The data index.

**Returns**

- `object` — A load data event.

<MemberHeading
  id="getviewfromdomvideo"
  depth="3"
  name="getViewFromDOMVideo"
  sig="getViewFromDOMVideo(
	video: object,
	onloaditem: function,
	onload: object,
	onprogress: object,
	onloadend: object,
	origin: string | File,
	dataIndex: number,
)"
/>

<MemberMeta sourceHref="/source/src/image/domreader-js/#L155" sourceLabel="domReader.js:155" />

Get data from an input image using a canvas.

**Parameters**

- `video` (object) — The DOM Video, an HTMLVideoElement with extra info.
- `onloaditem` (function) — On load callback.
- `onload` (object) — The function to call once the data is loaded.
- `onprogress` (object) — The function to call to report progress.
- `onloadend` (object) — The function to call to report load end.
- `origin` (string | File) — The data origin.
- `dataIndex` (number) — The data index.

<MemberHeading id="getcomparepoint3d" depth="3" name="getComparePoint3D" sig="getComparePoint3D(orientation: Matrix33): comparePointFn" />

<MemberMeta sourceHref="/source/src/image/geometry-js/#L49" sourceLabel="geometry.js:49" />

Get a point compare function using Z coordinate difference. Compares de-oriented points using the input orientation inverse.

**Parameters**

- `orientation` ([Matrix33](/matrix33)) — The orientation matrix.

**Returns**

- [`comparePointFn`](/comparepointfn) — The point compare function.

<MemberHeading
  id="getclosestoriginresidual"
  depth="3"
  name="getClosestOriginResidual"
  sig="getClosestOriginResidual(
	point3D: Point3D,
	origins: Array.<Point3D>,
	orientation: Matrix33,
): Object"
/>

<MemberMeta sourceHref="/source/src/image/geometry-js/#L73" sourceLabel="geometry.js:73" />

Get the closest of a list of origins to an input point, and the signed residual between the point and that origin, projected onto the slice-stacking direction (the orientation's 3rd column, ie its normal). A positive residual means the point is 'ahead of' (in the codirectional sense) the closest origin along that direction, a negative (or zero) residual means it is 'at or behind' it.

**Parameters**

- `point3D` ([Point3D](/point3d)) — The point to locate.
- `origins` (Array.\<[Point3D](/point3d)>) — The origins to search.
- `orientation` ([Matrix33](/matrix33)) — The geometry orientation.

**Returns**

- `Object` — The closest origin's index in the input list and the normal-projected residual to it.

<MemberHeading
  id="getclosestvalueindex"
  depth="3"
  name="getClosestValueIndex"
  sig="getClosestValueIndex(
	values: Array.<number>,
	value: number,
): number"
/>

<MemberMeta sourceHref="/source/src/image/geometry-js/#L101" sourceLabel="geometry.js:101" />

Get the index of the closest value of a sorted list.

**Parameters**

- `values` (Array.\<number>) — The sorted values.
- `value` (number) — The value to locate.

**Returns**

- `number` — The index of the closest value.

<MemberHeading
  id="getorientedarray3d"
  depth="3"
  name="getOrientedArray3D"
  sig="getOrientedArray3D(
	array3D: Array.<number>,
	orientation: Matrix33,
): Array.<number>"
/>

<MemberMeta sourceHref="/source/src/image/geometry-js/#L1101" sourceLabel="geometry.js:1101" />

Get the oriented values of an input 3D array.

**Parameters**

- `array3D` (Array.\<number>) — The 3D array.
- `orientation` ([Matrix33](/matrix33)) — The orientation 3D matrix.

**Returns**

- `Array.<number>` — The values reordered according to the orientation.

<MemberHeading
  id="getdeorientedarray3d"
  depth="3"
  name="getDeOrientedArray3D"
  sig="getDeOrientedArray3D(
	array3D: Array.<number>,
	orientation: Matrix33,
): Array.<number>"
/>

<MemberMeta sourceHref="/source/src/image/geometry-js/#L1114" sourceLabel="geometry.js:1114" />

Get the raw values of an oriented input 3D array.

**Parameters**

- `array3D` (Array.\<number>) — The 3D array.
- `orientation` ([Matrix33](/matrix33)) — The orientation 3D matrix.

**Returns**

- `Array.<number>` — The values reordered to compensate the orientation.

<MemberHeading
  id="getslicegeometryspacing"
  depth="3"
  name="getSliceGeometrySpacing"
  sig="getSliceGeometrySpacing(
	origins: Array.<Point3D>,
): number | undefined"
/>

<MemberMeta sourceHref="/source/src/image/geometry-js/#L1126" sourceLabel="geometry.js:1126" />

Get the slice spacing from the difference in the Z directions of input origins.

**Parameters**

- `origins` (Array.\<[Point3D](/point3d)>) — An array of Point3D.

**Returns**

- `number | undefined` — The spacing.

<MemberHeading
  id="getvolumeidsformerge"
  depth="3"
  name="getVolumeIdsForMerge"
  sig="getVolumeIdsForMerge(
	geometry: Geometry,
	volumeCount: number | undefined,
): Array.<VolumeId> | undefined"
/>

<MemberMeta sourceHref="/source/src/image/geometry-js/#L1171" sourceLabel="geometry.js:1171" />

Volume ids to copy onto a merged geometry.

A geometry qualifies when it has one id per volume and that count is the merged volume count. Copying them keeps world positions (volume ids) convertible back to volume indices.

**Parameters**

- `geometry` ([Geometry](/geometry)) — The input geometry.
- `volumeCount` (number | undefined) — The merged volume count.

**Returns**

- `Array.<`[`VolumeId`](/volumeid)`> | undefined` — The ids to copy.

<MemberHeading
  id="samevolumeids"
  depth="3"
  name="sameVolumeIds"
  sig="sameVolumeIds(
	ids0: Array.<VolumeId>,
	ids1: Array.<VolumeId>,
): boolean"
/>

<MemberMeta sourceHref="/source/src/image/geometry-js/#L1192" sourceLabel="geometry.js:1192" />

Check that two volume id lists match.

**Parameters**

- `ids0` (Array.\<[VolumeId](/volumeid)>) — The first list.
- `ids1` (Array.\<[VolumeId](/volumeid)>) — The second list.

**Returns**

- `boolean` — True when source, tag and value match in order.

<MemberHeading
  id="mergegeometries"
  depth="3"
  name="mergeGeometries"
  sig="mergeGeometries(
	geometry1: Geometry,
	geometry2: Geometry,
): Geometry"
/>

<MemberMeta sourceHref="/source/src/image/geometry-js/#L1220" sourceLabel="geometry.js:1220" />

Merge two geometries into one using the merge size and smallest resolution. Volume ids are kept when one input defines them for the merged volume count, or both define the same ids. A 3D overlay then does not drop the 4D underlay volume index. WARNING: needs to be called with the final geometries.

**Parameters**

- `geometry1` ([Geometry](/geometry)) — The first geometry.
- `geometry2` ([Geometry](/geometry)) — The second geometry.

**Returns**

- [`Geometry`](/geometry) — The merged geometry.

<MemberHeading
  id="getsliceindex"
  depth="3"
  name="getSliceIndex"
  sig="getSliceIndex(
	volumeGeometry: Geometry,
	sliceGeometry: Geometry,
): Index"
/>

<MemberMeta sourceHref="/source/src/image/image-js/#L49" sourceLabel="image.js:49" />

Get the slice index of an input slice into a volume geometry.

**Parameters**

- `volumeGeometry` ([Geometry](/geometry)) — The volume geometry.
- `sliceGeometry` ([Geometry](/geometry)) — The slice geometry.

**Returns**

- [`Index`](/index) — The index of the slice in the volume geomtry.

<MemberHeading
  id="getpalettecolourmap"
  depth="3"
  name="getPaletteColourMap"
  sig="getPaletteColourMap(
	dataElements: Record.<string, DataElement>,
): ColourMap | undefined"
/>

<MemberMeta sourceHref="/source/src/image/imagefactory-js/#L105" sourceLabel="imageFactory.js:105" />

Get the palette colour map.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The data elements.

**Returns**

- [`ColourMap`](/colourmap)` | undefined` — The palette colour map.

<MemberHeading
  id="getwindowpresets"
  depth="3"
  name="getWindowPresets"
  sig="getWindowPresets(
	dataElements: Record.<string, DataElement>,
	intensityFactor: number,
): Record.<string, WindowPreset> | undefined"
/>

<MemberMeta sourceHref="/source/src/image/imagefactory-js/#L198" sourceLabel="imageFactory.js:198" />

Get the window level presets.

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The data elements.
- `intensityFactor` (number) — The intensity factor.

**Returns**

- `Record.<string, `[`WindowPreset`](/windowpreset)`> | undefined` — The presets.

<MemberHeading
  id="getframegeometry"
  depth="3"
  name="getFrameGeometry"
  sig="getFrameGeometry(
	dataElements: DataElements,
	frameNumber: number,
): Geometry"
/>

<MemberMeta sourceHref="/source/src/image/imagefactory-js/#L262" sourceLabel="imageFactory.js:262" />

Get the geometry of one frame of a multi-frame data.

Frames with per-frame positions get their geometry from getSortedFramesGeometry: the frame position and the data time, or the volume index as time if frames share positions. Other frames are time frames: the frame geometry has the root position and the frame number as time. Once all frames are appended (see Image.appendSlice), the image has the same layout as the one created from the full buffer.

**Parameters**

- `dataElements` ([DataElements](/dataelements)) — The DICOM tags.
- `frameNumber` (number) — The frame number.

**Returns**

- [`Geometry`](/geometry) — The frame geometry.

<MemberHeading id="democreateimage" depth="3" name="demoCreateImage" sig="demoCreateImage(elements: Record.<string, DataElement>): Image" />

<MemberMeta sourceHref="/source/src/image/imagefactory-js/#L536" sourceLabel="imageFactory.js:536" />

Demo Image creation from DICOM elements: takes elements and first element of the pixel buffer to create an image.

Warning: not to be used in production code.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM elements.

**Returns**

- [`Image`](/image) — The Image object.

<MemberHeading
  id="simplerange"
  depth="3"
  name="simpleRange"
  sig="simpleRange(
	dataAccessor: function,
	start: number,
	end: number,
	increment?: number,
): object"
/>

<MemberMeta sourceHref="/source/src/image/iterator-js/#L20" sourceLabel="iterator.js:20" />

Get an simple iterator for a given range for a one component data.

Ref: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration\_protocols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols).

**Parameters**

- `dataAccessor` (function) — Function to access data.
- `start` (number) — The start of the range (included).
- `end` (number) — The end of the range (excluded).
- `increment` (number, optional) — The increment between indicies (default=1).

**Returns**

- `object` — An iterator folowing the iterator and iterable protocol.

<MemberHeading
  id="range"
  depth="3"
  name="range"
  sig="range(
	dataAccessor: function,
	start: number,
	maxIter: number,
	increment: number,
	blockMaxIter: number,
	blockIncrement: number,
	reverse1: boolean,
	reverse2: boolean,
): object"
/>

<MemberMeta sourceHref="/source/src/image/iterator-js/#L64" sourceLabel="iterator.js:64" />

Get an iterator for a given range for a one component data.

Using 'maxIter' and not an 'end' index since it fails in some edge cases (for ex coronal2, ie zxy).

**Parameters**

- `dataAccessor` (function) — Function to access data.
- `start` (number) — Zero-based index at which to start the iteration.
- `maxIter` (number) — The maximum number of iterations.
- `increment` (number) — Increment between indicies.
- `blockMaxIter` (number) — Number of applied increment after which blockIncrement is applied.
- `blockIncrement` (number) — Increment after blockMaxIter is reached, the value is from block start to the next block start.
- `reverse1` (boolean) — If true, loop from end to start. WARN: don't forget to set the value of start as the last index!
- `reverse2` (boolean) — If true, loop from block end to block start.

**Returns**

- `object` — An iterator folowing the iterator and iterable protocol.

<MemberHeading
  id="rangeregion"
  depth="3"
  name="rangeRegion"
  sig="rangeRegion(
	dataAccessor: function,
	start: number,
	end: number,
	increment: number,
	regionSize: number,
	regionOffset: number,
): object"
/>

<MemberMeta sourceHref="/source/src/image/iterator-js/#L133" sourceLabel="iterator.js:133" />

Get an iterator for a given range with bounds (for a one component data).

Ref: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration\_protocols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols).

**Parameters**

- `dataAccessor` (function) — Function to access data.
- `start` (number) — The start of the range (included).
- `end` (number) — The end of the range (excluded).
- `increment` (number) — The increment between indicies.
- `regionSize` (number) — The size of the region to iterate through.
- `regionOffset` (number) — The offset between regions.

**Returns**

- `object` — An iterator folowing the iterator and iterable protocol.

<MemberHeading
  id="rangeregions"
  depth="3"
  name="rangeRegions"
  sig="rangeRegions(
	dataAccessor: function,
	start: number,
	end: number,
	increment: number,
	regions: Array.<Array.<number>>,
): object"
/>

<MemberMeta sourceHref="/source/src/image/iterator-js/#L174" sourceLabel="iterator.js:174" />

Get an iterator for a given range with bounds (for a one component data).

Ref: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration\_protocols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols).

**Parameters**

- `dataAccessor` (function) — Function to access data.
- `start` (number) — The start of the range (included).
- `end` (number) — The end of the range (excluded).
- `increment` (number) — The increment between indicies.
- `regions` (Array.\<Array.\<number>>) — An array of regions: \[off0, size, off1].

**Returns**

- `object` — An iterator folowing the iterator and iterable protocol.

<MemberHeading
  id="simplerange3d"
  depth="3"
  name="simpleRange3d"
  sig="simpleRange3d(
	dataAccessor: function,
	start: number,
	end: number,
	increment: number,
	isPlanar: boolean,
): object"
/>

<MemberMeta sourceHref="/source/src/image/iterator-js/#L225" sourceLabel="iterator.js:225" />

Get an iterator for a given range for a 3 components data.

Ref: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration\_protocols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols).

**Parameters**

- `dataAccessor` (function) — Function to access data.
- `start` (number) — The start of the range (included).
- `end` (number) — The end of the range (excluded). (end - start) needs to be a multiple of 3...
- `increment` (number) — The increment between indicies (default=1).
- `isPlanar` (boolean) — A flag to know if the data is planar (RRRR...GGGG...BBBB...) or not (RGBRGBRGBRGB...), defaults to false.

**Returns**

- `object` — A 3 components iterator folowing the iterator and iterable protocol, the value is an array of size 3 with each component.

<MemberHeading
  id="range3d"
  depth="3"
  name="range3d"
  sig="range3d(
	dataAccessor: function,
	start: number,
	maxIter: number,
	increment: number,
	blockMaxIter: number,
	blockIncrement: number,
	reverse1: boolean,
	reverse2: boolean,
	isPlanar: boolean,
): object"
/>

<MemberMeta sourceHref="/source/src/image/iterator-js/#L290" sourceLabel="iterator.js:290" />

Get an iterator for a given range for a 3 components data.

Using 'maxIter' and not an 'end' index since it fails in some edge cases (for ex coronal2, ie zxy).

**Parameters**

- `dataAccessor` (function) — Function to access data.
- `start` (number) — Zero-based index at which to start the iteration.
- `maxIter` (number) — The maximum number of iterations.
- `increment` (number) — Increment between indicies.
- `blockMaxIter` (number) — Number of applied increment after which blockIncrement is applied.
- `blockIncrement` (number) — Increment after blockMaxIter is reached, the value is from block start to the next block start.
- `reverse1` (boolean) — If true, loop from end to start. WARN: don't forget to set the value of start as the last index!
- `reverse2` (boolean) — If true, loop from block end to block start.
- `isPlanar` (boolean) — A flag to know if the data is planar (RRRR...GGGG...BBBB...) or not (RGBRGBRGBRGB...), defaults to false.

**Returns**

- `object` — An iterator folowing the iterator and iterable protocol.

<MemberHeading id="getiteratorvalues" depth="3" name="getIteratorValues" sig="getIteratorValues(iterator: object): Array" />

<MemberMeta sourceHref="/source/src/image/iterator-js/#L358" sourceLabel="iterator.js:358" />

Get a list of values for a given iterator.

**Parameters**

- `iterator` (object) — The iterator to use to loop through data.

**Returns**

- `Array` — The list of values.

<MemberHeading
  id="getsliceiterator"
  depth="3"
  name="getSliceIterator"
  sig="getSliceIterator(
	image: Image,
	index: Index,
	isRescaled: boolean,
	viewOrientation: Matrix33,
): object"
/>

<MemberMeta sourceHref="/source/src/image/iterator-js/#L377" sourceLabel="iterator.js:377" />

Get a slice index iterator.

**Parameters**

- `image` ([Image](/image)) — The image to parse.
- `index` ([Index](/index)) — The current index.
- `isRescaled` (boolean) — Flag for rescaled values (default false).
- `viewOrientation` ([Matrix33](/matrix33)) — The view orientation.

**Returns**

- `object` — The slice iterator.

<MemberHeading
  id="getregionsliceiterator"
  depth="3"
  name="getRegionSliceIterator"
  sig="getRegionSliceIterator(
	image: Image,
	index: Index,
	isRescaled: boolean,
	min: Point2D,
	max: Point2D,
): object"
/>

<MemberMeta sourceHref="/source/src/image/iterator-js/#L501" sourceLabel="iterator.js:501" />

Get a slice index iterator for a rectangular region.

**Parameters**

- `image` ([Image](/image)) — The image to parse.
- `index` ([Index](/index)) — The current index.
- `isRescaled` (boolean) — Flag for rescaled values (default false).
- `min` ([Point2D](/point2d)) — The minimum position (optional).
- `max` ([Point2D](/point2d)) — The maximum position (optional).

**Returns**

- `object` — The slice iterator.

<MemberHeading
  id="getvariableregionsliceiterator"
  depth="3"
  name="getVariableRegionSliceIterator"
  sig="getVariableRegionSliceIterator(
	image: Image,
	index: Index,
	isRescaled: boolean,
	regions: Array.<Array.<Array.<number>>>,
): object | undefined"
/>

<MemberMeta sourceHref="/source/src/image/iterator-js/#L559" sourceLabel="iterator.js:559" />

Get a slice index iterator for a rectangular region.

**Parameters**

- `image` ([Image](/image)) — The image to parse.
- `index` ([Index](/index)) — The current index.
- `isRescaled` (boolean) — Flag for rescaled values (default false).
- `regions` (Array.\<Array.\<Array.\<number>>>) — An array of \[x, y] pairs (min, max).

**Returns**

- `object | undefined` — The slice iterator.

<MemberHeading id="valuerange" depth="3" name="valueRange" sig="valueRange(values: Array, end: number): object" />

<MemberMeta sourceHref="/source/src/image/iterator-js/#L634" sourceLabel="iterator.js:634" />

Get a multiple value iterator. The input array defines the values and their start index.

Ref: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration\_protocols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols).

**Parameters**

- `values` (Array) — An array of {index, value} pairs.
- `end` (number) — The end of the range (excluded).

**Returns**

- `object` — An iterator folowing the iterator and iterable protocol.

<MemberHeading
  id="generategeometrymessage"
  depth="3"
  name="generateGeometryMessage"
  sig="generateGeometryMessage(
	imageSize: Size,
	imageSpacing: Spacing,
): object"
/>

<MemberMeta sourceHref="/source/src/image/labelingthread-js/#L18" sourceLabel="labelingThread.js:18" />

Generate a worker message with geometry metadata only.

**Parameters**

- `imageSize` ([Size](/size)) — The image size.
- `imageSpacing` ([Spacing](/spacing)) — The image spacing.

**Returns**

- `object` — The geometry part of a worker message.

<MemberHeading
  id="generateworkermessage"
  depth="3"
  name="generateWorkerMessage"
  sig="generateWorkerMessage(
	imageBuffer: TypedArray,
	imageGeometry: Geometry,
): object"
/>

<MemberMeta sourceHref="/source/src/image/labelingthread-js/#L50" sourceLabel="labelingThread.js:50" />

Generate a worker message to send to the labeling worker.

**Parameters**

- `imageBuffer` ([TypedArray](/typedarray)) — The buffer to label.
- `imageGeometry` ([Geometry](/geometry)) — The image geometry.

**Returns**

- `object` — The message to send to the worker.

<MemberHeading id="buildlut" depth="3" name="buildLut" sig="buildLut(func: function): Array.<number>" />

<MemberMeta sourceHref="/source/src/image/luts-js/#L13" sourceLabel="luts.js:13" />

Build a LUT of size lut\_range\_max.

**Parameters**

- `func` (function) — The i to lut function.

**Returns**

- `Array.<number>` — The LUT.

<MemberHeading id="tomaxfirstthird" depth="3" name="toMaxFirstThird" sig="toMaxFirstThird(i: number): number" />

<MemberMeta sourceHref="/source/src/image/luts-js/#L27" sourceLabel="luts.js:27" />

Ramp to lut\_range\_max minus one on the first third values.

**Parameters**

- `i` (number) — The input index.

**Returns**

- `number` — The lut value.

<MemberHeading id="tomaxsecondthird" depth="3" name="toMaxSecondThird" sig="toMaxSecondThird(i: number): number" />

<MemberMeta sourceHref="/source/src/image/luts-js/#L43" sourceLabel="luts.js:43" />

Ramp to lut\_range\_max minus one on the second third values, otherwise return 0 for the first third and lut\_range\_max minus one for the last third.

**Parameters**

- `i` (number) — The input index.

**Returns**

- `number` — The lut value.

<MemberHeading id="tomaxthirdthird" depth="3" name="toMaxThirdThird" sig="toMaxThirdThird(i: number): number" />

<MemberMeta sourceHref="/source/src/image/luts-js/#L62" sourceLabel="luts.js:62" />

Ramp to lut\_range\_max minus one on the last third values, otherwise return 0.

**Parameters**

- `i` (number) — The input index.

**Returns**

- `number` — The lut value.

<MemberHeading id="id" depth="3" name="id" sig="id(i: number): number" />

<MemberMeta sourceHref="/source/src/image/luts-js/#L80" sourceLabel="luts.js:80" />

Identity, returns i.

**Parameters**

- `i` (number) — The input index.

**Returns**

- `number` — The lut value.

<MemberHeading id="invid" depth="3" name="invId" sig="invId(i: number): number" />

<MemberMeta sourceHref="/source/src/image/luts-js/#L90" sourceLabel="luts.js:90" />

Returns lut\_range\_max minus one minus i.

**Parameters**

- `i` (number) — The input index.

**Returns**

- `number` — The lut value.

<MemberHeading id="checktag" depth="3" name="checkTag" sig="checkTag(dataElements: DataElements, tagDefinition: object)" />

<MemberMeta sourceHref="/source/src/image/maskfactory-js/#L101" sourceLabel="maskFactory.js:101" />

Check that a DICOM tag definition is present in a parsed element.

**Parameters**

- `dataElements` ([DataElements](/dataelements)) — The root dicom element.
- `tagDefinition` (object) — The tag definition as {name, tag, type, enum}.

<MemberHeading id="getdefaultdicomsegjson" depth="3" name="getDefaultDicomSegJson" sig="getDefaultDicomSegJson(): SimpleTagValues" />

<MemberMeta sourceHref="/source/src/image/maskfactory-js/#L231" sourceLabel="maskFactory.js:231" />

Get the default DICOM seg tags as an object.

**Returns**

- [`SimpleTagValues`](/simpletagvalues) — The default tags.

<MemberHeading id="mergemaskimages" depth="3" name="mergeMaskImages" sig="mergeMaskImages(mask1: MaskImage, mask2: MaskImage): MaskImage" />

<MemberMeta sourceHref="/source/src/image/maskfactory-js/#L649" sourceLabel="maskFactory.js:649" />

Merge two mask images into a new combined mask image.

Segments from mask2 that share a segment number with mask1 are renumbered (bumped to the next available number) to avoid conflicts. Both masks must share the same spacing and orientation; the wider of the two geometries (the one with more slices) is used as the merged geometry, so a mask that only covers a sub-range of the other's slices does not get clipped. Brush-painted masks (no per-segment SegmentCollection data) are supported.

The returned image can be saved with the standard `new MaskFactory().toDicom(merged, undefined, sourceImage)` workflow.

**Parameters**

- `mask1` ([MaskImage](/maskimage)) — The first mask (provides meta).
- `mask2` ([MaskImage](/maskimage)) — The second mask to merge into mask1.

**Returns**

- [`MaskImage`](/maskimage) — The new merged mask image.

<MemberHeading
  id="democreatemaskimage"
  depth="3"
  name="demoCreateMaskImage"
  sig="demoCreateMaskImage(
	elements: Record.<string, DataElement>,
): MaskImage"
/>

<MemberMeta sourceHref="/source/src/image/maskfactory-js/#L836" sourceLabel="maskFactory.js:836" />

Demo mask Image creation from DICOM elements: takes elements and first element of the pixel buffer to create an image.

Warning: not to be used in production code.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM elements.

**Returns**

- [`MaskImage`](/maskimage) — The mask Image object.

<MemberHeading id="islutbitsstored" depth="3" name="isLutBitsStored" sig="isLutBitsStored(bitsStored: number): boolean" />

<MemberMeta sourceHref="/source/src/image/modalitylut-js/#L18" sourceLabel="modalityLut.js:18" />

Check if a pre-computed LUT can be created for the input bits stored.

**Parameters**

- `bitsStored` (number) — The number of bits used to store the data.

**Returns**

- `boolean` — True if a LUT can be created.

<MemberHeading
  id="generateworkermessages"
  depth="3"
  name="generateWorkerMessages"
  sig="generateWorkerMessages(
	sourceImageBuffer: TypedArray,
	sourceImageGeometry: Geometry,
	targetImageGeometry: Geometry,
	pixelRepresentation: number,
	interpolated: boolean,
	jobId: string,
): Array.<object>"
/>

<MemberMeta sourceHref="/source/src/image/resamplingthread-js/#L53" sourceLabel="resamplingThread.js:53" />

Generate a worker message to send to the resampling worker.

**Parameters**

- `sourceImageBuffer` ([TypedArray](/typedarray)) — The buffer to resample.
- `sourceImageGeometry` ([Geometry](/geometry)) — The current image geometry.
- `targetImageGeometry` ([Geometry](/geometry)) — The geometry to resample to.
- `pixelRepresentation` (number) — The pixel representation of the source image.
- `interpolated` (boolean) — If true use bilinear sampling, otherwise use nearest neighbor.
- `jobId` (string) — Unique resampling job id.

**Returns**

- `Array.<object>` — The message to send to the worker.

<MemberHeading
  id="generateresampledgeometry"
  depth="3"
  name="generateResampledGeometry"
  sig="generateResampledGeometry(
	sourceImageGeometry: Geometry,
	targetOrientation: Matrix33,
	centerOfRotation: Point | undefined,
): Geometry"
/>

<MemberMeta sourceHref="/source/src/image/resamplingthread-js/#L140" sourceLabel="resamplingThread.js:140" />

Generate the geometry of the resampled image.

**Parameters**

- `sourceImageGeometry` ([Geometry](/geometry)) — The current image geometry.
- `targetOrientation` ([Matrix33](/matrix33)) — The target image orientation.
- `centerOfRotation` ([Point](/point) | undefined) — World space center of rotation.

**Returns**

- [`Geometry`](/geometry) — The new geometry.

<MemberHeading
  id="generatebuffer"
  depth="3"
  name="generateBuffer"
  sig="generateBuffer(
	sourceImageBuffer: TypedArray,
	targetSize: Size,
): TypedArray"
/>

<MemberMeta sourceHref="/source/src/image/resamplingthread-js/#L377" sourceLabel="resamplingThread.js:377" />

Generate the buffer for the resampled image.

**Parameters**

- `sourceImageBuffer` ([TypedArray](/typedarray)) — The current image buffer.
- `targetSize` ([Size](/size)) — The size of the target.

**Returns**

- [`TypedArray`](/typedarray) — The new buffer.

<MemberHeading
  id="getreferencedframeofreferenceuidfromrtstruct"
  depth="3"
  name="getReferencedFrameOfReferenceUIDFromRTStruct"
  sig="getReferencedFrameOfReferenceUIDFromRTStruct(
	dataElements: Record.<string, DataElement>,
): string | undefined"
/>

<MemberMeta sourceHref="/source/src/image/rtstructfactory-js/#L64" sourceLabel="rtStructFactory.js:64" />

Get the referenced frame of reference UID from an RT Structure Set.

Path: ReferencedFrameOfReferenceSequence (3006,0010) → FrameOfReferenceUID (0020,0052), first item.

Ref: [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect\_C.8.8.5.html](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.8.8.5.html).

**Parameters**

- `dataElements` (Record.\<string, [DataElement](/dataelement)>) — The data elements.

**Returns**

- `string | undefined` — The frame of reference UID.

<MemberHeading id="getdefaultdicomrtstructjson" depth="3" name="getDefaultDicomRTStructJson" sig="getDefaultDicomRTStructJson(): SimpleTagValues" />

<MemberMeta sourceHref="/source/src/image/rtstructfactory-js/#L94" sourceLabel="rtStructFactory.js:94" />

Get the default DICOM RT Structure Set tags as an object.

**Returns**

- [`SimpleTagValues`](/simpletagvalues) — The default tags.

<MemberHeading
  id="bfsmarkvisited"
  depth="3"
  name="bfsMarkVisited"
  sig="bfsMarkVisited(
	buffer: Uint8Array,
	sliceOffset: number,
	width: number,
	height: number,
	value: number,
	startIdx: number,
	visited: Uint8Array,
)"
/>

<MemberMeta sourceHref="/source/src/image/rtstructfactory-js/#L133" sourceLabel="rtStructFactory.js:133" />

BFS (Breadth-First Search) flood-fill: mark all 8-connected pixels with `value` as visited.

**Parameters**

- `buffer` (Uint8Array) — The mask buffer.
- `sliceOffset` (number) — Byte offset of the slice in buffer.
- `width` (number) — Slice width.
- `height` (number) — Slice height.
- `value` (number) — Segment value.
- `startIdx` (number) — Flat index of the seed pixel.
- `visited` (Uint8Array) — Per-slice visited flags (length = width\*height).

<MemberHeading
  id="mooreboundary"
  depth="3"
  name="mooreBoundary"
  sig="mooreBoundary(
	buffer: Uint8Array,
	sliceOffset: number,
	width: number,
	height: number,
	value: number,
	sx: number,
	sy: number,
): Array.<{x: number, y: number}>"
/>

<MemberMeta sourceHref="/source/src/image/rtstructfactory-js/#L173" sourceLabel="rtStructFactory.js:173" />

Trace the outer boundary of a connected foreground region using Moore neighborhood tracing (Jacob's stopping criterion).

**Parameters**

- `buffer` (Uint8Array) — The mask buffer.
- `sliceOffset` (number) — Byte offset of the slice in buffer.
- `width` (number) — Slice width.
- `height` (number) — Slice height.
- `value` (number) — Segment value.
- `sx` (number) — X of the top-left pixel of the component.
- `sy` (number) — Y of the top-left pixel of the component.

**Returns**

- `Array.<{x: number, y: number}>` — Ordered boundary vertices.

<MemberHeading
  id="buffertopolygons"
  depth="3"
  name="bufferToPolygons"
  sig="bufferToPolygons(
	buffer: Uint8Array,
	sliceOffset: number,
	width: number,
	height: number,
	value: number,
): Array.<Array.<{x: number, y: number}>>"
/>

<MemberMeta sourceHref="/source/src/image/rtstructfactory-js/#L231" sourceLabel="rtStructFactory.js:231" />

Extract polygon contours from a mask slice using Moore neighborhood tracing. Returns one polygon per connected region with the given segment value.

**Parameters**

- `buffer` (Uint8Array) — The mask buffer (all slices).
- `sliceOffset` (number) — Byte offset of the slice in buffer.
- `width` (number) — Slice width in pixels.
- `height` (number) — Slice height in pixels.
- `value` (number) — Segment value to trace.

**Returns**

- `Array.<Array.<{x: number, y: number}>>` — One polygon per connected region.

<MemberHeading id="ptsegdist" depth="3" name="ptSegDist" sig="ptSegDist(pt: Object, a: Object, b: Object): number" />

<MemberMeta sourceHref="/source/src/image/rtstructfactory-js/#L258" sourceLabel="rtStructFactory.js:258" />

Perpendicular distance from a point to the line through a and b.

**Parameters**

- `pt` (Object) — The point.
- `a` (Object) — Line start.
- `b` (Object) — Line end.

**Returns**

- `number` — Distance in pixels.

<MemberHeading
  id="simplifypolygon"
  depth="3"
  name="simplifyPolygon"
  sig="simplifyPolygon(
	pts: Array.<{x: number, y: number}>,
	epsilon: number,
): Array.<{x: number, y: number}>"
/>

<MemberMeta sourceHref="/source/src/image/rtstructfactory-js/#L276" sourceLabel="rtStructFactory.js:276" />

Simplify a polygon using the Ramer-Douglas-Peucker algorithm. Ref: [https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker\_algorithm](https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm).

**Parameters**

- `pts` (Array.\<{x: number, y: number}>) — Input vertices.
- `epsilon` (number) — Max allowed deviation in pixels.

**Returns**

- `Array.<{x: number, y: number}>` — Simplified vertices.

<MemberHeading
  id="fillpolygons"
  depth="3"
  name="fillPolygons"
  sig="fillPolygons(
	buffer: Uint8Array,
	sliceOffset: number,
	width: number,
	height: number,
	polygonsList: Array.<Array.<{x: number, y: number}>>,
	value: number,
)"
/>

<MemberMeta sourceHref="/source/src/image/rtstructfactory-js/#L332" sourceLabel="rtStructFactory.js:332" />

Fill one or more closed polygons into a flat Uint8Array slice using a scanline even-odd rule applied across all of their edges together. Passing an outer contour together with a nested inner contour therefore punches a hole where the inner contour lies, matching how DICOM CLOSEDPLANAR\_XOR (and, by convention, plain CLOSED\_PLANAR) contours on the same ROI/slice combine (see PS3.3 C.8.8.6). Ref: [https://en.wikipedia.org/wiki/Even%E2%80%93odd\_rule](https://en.wikipedia.org/wiki/Even%E2%80%93odd_rule).

**Parameters**

- `buffer` (Uint8Array) — The mask buffer (all slices).
- `sliceOffset` (number) — Byte offset of the current slice in buffer.
- `width` (number) — Slice width in pixels.
- `height` (number) — Slice height in pixels.
- `polygonsList` (Array.\<Array.\<{x: number, y: number}>>) — Polygons (outer and/or hole contours) in pixel coords, filled together.
- `value` (number) — Segment number to write.

<MemberHeading
  id="markoutsidebackground"
  depth="3"
  name="markOutsideBackground"
  sig="markOutsideBackground(
	buffer: Uint8Array,
	sliceOffset: number,
	width: number,
	height: number,
	value: number,
): Uint8Array"
/>

<MemberMeta sourceHref="/source/src/image/rtstructfactory-js/#L387" sourceLabel="rtStructFactory.js:387" />

Flood-fill background pixels reachable from the slice border without crossing any `value`-valued foreground pixel. Used to tell apart plain outside background from background fully enclosed by foreground (holes).

**Parameters**

- `buffer` (Uint8Array) — The mask buffer (all slices).
- `sliceOffset` (number) — Byte offset of the slice in buffer.
- `width` (number) — Slice width in pixels.
- `height` (number) — Slice height in pixels.
- `value` (number) — Segment value to treat as foreground.

**Returns**

- `Uint8Array` — Per-slice flags, 1 where reachable from the border.

<MemberHeading
  id="findholepolygons"
  depth="3"
  name="findHolePolygons"
  sig="findHolePolygons(
	buffer: Uint8Array,
	sliceOffset: number,
	width: number,
	height: number,
	value: number,
): Array.<Array.<{x: number, y: number}>>"
/>

<MemberMeta sourceHref="/source/src/image/rtstructfactory-js/#L451" sourceLabel="rtStructFactory.js:451" />

Find polygons for background regions fully enclosed by `value`-valued foreground (ie holes), traced the same way as foreground regions.

**Parameters**

- `buffer` (Uint8Array) — The mask buffer (all slices).
- `sliceOffset` (number) — Byte offset of the slice in buffer.
- `width` (number) — Slice width in pixels.
- `height` (number) — Slice height in pixels.
- `value` (number) — Segment value to trace holes for.

**Returns**

- `Array.<Array.<{x: number, y: number}>>` — One polygon per enclosed hole region.

<MemberHeading
  id="computegreyscale"
  depth="3"
  name="computeGreyscale"
  sig="computeGreyscale(
	data: Array,
	width: number,
	height: number,
): object"
/>

<MemberMeta sourceHref="/source/src/image/scissors-js/#L14" sourceLabel="scissors.js:14" />

Compute grey scale.

**Parameters**

- `data` (Array) — The input data.
- `width` (number) — The width of the output.
- `height` (number) — The height of the output.

**Returns**

- `object` — A greyscale object.

<MemberHeading id="computegradient" depth="3" name="computeGradient" sig="computeGradient(greyscale: object): object" />

<MemberMeta sourceHref="/source/src/image/scissors-js/#L83" sourceLabel="scissors.js:83" />

Compute gradient.

**Parameters**

- `greyscale` (object) — The input greyscale.

**Returns**

- `object` — A gradient object.

<MemberHeading id="computelaplace" depth="3" name="computeLaplace" sig="computeLaplace(greyscale: object): object" />

<MemberMeta sourceHref="/source/src/image/scissors-js/#L127" sourceLabel="scissors.js:127" />

**Parameters**

- `greyscale` (object) — The input greyscale.

**Returns**

- `object` — A laplace object.

<MemberHeading id="computegradx" depth="3" name="computeGradX" sig="computeGradX(greyscale: object): Array" />

<MemberMeta sourceHref="/source/src/image/scissors-js/#L174" sourceLabel="scissors.js:174" />

Compute the X gradient.

**Parameters**

- `greyscale` (object) — The values.

**Returns**

- `Array` — The gradient.

<MemberHeading id="computegrady" depth="3" name="computeGradY" sig="computeGradY(greyscale: object): Array" />

<MemberMeta sourceHref="/source/src/image/scissors-js/#L198" sourceLabel="scissors.js:198" />

Compute the Y gradient.

**Parameters**

- `greyscale` (object) — The values.

**Returns**

- `Array` — The gradient.

<MemberHeading
  id="gradunitvector"
  depth="3"
  name="gradUnitVector"
  sig="gradUnitVector(
	gradX: Array,
	gradY: Array,
	px: number,
	py: number,
	out: object,
)"
/>

<MemberMeta sourceHref="/source/src/image/scissors-js/#L227" sourceLabel="scissors.js:227" />

Compute the gradient unit vector.

**Parameters**

- `gradX` (Array) — The X gradient.
- `gradY` (Array) — The Y gradient.
- `px` (number) — The point X.
- `py` (number) — The point Y.
- `out` (object) — The result.

<MemberHeading
  id="graddirection"
  depth="3"
  name="gradDirection"
  sig="gradDirection(
	gradX: Array,
	gradY: Array,
	px: number,
	py: number,
	qx: number,
	qy: number,
): number"
/>

<MemberMeta sourceHref="/source/src/image/scissors-js/#L250" sourceLabel="scissors.js:250" />

Compute the gradient direction.

**Parameters**

- `gradX` (Array) — The X gradient.
- `gradY` (Array) — The Y gradient.
- `px` (number) — The point X.
- `py` (number) — The point Y.
- `qx` (number) — The q X.
- `qy` (number) — The q Y.

**Returns**

- `number` — The direction.

<MemberHeading
  id="computesides"
  depth="3"
  name="computeSides"
  sig="computeSides(
	dist: number,
	gradX: Array,
	gradY: Array,
	greyscale: object,
): object"
/>

<MemberMeta sourceHref="/source/src/image/scissors-js/#L284" sourceLabel="scissors.js:284" />

Compute the sides.

**Parameters**

- `dist` (number) — The distance.
- `gradX` (Array) — The X gradient.
- `gradY` (Array) — The Y gradient.
- `greyscale` (object) — The value.

**Returns**

- `object` — The sides.

<MemberHeading id="gaussianblur" depth="3" name="gaussianBlur" sig="gaussianBlur(buffer: Array, out: Array)" />

<MemberMeta sourceHref="/source/src/image/scissors-js/#L329" sourceLabel="scissors.js:329" />

Gaussian blur an input buffer.

**Parameters**

- `buffer` (Array) — The input buffer.
- `out` (Array) — The result.

<MemberHeading
  id="createroislicebuffers"
  depth="3"
  name="createRoiSliceBuffers"
  sig="createRoiSliceBuffers(
	imageBuffer: Uint8Array,
	segmentNumbers: Array.<number>,
	sliceSize: number,
	sliceOffset: number,
): Record.<number, Uint8Array>"
/>

<MemberMeta sourceHref="/source/src/image/segmentcollection-js/#L21" sourceLabel="segmentCollection.js:21" />

Create ROI slice buffers.

**Parameters**

- `imageBuffer` (Uint8Array) — The mask image buffer.
- `segmentNumbers` (Array.\<number>) — The mask segment numbers.
- `sliceSize` (number) — The size of a slice.
- `sliceOffset` (number) — The slice offset.

**Returns**

- `Record.<number, Uint8Array>` — The ROI slice image buffers, indexed by segment index (segment.number - 1).

<MemberHeading
  id="createroibuffers"
  depth="3"
  name="createRoiBuffers"
  sig="createRoiBuffers(
	imageBuffer: Uint8Array,
	geometry: Geometry,
	segmentNumbers: Array.<number>,
): Record.<string, Record.<number, Uint8Array>>"
/>

<MemberMeta sourceHref="/source/src/image/segmentcollection-js/#L54" sourceLabel="segmentCollection.js:54" />

Create ROI buffers.

**Parameters**

- `imageBuffer` (Uint8Array) — The mask image buffer.
- `geometry` ([Geometry](/geometry)) — The mask geometry.
- `segmentNumbers` (Array.\<number>) — The mask segment numbers.

**Returns**

- `Record.<string, Record.<number, Uint8Array>>` — The ROI buffers, indexed by segment index (segment.number - 1) and slice index.

<MemberHeading
  id="democreateview"
  depth="3"
  name="demoCreateView"
  sig="demoCreateView(
	elements: Record.<string, DataElement>,
	image: Image,
): View"
/>

<MemberMeta sourceHref="/source/src/image/view-js/#L60" sourceLabel="view.js:60" />

Demo View creation from DICOM elements and image.

Warning: not to be used in production code.

**Parameters**

- `elements` (Record.\<string, [DataElement](/dataelement)>) — The DICOM elements.
- `image` ([Image](/image)) — The associated image.

**Returns**

- [`View`](/view) — The View object.

<MemberHeading
  id="generateimagedatamonochrome"
  depth="3"
  name="generateImageDataMonochrome"
  sig="generateImageDataMonochrome(
	array: ImageData,
	iterator: object,
	alphaFunc: function,
	windowLut: WindowLut,
	colourMap: ColourMap,
)"
/>

<MemberMeta sourceHref="/source/src/image/viewmonochrome-js/#L15" sourceLabel="viewMonochrome.js:15" />

Generate image data for 'MONOCHROME\*' photometric interpretation.

**Parameters**

- `array` (ImageData) — The array to store the outut data.
- `iterator` (object) — Position iterator.
- `alphaFunc` (function) — The alpha function.
- `windowLut` ([WindowLut](/windowlut)) — The window/level LUT.
- `colourMap` ([ColourMap](/colourmap)) — The colour map.

<MemberHeading
  id="generateimagedatapalettecolor"
  depth="3"
  name="generateImageDataPaletteColor"
  sig="generateImageDataPaletteColor(
	array: ImageData,
	iterator: object,
	alphaFunc: function,
	colourMap: ColourMap,
	is16BitsStored: boolean,
)"
/>

<MemberMeta sourceHref="/source/src/image/viewpalettecolor-js/#L20" sourceLabel="viewPaletteColor.js:20" />

Generate image data for 'PALETTE COLOR' photometric interpretation.

**Parameters**

- `array` (ImageData) — The array to store the outut data.
- `iterator` (object) — Position iterator.
- `alphaFunc` (function) — The alpha function.
- `colourMap` ([ColourMap](/colourmap)) — The colour map.
- `is16BitsStored` (boolean) — Flag to know if the data is 16bits.

<MemberHeading
  id="generateimagedatapalettecolorblend"
  depth="3"
  name="generateImageDataPaletteColorBlend"
  sig="generateImageDataPaletteColorBlend(
	array: ImageData,
	iterator: object,
	colourMap: ColourMap,
	collection: SegmentCollection,
	sliceSize: number,
	imageSize: Size,
	orientation: Matrix33,
	contourThickness: number,
	fillOpacity: number,
	segmentViewHelper?: MaskSegmentViewHelper,
)"
/>

<MemberMeta sourceHref="/source/src/image/viewpalettecolor-js/#L80" sourceLabel="viewPaletteColor.js:80" />

Generate image data for 'PALETTE COLOR' with overlapping segment blend. For each pixel, averages the palette colours of all visible segments present at that buffer offset.

Contour detection uses a cached union ImageContour (one binary buffer where any visible segment is present) built by SegmentCollection. This avoids false seams that would occur if the label-map ImageContour were used, because the label map stores only first-wins values at overlap positions.

**Parameters**

- `array` (ImageData) — The array to store the output data.
- `iterator` (object) — Position iterator.
- `colourMap` ([ColourMap](/colourmap)) — The colour map.
- `collection` ([SegmentCollection](/segmentcollection)) — The segment collection.
- `sliceSize` (number) — Number of pixels per slice (ncols \* nrows).
- `imageSize` ([Size](/size)) — The full image size.
- `orientation` ([Matrix33](/matrix33)) — The view orientation.
- `contourThickness` (number) — Contour thickness (0 = fill only).
- `fillOpacity` (number) — Fill opacity \[0-1].
- `segmentViewHelper` ([MaskSegmentViewHelper](/masksegmentviewhelper), optional) — Hidden-segment tracker.

<MemberHeading
  id="generateimagedatargb"
  depth="3"
  name="generateImageDataRgb"
  sig="generateImageDataRgb(
	array: ImageData,
	iterator: object,
	alphaFunc: function,
)"
/>

<MemberMeta sourceHref="/source/src/image/viewrgb-js/#L8" sourceLabel="viewRgb.js:8" />

Generate image data for 'RGB' photometric interpretation.

**Parameters**

- `array` (ImageData) — The array to store the outut data.
- `iterator` (object) — Position iterator.
- `alphaFunc` (function) — The alpha function.

<MemberHeading
  id="generateimagedataybrfull"
  depth="3"
  name="generateImageDataYbrFull"
  sig="generateImageDataYbrFull(
	array: ImageData,
	iterator: object,
	alphaFunc: function,
)"
/>

<MemberMeta sourceHref="/source/src/image/viewybrfull-js/#L10" sourceLabel="viewYbrFull.js:10" />

Generate image data for 'YBR\_FULL' photometric interpretation.

**Parameters**

- `array` (ImageData) — The array to store the outut data.
- `iterator` (object) — Position iterator.
- `alphaFunc` (function) — The alpha function.

<MemberHeading id="equalwl" depth="3" name="equalWl" sig="equalWl(wl0: WindowLevel, wl1: WindowLevel): boolean" />

<MemberMeta sourceHref="/source/src/image/windowlevel-js/#L39" sourceLabel="windowLevel.js:39" />

Check for window level equality.

**Parameters**

- `wl0` ([WindowLevel](/windowlevel)) — The first window level.
- `wl1` ([WindowLevel](/windowlevel)) — The second window level.

**Returns**

- `boolean` — True if both objects are equal.

<MemberHeading id="getminwindowwidth" depth="3" name="getMinWindowWidth" sig="getMinWindowWidth(voiLutFunctionName?: string): number" />

<MemberMeta sourceHref="/source/src/image/windowlevel-js/#L60" sourceLabel="windowLevel.js:60" />

Get the minimum window width allowed by a VOI LUT function: LINEAR requires a width of at least 1, LINEAR\_EXACT and SIGMOID require a strictly positive width (the epsilon avoids a division by zero).

Ref: [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect\_C.11.2.html#sect\_C.11.2.1](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.11.2.html#sect_C.11.2.1).

**Parameters**

- `voiLutFunctionName` (string, optional) — The VOI LUT function name, defaults to 'LINEAR'.

**Returns**

- `number` — The minimum window width.

<MemberHeading
  id="validatewindowlevel"
  depth="3"
  name="validateWindowLevel"
  sig="validateWindowLevel(
	wl: WindowLevel,
	range: object,
	voiLutFunctionName?: string,
): WindowLevel | undefined"
/>

<MemberMeta sourceHref="/source/src/image/windowlevel-js/#L78" sourceLabel="windowLevel.js:78" />

Validate and constrain an input window level.

**Parameters**

- `wl` ([WindowLevel](/windowlevel)) — The window level to validate.
- `range` (object) — The image pixel data range.
- `voiLutFunctionName` (string, optional) — The VOI LUT function name, defaults to 'LINEAR'.

**Returns**

- [`WindowLevel`](/windowlevel)` | undefined` — A valid window level.

<MemberHeading id="getloaderlist" depth="3" name="getLoaderList" sig="getLoaderList(): Array" />

<MemberMeta sourceHref="/source/src/io/loaderlist-js/#L24" sourceLabel="loaderList.js:24" />

Get the list of available data-loader constructors. Always returns the same array instance so callers can mutate it (for example in tests) and have those mutations visible to all consumers.

**Returns**

- `Array` — The list of loader constructors.

<MemberHeading id="mulabc" depth="3" name="mulABC" sig="mulABC(a: number, b: number, c: number): number" />

<MemberMeta sourceHref="/source/src/math/circle-js/#L20" sourceLabel="circle.js:20" />

Mulitply the three inputs if the last two are not null.

**Parameters**

- `a` (number) — The first input.
- `b` (number) — The second input.
- `c` (number) — The third input.

**Returns**

- `number` — The multiplication of the three inputs or null if one of the last two is null.

<MemberHeading id="mulabc" depth="3" name="mulABC" sig="mulABC(a: number, b: number, c: number): number" />

<MemberMeta sourceHref="/source/src/math/ellipse-js/#L20" sourceLabel="ellipse.js:20" />

Mulitply the three inputs if the last two are not null.

**Parameters**

- `a` (number) — The first input.
- `b` (number) — The second input.
- `c` (number) — The third input.

**Returns**

- `number` — The multiplication of the three inputs or null if one of the last two is null.

<MemberHeading
  id="getellipseindices"
  depth="3"
  name="getEllipseIndices"
  sig="getEllipseIndices(
	center: Index,
	radius: Array.<number>,
	dir: Array.<number>,
): Array.<Index>"
/>

<MemberMeta sourceHref="/source/src/math/ellipse-js/#L279" sourceLabel="ellipse.js:279" />

Get the indices that form a ellpise.

**Parameters**

- `center` ([Index](/index)) — The ellipse center.
- `radius` (Array.\<number>) — The 2 ellipse radiuses.
- `dir` (Array.\<number>) — The 2 ellipse directions.

**Returns**

- `Array.<`[`Index`](/index)`>` — The indices of the ellipse.

<MemberHeading
  id="getentriesvalueat"
  depth="3"
  name="getEntriesValueAt"
  sig="getEntriesValueAt(
	entries: Array.<HistogramEntry>,
	index: number,
): number"
/>

<MemberMeta sourceHref="/source/src/math/histogram-js/#L177" sourceLabel="histogram.js:177" />

Get the value at a given index of the sorted list of values that the entries describe.

**Parameters**

- `entries` (Array.\<[HistogramEntry](/histogramentry)>) — The sorted entries.
- `index` (number) — The index in the sorted list of values.

**Returns**

- `number` — The value.

<MemberHeading
  id="getentriespercentile"
  depth="3"
  name="getEntriesPercentile"
  sig="getEntriesPercentile(
	entries: Array.<HistogramEntry>,
	total: number,
	ratio: number,
): number"
/>

<MemberMeta sourceHref="/source/src/math/histogram-js/#L198" sourceLabel="histogram.js:198" />

Get the percentile of the values that the entries describe. Uses linear interpolation between values like `getPercentile` in `math/stats.js`.

**Parameters**

- `entries` (Array.\<[HistogramEntry](/histogramentry)>) — The sorted entries.
- `total` (number) — The total count.
- `ratio` (number) — The percentile ratio \[0-1].

**Returns**

- `number` — The percentile.

<MemberHeading id="getzeroindex" depth="3" name="getZeroIndex" sig="getZeroIndex(size: number): Index" />

<MemberMeta sourceHref="/source/src/math/index-js/#L218" sourceLabel="index.js:218" />

Get an index with values set to 0 and the input size.

**Parameters**

- `size` (number) — The size of the index.

**Returns**

- [`Index`](/index) — The zero index.

<MemberHeading id="getangle" depth="3" name="getAngle" sig="getAngle(line0: Line, line1: Line): number" />

<MemberMeta sourceHref="/source/src/math/line-js/#L227" sourceLabel="line.js:227" />

Get the angle between two lines in degree.

**Parameters**

- `line0` ([Line](/line)) — The first line.
- `line1` ([Line](/line)) — The second line.

**Returns**

- `number` — The angle.

<MemberHeading id="areorthogonal" depth="3" name="areOrthogonal" sig="areOrthogonal(line0: Line, line1: Line): boolean" />

<MemberMeta sourceHref="/source/src/math/line-js/#L250" sourceLabel="line.js:250" />

Check if two lines are orthogonal.

**Parameters**

- `line0` ([Line](/line)) — The first line.
- `line1` ([Line](/line)) — The second line.

**Returns**

- `boolean` — True if both lines are orthogonal.

<MemberHeading id="ispointinlinerange" depth="3" name="isPointInLineRange" sig="isPointInLineRange(point: Point2D, line: Line): boolean" />

<MemberMeta sourceHref="/source/src/math/line-js/#L266" sourceLabel="line.js:266" />

Check if a point is in a line coordinate range.

**Parameters**

- `point` ([Point2D](/point2d)) — The input point.
- `line` ([Line](/line)) — The input line.

**Returns**

- `boolean` — True if the input point is in the line coordinate range.

<MemberHeading
  id="getdistancetosegment"
  depth="3"
  name="getDistanceToSegment"
  sig="getDistanceToSegment(
	point: Point2D,
	begin: Point2D,
	end: Point2D,
): number"
/>

<MemberMeta sourceHref="/source/src/math/line-js/#L285" sourceLabel="line.js:285" />

Get the distance between a point and a line segment.

**Parameters**

- `point` ([Point2D](/point2d)) — The input point.
- `begin` ([Point2D](/point2d)) — The segment begin point.
- `end` ([Point2D](/point2d)) — The segment end point.

**Returns**

- `number` — The distance to the closest point of the segment.

<MemberHeading
  id="getperpendicularline"
  depth="3"
  name="getPerpendicularLine"
  sig="getPerpendicularLine(
	line: Line,
	point: Point2D,
	length: number,
	spacing?: Scalar2D,
): Line"
/>

<MemberMeta sourceHref="/source/src/math/line-js/#L311" sourceLabel="line.js:311" />

Get a perpendicular line to an input one at a given point.

**Parameters**

- `line` ([Line](/line)) — The line to be perpendicular to.
- `point` ([Point2D](/point2d)) — The middle point of the perpendicular line.
- `length` (number) — The length of the perpendicular line.
- `spacing` ([Scalar2D](/scalar2d), optional) — Optional image spacing, default to \[1,1].

**Returns**

- [`Line`](/line) — The perpendicular line.

<MemberHeading
  id="getperpendicularlineatdistance"
  depth="3"
  name="getPerpendicularLineAtDistance"
  sig="getPerpendicularLineAtDistance(
	line: Line,
	distance: number,
	length: number,
	spacing?: Scalar2D,
): Line"
/>

<MemberMeta sourceHref="/source/src/math/line-js/#L335" sourceLabel="line.js:335" />

Get a perpendicular line to an input one at a given distance of its begin point.

**Parameters**

- `line` ([Line](/line)) — The line to be perpendicular to.
- `distance` (number) — The distance to the input line begin point.
- `length` (number) — The length of the perpendicular line.
- `spacing` ([Scalar2D](/scalar2d), optional) — Optional image spacing, default to \[1,1].

**Returns**

- [`Line`](/line) — The perpendicular line.

<MemberHeading
  id="getlinefromequation"
  depth="3"
  name="getLineFromEquation"
  sig="getLineFromEquation(
	slope: number,
	intercept: number,
	point: Point2D,
	length: number,
	spacing?: Scalar2D,
): Line"
/>

<MemberMeta sourceHref="/source/src/math/line-js/#L366" sourceLabel="line.js:366" />

Get a line from an equation, a middle point and a length.

**Parameters**

- `slope` (number) — The line slope.
- `intercept` (number) — The line intercept.
- `point` ([Point2D](/point2d)) — The middle point of the line.
- `length` (number) — The line length.
- `spacing` ([Scalar2D](/scalar2d), optional) — Optional image spacing, default to \[1,1].

**Returns**

- [`Line`](/line) — The resulting line.

<MemberHeading id="getmatrixinverse" depth="3" name="getMatrixInverse" sig="getMatrixInverse(m: Matrix33): Matrix33 | undefined" />

<MemberMeta sourceHref="/source/src/math/matrix-js/#L344" sourceLabel="matrix.js:344" />

Get the inverse of an input 3\*3 matrix.

Ref:

- [https://en.wikipedia.org/wiki/Invertible\_matrix#Inversion\_of\_3\_%C3%97\_3\_matrices](https://en.wikipedia.org/wiki/Invertible_matrix#Inversion_of_3_%C3%97_3_matrices),
- [https://github.com/willnode/N-Matrix-Programmer](https://github.com/willnode/N-Matrix-Programmer).

**Parameters**

- `m` ([Matrix33](/matrix33)) — The input matrix.

**Returns**

- [`Matrix33`](/matrix33)` | undefined` — The inverse matrix or undefined if the determinant is zero.

<MemberHeading id="getidentitymat33" depth="3" name="getIdentityMat33" sig="getIdentityMat33(): Matrix33" />

<MemberMeta sourceHref="/source/src/math/matrix-js/#L386" sourceLabel="matrix.js:386" />

Create a 3x3 identity matrix.

**Returns**

- [`Matrix33`](/matrix33) — The identity matrix.

<MemberHeading id="isidentitymat33" depth="3" name="isIdentityMat33" sig="isIdentityMat33(mat33: Matrix33): boolean" />

<MemberMeta sourceHref="/source/src/math/matrix-js/#L402" sourceLabel="matrix.js:402" />

Check if a matrix is a 3x3 identity matrix.

**Parameters**

- `mat33` ([Matrix33](/matrix33)) — The matrix to test.

**Returns**

- `boolean` — True if identity.

<MemberHeading id="issimilar" depth="3" name="isSimilar" sig="isSimilar(a: number, b: number, tol?: number): boolean" />

<MemberMeta sourceHref="/source/src/math/number-js/#L44" sourceLabel="number.js:44" />

Check if two numbers are similar.

**Parameters**

- `a` (number) — The first number.
- `b` (number) — The second number.
- `tol` (number, optional) — Optional comparison tolerance, defaults to Number.EPSILON.

**Returns**

- `boolean` — True if similar.

<MemberHeading id="isaboveepsilon" depth="3" name="isAboveEpsilon" sig="isAboveEpsilon(value: number): boolean" />

<MemberMeta sourceHref="/source/src/math/number-js/#L60" sourceLabel="number.js:60" />

Check if a value is above REAL\_WORLD\_EPSILO&#x4E;_&#x31;00 meaning it is non negligible. Warns if the value is above REAL\_WORLD\_EPSILON but below REAL\_WORLD\_EPSILO&#x4E;_&#x31;00.

**Parameters**

- `value` (number) — The value to test.

**Returns**

- `boolean` — True if the value is above the REAL\_WORLD\_EPSILON\*100, false otherwise.

<MemberHeading id="precisionround" depth="3" name="precisionRound" sig="precisionRound(number: number, precision: number): number" />

<MemberMeta sourceHref="/source/src/math/number-js/#L104" sourceLabel="number.js:104" />

Round a float number to a given precision.

Inspired from [https://stackoverflow.com/a/49729715/3639892](https://stackoverflow.com/a/49729715/3639892).

`toPrecision` uses all non zero digits of the number: (123.009).toPrecision(4) = "123.0"; (0.09).toPrecision(4) = "0.09000".

`toFixed` does not always behave as expected: (123.009).toFixed(2) = "123.01"; (0.009).toFixed(2) = "0.01"; but (-0.005).toFixed(2) = "-0.01" (expecting 0); (1.005).toFixed(2) = "1" (expecting 1.01).

**Parameters**

- `number` (number) — The number to round.
- `precision` (number) — The rounding precision, ie the result number of digits after the comma.

**Returns**

- `number` — The rounded number.

<MemberHeading id="getcoronalmat33" depth="3" name="getCoronalMat33" sig="getCoronalMat33(): Matrix33" />

<MemberMeta sourceHref="/source/src/math/orientation-js/#L12" sourceLabel="orientation.js:12" />

Create a 3x3 coronal (xzy) matrix.

**Returns**

- [`Matrix33`](/matrix33) — The coronal matrix.

<MemberHeading id="getsagittalmat33" depth="3" name="getSagittalMat33" sig="getSagittalMat33(): Matrix33" />

<MemberMeta sourceHref="/source/src/math/orientation-js/#L27" sourceLabel="orientation.js:27" />

Create a 3x3 sagittal (yzx) matrix.

**Returns**

- [`Matrix33`](/matrix33) — The sagittal matrix.

<MemberHeading id="getmatrixfromname" depth="3" name="getMatrixFromName" sig="getMatrixFromName(name: string): Matrix33 | undefined" />

<MemberMeta sourceHref="/source/src/math/orientation-js/#L61" sourceLabel="orientation.js:61" />

Get an orientation matrix from a name.

**Parameters**

- `name` (string) — The orientation name.

**Returns**

- [`Matrix33`](/matrix33)` | undefined` — The orientation matrix.

<MemberHeading id="getorientationstringlps" depth="3" name="getOrientationStringLPS" sig="getOrientationStringLPS(matrix: Matrix33): string" />

<MemberMeta sourceHref="/source/src/math/orientation-js/#L81" sourceLabel="orientation.js:81" />

Get the orientation code of an orientation matrix. Each letter defines the towards direction. Letters are: R (right), L (left), A (anterior), P (posterior), I (inferior) and S (superior).

**Parameters**

- `matrix` ([Matrix33](/matrix33)) — The orientation matrix.

**Returns**

- `string` — The orientation code.

<MemberHeading id="getvectorstringlps" depth="3" name="getVectorStringLPS" sig="getVectorStringLPS(vector: Vector3D): string" />

<MemberMeta sourceHref="/source/src/math/orientation-js/#L109" sourceLabel="orientation.js:109" />

Get the orientation code of an orientation vector. Credits: David Clunie, [https://www.dclunie.com/medical-image-faq/html/part2.html](https://www.dclunie.com/medical-image-faq/html/part2.html).

**Parameters**

- `vector` ([Vector3D](/vector3d)) — The orientation vector.

**Returns**

- `string` — The orientation code.

<MemberHeading id="getlpsgroup" depth="3" name="getLPSGroup" sig="getLPSGroup(code: string): string | undefined" />

<MemberMeta sourceHref="/source/src/math/orientation-js/#L155" sourceLabel="orientation.js:155" />

Get the LPS 'group' (axial, coronal or sagittal) from a LPS code.

**Parameters**

- `code` (string) — The LPS code string.

**Returns**

- `string | undefined` — The group.

<MemberHeading id="getorientationname" depth="3" name="getOrientationName" sig="getOrientationName(cosines: Array.<number>): string | undefined" />

<MemberMeta sourceHref="/source/src/math/orientation-js/#L181" sourceLabel="orientation.js:181" />

Get the name of an image orientation patient.

**Parameters**

- `cosines` (Array.\<number>) — The image orientation patient cosines (6 values).

**Returns**

- `string | undefined` — The orientation name: axial, coronal or sagittal.

<MemberHeading
  id="getorientationfromcosines"
  depth="3"
  name="getOrientationFromCosines"
  sig="getOrientationFromCosines(
	cosines: Array.<number>,
): Matrix33 | undefined"
/>

<MemberMeta sourceHref="/source/src/math/orientation-js/#L198" sourceLabel="orientation.js:198" />

Get the orientation matrix associated to the direction cosines.

**Parameters**

- `cosines` (Array.\<number>) — The image orientation patient cosines (6 values).

**Returns**

- [`Matrix33`](/matrix33)` | undefined` — The orientation matrix.

<MemberHeading id="getcosinesfromorientation" depth="3" name="getCosinesFromOrientation" sig="getCosinesFromOrientation(matrix: Matrix33): Array.<number>" />

<MemberMeta sourceHref="/source/src/math/orientation-js/#L222" sourceLabel="orientation.js:222" />

Get the direction cosines from an orientation matrix.

**Parameters**

- `matrix` ([Matrix33](/matrix33)) — The input matrix.

**Returns**

- `Array.<number>` — The image orientation patient cosines (6 values).

<MemberHeading
  id="getvieworientation"
  depth="3"
  name="getViewOrientation"
  sig="getViewOrientation(
	imageOrientation: Matrix33,
	targetOrientation: Matrix33,
): Matrix33"
/>

<MemberMeta sourceHref="/source/src/math/orientation-js/#L241" sourceLabel="orientation.js:241" />

Get the view orientation according to an image and target orientation. The view orientation is used to go from target to image space.

**Parameters**

- `imageOrientation` ([Matrix33](/matrix33)) — The image geometry.
- `targetOrientation` ([Matrix33](/matrix33)) — The target orientation.

**Returns**

- [`Matrix33`](/matrix33) — The view orientation.

<MemberHeading
  id="gettargetorientation"
  depth="3"
  name="getTargetOrientation"
  sig="getTargetOrientation(
	imageOrientation: Matrix33,
	viewOrientation: Matrix33,
): Matrix33"
/>

<MemberMeta sourceHref="/source/src/math/orientation-js/#L268" sourceLabel="orientation.js:268" />

Get the target orientation according to an image and view orientation. The target orientation is used to go from target to real space.

**Parameters**

- `imageOrientation` ([Matrix33](/matrix33)) — The image geometry.
- `viewOrientation` ([Matrix33](/matrix33)) — The view orientation.

**Returns**

- [`Matrix33`](/matrix33) — The target orientation.

<MemberHeading
  id="getlegacytargetorientation"
  depth="3"
  name="getLegacyTargetOrientation"
  sig="getLegacyTargetOrientation(
	imageOrientation: Matrix33,
	targetOrientation: Matrix33,
): Matrix33"
/>

<MemberMeta sourceHref="/source/src/math/orientation-js/#L288" sourceLabel="orientation.js:288" />

Get the legacy target orientation: the target orientation as it was before v0.37, with an abs for coronal acquisitions. Only used to recognise the plane cosines (planePoints) of annotations saved with previous versions.

**Parameters**

- `imageOrientation` ([Matrix33](/matrix33)) — The image orientation.
- `targetOrientation` ([Matrix33](/matrix33)) — The target orientation, see getTargetOrientation.

**Returns**

- [`Matrix33`](/matrix33) — The legacy target orientation.

<MemberHeading
  id="getdisplayorientation"
  depth="3"
  name="getDisplayOrientation"
  sig="getDisplayOrientation(
	imageOrientation: Matrix33,
	targetName?: string,
): Matrix33"
/>

<MemberMeta sourceHref="/source/src/math/orientation-js/#L307" sourceLabel="orientation.js:307" />

Get the display orientation of a view: the orientation matrix of the target orientation name or, if undefined or unknown, the one of the image acquisition plane.

**Parameters**

- `imageOrientation` ([Matrix33](/matrix33)) — The image orientation.
- `targetName` (string, optional) — The target orientation name.

**Returns**

- [`Matrix33`](/matrix33) — The display orientation.

<MemberHeading
  id="getviewflips"
  depth="3"
  name="getViewFlips"
  sig="getViewFlips(
	imageOrientation: Matrix33,
	displayOrientation: Matrix33,
	targetOrientation: Matrix33,
): Object"
/>

<MemberMeta sourceHref="/source/src/math/orientation-js/#L338" sourceLabel="orientation.js:338" />

Get the layer flips needed to show an image with its display orientation: for each view axis, flip it if its direction is opposite to the display one.

The scale flips are in the target space, as expected by the layers flipScale methods, and the offset ones in the view space.

**Parameters**

- `imageOrientation` ([Matrix33](/matrix33)) — The image orientation.
- `displayOrientation` ([Matrix33](/matrix33)) — The display orientation, see getDisplayOrientation.
- `targetOrientation` ([Matrix33](/matrix33)) — The layers target orientation, see getTargetOrientation.

**Returns**

- `Object` — The scale and offset flips.

<MemberHeading id="getequalpoint3dfunction" depth="3" name="getEqualPoint3DFunction" sig="getEqualPoint3DFunction(point: Point3D): function" />

<MemberMeta sourceHref="/source/src/math/point-js/#L294" sourceLabel="point.js:294" />

Get an array find callback for an equal input point.

**Parameters**

- `point` ([Point3D](/point3d)) — The point to compare to.

**Returns**

- `function` — A function that compares, using `equals`, its input point to the one given as input to this function.

<MemberHeading id="includespoint3d" depth="3" name="includesPoint3D" sig="includesPoint3D(arr: Array.<Point3D>, val: Point3D): boolean" />

<MemberMeta sourceHref="/source/src/math/point-js/#L307" sourceLabel="point.js:307" />

Check if an array of Point3D includes a given one.

**Parameters**

- `arr` (Array.\<[Point3D](/point3d)>) — The array of Point3D.
- `val` ([Point3D](/point3d)) — The Point3D to look for.

**Returns**

- `boolean` — True if included.

<MemberHeading id="point3dfromarray" depth="3" name="point3DFromArray" sig="point3DFromArray(arr: Array.<number>): Point3D" />

<MemberMeta sourceHref="/source/src/math/point-js/#L319" sourceLabel="point.js:319" />

Create a [Point3D](/point3d) from an array.

**Parameters**

- `arr` (Array.\<number>) — The input array.

**Returns**

- [`Point3D`](/point3d) — The point.

<MemberHeading id="mulabc" depth="3" name="mulABC" sig="mulABC(a: number, b: number, c: number): number" />

<MemberMeta sourceHref="/source/src/math/rectangle-js/#L20" sourceLabel="rectangle.js:20" />

Mulitply the three inputs if the last two are not null.

**Parameters**

- `a` (number) — The first input.
- `b` (number) — The second input.
- `c` (number) — The third input.

**Returns**

- `number` — The multiplication of the three inputs or null if one of the last two is null.

<MemberHeading
  id="getrectangleindices"
  depth="3"
  name="getRectangleIndices"
  sig="getRectangleIndices(
	center: Index,
	size: Array.<number>,
	dir: Array.<number>,
): Array.<Index>"
/>

<MemberMeta sourceHref="/source/src/math/rectangle-js/#L278" sourceLabel="rectangle.js:278" />

Get the indices that form a rectangle.

**Parameters**

- `center` ([Index](/index)) — The rectangle center.
- `size` (Array.\<number>) — The 2 rectangle sizes.
- `dir` (Array.\<number>) — The 2 rectangle directions.

**Returns**

- `Array.<`[`Index`](/index)`>` — The indices of the rectangle.

<MemberHeading
  id="getstats"
  depth="3"
  name="getStats"
  sig="getStats(
	values: Array.<number>,
	flags?: Array.<string>,
): Statistics | undefined"
/>

<MemberMeta sourceHref="/source/src/math/stats-js/#L72" sourceLabel="stats.js:72" />

Get statistics on an input array of number. Note: could use [https://github.com/tmcw/simple-statistics](https://github.com/tmcw/simple-statistics).

**Parameters**

- `values` (Array.\<number>) — The array of values to extract stats from.
- `flags` (Array.\<string>, optional) — A list of stat value names to calculate.

**Returns**

- [`Statistics`](/statistics)` | undefined` — A statistics object, undefined if the input array is empty.

<MemberHeading id="includesfullstatsflags" depth="3" name="includesFullStatsFlags" sig="includesFullStatsFlags(flags?: Array.<string>): boolean" />

<MemberMeta sourceHref="/source/src/math/stats-js/#L85" sourceLabel="stats.js:85" />

Does the input flag list contain a full stat element?

**Parameters**

- `flags` (Array.\<string>, optional) — A list of stat values to calculate.

**Returns**

- `boolean` — True if one of the flags is a full stat flag.

<MemberHeading id="getbasicstats" depth="3" name="getBasicStats" sig="getBasicStats(values: Array.<number>): Statistics | undefined" />

<MemberMeta sourceHref="/source/src/math/stats-js/#L101" sourceLabel="stats.js:101" />

Get simple stats: minimum, maximum, mean and standard deviation of an array of values.

**Parameters**

- `values` (Array.\<number>) — The array of values to extract stats from.

**Returns**

- [`Statistics`](/statistics)` | undefined` — Simple statistics (no median, p25 nor p75), undefined if the input array is empty.

<MemberHeading id="getfullstats" depth="3" name="getFullStats" sig="getFullStats(values: Array.<number>): Statistics | undefined" />

<MemberMeta sourceHref="/source/src/math/stats-js/#L142" sourceLabel="stats.js:142" />

Get full stats: minimum, maximum, mean, standard deviation, median, 25% and 75% percentile of an array of values.

**Parameters**

- `values` (Array.\<number>) — The array of values to extract stats from, left unchanged.

**Returns**

- [`Statistics`](/statistics)` | undefined` — Complete statistics (includes median, p25 and p75), undefined if the input array is empty.

<MemberHeading id="getpercentile" depth="3" name="getPercentile" sig="getPercentile(values: Array.<number>, ratio: number): number" />

<MemberMeta sourceHref="/source/src/math/stats-js/#L170" sourceLabel="stats.js:170" />

Get an arrays' percentile. Uses linear interpolation for percentiles that lie between data points. See: [https://en.wikipedia.org/wiki/Percentile](https://en.wikipedia.org/wiki/Percentile) (second variant interpolation).

**Parameters**

- `values` (Array.\<number>) — The sorted array of values.
- `ratio` (number) — The percentile ratio \[0-1].

**Returns**

- `number` — The percentile.

<MemberHeading id="guid" depth="3" name="guid" sig="guid(): string" />

<MemberMeta sourceHref="/source/src/math/stats-js/#L200" sourceLabel="stats.js:200" />

Unique ID generator.

See [http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript](http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript) and this [answer](http://stackoverflow.com/a/13403498).

**Returns**

- `string` — A unique ID.

<MemberHeading id="getindexcomparefunction" depth="3" name="getIndexCompareFunction" sig="getIndexCompareFunction(direction: number): object" />

<MemberMeta sourceHref="/source/src/tools/behaviors/brushmaskpaint-js/#L44" sourceLabel="brushMaskPaint.js:44" />

Get an array sort callback:

- f(a,b) > 0 -> b,a,
- f(a,b) \< 0 -> a,b,
- f(a,b) = 0 -> original order.

**Parameters**

- `direction` (number) — The direction to use to compare indices.

**Returns**

- `object` — A function that compares two Index.

<MemberHeading id="getdimensionorganization" depth="3" name="getDimensionOrganization" sig="getDimensionOrganization(): object" />

<MemberMeta sourceHref="/source/src/tools/behaviors/brushmaskpaint-js/#L61" sourceLabel="brushMaskPaint.js:61" />

Get a dimension organisation used to index a DICOM seg.

**Returns**

- `object` — The indices and organisations.

<MemberHeading
  id="getcircleindices"
  depth="3"
  name="getCircleIndices"
  sig="getCircleIndices(
	geometry: Geometry,
	position: Point,
	radiuses: Array.<number>,
	dims: Array.<number>,
): Array.<Index>"
/>

<MemberMeta sourceHref="/source/src/tools/behaviors/brushmaskpaint-js/#L101" sourceLabel="brushMaskPaint.js:101" />

Get the indices that form a circle. Can be an ellipse to adapt to view.

**Parameters**

- `geometry` ([Geometry](/geometry)) — The geometry.
- `position` ([Point](/point)) — The circle center.
- `radiuses` (Array.\<number>) — The circle radiuses.
- `dims` (Array.\<number>) — The 2 dimensions.

**Returns**

- `Array.<`[`Index`](/index)`>` — The indices of the circle.

<MemberHeading
  id="getoriginindexrangefrommaskindices"
  depth="3"
  name="getOriginIndexRangeFromMaskIndices"
  sig="getOriginIndexRangeFromMaskIndices(
	geometry: Geometry,
	indices: Array.<Index>,
): Array.<number>"
/>

<MemberMeta sourceHref="/source/src/tools/behaviors/brushmaskpaint-js/#L119" sourceLabel="brushMaskPaint.js:119" />

Get the range of origin indices that correspond to input new mask indices.

**Parameters**

- `geometry` ([Geometry](/geometry)) — The geometry.
- `indices` (Array.\<[Index](/index)>) — An array of indices.

**Returns**

- `Array.<number>` — Range of indices in the input origins.

<MemberHeading
  id="getoffsetsfromindices"
  depth="3"
  name="getOffsetsFromIndices"
  sig="getOffsetsFromIndices(
	geometry: Geometry,
	indices: Array.<Index>,
): Array.<number>"
/>

<MemberMeta sourceHref="/source/src/tools/behaviors/brushmaskpaint-js/#L172" sourceLabel="brushMaskPaint.js:172" />

Get the data offsets that correspond to input indices.

**Parameters**

- `geometry` ([Geometry](/geometry)) — The geometry.
- `indices` (Array.\<[Index](/index)>) — An array of indices.

**Returns**

- `Array.<number>` — An array of offsets.

<MemberHeading id="formatstring" depth="3" name="formatString" sig="formatString(template: *, ...values: any): string" />

<MemberMeta sourceHref="/source/src/tools/behaviors/brushpaintmessages-js/#L51" sourceLabel="brushPaintMessages.js:51" />

**Parameters**

- `template` (\*) — The template where to add values.
- `values` (any) — The values to add to the template.

**Returns**

- `string` — The formated string.

<MemberHeading id="normalizethreshold" depth="3" name="normalizeThreshold" sig="normalizeThreshold(threshold: Scalar2D | undefined): Scalar2D" />

<MemberMeta sourceHref="/source/src/tools/behaviors/dragbehavior-js/#L35" sourceLabel="dragBehavior.js:35" />

**Parameters**

- `threshold` ([Scalar2D](/scalar2d) | undefined) — Raw threshold.

**Returns**

- [`Scalar2D`](/scalar2d) — Copy with numeric `x` and `y`.

<MemberHeading
  id="isvaliddrawpoint"
  depth="3"
  name="isValidDrawPoint"
  sig="isValidDrawPoint(
	point: Point2D,
	layerGroup: LayerGroup,
): boolean"
/>

<MemberMeta sourceHref="/source/src/tools/behaviors/drawpreview-js/#L28" sourceLabel="drawPreview.js:28" />

Check if a point is valid in the input layerGroup active draw layer.

**Parameters**

- `point` ([Point2D](/point2d)) — The display point to validate.
- `layerGroup` ([LayerGroup](/layergroup)) — The layer group.

**Returns**

- `boolean` — True if valid.

<MemberHeading
  id="getactiveorfirstmonochromeviewlayer"
  depth="3"
  name="getActiveOrFirstMonochromeViewLayer"
  sig="getActiveOrFirstMonochromeViewLayer(
	layerGroup: LayerGroup,
	activeViewLayerOnly: boolean,
): ViewLayer | undefined"
/>

<MemberMeta sourceHref="/source/src/tools/behaviors/utils-js/#L16" sourceLabel="utils.js:16" />

Active view layer, or the first monochrome view layer among active layers when `activeViewLayerOnly` is false (window/level-style resolution).

**Parameters**

- `layerGroup` ([LayerGroup](/layergroup)) — The layer group.
- `activeViewLayerOnly` (boolean) — If true, use [LayerGroup#getActiveViewLayer](/layergroup#getactiveviewlayer) only; if false, the first layer whose view controller reports monochrome.

**Returns**

- [`ViewLayer`](/viewlayer)` | undefined` — The view layer.

<MemberHeading
  id="getactiveordrawrefviewlayer"
  depth="3"
  name="getActiveOrDrawRefViewLayer"
  sig="getActiveOrDrawRefViewLayer(
	layerGroup: LayerGroup,
): ViewLayer | undefined"
/>

<MemberMeta sourceHref="/source/src/tools/behaviors/utils-js/#L36" sourceLabel="utils.js:36" />

Active view layer, or the view layer referenced by the active draw layer.

**Parameters**

- `layerGroup` ([LayerGroup](/layergroup)) — The layer group.

**Returns**

- [`ViewLayer`](/viewlayer)` | undefined` — The view layer.

<MemberHeading id="getspiny" depth="3" name="getSpinY" sig="getSpinY(event: object): number" />

<MemberMeta sourceHref="/source/src/tools/behaviors/wheeltick-js/#L9" sourceLabel="wheelTick.js:9" />

Get a normalised spin speed in the Y direction to try to support trackpads (small and large deltaY) and mouse wheel (large deltaY). Should return 1 or -1 for a single mouse wheel tick.

**Parameters**

- `event` (object) — The wheel event.

**Returns**

- `number` — The normalised spin Y.

<MemberHeading id="isnodenamelabel" depth="3" name="isNodeNameLabel" sig="isNodeNameLabel(node: Konva.Node): boolean" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawbounds-js/#L51" sourceLabel="drawBounds.js:51" />

Is an input node's name 'label'.

**Parameters**

- `node` (Konva.Node) — A Konva node.

**Returns**

- `boolean` — True if the node's name is 'label'.

<MemberHeading id="isnodenameshape" depth="3" name="isNodeNameShape" sig="isNodeNameShape(node: Konva.Node): boolean" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawbounds-js/#L61" sourceLabel="drawBounds.js:61" />

Is an input node's name 'shape'.

**Parameters**

- `node` (Konva.Node) — A Konva node.

**Returns**

- `boolean` — True if the node's name is 'shape'.

<MemberHeading id="ispositionnode" depth="3" name="isPositionNode" sig="isPositionNode(node: Konva.Node): boolean" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawbounds-js/#L71" sourceLabel="drawBounds.js:71" />

Is an input node a position node.

**Parameters**

- `node` (Konva.Node) — A Konva node.

**Returns**

- `boolean` — True if the node's name is 'position-group'.

<MemberHeading id="getlineshape" depth="3" name="getLineShape" sig="getLineShape(group: Konva.Group): Konva.Line | undefined" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawbounds-js/#L81" sourceLabel="drawBounds.js:81" />

Get a Konva.Line shape from a group.

**Parameters**

- `group` (Konva.Group) — The group to look into.

**Returns**

- `Konva.Line | undefined` — The shape.

<MemberHeading
  id="getanchorshape"
  depth="3"
  name="getAnchorShape"
  sig="getAnchorShape(
	group: Konva.Group,
	index: number,
): Konva.Ellipse | undefined"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/drawbounds-js/#L96" sourceLabel="drawBounds.js:96" />

Get a Konva.Ellipse anchor shape from a group.

**Parameters**

- `group` (Konva.Group) — The group to look into.
- `index` (number) — The anchor index.

**Returns**

- `Konva.Ellipse | undefined` — The anchor shape.

<MemberHeading id="isnodewithid" depth="3" name="isNodeWithId" sig="isNodeWithId(id: string): testFn" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawbounds-js/#L118" sourceLabel="drawBounds.js:118" />

Get a lambda to check a node's id.

**Parameters**

- `id` (string) — The id to check.

**Returns**

- [`testFn`](/testfn) — A function to check a node's id.

<MemberHeading
  id="getdefaultanchor"
  depth="3"
  name="getDefaultAnchor"
  sig="getDefaultAnchor(
	x: number,
	y: number,
	id: string,
	style: Style,
): Konva.Ellipse"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/drawbounds-js/#L138" sourceLabel="drawBounds.js:138" />

Get the default anchor shape.

**Parameters**

- `x` (number) — The X position.
- `y` (number) — The Y position.
- `id` (string) — The shape id.
- `style` ([Style](/style)) — The application style.

**Returns**

- `Konva.Ellipse` — The default anchor shape.

<MemberHeading id="getanchorindex" depth="3" name="getAnchorIndex" sig="getAnchorIndex(id: string): number" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawbounds-js/#L168" sourceLabel="drawBounds.js:168" />

Get an anchor index from its id.

**Parameters**

- `id` (string) — The anchor id as 'anchor#'.

**Returns**

- `number` — The anchor index.

<MemberHeading
  id="boundnodeposition"
  depth="3"
  name="boundNodePosition"
  sig="boundNodePosition(
	node: Konva.Node,
	min: Point2D,
	max: Point2D,
): boolean"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/drawbounds-js/#L181" sourceLabel="drawBounds.js:181" />

Bound a node position.

**Parameters**

- `node` (Konva.Node) — The node to bound the position.
- `min` ([Point2D](/point2d)) — The minimum position.
- `max` ([Point2D](/point2d)) — The maximum position.

**Returns**

- `boolean` — True if the position was corrected.

<MemberHeading
  id="getshapepositionrange"
  depth="3"
  name="getShapePositionRange"
  sig="getShapePositionRange(
	stageSize: Scalar2D,
	shape: Konva.Shape,
): object"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/drawbounds-js/#L207" sourceLabel="drawBounds.js:207" />

Get a shape top left position range.

**Parameters**

- `stageSize` ([Scalar2D](/scalar2d)) — The stage size as {x,y}.
- `shape` (Konva.Shape) — The shape to evaluate.

**Returns**

- `object` — The range as {min, max}.

<MemberHeading
  id="isshapeinrange"
  depth="3"
  name="isShapeInRange"
  sig="isShapeInRange(
	shape: Konva.Shape,
	min: Point2D,
	max: Point2D,
): boolean"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/drawbounds-js/#L225" sourceLabel="drawBounds.js:225" />

Is an input shape top left position in the input range.

**Parameters**

- `shape` (Konva.Shape) — The shape to evaluate.
- `min` ([Point2D](/point2d)) — The minimum top left position.
- `max` ([Point2D](/point2d)) — The maximum top left position.

**Returns**

- `boolean` — True if in range.

<MemberHeading
  id="validateanchorposition"
  depth="3"
  name="validateAnchorPosition"
  sig="validateAnchorPosition(
	stageSize: Scalar2D,
	anchor: Konva.Shape,
): boolean"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/drawbounds-js/#L241" sourceLabel="drawBounds.js:241" />

Validate an anchor position.

**Parameters**

- `stageSize` ([Scalar2D](/scalar2d)) — The stage size {x,y}.
- `anchor` (Konva.Shape) — The anchor to evaluate.

**Returns**

- `boolean` — True if the position was corrected.

<MemberHeading id="defaultopenroidialog" depth="3" name="defaultOpenRoiDialog" sig="defaultOpenRoiDialog(annotation: Annotation, callback: function)" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawshapehandler-js/#L35" sourceLabel="drawShapeHandler.js:35" />

Open a dialogue to edit roi data. Defaults to window\.prompt.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The roi data.
- `callback` (function) — The callback to launch on dialogue exit.

<MemberHeading
  id="setlinehitfunc"
  depth="3"
  name="setLineHitFunc"
  sig="setLineHitFunc(
	kline: Konva.Line,
	line: Line,
	zoomScale: Scalar2D,
	hitWidth?: number,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/linehitfunc-js/#L21" sourceLabel="lineHitFunc.js:21" />

Apply a wider quadrilateral hit area to an open Konva.Line.

The hit zone is a rectangle whose sides are the perpendicular half-widths drawn at each endpoint of the line. This makes thin lines much easier to click without changing their visual appearance.

**Parameters**

- `kline` (Konva.Line) — The Konva line shape to update.
- `line` ([Line](/line)) — The mathematical line (provides begin/end points).
- `zoomScale` ([Scalar2D](/scalar2d)) — The current zoom scale {x, y}.
- `hitWidth` (number, optional) — Half-width of the hit quad in pixels (default 20).

<MemberHeading id="getdefaultlabel" depth="3" name="getDefaultLabel" sig="getDefaultLabel(name: string): object" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapeannotators-js/#L24" sourceLabel="shapeAnnotators.js:24" />

Get the label text expression for a named shape, honouring the custom label override when one is set.

**Parameters**

- `name` (string) — The shape name.

**Returns**

- `object` — The label text expression object.

<MemberHeading id="protractorarcparams" depth="3" name="protractorArcParams" sig="protractorArcParams(protractor: object): Object" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapepainters-js/#L561" sourceLabel="shapePainters.js:561" />

Compute the arc parameters for a complete protractor.

**Parameters**

- `protractor` (object) — The Protractor math shape.

**Returns**

- `Object` — Params.

<MemberHeading
  id="buildprotractorarc"
  depth="3"
  name="buildProtractorArc"
  sig="buildProtractorArc(
	protractor: object,
	colour: string,
	style: Style,
): Konva.Arc"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/shapepainters-js/#L583" sourceLabel="shapePainters.js:583" />

Build the arc Konva node for a protractor.

**Parameters**

- `protractor` (object) — The Protractor math shape.
- `colour` (string) — The stroke colour.
- `style` ([Style](/style)) — The drawing style.

**Returns**

- `Konva.Arc` — The arc node.

<MemberHeading id="applyprotractorhitfunc" depth="3" name="applyProtractorHitFunc" sig="applyProtractorHitFunc(kshape: Konva.Line, protractor: object)" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapepainters-js/#L606" sourceLabel="shapePainters.js:606" />

Apply the triangle hit area to the protractor's Konva.Line shape.

**Parameters**

- `kshape` (Konva.Line) — The Konva line node.
- `protractor` (object) — The Protractor math shape.

<MemberHeading id="getpainter" depth="3" name="getPainter" sig="getPainter(name: string): KonvaShapePainter" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapepainters-js/#L649" sourceLabel="shapePainters.js:649" />

Get the Konva shape entry for a factory name.

**Parameters**

- `name` (string) — The factory / annotator name.

**Returns**

- [`KonvaShapePainter`](/konvashapepainter) — The entry.

<MemberHeading id="tostringid" depth="3" name="toStringId" sig="toStringId(arr: Array, dims?: Array.<number>): string" />

<MemberMeta sourceHref="/source/src/utils/array-js/#L10" sourceLabel="array.js:10" />

Get a string id from array values in the form of: '#0-1\_#1-2'.

**Parameters**

- `arr` (Array) — The input array.
- `dims` (Array.\<number>, optional) — Optional list of dimensions to use.

**Returns**

- `string` — The string id.

<MemberHeading id="getarrayfromstringid" depth="3" name="getArrayFromStringId" sig="getArrayFromStringId(inputStr: string): Array" />

<MemberMeta sourceHref="/source/src/utils/array-js/#L42" sourceLabel="array.js:42" />

Get an array from an id string in the form of: '#0-1\_#1-2' (result of toStringId).

**Parameters**

- `inputStr` (string) — The input string.

**Returns**

- `Array` — The corresponding array (minimum size is 3D).

<MemberHeading id="checkandapply" depth="3" name="checkAndApply" sig="checkAndApply(a: any, b: any, func: function): any" />

<MemberMeta sourceHref="/source/src/utils/array-js/#L80" sourceLabel="array.js:80" />

Apply an input 'compare'function after having checked the two inputs for undefined.

**Parameters**

- `a` (any) — The first input.
- `b` (any) — The second input.
- `func` (function) — The compare function.

**Returns**

- `any` — The result of the function applied to the inputs or the not undefined input.

<MemberHeading id="arraymap" depth="3" name="arrayMap" sig="arrayMap(arr0: Array, arr1: Array, func: function): Array" />

<MemberMeta sourceHref="/source/src/utils/array-js/#L100" sourceLabel="array.js:100" />

Apply an input 'compare' function to items of 2 arrays. The output will have a length that is the maximum of both inputs.

**Parameters**

- `arr0` (Array) — The first array.
- `arr1` (Array) — The second array.
- `func` (function) — The compare function.

**Returns**

- `Array` — The result array.

<MemberHeading
  id="arraycontains"
  depth="3"
  name="arrayContains"
  sig="arrayContains(
	arr0: Array.<string>,
	arr1: Array.<string>,
): boolean"
/>

<MemberMeta sourceHref="/source/src/utils/array-js/#L116" sourceLabel="array.js:116" />

Check if the first input array contains all the elements of the second input array.

**Parameters**

- `arr0` (Array.\<string>) — The test array.
- `arr1` (Array.\<string>) — The elements to check in the first array.

**Returns**

- `boolean` — True if all the elements of arr1 are included in arr0.

<MemberHeading id="arraysortequals" depth="3" name="arraySortEquals" sig="arraySortEquals(arr0: Array, arr1: Array): boolean" />

<MemberMeta sourceHref="/source/src/utils/array-js/#L145" sourceLabel="array.js:145" />

Check for array equality after sorting.

**Parameters**

- `arr0` (Array) — First array.
- `arr1` (Array) — Second array.

**Returns**

- `boolean` — True if both array are defined and contain same values.

<MemberHeading id="arrayequals" depth="3" name="arrayEquals" sig="arrayEquals(arr0: Array, arr1: Array): boolean" />

<MemberMeta sourceHref="/source/src/utils/array-js/#L164" sourceLabel="array.js:164" />

Check for array equality.

**Parameters**

- `arr0` (Array) — First array.
- `arr1` (Array) — Second array.

**Returns**

- `boolean` — True if both array are defined and contain same values.

<MemberHeading id="uint8arraytostring" depth="3" name="uint8ArrayToString" sig="uint8ArrayToString(arr: Uint8Array): string" />

<MemberMeta sourceHref="/source/src/utils/array-js/#L185" sourceLabel="array.js:185" />

Convert a Uint8Array to a string.

**Parameters**

- `arr` (Uint8Array) — The array to convert.

**Returns**

- `string` — The array as string.

<MemberHeading
  id="findinarraysubset"
  depth="3"
  name="findInArraySubset"
  sig="findInArraySubset(
	arr: Uint8Array,
	callbackFn: function,
	start: number | undefined,
	end?: number | undefined,
): number | undefined"
/>

<MemberMeta sourceHref="/source/src/utils/array-js/#L199" sourceLabel="array.js:199" />

Array find in a subset of the input array. Equivalent to: `arr.slice(start, end).find(callbackFn)`.

**Parameters**

- `arr` (Uint8Array) — The input array to search.
- `callbackFn` (function) — The find function.
- `start` (number | undefined) — The array start index.
- `end` (number | undefined, optional) — The array end index.

**Returns**

- `number | undefined` — The index where the element was found.

<MemberHeading id="getfindarrayinarraycallback" depth="3" name="getFindArrayInArrayCallback" sig="getFindArrayInArrayCallback(arr1: Uint8Array): function" />

<MemberMeta sourceHref="/source/src/utils/array-js/#L227" sourceLabel="array.js:227" />

Get a find in array callback.

**Parameters**

- `arr1` (Uint8Array) — The array to find.

**Returns**

- `function` — The find callback function.

<MemberHeading id="parsemultipart" depth="3" name="parseMultipart" sig="parseMultipart(arr: ArrayBuffer): Array" />

<MemberMeta sourceHref="/source/src/utils/array-js/#L247" sourceLabel="array.js:247" />

Extract each element of a multipart ArrayBuffer.

Ref: [https://en.wikipedia.org/wiki/MIME#Multipart\_messages](https://en.wikipedia.org/wiki/MIME#Multipart_messages).

**Parameters**

- `arr` (ArrayBuffer) — The multipart array.

**Returns**

- `Array` — The multipart parts as an array of object as {'Content-Type', ..., data} (depending on header tags).

<MemberHeading id="buildmultipart" depth="3" name="buildMultipart" sig="buildMultipart(parts: Array, boundary: string): Uint8Array" />

<MemberMeta sourceHref="/source/src/utils/array-js/#L355" sourceLabel="array.js:355" />

Build a multipart message.

Ref:

- [https://en.wikipedia.org/wiki/MIME#Multipart\_messages](https://en.wikipedia.org/wiki/MIME#Multipart_messages),
- [https://hg.orthanc-server.com/orthanc-dicomweb/file/tip/Resources/Samples/JavaScript/stow-rs.js](https://hg.orthanc-server.com/orthanc-dicomweb/file/tip/Resources/Samples/JavaScript/stow-rs.js).

**Parameters**

- `parts` (Array) — The message parts as an array of object containing content headers and messages as the data property (as returned by parse).
- `boundary` (string) — The message boundary.

**Returns**

- `Uint8Array` — The full multipart message.

<MemberHeading id="isequalrgb" depth="3" name="isEqualRgb" sig="isEqualRgb(c1: RGB, c2: RGB): boolean" />

<MemberMeta sourceHref="/source/src/utils/colour-js/#L49" sourceLabel="colour.js:49" />

Check if two rgb objects are equal.

**Parameters**

- `c1` ([RGB](/rgb)) — The first colour.
- `c2` ([RGB](/rgb)) — The second colour.

**Returns**

- `boolean` — True if both colour are equal.

<MemberHeading id="ybrtorgb" depth="3" name="ybrToRgb" sig="ybrToRgb(y: number, cb: number, cr: number): RGB" />

<MemberMeta sourceHref="/source/src/utils/colour-js/#L71" sourceLabel="colour.js:71" />

Convert YBR to RGB.

Ref:

- [http://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect\_C.7.6.3.html#sect\_C.7.6.3.1.2](http://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.7.6.3.html#sect_C.7.6.3.1.2),
- [https://en.wikipedia.org/wiki/YCbCr#JPEG\_conversion](https://en.wikipedia.org/wiki/YCbCr#JPEG_conversion).

**Parameters**

- `y` (number) — The Y component.
- `cb` (number) — The Cb component.
- `cr` (number) — The Cr component.

**Returns**

- [`RGB`](/rgb) — RGB equivalent as {r,g,b}.

<MemberHeading id="hextorgb" depth="3" name="hexToRgb" sig="hexToRgb(hexStr: string): RGB" />

<MemberMeta sourceHref="/source/src/utils/colour-js/#L85" sourceLabel="colour.js:85" />

Convert a hex color into RGB.

**Parameters**

- `hexStr` (string) — The hex color as '#ab01ef'.

**Returns**

- [`RGB`](/rgb) — The RGB values as {r,g,b}.

<MemberHeading id="rgbtohex" depth="3" name="rgbToHex" sig="rgbToHex(rgb: RGB): string" />

<MemberMeta sourceHref="/source/src/utils/colour-js/#L99" sourceLabel="colour.js:99" />

Convert RGB to its hex equivalent.

**Parameters**

- `rgb` ([RGB](/rgb)) — The RGB object as {r,g,b}.

**Returns**

- `string` — A string representing the hex color as '#ab01ef'.

<MemberHeading id="getbrightness" depth="3" name="getBrightness" sig="getBrightness(rgb: RGB): number" />

<MemberMeta sourceHref="/source/src/utils/colour-js/#L113" sourceLabel="colour.js:113" />

Get the brightness of a RGB colour: calculates the luma (Y) of the YIQ colour space.

Ref: [https://en.wikipedia.org/wiki/YIQ#From\_RGB\_to\_YIQ](https://en.wikipedia.org/wiki/YIQ#From_RGB_to_YIQ).

**Parameters**

- `rgb` ([RGB](/rgb)) — RGB triplet.

**Returns**

- `number` — The brightness (\[0,1]).

<MemberHeading id="isdarkcolour" depth="3" name="isDarkColour" sig="isDarkColour(hexColour: string): boolean" />

<MemberMeta sourceHref="/source/src/utils/colour-js/#L128" sourceLabel="colour.js:128" />

Check if a colour given in hexadecimal format is dark.

**Parameters**

- `hexColour` (string) — The colour (as '#ab01ef').

**Returns**

- `boolean` — True if the colour is dark (brightness \< 0.5).

<MemberHeading id="getshadowcolour" depth="3" name="getShadowColour" sig="getShadowColour(hexColour: string): string" />

<MemberMeta sourceHref="/source/src/utils/colour-js/#L138" sourceLabel="colour.js:138" />

Get the shadow colour of an input colour.

**Parameters**

- `hexColour` (string) — The colour (as '#ab01ef').

**Returns**

- `string` — The shadow colour (white or black).

<MemberHeading id="uintlabtolab" depth="3" name="uintLabToLab" sig="uintLabToLab(triplet: object): object" />

<MemberMeta sourceHref="/source/src/utils/colour-js/#L149" sourceLabel="colour.js:149" />

Unsigned int CIE LAB value (\[0, 65535]) to CIE LAB value (L: \[0, 100], a: \[-128, 127], b: \[-128, 127]).

**Parameters**

- `triplet` (object) — CIE LAB triplet as {l,a,b} with unsigned range.

**Returns**

- `object` — CIE LAB triplet as {l,a,b} with CIE LAB range.

<MemberHeading id="labtouintlab" depth="3" name="labToUintLab" sig="labToUintLab(triplet: object): object" />

<MemberMeta sourceHref="/source/src/utils/colour-js/#L166" sourceLabel="colour.js:166" />

CIE LAB value (L: \[0, 100], a: \[-128, 127], b: \[-128, 127]) to unsigned int CIE LAB (\[0, 65535]).

**Parameters**

- `triplet` (object) — CIE XYZ triplet as {l,a,b} with CIE LAB range.

**Returns**

- `object` — CIE LAB triplet as {l,a,b} with unsigned range.

<MemberHeading id="cielabtociexyz" depth="3" name="cielabToCiexyz" sig="cielabToCiexyz(triplet: object): Scalar3D" />

<MemberMeta sourceHref="/source/src/utils/colour-js/#L197" sourceLabel="colour.js:197" />

Convert CIE LAB to CIE XYZ (standard illuminant D65, 2degree 1931).

Ref: [https://en.wikipedia.org/wiki/CIELAB\_color\_space#From\_CIELAB\_to\_CIEXYZ](https://en.wikipedia.org/wiki/CIELAB_color_space#From_CIELAB_to_CIEXYZ).

**Parameters**

- `triplet` (object) — CIE LAB triplet as {l,a,b}.

**Returns**

- [`Scalar3D`](/scalar3d) — CIE XYZ triplet as {x,y,z}.

<MemberHeading id="ciexyztocielab" depth="3" name="ciexyzToCielab" sig="ciexyzToCielab(triplet: Scalar3D): object" />

<MemberMeta sourceHref="/source/src/utils/colour-js/#L235" sourceLabel="colour.js:235" />

Convert CIE XYZ to CIE LAB (standard illuminant D65, 2degree 1931).

Ref: [https://en.wikipedia.org/wiki/CIELAB\_color\_space#From\_CIEXYZ\_to\_CIELAB](https://en.wikipedia.org/wiki/CIELAB_color_space#From_CIEXYZ_to_CIELAB).

**Parameters**

- `triplet` ([Scalar3D](/scalar3d)) — CIE XYZ triplet as {x,y,z}.

**Returns**

- `object` — CIE LAB triplet as {l,a,b}.

<MemberHeading id="ciexyztosrgb" depth="3" name="ciexyzToSrgb" sig="ciexyzToSrgb(triplet: Scalar3D): RGB" />

<MemberMeta sourceHref="/source/src/utils/colour-js/#L274" sourceLabel="colour.js:274" />

Convert CIE XYZ to sRGB.

Ref: [https://en.wikipedia.org/wiki/SRGB#From\_CIE\_XYZ\_to\_sRGB](https://en.wikipedia.org/wiki/SRGB#From_CIE_XYZ_to_sRGB).

**Parameters**

- `triplet` ([Scalar3D](/scalar3d)) — CIE XYZ triplet as {x,y,z}.

**Returns**

- [`RGB`](/rgb) — 'sRGB' triplet as {r,g,b}.

<MemberHeading id="srgbtociexyz" depth="3" name="srgbToCiexyz" sig="srgbToCiexyz(triplet: RGB): Scalar3D" />

<MemberMeta sourceHref="/source/src/utils/colour-js/#L312" sourceLabel="colour.js:312" />

Convert sRGB to CIE XYZ.

Ref: [https://en.wikipedia.org/wiki/SRGB#From\_sRGB\_to\_CIE\_XYZ](https://en.wikipedia.org/wiki/SRGB#From_sRGB_to_CIE_XYZ).

**Parameters**

- `triplet` ([RGB](/rgb)) — 'sRGB' triplet as {r,g,b}.

**Returns**

- [`Scalar3D`](/scalar3d) — CIE XYZ triplet as {x,y,z}.

<MemberHeading id="cielabtosrgb" depth="3" name="cielabToSrgb" sig="cielabToSrgb(triplet: object): RGB" />

<MemberMeta sourceHref="/source/src/utils/colour-js/#L346" sourceLabel="colour.js:346" />

Convert CIE LAB to sRGB (standard illuminant D65).

**Parameters**

- `triplet` (object) — CIE LAB triplet as {l,a,b}.

**Returns**

- [`RGB`](/rgb) — 'sRGB' triplet as {r,g,b}.

<MemberHeading id="srgbtocielab" depth="3" name="srgbToCielab" sig="srgbToCielab(triplet: RGB): object" />

<MemberMeta sourceHref="/source/src/utils/colour-js/#L356" sourceLabel="colour.js:356" />

Convert sRGB to CIE LAB (standard illuminant D65).

**Parameters**

- `triplet` ([RGB](/rgb)) — 'sRGB' triplet as {r,g,b}.

**Returns**

- `object` — CIE LAB triplet as {l,a,b}.

<MemberHeading id="colournametohex" depth="3" name="colourNameToHex" sig="colourNameToHex(name: string): string" />

<MemberMeta sourceHref="/source/src/utils/colour-js/#L366" sourceLabel="colour.js:366" />

Get the hex code of a string colour for a colour used in pre dwv v0.17.

**Parameters**

- `name` (string) — The name of a colour.

**Returns**

- `string` — The hex representing the colour.

<MemberHeading id="getdefaultcolour" depth="3" name="getDefaultColour" sig="getDefaultColour(number: number): RGB" />

<MemberMeta sourceHref="/source/src/utils/colour-js/#L412" sourceLabel="colour.js:412" />

Get a default RGB colour for a given number (for example a segment number).

**Parameters**

- `number` (number) — The input number.

**Returns**

- [`RGB`](/rgb) — A colour.

<MemberHeading
  id="mergeobjects"
  depth="3"
  name="mergeObjects"
  sig="mergeObjects(
	obj1: object,
	obj2: object,
	idKey: string,
	valueKey: string,
	secondIdGetter?: function,
): object"
/>

<MemberMeta sourceHref="/source/src/utils/operator-js/#L48" sourceLabel="operator.js:48" />

Merge two similar objects.

Objects need to be in the form of: `{ idKey: {valueKey: ['0']}, key0: {valueKey: ["abc"]}, key1: {valueKey: [33]} } `.

Merged objects will be in the form of: `{ mergeId: ['0','1','2'], idKey: {valueKey: { 0: ['0'], 1: ['1'], 2: ['2'] }}, key0: {valueKey: { 0: ["abc"], 1: ["def"], 2: ["ghi"] }}, key1: {valueKey: { 0: [33], 1: [44], 2: [55] }} } `.

**Parameters**

- `obj1` (object) — The first object, can be the result of a previous merge.
- `obj2` (object) — The second object.
- `idKey` (string) — The key to use as index for duplicate values.
- `valueKey` (string) — The key to use to access object values.
- `secondIdGetter` (function, optional) — Function `(obj) => number|undefined` called on each raw (not yet merged) object to get its second id, added as a suffix to its base id to disambiguate objects that would otherwise share the same base id (to differentiate time points for example). Defaults to no second id.

**Returns**

- `object` — The merged object.

<MemberHeading id="capitalisefirstletter" depth="3" name="capitaliseFirstLetter" sig="capitaliseFirstLetter(string: string): string" />

<MemberMeta sourceHref="/source/src/utils/string-js/#L10" sourceLabel="string.js:10" />

Capitalise the first letter of a string.

**Parameters**

- `string` (string) — The string to capitalise the first letter.

**Returns**

- `string` — The new string.

<MemberHeading
  id="startswith"
  depth="3"
  name="startsWith"
  sig="startsWith(
	str: string,
	search: string,
	rawPos?: number,
): boolean"
/>

<MemberMeta sourceHref="/source/src/utils/string-js/#L27" sourceLabel="string.js:27" />

Check if a string starts with the input element.

**Parameters**

- `str` (string) — The input string.
- `search` (string) — The searched start.
- `rawPos` (number, optional) — The position in this string at which to begin searching for searchString. Defaults to 0.

**Returns**

- `boolean` — True if the input string starts with the searched string.

<MemberHeading id="endswith" depth="3" name="endsWith" sig="endsWith(str: string, search: string): boolean" />

<MemberMeta sourceHref="/source/src/utils/string-js/#L43" sourceLabel="string.js:43" />

Check if a string ends with the input element.

**Parameters**

- `str` (string) — The input string.
- `search` (string) — The searched ending.

**Returns**

- `boolean` — True if the input string ends with the searched string.

<MemberHeading id="splitkeyvaluestring" depth="3" name="splitKeyValueString" sig="splitKeyValueString(inputStr: string): object" />

<MemberMeta sourceHref="/source/src/utils/string-js/#L58" sourceLabel="string.js:58" />

Split key/value string: `key0=val00&key0=val01&key1=val10` will return `{key0 : [val00, val01], key1 : val1}`.

**Parameters**

- `inputStr` (string) — The string to split.

**Returns**

- `object` — The split string.

<MemberHeading id="getflags" depth="3" name="getFlags" sig="getFlags(inputStr: string): Array.<string>" />

<MemberMeta sourceHref="/source/src/utils/string-js/#L89" sourceLabel="string.js:89" />

Get flags from an input string. Flags are words surrounded with curly braces.

**Parameters**

- `inputStr` (string) — The input string.

**Returns**

- `Array.<string>` — An array of found flags.

<MemberHeading id="replaceflags" depth="3" name="replaceFlags" sig="replaceFlags(inputStr: string, values: object): string" />

<MemberMeta sourceHref="/source/src/utils/string-js/#L115" sourceLabel="string.js:115" />

Replace flags in a input string. Flags are keywords surrounded with curly braces.

**Parameters**

- `inputStr` (string) — The input string.
- `values` (object) — A object of {value, unit}.

**Returns**

- `string` — The result string.

<MemberHeading id="getrootpath" depth="3" name="getRootPath" sig="getRootPath(path: string): string" />

<MemberMeta sourceHref="/source/src/utils/string-js/#L163" sourceLabel="string.js:163" />

Get the root of an input path. Splits using `/` as separator.

**Parameters**

- `path` (string) — The input path.

**Returns**

- `string` — The input path without its last part.

<MemberHeading id="getfileextension" depth="3" name="getFileExtension" sig="getFileExtension(filePath: string): string | undefined" />

<MemberMeta sourceHref="/source/src/utils/string-js/#L176" sourceLabel="string.js:176" />

Get a file extension: anything after the last dot. File name starting with a dot are discarded. Extensions are expected to contain at least one letter.

**Parameters**

- `filePath` (string) — The file path containing the file name.

**Returns**

- `string | undefined` — The lower case file extension or undefined for none.

<MemberHeading id="stringtouint8array" depth="3" name="stringToUint8Array" sig="stringToUint8Array(str: string): Uint8Array" />

<MemberMeta sourceHref="/source/src/utils/string-js/#L200" sourceLabel="string.js:200" />

Convert a string to a Uint8Array.

**Parameters**

- `str` (string) — The string to convert.

**Returns**

- `Uint8Array` — The Uint8Array.

<MemberHeading id="gethardwareconcurrency" depth="3" name="getHardwareConcurrency" sig="getHardwareConcurrency(): number | undefined" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L13" sourceLabel="thread.js:13" />

Get the number of logical processors.

**Returns**

- `number | undefined` — The number of logical processors (`navigator.hardwareConcurrency`), undefined if not available.

<MemberHeading id="getdefaultpoolsize" depth="3" name="getDefaultPoolSize" sig="getDefaultPoolSize(): number" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L32" sourceLabel="thread.js:32" />

Get the default thread pool size: half the number of logical processors (at least one), or [FALLBACK\_POOL\_SIZE](/global#fallbackpoolsize) if not available. Leaves room for the main thread and limits the number of workers (and their buffer copies), which matters on memory limited devices such as iOS ones.

**Returns**

- `number` — The pool size.

<MemberHeading id="clamppoolsize" depth="3" name="clampPoolSize" sig="clampPoolSize(poolSize: number): number" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L48" sourceLabel="thread.js:48" />

Clamp a thread pool size to the number of logical processors, if available.

**Parameters**

- `poolSize` (number) — The pool size.

**Returns**

- `number` — The clamped pool size.

<MemberHeading id="geturlfromuri" depth="3" name="getUrlFromUri" sig="getUrlFromUri(uri: string): URL" />

<MemberMeta sourceHref="/source/src/utils/uri-js/#L10" sourceLabel="uri.js:10" />

Get an full object URL from a string uri.

**Parameters**

- `uri` (string) — A string representing the url.

**Returns**

- `URL` — A URL object.

<MemberHeading id="splituri" depth="3" name="splitUri" sig="splitUri(uri: string): object" />

<MemberMeta sourceHref="/source/src/utils/uri-js/#L31" sourceLabel="uri.js:31" />

Split an input URI: 'root?key0=val00\&key0=val01\&key1=val10' returns { base : root, query : \[ key0 : \[val00, val01], key1 : val1 ] } Returns an empty object if the input string is not correct (null, empty...) or if it is not a query string (no question mark).

**Parameters**

- `uri` (string) — The string to split.

**Returns**

- `object` — The split string.

<MemberHeading id="geturiquery" depth="3" name="getUriQuery" sig="getUriQuery(uri: string): object" />

<MemberMeta sourceHref="/source/src/utils/uri-js/#L59" sourceLabel="uri.js:59" />

Get the query part, split into an array, of an input URI. The URI scheme is: `base?query#fragment`.

**Parameters**

- `uri` (string) — The input URI.

**Returns**

- `object` — The query part, split into an array, of the input URI.

<MemberHeading id="decodequery" depth="3" name="decodeQuery" sig="decodeQuery(query: object, callback: function, options: object)" />

<MemberMeta badges="deprecated" sourceHref="/source/src/utils/uri-js/#L84" sourceLabel="uri.js:84" />

Generic URI query decoder. Supports manifest: `[dwv root]?input=encodeURIComponent('[manifest file]')&type=manifest`. Or encoded URI with base and key value/pairs: `[dwv root]?input=encodeURIComponent([root]?key0=value0&key1=value1)`.

<Callout type="error">
  &#x20;Since v0.36, please use specialised getURLsFromKeyValueUri and app.loadURLS or handleURLsFromWeasisXMLManifest.
</Callout>

**Parameters**

- `query` (object) — The query part to the input URI.
- `callback` (function) — The function to call with the decoded file urls.
- `options` (object) — Optional url request options.

<MemberHeading id="geturlsfromkeyvalueuri" depth="3" name="getURLsFromKeyValueUri" sig="getURLsFromKeyValueUri(uri: string): Array.<string> | undefined" />

<MemberMeta sourceHref="/source/src/utils/uri-js/#L103" sourceLabel="uri.js:103" />

Get a list of URLs from a uri containing key-value pairs as in: `[dwv root]?input=encodeURIComponent([root]?key0=value0&key1=value1)`.

**Parameters**

- `uri` (string) — The input URI.

**Returns**

- `Array.<string> | undefined` — The list of URLs.

<MemberHeading id="handleurlsfromweasisxmlmanifest" depth="3" name="handleURLsFromWeasisXMLManifest" sig="handleURLsFromWeasisXMLManifest(uri: string, callback: function)" />

<MemberMeta sourceHref="/source/src/utils/uri-js/#L120" sourceLabel="uri.js:120" />

Handle (ie call callback) with the list of urls contained in a WEASIS XML manifest provided via a uri as in: `[dwv root]?input=encodeURIComponent('[manifest file]')&type=manifest`.

**Parameters**

- `uri` (string) — The input URI.
- `callback` (function) — The function to call with the decoded file urls.

<MemberHeading
  id="decodekeyvalueuri"
  depth="3"
  name="decodeKeyValueUri"
  sig="decodeKeyValueUri(
	uri: string,
	replaceMode: string,
): Array.<string>"
/>

<MemberMeta sourceHref="/source/src/utils/uri-js/#L138" sourceLabel="uri.js:138" />

Decode a Key/Value pair URI. If a key is repeated, the result be an array of base + each key.

**Parameters**

- `uri` (string) — The URI to decode.
- `replaceMode` (string) — The key replace mode. Can be:

**Returns**

- `Array.<string>` — The list of input file urls.

<MemberHeading
  id="parseweasisxmlmanifest"
  depth="3"
  name="parseWeasisXMLManifest"
  sig="parseWeasisXMLManifest(
	manifest: XMLDocument,
	nslices: number,
): Array.<string>"
/>

<MemberMeta sourceHref="/source/src/utils/uri-js/#L260" sourceLabel="uri.js:260" />

Parse a WEASIS XML manifest. See: [https://weasis.org/en/basics/customize/integration/#build-an-xml-manifest](https://weasis.org/en/basics/customize/integration/#build-an-xml-manifest).

**Parameters**

- `manifest` (XMLDocument) — The manifest to decode.
- `nslices` (number) — The number of slices to load.

**Returns**

- `Array.<string>` — A list of WADO urls.

<MemberHeading id="getrlefragment" depth="3" name="getRleFragment" sig="getRleFragment(segments: Array.<Array.<number>>): Uint8Array" />

<MemberMeta sourceHref="/source/tests/decoders/dwv/rle-test-js/#L21" sourceLabel="rle.test.js:21" />

Create a RLE fragment from already encoded segments: 64 bytes header (number of segments + 15 segment offsets) followed by the segments. Ref: [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part05/sect\_G.5.html](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part05/sect_G.5.html).

**Parameters**

- `segments` (Array.\<Array.\<number>>) — The encoded segments, as byte values (negative counts can be given as signed values).

**Returns**

- `Uint8Array` — The RLE fragment.

<MemberHeading id="decode" depth="3" name="decode" sig="decode(fragment: Uint8Array, meta: object): TypedArray" />

<MemberMeta sourceHref="/source/tests/decoders/dwv/rle-test-js/#L48" sourceLabel="rle.test.js:48" />

Decode a fragment.

**Parameters**

- `fragment` (Uint8Array) — The RLE fragment.
- `meta` (object) — The meta data: {bitsAllocated, isSigned, sliceSize, samplesPerPixel, planarConfiguration}.

**Returns**

- [`TypedArray`](/typedarray) — The decoded data.

<MemberHeading
  id="makemultiframeelements"
  depth="3"
  name="makeMultiFrameElements"
  sig="makeMultiFrameElements(
	temporalPositionIndex: number,
	numberOfFrames?: number,
): Record.<string, DataElement>"
/>

<MemberMeta sourceHref="/source/tests/dicom/dicomvolume-test-js/#L65" sourceLabel="dicomVolume.test.js:65" />

Create DICOM elements for a multi-frame file whose frames all share the given TemporalPositionIndex.

**Parameters**

- `temporalPositionIndex` (number) — The per-frame temporal position index value.
- `numberOfFrames` (number, optional) — Optional number of frames (defaults to 2).

**Returns**

- `Record.<string, `[`DataElement`](/dataelement)`>` — The DICOM elements.

<MemberHeading
  id="makeenhancedmrelements"
  depth="3"
  name="makeEnhancedMRElements"
  sig="makeEnhancedMRElements(
	bValues: Array.<number>,
): Record.<string, DataElement>"
/>

<MemberMeta sourceHref="/source/tests/dicom/dicomvolume-test-js/#L91" sourceLabel="dicomVolume.test.js:91" />

Create DICOM elements for an enhanced MR multi-frame file with per-frame diffusion b-values.

**Parameters**

- `bValues` (Array.\<number>) — The per-frame b-values.

**Returns**

- `Record.<string, `[`DataElement`](/dataelement)`>` — The DICOM elements.

<MemberHeading
  id="makeperframeelements"
  depth="3"
  name="makePerFrameElements"
  sig="makePerFrameElements(
	frameValues: object,
	extraElements?: Record.<string, DataElement>,
): Record.<string, DataElement>"
/>

<MemberMeta sourceHref="/source/tests/dicom/dicomvolume-test-js/#L115" sourceLabel="dicomVolume.test.js:115" />

Create DICOM elements for a multi-frame file with per-frame TemporalPositionIndex and/or diffusion b-values.

**Parameters**

- `frameValues` (object) — The per-frame values: optional `temporalPositions`, `bValues` and `dimensionIndexValues` arrays.
- `extraElements` (Record.\<string, [DataElement](/dataelement)>, optional) — Optional root elements.

**Returns**

- `Record.<string, `[`DataElement`](/dataelement)`>` — The DICOM elements.

<MemberHeading id="makedataelement" depth="3" name="makeDataElement" sig="makeDataElement(vr: string, value: Array): DataElement" />

<MemberMeta sourceHref="/source/tests/dicom/dicomvolume-test-js/#L154" sourceLabel="dicomVolume.test.js:154" />

Create a data element with a given VR and value.

**Parameters**

- `vr` (string) — The value representation.
- `value` (Array) — The element value.

**Returns**

- [`DataElement`](/dataelement) — The data element.

<MemberHeading id="getcandidate" depth="3" name="getCandidate" sig="getCandidate(name: string): function" />

<MemberMeta sourceHref="/source/tests/dicom/dicomvolume-test-js/#L166" sourceLabel="dicomVolume.test.js:166" />

Get a candidate getter by name.

**Parameters**

- `name` (string) — The candidate name.

**Returns**

- `function` — The getter.

<MemberHeading id="b64urltoarraybuffer" depth="3" name="b64urlToArrayBuffer" sig="b64urlToArrayBuffer(str: string): ArrayBuffer" />

<MemberMeta sourceHref="/source/tests/dicom/utils-js/#L9" sourceLabel="utils.js:9" />

Convert a base64 url to an ArrayBuffer. Something like: 'data:application/dicom;base64,SGVsbG8sIFdvcmxkIQ==' The function is independent from the mime type.

**Parameters**

- `str` (string) — Base64 url string.

**Returns**

- `ArrayBuffer` — The corresponding buffer.

<MemberHeading id="createdrawlayer" depth="3" name="createDrawLayer" sig="createDrawLayer(ids: Array.<string>): DrawLayer" />

<MemberMeta sourceHref="/source/tests/gui/drawlayer-test-js/#L24" sourceLabel="drawLayer.test.js:24" />

Create a draw layer with shape groups.

**Parameters**

- `ids` (Array.\<string>) — The shape group ids.

**Returns**

- [`DrawLayer`](/drawlayer) — The draw layer.

<MemberHeading id="getopacity" depth="3" name="getOpacity" sig="getOpacity(drawLayer: DrawLayer, id: string): number" />

<MemberMeta sourceHref="/source/tests/gui/drawlayer-test-js/#L48" sourceLabel="drawLayer.test.js:48" />

Get the opacity of a group.

**Parameters**

- `drawLayer` ([DrawLayer](/drawlayer)) — The draw layer.
- `id` (string) — The group id.

**Returns**

- `number` — The group opacity.

<MemberHeading id="createpositioneddrawlayer" depth="3" name="createPositionedDrawLayer" sig="createPositionedDrawLayer(circles: Array.<object>): DrawLayer" />

<MemberMeta sourceHref="/source/tests/gui/drawlayer-test-js/#L145" sourceLabel="drawLayer.test.js:145" />

Create a draw layer at a current position with circle annotations.

**Parameters**

- `circles` (Array.\<object>) — The circles as {id, x, y, r}.

**Returns**

- [`DrawLayer`](/drawlayer) — The draw layer.

<MemberHeading id="getitem" depth="3" name="getItem" sig="getItem(pos: string, value: string): object" />

<MemberMeta sourceHref="/source/tests/gui/infolayer-test-js/#L17" sourceLabel="infoLayer.test.js:17" />

Create an info data item.

**Parameters**

- `pos` (string) — The position.
- `value` (string) — The value.

**Returns**

- `object` — The info data item.

<MemberHeading id="createinfolayer" depth="3" name="createInfoLayer" sig="createInfoLayer(groupDivId: string): Object" />

<MemberMeta sourceHref="/source/tests/gui/infolayer-test-js/#L28" sourceLabel="infoLayer.test.js:28" />

Create an info layer inside a layer group div appended to the document.

**Parameters**

- `groupDivId` (string) — The layer group div id.

**Returns**

- `Object` — The group div and info layer.

<MemberHeading
  id="makebinderlayergroup"
  depth="3"
  name="makeBinderLayerGroup"
  sig="makeBinderLayerGroup(
	dataId: string,
	position: Array.<number>,
	size: Array.<number>,
	geometry?: Geometry,
): Object"
/>

<MemberMeta sourceHref="/source/tests/gui/layergroup-test-js/#L38" sourceLabel="layerGroup.test.js:38" />

Create a layer group mock with one view layer, as used by the position binder.

**Parameters**

- `dataId` (string) — The view layer data id.
- `position` (Array.\<number>) — The view layer current position.
- `size` (Array.\<number>) — The view layer image size.
- `geometry` ([Geometry](/geometry), optional) — The view layer image geometry.

**Returns**

- `Object` — The layer group and its view controller.

<MemberHeading
  id="firepositionevent"
  depth="3"
  name="firePositionEvent"
  sig="firePositionEvent(
	binder: PositionBinder,
	source: object,
	target: object,
	event: CustomEvent,
)"
/>

<MemberMeta sourceHref="/source/tests/gui/layergroup-test-js/#L81" sourceLabel="layerGroup.test.js:81" />

Fire a position change event from a source layer group to a position binder of a target layer group.

**Parameters**

- `binder` ([PositionBinder](/positionbinder)) — The position binder.
- `source` (object) — The source layer group mock.
- `target` (object) — The target layer group mock.
- `event` (CustomEvent) — The position change event.

<MemberHeading
  id="makevolumegeometry"
  depth="3"
  name="makeVolumeGeometry"
  sig="makeVolumeGeometry(
	name: string,
	values: Array.<number>,
): Geometry"
/>

<MemberMeta sourceHref="/source/tests/gui/layergroup-test-js/#L93" sourceLabel="layerGroup.test.js:93" />

Create a geometry with volume ids.

**Parameters**

- `name` (string) — The volume id name.
- `values` (Array.\<number>) — The volume id values.

**Returns**

- [`Geometry`](/geometry) — The geometry.

<MemberHeading
  id="makepositionevent"
  depth="3"
  name="makePositionEvent"
  sig="makePositionEvent(
	dataid: string,
	position: Array.<number>,
	diffDims: Array.<number>,
): CustomEvent"
/>

<MemberMeta sourceHref="/source/tests/gui/layergroup-test-js/#L111" sourceLabel="layerGroup.test.js:111" />

Create a position change event.

**Parameters**

- `dataid` (string) — The source data id.
- `position` (Array.\<number>) — The source position.
- `diffDims` (Array.\<number>) — The modified dimensions.

**Returns**

- `CustomEvent` — The event.

<MemberHeading id="getsetposition" depth="3" name="getSetPosition" sig="getSetPosition(vc: object): Array.<number>" />

<MemberMeta sourceHref="/source/tests/gui/layergroup-test-js/#L123" sourceLabel="layerGroup.test.js:123" />

Get the position set on a view controller mock.

**Parameters**

- `vc` (object) — The view controller mock.

**Returns**

- `Array.<number>` — The position values.

<MemberHeading
  id="makewindowlevelbinderlayergroup"
  depth="3"
  name="makeWindowLevelBinderLayerGroup"
  sig="makeWindowLevelBinderLayerGroup(
	dataId: string,
	presetNames: Array.<string>,
): Object"
/>

<MemberMeta sourceHref="/source/tests/gui/layergroup-test-js/#L136" sourceLabel="layerGroup.test.js:136" />

Create a layer group mock with one view layer, as used by the window/level binder.

**Parameters**

- `dataId` (string) — The view layer data id.
- `presetNames` (Array.\<string>) — The view controller preset names.

**Returns**

- `Object` — The layer group and its view controller.

<MemberHeading id="makewindowlevelevent" depth="3" name="makeWindowLevelEvent" sig="makeWindowLevelEvent(dataid: string, value: Array): CustomEvent" />

<MemberMeta sourceHref="/source/tests/gui/layergroup-test-js/#L158" sourceLabel="layerGroup.test.js:158" />

Create a window/level change event.

**Parameters**

- `dataid` (string) — The source data id.
- `value` (Array) — The event value: \[center, width, presetName].

**Returns**

- `CustomEvent` — The event.

<MemberHeading id="makediv" depth="3" name="makeDiv" sig="makeDiv(id: string): HTMLDivElement" />

<MemberMeta sourceHref="/source/tests/gui/stage-test-js/#L14" sourceLabel="stage.test.js:14" />

**Parameters**

- `id` (string) — The div id.

**Returns**

- `HTMLDivElement` — A div appended to the document body.

<MemberHeading
  id="createviewlayer"
  depth="3"
  name="createViewLayer"
  sig="createViewLayer(
	isMask: boolean,
	checker?: CanvasSizeChecker,
): ViewLayer"
/>

<MemberMeta sourceHref="/source/tests/gui/viewlayer-test-js/#L26" sourceLabel="viewLayer.test.js:26" />

Create a view layer.

**Parameters**

- `isMask` (boolean) — True to create a mask view layer.
- `checker` ([CanvasSizeChecker](/canvassizechecker), optional) — Optional canvas size checker.

**Returns**

- [`ViewLayer`](/viewlayer) — The view layer.

<MemberHeading id="getopacity" depth="3" name="getOpacity" sig="getOpacity(viewLayer: ViewLayer, segmentNumber: number): number" />

<MemberMeta sourceHref="/source/tests/gui/viewlayer-test-js/#L54" sourceLabel="viewLayer.test.js:54" />

Get the highlight opacity of a segment.

**Parameters**

- `viewLayer` ([ViewLayer](/viewlayer)) — The view layer.
- `segmentNumber` (number) — The segment number.

**Returns**

- `number` — The segment highlight opacity.

<MemberHeading id="makeannotation" depth="3" name="makeAnnotation" sig="makeAnnotation(uid: string): object" />

<MemberMeta sourceHref="/source/tests/image/annotationgroup-test-js/#L20" sourceLabel="annotationGroup.test.js:20" />

Build a minimal annotation-like stub with a given tracking UID. Stubs out `setViewController` and `updateQuantification` so the group can delegate to them without importing the full Annotation class.

**Parameters**

- `uid` (string) — The tracking UID.

**Returns**

- `object` — Annotation stub.

<MemberHeading id="lastpool" depth="3" name="lastPool" sig="lastPool(): object" />

<MemberMeta sourceHref="/source/tests/image/decoder-test-js/#L60" sourceLabel="decoder.test.js:60" />

Return the ThreadPool mock instance created by the last PixelBufferDecoder constructor call.

**Returns**

- `object` — The mock pool instance.

<MemberHeading
  id="getbuffer"
  depth="3"
  name="getBuffer"
  sig="getBuffer(
	config: object,
	syntax: string,
	structure?: object,
): ArrayBuffer"
/>

<MemberMeta sourceHref="/source/tests/image/dicombuffertodata-test-js/#L107" sourceLabel="dicomBufferToData.test.js:107" />

Generate the DICOM buffer of the first file of a data structure.

**Parameters**

- `config` (object) — The data configuration.
- `syntax` (string) — The transfer syntax.
- `structure` (object, optional) — The data structure, defaults to single slice.

**Returns**

- `ArrayBuffer` — The DICOM buffer.

<MemberHeading
  id="getreferencepixels"
  depth="3"
  name="getReferencePixels"
  sig="getReferencePixels(
	config: object,
	structure?: object,
): Array.<number>"
/>

<MemberMeta sourceHref="/source/tests/image/dicombuffertodata-test-js/#L120" sourceLabel="dicomBufferToData.test.js:120" />

Get the reference (uncompressed) pixels of the first file of a data structure.

**Parameters**

- `config` (object) — The data configuration.
- `structure` (object, optional) — The data structure, defaults to single slice.

**Returns**

- `Array.<number>` — The pixel values.

<MemberHeading id="getrecordingconverter" depth="3" name="getRecordingConverter" sig="getRecordingConverter(options?: object): object" />

<MemberMeta sourceHref="/source/tests/image/dicombuffertodata-test-js/#L133" sourceLabel="dicomBufferToData.test.js:133" />

Create a converter that records all its events.

**Parameters**

- `options` (object, optional) — Optional converter options.

**Returns**

- `object` — The converter and the recorded events as {converter, events}, each event being {type, event}.

<MemberHeading
  id="eventsoftype"
  depth="3"
  name="eventsOfType"
  sig="eventsOfType(
	events: Array.<object>,
	type: string,
): Array.<object>"
/>

<MemberMeta sourceHref="/source/tests/image/dicombuffertodata-test-js/#L162" sourceLabel="dicomBufferToData.test.js:162" />

Get the events of a given type.

**Parameters**

- `events` (Array.\<object>) — The recorded events.
- `type` (string) — The event type.

**Returns**

- `Array.<object>` — The events of that type.

<MemberHeading
  id="getreferenceframes"
  depth="3"
  name="getReferenceFrames"
  sig="getReferenceFrames(
	elements: object,
	numberOfFrames: number,
): Array.<Array.<number>>"
/>

<MemberMeta sourceHref="/source/tests/image/dicombuffertodata-test-js/#L174" sourceLabel="dicomBufferToData.test.js:174" />

Get the reference (uncompressed) frames of a file, in encoding order.

**Parameters**

- `elements` (object) — The file data elements.
- `numberOfFrames` (number) — The number of frames.

**Returns**

- `Array.<Array.<number>>` — The frames pixel values.

<MemberHeading id="getframesperfile" depth="3" name="getFramesPerFile" sig="getFramesPerFile(structure: object): number" />

<MemberMeta sourceHref="/source/tests/image/dicombuffertodata-test-js/#L190" sourceLabel="dicomBufferToData.test.js:190" />

Get the number of frames per file of a data structure.

**Parameters**

- `structure` (object) — The data structure.

**Returns**

- `number` — The number of frames.

<MemberHeading
  id="convertdeferred"
  depth="3"
  name="convertDeferred"
  sig="convertDeferred(
	buffers: Array.<ArrayBuffer>,
	sortTasks: function,
	options?: object,
	setup?: function,
): Array.<object>"
/>

<MemberMeta sourceHref="/source/tests/image/dicombuffertodata-test-js/#L206" sourceLabel="dicomBufferToData.test.js:206" />

Convert buffers with deferred decoding, then run the decoding tasks in the given order (uncompressed data is not deferred).

**Parameters**

- `buffers` (Array.\<ArrayBuffer>) — The buffers, one per data index.
- `sortTasks` (function) — The pending tasks sort function.
- `options` (object, optional) — Optional converter options.
- `setup` (function, optional) — Optional converter setup function, called with the recording converter before conversion.

**Returns**

- `Array.<object>` — The recorded events.

<MemberHeading id="getdatacontrollersetup" depth="3" name="getDataControllerSetup" sig="getDataControllerSetup(dataController: DataController): function" />

<MemberMeta sourceHref="/source/tests/image/dicombuffertodata-test-js/#L235" sourceLabel="dicomBufferToData.test.js:235" />

Get a converter setup function that adds or appends the loaded data to a data controller, as the app does.

**Parameters**

- `dataController` ([DataController](/datacontroller)) — The data controller.

**Returns**

- `function` — The setup function.

<MemberHeading id="getreferenceimage" depth="3" name="getReferenceImage" sig="getReferenceImage(config: object, structure: object): object" />

<MemberMeta sourceHref="/source/tests/image/dicombuffertodata-test-js/#L258" sourceLabel="dicomBufferToData.test.js:258" />

Build the reference image of a data structure from its uncompressed files, without converter nor data controller: one image per frame appended in encoding order.

**Parameters**

- `config` (object) — The data configuration.
- `structure` (object) — The data structure.

**Returns**

- `object` — The reference image.

<MemberHeading id="makergbadata" depth="3" name="makeRgbaData" sig="makeRgbaData(n: number): Uint8ClampedArray" />

<MemberMeta sourceHref="/source/tests/image/domreader-test-js/#L23" sourceLabel="domReader.test.js:23" />

Build a predictable RGBA flat buffer for `n` pixels. Pixel i has R=i+1, G=i+2, B=i+3, A=255.

**Parameters**

- `n` (number) — Number of pixels.

**Returns**

- `Uint8ClampedArray` — RGBA data.

<MemberHeading id="rgbatorgb" depth="3" name="rgbaToRgb" sig="rgbaToRgb(rgba: Uint8ClampedArray): Uint8Array" />

<MemberMeta sourceHref="/source/tests/image/domreader-test-js/#L40" sourceLabel="domReader.test.js:40" />

Convert RGBA data to the expected RGB buffer (alpha stripped).

**Parameters**

- `rgba` (Uint8ClampedArray) — RGBA pixel data.

**Returns**

- `Uint8Array` — RGB buffer.

<MemberHeading id="makedomimage" depth="3" name="makeDomImage" sig="makeDomImage(w: number, h: number): object" />

<MemberMeta sourceHref="/source/tests/image/domreader-test-js/#L58" sourceLabel="domReader.test.js:58" />

Make a mock DOM image.

**Parameters**

- `w` (number) — Image width in pixels.
- `h` (number) — Image height in pixels.

**Returns**

- `object` — The mock image.

<MemberHeading
  id="makeimage"
  depth="3"
  name="makeImage"
  sig="makeImage(
	width: number,
	height: number,
	values: Array.<number>,
): Image"
/>

<MemberMeta sourceHref="/source/tests/image/filter-test-js/#L30" sourceLabel="filter.test.js:30" />

Build a single-slice Image from a flat array of pixel values. The image is `width × height × 1`, stored as Int16Array.

**Parameters**

- `width` (number) — Number of columns.
- `height` (number) — Number of rows.
- `values` (Array.\<number>) — Pixel values in row-major order (x varies fastest).

**Returns**

- [`Image`](/image) — The constructed Image.

<MemberHeading
  id="createframesimage"
  depth="3"
  name="createFramesImage"
  sig="createFramesImage(
	factory: ImageFactory,
	elements: object,
	numberOfFiles: number,
	numberOfFrames: number,
	image?: object,
): object"
/>

<MemberMeta sourceHref="/source/tests/image/imagefactory-test-js/#L47" sourceLabel="imageFactory.test.js:47" />

Create the image of a file frame by frame, the way loaded data is (see DicomBufferToData and DataController): one image per frame, appended to the first one. Single frame data is created at once.

**Parameters**

- `factory` ([ImageFactory](/imagefactory)) — The image factory.
- `elements` (object) — The file data elements.
- `numberOfFiles` (number) — The number of files.
- `numberOfFrames` (number) — The number of frames of the file.
- `image` (object, optional) — Optional image to append the frames to.

**Returns**

- `object` — The image.

<MemberHeading
  id="buildhistogram"
  depth="3"
  name="buildHistogram"
  sig="buildHistogram(
	counts: Record.<number, number>,
	rsi?: RescaleSlopeAndIntercept,
): ImageHistogram"
/>

<MemberMeta sourceHref="/source/tests/image/imagehistogram-test-js/#L19" sourceLabel="imageHistogram.test.js:19" />

Build an image histogram from raw value -> count pairs.

**Parameters**

- `counts` (Record.\<number, number>) — Map of raw value to count.
- `rsi` ([RescaleSlopeAndIntercept](/rescaleslopeandintercept), optional) — Optional RSI, defaults to id.

**Returns**

- [`ImageHistogram`](/imagehistogram) — The histogram.

<MemberHeading id="configtoelements" depth="3" name="configToElements" sig="configToElements(config: object): Record.<string, object>" />

<MemberMeta sourceHref="/source/tests/image/maskfactory-test-js/#L45" sourceLabel="maskFactory.test.js:45" />

Parse synthetic SEG config tags into DICOM data elements.

**Parameters**

- `config` (object) — A synthetic-data entry.

**Returns**

- `Record.<string, object>` — DICOM data elements.

<MemberHeading id="buildrefimage" depth="3" name="buildRefImage" sig="buildRefImage(): Image" />

<MemberMeta sourceHref="/source/tests/image/maskfactory-test-js/#L54" sourceLabel="maskFactory.test.js:54" />

Build a minimal reference Image matching test-img-00 geometry.

**Returns**

- [`Image`](/image) — The reference image.

<MemberHeading id="buildmaskimage" depth="3" name="buildMaskImage" sig="buildMaskImage(configName: string): MaskImage" />

<MemberMeta sourceHref="/source/tests/image/maskfactory-test-js/#L71" sourceLabel="maskFactory.test.js:71" />

Build a mask Image matching test-img-00 geometry.

**Parameters**

- `configName` (string) — The config name.

**Returns**

- [`MaskImage`](/maskimage) — The reference image.

<MemberHeading
  id="getsegmentsfromelements"
  depth="3"
  name="getSegmentsFromElements"
  sig="getSegmentsFromElements(
	elements: Record.<string, object>,
): Array"
/>

<MemberMeta sourceHref="/source/tests/image/maskfactory-test-js/#L88" sourceLabel="maskFactory.test.js:88" />

Extract the segment array from DICOM data elements.

**Parameters**

- `elements` (Record.\<string, object>) — DICOM data elements.

**Returns**

- `Array` — Array of MaskSegment objects.

<MemberHeading
  id="buildsinglesegmentmask"
  depth="3"
  name="buildSingleSegmentMask"
  sig="buildSingleSegmentMask(
	segNumber: number,
	label: string,
	pixelStart: number,
	pixelCount: number,
): MaskImage"
/>

<MemberMeta sourceHref="/source/tests/image/maskfactory-test-js/#L372" sourceLabel="maskFactory.test.js:372" />

Build a minimal single-segment mask using the test-img-00 geometry.

**Parameters**

- `segNumber` (number) — The segment number.
- `label` (string) — The segment label.
- `pixelStart` (number) — First pixel index to mark as foreground.
- `pixelCount` (number) — Number of contiguous foreground pixels.

**Returns**

- [`MaskImage`](/maskimage) — The mask image.

<MemberHeading
  id="countof"
  depth="3"
  name="countOf"
  sig="countOf(
	histogram: ImageHistogram,
	value: number,
): number | undefined"
/>

<MemberMeta sourceHref="/source/tests/image/maskimage-test-js/#L42" sourceLabel="maskImage.test.js:42" />

Get the count of a rescaled value in a histogram.

**Parameters**

- `histogram` ([ImageHistogram](/imagehistogram)) — The histogram.
- `value` (number) — The rescaled value.

**Returns**

- `number | undefined` — The count, undefined if absent.

<MemberHeading id="makemockmask" depth="3" name="makeMockMask" sig="makeMockMask(meta?: object): object" />

<MemberMeta sourceHref="/source/tests/image/masksegmenthelper-test-js/#L29" sourceLabel="maskSegmentHelper.test.js:29" />

Build a minimal mock mask image. Only the methods required by MaskSegmentHelper are present; `hasValues` and `updatePaletteColourMap` are Vitest spies so calls can be inspected.

**Parameters**

- `meta` (object, optional) — Optional initial meta object.

**Returns**

- `object` — Mock mask image.

<MemberHeading
  id="makerealmask"
  depth="3"
  name="makeRealMask"
  sig="makeRealMask(
	width: number,
	height: number,
	values: Array.<number>,
	origin?: Point3D,
): Image"
/>

<MemberMeta sourceHref="/source/tests/image/masksegmenthelper-test-js/#L53" sourceLabel="maskSegmentHelper.test.js:53" />

Build a real single-component, single-slice Image for findOverlap tests. Uses Uint8Array so segment numbers (0–255) fit without clamping.

**Parameters**

- `width` (number) — Number of columns.
- `height` (number) — Number of rows.
- `values` (Array.\<number>) — Pixel values in row-major order.
- `origin` ([Point3D](/point3d), optional) — Optional world-space origin (defaults to 0,0,0).

**Returns**

- [`Image`](/image) — The constructed image.

<MemberHeading id="makeseg" depth="3" name="makeSeg" sig="makeSeg(number: number, label?: string): MaskSegment" />

<MemberMeta sourceHref="/source/tests/image/masksegmenthelper-test-js/#L71" sourceLabel="maskSegmentHelper.test.js:71" />

Build a MaskSegment with only number and label set.

**Parameters**

- `number` (number) — Segment number.
- `label` (string, optional) — Optional label (defaults to `seg-<number>`).

**Returns**

- [`MaskSegment`](/masksegment) — The constructed segment.

<MemberHeading
  id="makegeometry"
  depth="3"
  name="makeGeometry"
  sig="makeGeometry(
	sizeArr: Array.<number>,
	spacingArr?: Array.<number>,
	origin?: Point3D,
	orientation?: Matrix33,
): Geometry"
/>

<MemberMeta sourceHref="/source/tests/image/planehelper-test-js/#L31" sourceLabel="planeHelper.test.js:31" />

Build a Geometry.

**Parameters**

- `sizeArr` (Array.\<number>) — Size in voxels.
- `spacingArr` (Array.\<number>, optional) — Spacing per axis (default: all 1).
- `origin` ([Point3D](/point3d), optional) — World origin (default: 0,0,0).
- `orientation` ([Matrix33](/matrix33), optional) — Image orientation (default: identity).

**Returns**

- [`Geometry`](/geometry) — The geometry.

<MemberHeading
  id="makegeometry"
  depth="3"
  name="makeGeometry"
  sig="makeGeometry(
	sizeArr: Array.<number>,
	origin?: Point3D,
): Geometry"
/>

<MemberMeta sourceHref="/source/tests/image/positionhelper-test-js/#L24" sourceLabel="positionHelper.test.js:24" />

Build a Geometry with unit spacing and identity orientation.

**Parameters**

- `sizeArr` (Array.\<number>) — Size values \[nx, ny, nz].
- `origin` ([Point3D](/point3d), optional) — World origin (default: 0,0,0).

**Returns**

- [`Geometry`](/geometry) — The constructed geometry.

<MemberHeading
  id="makehelper"
  depth="3"
  name="makeHelper"
  sig="makeHelper(
	sizeArr: Array.<number>,
	initIndex: Array.<number>,
	scrollDim?: number,
	origin?: Point3D,
): Object"
/>

<MemberMeta sourceHref="/source/tests/image/positionhelper-test-js/#L44" sourceLabel="positionHelper.test.js:44" />

Build a mock view backed by a real Geometry. `currentPosition` is stored in a shared closure so the helper's position accessor and the geometry stay consistent.

**Parameters**

- `sizeArr` (Array.\<number>) — Geometry size values.
- `initIndex` (Array.\<number>) — Initial position as index values.
- `scrollDim` (number, optional, default: 2) — Scroll dimension (default: 2 / z).
- `origin` ([Point3D](/point3d), optional) — World origin.

**Returns**

- `Object` — The helper and the underlying geometry.

<MemberHeading
  id="makeviewhelper"
  depth="3"
  name="makeViewHelper"
  sig="makeViewHelper(
	geometry: Geometry,
	initIndex: Array.<number>,
	scrollDim?: number,
): PositionHelper"
/>

<MemberMeta sourceHref="/source/tests/image/positionhelper-test-js/#L71" sourceLabel="positionHelper.test.js:71" />

Build a position helper on an existing geometry.

**Parameters**

- `geometry` ([Geometry](/geometry)) — The geometry.
- `initIndex` (Array.\<number>) — Initial position as index values.
- `scrollDim` (number, optional, default: 2) — Scroll dimension (default: 2 / z).

**Returns**

- [`PositionHelper`](/positionhelper) — The helper.

<MemberHeading id="buildrefimage" depth="3" name="buildRefImage" sig="buildRefImage(): Image" />

<MemberMeta sourceHref="/source/tests/image/rtstructfactory-test-js/#L38" sourceLabel="rtStructFactory.test.js:38" />

Build a minimal reference Image matching test-img-00 geometry: 32×32×1, unit spacing, identity orientation, origin at (0,0,0).

**Returns**

- [`Image`](/image) — The reference image.

<MemberHeading id="configtoelements" depth="3" name="configToElements" sig="configToElements(config: object): Record.<string, object>" />

<MemberMeta sourceHref="/source/tests/image/rtstructfactory-test-js/#L58" sourceLabel="rtStructFactory.test.js:58" />

Parse synthetic RTSS config tags into DICOM data elements.

**Parameters**

- `config` (object) — A synthetic-data entry.

**Returns**

- `Record.<string, object>` — DICOM data elements.

<MemberHeading
  id="makegeometry"
  depth="3"
  name="makeGeometry"
  sig="makeGeometry(
	ncols: number,
	nrows: number,
	nslices: number,
): Geometry"
/>

<MemberMeta sourceHref="/source/tests/image/segmentcollection-test-js/#L26" sourceLabel="segmentCollection.test.js:26" />

Build a minimal Geometry: ncols × nrows × nslices, unit spacing.

**Parameters**

- `ncols` (number) — Number of columns.
- `nrows` (number) — Number of rows.
- `nslices` (number) — Number of slices.

**Returns**

- [`Geometry`](/geometry) — The geometry.

<MemberHeading
  id="makepixelbuffer"
  depth="3"
  name="makePixelBuffer"
  sig="makePixelBuffer(
	sliceSize: number,
	activeOffsets: Array.<number>,
): Uint8Array"
/>

<MemberMeta sourceHref="/source/tests/image/segmentcollection-test-js/#L45" sourceLabel="segmentCollection.test.js:45" />

Build a pixel buffer for one frame: listed offsets set to 1, rest 0.

**Parameters**

- `sliceSize` (number) — Total pixels per slice (ncols \* nrows).
- `activeOffsets` (Array.\<number>) — Local offsets within the slice to set.

**Returns**

- `Uint8Array` — The pixel buffer.

<MemberHeading id="makeseg" depth="3" name="makeSeg" sig="makeSeg(number: number): MaskSegment" />

<MemberMeta sourceHref="/source/tests/image/segmentcollection-test-js/#L59" sourceLabel="segmentCollection.test.js:59" />

Build a MaskSegment with number and displayValue set.

**Parameters**

- `number` (number) — Segment number.

**Returns**

- [`MaskSegment`](/masksegment) — The segment.

<MemberHeading id="makeimagedata" depth="3" name="makeImageData" sig="makeImageData(size: number): Object" />

<MemberMeta sourceHref="/source/tests/image/utils/viewtesthelpers-js/#L11" sourceLabel="viewTestHelpers.js:11" />

Build a flat RGBA buffer of `size` pixels, initialised to zero.

**Parameters**

- `size` (number) — Number of pixels.

**Returns**

- `Object` — Minimal ImageData-like object.

<MemberHeading id="makeiterator" depth="3" name="makeIterator" sig="makeIterator(values: Array): object" />

<MemberMeta sourceHref="/source/tests/image/utils/viewtesthelpers-js/#L22" sourceLabel="viewTestHelpers.js:22" />

Build a position iterator over an array of pixel values. Each element may be a scalar or an array (e.g. \[R, G, B] / \[Y, Cb, Cr]).

**Parameters**

- `values` (Array) — Pixel values to iterate.

**Returns**

- `object` — Iterator with a `next()` method.

<MemberHeading id="makecolourmap" depth="3" name="makeColourMap" sig="makeColourMap(): Object" />

<MemberMeta sourceHref="/source/tests/image/utils/viewtesthelpers-js/#L40" sourceLabel="viewTestHelpers.js:40" />

Build a ColourMap-shaped object with predictable values: red\[i] = i, green\[i] = 255 - i, blue\[i] = (i \* 2) % 256.

**Returns**

- `Object` — Colour map.

<MemberHeading id="makeidentitywindowlut" depth="3" name="makeIdentityWindowLut" sig="makeIdentityWindowLut(): Object" />

<MemberMeta sourceHref="/source/tests/image/viewmonochrome-test-js/#L17" sourceLabel="viewMonochrome.test.js:17" />

Build a minimal WindowLut mock whose `getValue` returns its input unchanged.

**Returns**

- `Object` — Identity window LUT.

<MemberHeading id="buildhistogram" depth="3" name="buildHistogram" sig="buildHistogram(counts: Record.<number, number>): Histogram" />

<MemberMeta sourceHref="/source/tests/math/histogram-test-js/#L15" sourceLabel="histogram.test.js:15" />

Build a histogram from value -> count pairs.

**Parameters**

- `counts` (Record.\<number, number>) — Map of value to count.

**Returns**

- [`Histogram`](/histogram) — The histogram.

<MemberHeading id="makedrawdragapp" depth="3" name="makeDrawDragApp" sig="makeDrawDragApp(): object" />

<MemberMeta sourceHref="/source/tests/tools/behaviors/drawdragbehavior-test-js/#L21" sourceLabel="drawDragBehavior.test.js:21" />

**Returns**

- `object` — App stub for [DrawDragBehavior](/drawdragbehavior).

<MemberHeading id="makeminimaldrawlayerfordrag" depth="3" name="makeMinimalDrawLayerForDrag" sig="makeMinimalDrawLayerForDrag(): object" />

<MemberMeta sourceHref="/source/tests/tools/behaviors/drawdragbehavior-test-js/#L48" sourceLabel="drawDragBehavior.test.js:48" />

Draw layer stub: selection misses (non-editable group / no hit).

**Returns**

- `object` — Draw layer mock.

<MemberHeading id="makedrawpreviewapp" depth="3" name="makeDrawPreviewApp" sig="makeDrawPreviewApp(): object" />

<MemberMeta sourceHref="/source/tests/tools/behaviors/drawpreview-test-js/#L17" sourceLabel="drawPreview.test.js:17" />

**Returns**

- `object` — Minimal app stub for [DrawPreview](/drawpreview).

<MemberHeading id="makedrawselectstub" depth="3" name="makeDrawSelectStub" sig="makeDrawSelectStub(): object" />

<MemberMeta sourceHref="/source/tests/tools/behaviors/drawtapbehavior-test-js/#L23" sourceLabel="drawTapBehavior.test.js:23" />

Minimal mock for [DrawSelect](/drawselect) (methods used by [DrawTapBehavior](/drawtapbehavior)).

**Returns**

- `object` — DrawSelect-like stub.

<MemberHeading id="makedrawtapapp" depth="3" name="makeDrawTapApp" sig="makeDrawTapApp(): object" />

<MemberMeta sourceHref="/source/tests/tools/behaviors/drawtapbehavior-test-js/#L35" sourceLabel="drawTapBehavior.test.js:35" />

**Returns**

- `object` — App stub for [DrawTapBehavior](/drawtapbehavior).

<MemberHeading id="makeminimaldrawlayer" depth="3" name="makeMinimalDrawLayer" sig="makeMinimalDrawLayer(): object" />

<MemberMeta sourceHref="/source/tests/tools/behaviors/drawtapbehavior-test-js/#L60" sourceLabel="drawTapBehavior.test.js:60" />

**Returns**

- `object` — Draw layer mock for tap tests (no hit / non-editable).

<MemberHeading id="createrectangledrawintegrationsetup" depth="3" name="createRectangleDrawIntegrationSetup" sig="createRectangleDrawIntegrationSetup(): object" />

<MemberMeta sourceHref="/source/tests/tools/behaviors/rectangledrawfixture-js/#L16" sourceLabel="rectangleDrawFixture.js:16" />

Konva stage + layer group + app mocks for rectangle finalization tests.

**Returns**

- `object` — Fixture: app, layerGroup, konvaLayer, stage, addedAnnotations, cleanup.

<MemberHeading
  id="assertrectangleannotationok"
  depth="3"
  name="assertRectangleAnnotationOk"
  sig="assertRectangleAnnotationOk(
	annotation: unknown,
	begin: Point2D,
	end: Point2D,
)"
/>

<MemberMeta sourceHref="/source/tests/tools/behaviors/rectangledrawfixture-js/#L123" sourceLabel="rectangleDrawFixture.js:123" />

Assert a finalized annotation is a rectangle with expected display corners.

**Parameters**

- `annotation` (unknown) — Annotation passed to [DrawController#addAnnotation](/drawcontroller#addannotation).
- `begin` ([Point2D](/point2d)) — Expected begin (plane / display in fixture).
- `end` ([Point2D](/point2d)) — Expected end.

<MemberHeading id="makemockviewcontroller" depth="3" name="makeMockViewController" sig="makeMockViewController(): object" />

<MemberMeta sourceHref="/source/tests/tools/behaviors/utils-js/#L10" sourceLabel="utils.js:10" />

Create a minimal View Controller mock.

**Returns**

- `object` — The view controller mock.

<MemberHeading id="makemockviewlayer" depth="3" name="makeMockViewLayer" sig="makeMockViewLayer(viewController?: object): object" />

<MemberMeta sourceHref="/source/tests/tools/behaviors/utils-js/#L42" sourceLabel="utils.js:42" />

Create a minimal View Layer mock.

**Parameters**

- `viewController` (object, optional) — The view controller mock (optional).

**Returns**

- `object` — The view layer mock.

<MemberHeading id="makemocklayer" depth="3" name="makeMockLayer" sig="makeMockLayer(): object" />

<MemberMeta sourceHref="/source/tests/tools/behaviors/utils-js/#L61" sourceLabel="utils.js:61" />

Create a minimal Layer mock.

**Returns**

- `object` — The layer mock.

<MemberHeading id="makemockpositionhelper" depth="3" name="makeMockPositionHelper" sig="makeMockPositionHelper(): object" />

<MemberMeta sourceHref="/source/tests/tools/behaviors/utils-js/#L75" sourceLabel="utils.js:75" />

Create a minimal Position Helper mock.

**Returns**

- `object` — The position helper mock.

<MemberHeading id="makemocklayergroup" depth="3" name="makeMockLayerGroup" sig="makeMockLayerGroup(viewLayer?: object, layer?: object): object" />

<MemberMeta sourceHref="/source/tests/tools/behaviors/utils-js/#L91" sourceLabel="utils.js:91" />

Create a minimal Layer Group mock.

**Parameters**

- `viewLayer` (object, optional) — The view layer mock (optional).
- `layer` (object, optional) — The active layer mock (optional).

**Returns**

- `object` — The layer group mock.

<MemberHeading id="makemockdatacontroller" depth="3" name="makeMockDataController" sig="makeMockDataController(): object" />

<MemberMeta sourceHref="/source/tests/tools/behaviors/utils-js/#L118" sourceLabel="utils.js:118" />

Create a minimal DataController mock.

**Returns**

- `object` — The data controller mock.

<MemberHeading id="makemockapp" depth="3" name="makeMockApp" sig="makeMockApp(): object" />

<MemberMeta sourceHref="/source/tests/tools/behaviors/utils-js/#L133" sourceLabel="utils.js:133" />

Create a minimal App mock.

**Returns**

- `object` — The app mock.

<MemberHeading
  id="makemockwheelevent"
  depth="3"
  name="makeMockWheelEvent"
  sig="makeMockWheelEvent(
	deltaY?: number,
	wheelDeltaY?: number,
): object"
/>

<MemberMeta sourceHref="/source/tests/tools/behaviors/utils-js/#L146" sourceLabel="utils.js:146" />

Create a minimal Wheel Event mock.

**Parameters**

- `deltaY` (number, optional) — The deltaY value.
- `wheelDeltaY` (number, optional) — The wheelDeltaY value.

**Returns**

- `object` — The wheel event mock.

<MemberHeading id="makedrawapp" depth="3" name="makeDrawApp" sig="makeDrawApp(overrides?: object): object" />

<MemberMeta sourceHref="/source/tests/tools/draw-test-js/#L29" sourceLabel="draw.test.js:29" />

**Parameters**

- `overrides` (object, optional) — Override app methods.

**Returns**

- `object` — Minimal [App](/app) stub for [Draw](/draw).

<MemberHeading id="makeimage3x3" depth="3" name="makeImage3x3" sig="makeImage3x3(values: Array.<number>): Image" />

<MemberMeta sourceHref="/source/tests/tools/filter-test-js/#L39" sourceLabel="filter.test.js:39" />

Small greyscale image for filter runs (3×3 matches convolution kernels).

**Parameters**

- `values` (Array.\<number>) — Pixel values row-major.

**Returns**

- [`Image`](/image) — The image.

<MemberHeading id="makefilterapp" depth="3" name="makeFilterApp" sig="makeFilterApp(image: Image): object" />

<MemberMeta sourceHref="/source/tests/tools/filter-test-js/#L55" sourceLabel="filter.test.js:55" />

Minimal app stub with image data for [Threshold](/threshold), [Sharpen](/sharpen), and [Sobel](/sobel).

**Parameters**

- `image` ([Image](/image)) — Pixel data.

**Returns**

- `object` — App mock.

<MemberHeading id="getresultimagefromsetimage" depth="3" name="getResultImageFromSetImage" sig="getResultImageFromSetImage(app: object): Image" />

<MemberMeta sourceHref="/source/tests/tools/filter-test-js/#L83" sourceLabel="filter.test.js:83" />

Image passed to [DataController#setImage](/datacontroller#setimage) from [RunFilterCommand#execute](/runfiltercommand#execute).

**Parameters**

- `app` (object) — Mock app from [makeFilterApp](/global#makefilterapp).

**Returns**

- [`Image`](/image) — The new image for `dataId`.

<MemberHeading id="makefloodfillappmock" depth="3" name="makeFloodfillAppMock" sig="makeFloodfillAppMock(): object" />

<MemberMeta sourceHref="/source/tests/tools/floodfill-test-js/#L38" sourceLabel="floodfill.test.js:38" />

Minimal app stub for [Floodfill](/floodfill) and [LayerGroupPointer](/layergrouppointer).

**Returns**

- `object` — Mock application.

<MemberHeading id="setuplayercanvas" depth="3" name="setupLayerCanvas" sig="setupLayerCanvas(groupDivId: string): Object" />

<MemberMeta sourceHref="/source/tests/tools/layergrouppointer-test-js/#L34" sourceLabel="layerGroupPointer.test.js:34" />

Minimal layer DOM: canvas inside `.layer` div (see [getLayerDetailsFromEvent](/global#getlayerdetailsfromevent)).

**Parameters**

- `groupDivId` (string, default: "layerGroupPtrTest") — Layer group id (e.g. `layerGroup0`).

**Returns**

- `Object` — Canvas and id.

<MemberHeading
  id="mouseevent"
  depth="3"
  name="mouseEvent"
  sig="mouseEvent(
	type: string,
	target: EventTarget,
	offsetX: number,
	offsetY: number,
): MouseEvent"
/>

<MemberMeta sourceHref="/source/tests/tools/layergrouppointer-test-js/#L53" sourceLabel="layerGroupPointer.test.js:53" />

**Parameters**

- `type` (string) — The DOM event type.
- `target` (EventTarget) — The event target node.
- `offsetX` (number) — Horizontal offset on the target.
- `offsetY` (number) — Vertical offset on the target.

**Returns**

- `MouseEvent` — Synthetic mouse event for tests.

<MemberHeading id="touchevent" depth="3" name="touchEvent" sig="touchEvent(type: string, target: EventTarget): TouchEvent" />

<MemberMeta sourceHref="/source/tests/tools/layergrouppointer-test-js/#L66" sourceLabel="layerGroupPointer.test.js:66" />

**Parameters**

- `type` (string) — Touch event type.
- `target` (EventTarget) — Usually the canvas under `.layer`.

**Returns**

- `TouchEvent` — Synthetic touch event for tests.

<MemberHeading id="wheelevent" depth="3" name="wheelEvent" sig="wheelEvent(target: EventTarget, opts?: object): WheelEvent" />

<MemberMeta sourceHref="/source/tests/tools/layergrouppointer-test-js/#L78" sourceLabel="layerGroupPointer.test.js:78" />

**Parameters**

- `target` (EventTarget) — The event target, usually the canvas under a `.layer` div.
- `opts` (object, optional) — Optional deltaY and wheelDeltaY for tick shaping.

**Returns**

- `WheelEvent` — Synthetic wheel event for tests.

<MemberHeading id="makelivewireappmock" depth="3" name="makeLivewireAppMock" sig="makeLivewireAppMock(): object" />

<MemberMeta sourceHref="/source/tests/tools/livewire-test-js/#L34" sourceLabel="livewire.test.js:34" />

Minimal app stub for [Livewire](/livewire) and [LayerGroupPointer](/layergrouppointer).

**Returns**

- `object` — Mock application.

<MemberHeading id="p" depth="3" name="p" sig="p(x: number, y: number): Point2D" />

<MemberMeta sourceHref="/source/tests/tools/shapes/arrow-test-js/#L14" sourceLabel="arrow.test.js:14" />

**Parameters**

- `x` (number) — X.
- `y` (number) — Y.

**Returns**

- [`Point2D`](/point2d) — Point.

<MemberHeading id="makearrowannotation" depth="3" name="makeArrowAnnotation" sig="makeArrowAnnotation(tip?: Point2D, tail?: Point2D): object" />

<MemberMeta sourceHref="/source/tests/tools/shapes/arrow-test-js/#L25" sourceLabel="arrow.test.js:25" />

Arrow annotation mock: mathShape = tip, referencePoints\[0] = tail.

**Parameters**

- `tip` ([Point2D](/point2d), optional) — Tip.
- `tail` ([Point2D](/point2d), optional) — Tail.

**Returns**

- `object` — Annotation-like object.

<MemberHeading
  id="makebidimannotation"
  depth="3"
  name="makeBiDimAnnotation"
  sig="makeBiDimAnnotation(
	x0: number,
	y0: number,
	x1: number,
	y1: number,
): object"
/>

<MemberMeta sourceHref="/source/tests/tools/shapes/bidimensional-test-js/#L23" sourceLabel="bidimensional.test.js:23" />

Build a horizontal BidimensionalLine annotation via the factory. The short axis is fully initialised by setAnnotationMathShape.

**Parameters**

- `x0` (number) — X of begin point.
- `y0` (number) — Y of begin point.
- `x1` (number) — X of end point.
- `y1` (number) — Y of end point.

**Returns**

- `object` — Annotation mock with mathShape set.

<MemberHeading id="p" depth="3" name="p" sig="p(x: number, y: number): Point2D" />

<MemberMeta sourceHref="/source/tests/tools/shapes/circle-test-js/#L15" sourceLabel="circle.test.js:15" />

**Parameters**

- `x` (number) — X.
- `y` (number) — Y.

**Returns**

- [`Point2D`](/point2d) — Point.

<MemberHeading id="p" depth="3" name="p" sig="p(x: number, y: number): Point2D" />

<MemberMeta sourceHref="/source/tests/tools/shapes/ellipse-test-js/#L15" sourceLabel="ellipse.test.js:15" />

**Parameters**

- `x` (number) — X.
- `y` (number) — Y.

**Returns**

- [`Point2D`](/point2d) — Point.

<MemberHeading id="p" depth="3" name="p" sig="p(x: number, y: number): Point2D" />

<MemberMeta sourceHref="/source/tests/tools/shapes/protractor-test-js/#L17" sourceLabel="protractor.test.js:17" />

**Parameters**

- `x` (number) — X.
- `y` (number) — Y.

**Returns**

- [`Point2D`](/point2d) — Point.

<MemberHeading id="p" depth="3" name="p" sig="p(x: number, y: number): Point2D" />

<MemberMeta sourceHref="/source/tests/tools/shapes/rectangle-test-js/#L15" sourceLabel="rectangle.test.js:15" />

**Parameters**

- `x` (number) — X.
- `y` (number) — Y.

**Returns**

- [`Point2D`](/point2d) — Point.

<MemberHeading id="p" depth="3" name="p" sig="p(x: number, y: number): Point2D" />

<MemberMeta sourceHref="/source/tests/tools/shapes/roi-test-js/#L15" sourceLabel="roi.test.js:15" />

**Parameters**

- `x` (number) — X.
- `y` (number) — Y.

**Returns**

- [`Point2D`](/point2d) — Point.

<MemberHeading id="p" depth="3" name="p" sig="p(x: number, y: number): Point2D" />

<MemberMeta sourceHref="/source/tests/tools/shapes/ruler-test-js/#L15" sourceLabel="ruler.test.js:15" />

**Parameters**

- `x` (number) — X.
- `y` (number) — Y.

**Returns**

- [`Point2D`](/point2d) — Point.

<MemberHeading id="p" depth="3" name="p" sig="p(x: number, y: number): Point2D" />

<MemberMeta sourceHref="/source/tests/tools/shapes/shapeannotators-test-js/#L32" sourceLabel="shapeAnnotators.test.js:32" />

Create a Point2D.

**Parameters**

- `x` (number) — X coordinate.
- `y` (number) — Y coordinate.

**Returns**

- [`Point2D`](/point2d) — A new Point2D.

<MemberHeading id="makeannotation" depth="3" name="makeAnnotation" sig="makeAnnotation(mathShape?: object): object" />

<MemberMeta sourceHref="/source/tests/tools/shapes/shapeannotators-test-js/#L42" sourceLabel="shapeAnnotators.test.js:42" />

Standard annotation mock (mathShape + mocked hooks).

**Parameters**

- `mathShape` (object, optional) — The math shape.

**Returns**

- `object` — The annotation mock.

<MemberHeading id="makearrowannotation" depth="3" name="makeArrowAnnotation" sig="makeArrowAnnotation(tip?: Point2D, tail?: Point2D): object" />

<MemberMeta sourceHref="/source/tests/tools/shapes/shapeannotators-test-js/#L53" sourceLabel="shapeAnnotators.test.js:53" />

Arrow annotation mock: mathShape = tip Point2D, referencePoints\[0] = tail.

**Parameters**

- `tip` ([Point2D](/point2d), optional) — The tip point (mathShape).
- `tail` ([Point2D](/point2d), optional) — The tail point (referencePoints\[0]).

**Returns**

- `object` — The annotation mock.

<MemberHeading id="p" depth="3" name="p" sig="p(x: number, y: number): Point2D" />

<MemberMeta sourceHref="/source/tests/tools/shapes/shapepainters-test-js/#L28" sourceLabel="shapePainters.test.js:28" />

Create a Point2D.

**Parameters**

- `x` (number) — X coordinate.
- `y` (number) — Y coordinate.

**Returns**

- [`Point2D`](/point2d) — A new Point2D.

<MemberHeading id="makeannotation" depth="3" name="makeAnnotation" sig="makeAnnotation(mathShape?: object): object" />

<MemberMeta sourceHref="/source/tests/tools/shapes/shapepainters-test-js/#L38" sourceLabel="shapePainters.test.js:38" />

Standard annotation mock.

**Parameters**

- `mathShape` (object, optional) — The math shape.

**Returns**

- `object` — The annotation mock.

<MemberHeading id="makearrowannotation" depth="3" name="makeArrowAnnotation" sig="makeArrowAnnotation(tip?: Point2D, tail?: Point2D): object" />

<MemberMeta sourceHref="/source/tests/tools/shapes/shapepainters-test-js/#L49" sourceLabel="shapePainters.test.js:49" />

Arrow annotation mock (mathShape = Point2D, referencePoints\[0] = Point2D).

**Parameters**

- `tip` ([Point2D](/point2d), optional) — The tip point.
- `tail` ([Point2D](/point2d), optional) — The tail point.

**Returns**

- `object` — The annotation mock.

<MemberHeading id="p" depth="3" name="p" sig="p(x: number, y: number): Point2D" />

<MemberMeta sourceHref="/source/tests/tools/shapes/shaperenderer-test-js/#L35" sourceLabel="shapeRenderer.test.js:35" />

Create a Point2D.

**Parameters**

- `x` (number) — X coordinate.
- `y` (number) — Y coordinate.

**Returns**

- [`Point2D`](/point2d) — A new Point2D.

<MemberHeading id="makeannotation" depth="3" name="makeAnnotation" sig="makeAnnotation(mathShape?: object): object" />

<MemberMeta sourceHref="/source/tests/tools/shapes/shaperenderer-test-js/#L45" sourceLabel="shapeRenderer.test.js:45" />

Standard annotation mock.

**Parameters**

- `mathShape` (object, optional) — The math shape.

**Returns**

- `object` — The annotation mock.

<MemberHeading id="makearrowannotation" depth="3" name="makeArrowAnnotation" sig="makeArrowAnnotation(tip?: Point2D, tail?: Point2D): object" />

<MemberMeta sourceHref="/source/tests/tools/shapes/shaperenderer-test-js/#L56" sourceLabel="shapeRenderer.test.js:56" />

Arrow annotation mock (mathShape = Point2D, referencePoints\[0] = Point2D).

**Parameters**

- `tip` ([Point2D](/point2d), optional) — The tip point.
- `tail` ([Point2D](/point2d), optional) — The tail point.

**Returns**

- `object` — The annotation mock.

<MemberHeading id="makestyle" depth="3" name="makeStyle" sig="makeStyle(): object" />

<MemberMeta sourceHref="/source/tests/tools/shapes/utils-js/#L9" sourceLabel="utils.js:9" />

Create a minimal Style mock covering all methods used by shape factories and LabelFactory.

**Returns**

- `object` — The style mock.

<MemberHeading id="makeannotation" depth="3" name="makeAnnotation" sig="makeAnnotation(mathShape?: object): object" />

<MemberMeta sourceHref="/source/tests/tools/shapes/utils-js/#L34" sourceLabel="utils.js:34" />

Create a minimal Annotation-like mock for factory tests.

The returned object has all standard annotation fields; pass any math shape as `mathShape`. For factories that require extra fields (e.g. ArrowFactory's `referencePoints`) extend the object at the call site.

**Parameters**

- `mathShape` (object, optional) — The math shape to assign.

**Returns**

- `object` — The annotation mock.

<MemberHeading
  id="makeshapegroupwithanchors"
  depth="3"
  name="makeShapeGroupWithAnchors"
  sig="makeShapeGroupWithAnchors(
	factory: object,
	ann: object,
	style: object,
): object"
/>

<MemberMeta sourceHref="/source/tests/tools/shapes/utils-js/#L58" sourceLabel="utils.js:58" />

Build a full Konva group for an annotation and attach the factory anchors to it, mirroring the real draw-controller setup so that `updateAnnotationOnAnchorMove` and `updateShapeGroupOnAnchorMove` work.

**Parameters**

- `factory` (object) — The shape factory under test.
- `ann` (object) — The annotation mock.
- `style` (object) — The style mock.

**Returns**

- `object` — The Konva group and anchor list.

<MemberHeading id="maketask" depth="3" name="makeTask" sig="makeTask(message?: object, info?: object): WorkerTask" />

<MemberMeta sourceHref="/source/tests/utils/thread-test-js/#L24" sourceLabel="thread.test.js:24" />

Build a WorkerTask backed by a mock worker so no real Web Worker is spawned. The mock worker exposes `postMessage`, `terminate`, `onmessage`, `onerror` as plain spies. After `addWorkerTask` runs, the pool wires its own callbacks onto `mockWorker.onmessage` / `.onerror`, so calling those in tests simulates the worker responding.

**Parameters**

- `message` (object, optional) — Start message for the task.
- `info` (object, optional) — Info object attached to the task.

**Returns**

- [`WorkerTask`](/workertask) — The task with an extra `.mockWorker` property.

<MemberHeading id="makepool" depth="3" name="makePool" sig="makePool(size: number): Object" />

<MemberMeta sourceHref="/source/tests/utils/thread-test-js/#L43" sourceLabel="thread.test.js:43" />

Build a ThreadPool with spies on every event handler.

**Parameters**

- `size` (number) — Pool size.

**Returns**

- `Object` — Pool and a map of spy handlers.

## Instance Fields

<MemberHeading id="loaderlist" depth="3" name="_loaderList" sig="_loaderList: Array | null" />

<MemberMeta sourceHref="/source/src/io/loaderlist-js/#L15" sourceLabel="loaderList.js:15" />

Singleton loader list, lazily initialised to break the circular dependency: MultipartLoader → MemoryLoader → loaderList → MultipartLoader. The array is created on the first call to getLoaderList(), at which point all modules have been fully evaluated and every class is defined.

## Other

<MemberHeading id="custom" depth="3" name="custom" sig="custom" />

<MemberMeta sourceHref="/source/src/app/custom-js/#L14" sourceLabel="custom.js:14" />

Overridalbe custom object for client defined items.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L37" sourceLabel="dataController.js:37" />

Related DICOM tag keys.

<MemberHeading id="dataeventnames" depth="3" name="dataEventNames" sig="dataEventNames: Array.<string>" />

<MemberMeta sourceHref="/source/src/app/datacontroller-js/#L47" sourceLabel="dataController.js:47" />

List of data event names.

<MemberHeading id="loadeventnames" depth="3" name="loadEventNames" sig="loadEventNames: Array.<string>" />

<MemberMeta sourceHref="/source/src/app/loadcontroller-js/#L10" sourceLabel="loadController.js:10" />

List of load event names.

<MemberHeading id="stagecontrollereventnames" depth="3" name="stageControllerEventNames" sig="stageControllerEventNames" />

<MemberMeta sourceHref="/source/src/app/stagecontroller-js/#L32" sourceLabel="stageController.js:32" />

Events fired by the StageController (propagated to App).

<MemberHeading id="undoeventnames" depth="3" name="undoEventNames" sig="undoEventNames: Array.<string>" />

<MemberMeta sourceHref="/source/src/app/undocontroller-js/#L8" sourceLabel="undoController.js:8" />

List of undo controller event names.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/dicom/dicomcode-js/#L9" sourceLabel="dicomCode.js:9" />

DICOM code tag keys.

<MemberHeading id="dcmcodes" depth="3" name="DcmCodes" sig="DcmCodes" />

<MemberMeta sourceHref="/source/src/dicom/dicomcode-js/#L156" sourceLabel="dicomCode.js:156" />

DICOM codes. List: [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part16/chapter\_d.html](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part16/chapter_d.html).

<MemberHeading id="sctcodes" depth="3" name="SctCodes" sig="SctCodes" />

<MemberMeta sourceHref="/source/src/dicom/dicomcode-js/#L250" sourceLabel="dicomCode.js:250" />

SNOMED-CT codes. List: [https://browser.ihtsdotools.org](https://browser.ihtsdotools.org).

<MemberHeading id="ucumcodes" depth="3" name="UcumCodes" sig="UcumCodes" />

<MemberMeta sourceHref="/source/src/dicom/dicomcode-js/#L267" sourceLabel="dicomCode.js:267" />

UCUM codes. Definition: [https://unitsofmeasure.org/ucum](https://unitsofmeasure.org/ucum). List: [https://ucum.nlm.nih.gov/ucum-lhc/demo.html](https://ucum.nlm.nih.gov/ucum-lhc/demo.html).

<MemberHeading id="quantificationname2dictitem" depth="3" name="QuantificationName2DictItem" sig="QuantificationName2DictItem" />

<MemberMeta sourceHref="/source/src/dicom/dicomcode-js/#L350" sourceLabel="dicomCode.js:350" />

Quantification name to dictionary item.

<MemberHeading id="quantificationunit2ucumkey" depth="3" name="QuantificationUnit2UcumKey" sig="QuantificationUnit2UcumKey" />

<MemberMeta sourceHref="/source/src/dicom/dicomcode-js/#L416" sourceLabel="dicomCode.js:416" />

Quantification unit to UCUM key. Associated tags:

- Rescale type [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect\_C.11.html#sect\_C.11.1.1.2](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.11.html#sect_C.11.1.1.2),
- Units [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect\_C.8.9.html#sect\_C.8.9.1.1.3](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.8.9.html#sect_C.8.9.1.1.3).
- SUV [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part16/sect\_CID\_85.html](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part16/sect_CID_85.html).

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/dicom/dicomdir-js/#L11" sourceLabel="dicomDir.js:11" />

Related DICOM tag keys.

<MemberHeading id="directoryrecordtypes" depth="3" name="DirectoryRecordTypes" sig="DirectoryRecordTypes" />

<MemberMeta sourceHref="/source/src/dicom/dicomdir-js/#L22" sourceLabel="dicomDir.js:22" />

DICOM record types.

Ref: [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect\_F.3.2.2.html#table\_F.3-3](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_F.3.2.2.html#table_F.3-3).

<MemberHeading id="textencoder" depth="3" name="textEncoder" sig="textEncoder" />

<MemberMeta sourceHref="/source/src/dicom/dicomelementswrapper-js/#L173" sourceLabel="dicomElementsWrapper.js:173" />

Text encoder used to get string byte lengths.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/dicom/dicomfunctionalgroup-js/#L22" sourceLabel="dicomFunctionalGroup.js:22" />

Related DICOM tag keys.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/dicom/dicomgeometry-js/#L51" sourceLabel="dicomGeometry.js:51" />

Related DICOM tag keys.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/dicom/dicomimage-js/#L21" sourceLabel="dicomImage.js:21" />

Related DICOM tag keys.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/dicom/dicomimagereference-js/#L15" sourceLabel="dicomImageReference.js:15" />

Related DICOM tag keys.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/dicom/dicommanufacturer-js/#L10" sourceLabel="dicomManufacturer.js:10" />

Related DICOM tag keys.

<MemberHeading id="normalisedmanufacturers" depth="3" name="NormalisedManufacturers" sig="NormalisedManufacturers" />

<MemberMeta sourceHref="/source/src/dicom/dicommanufacturer-js/#L17" sourceLabel="dicomManufacturer.js:17" />

Normalised manufacturer names.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/dicom/dicommeasuredvalue-js/#L15" sourceLabel="dicomMeasuredValue.js:15" />

Related DICOM tag keys.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/dicom/dicomnumericmeasurement-js/#L20" sourceLabel="dicomNumericMeasurement.js:20" />

Related DICOM tag keys.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L637" sourceLabel="dicomParser.js:637" />

Small list of used tag keys.

<MemberHeading id="textdecoder" depth="3" name="TextDecoder" sig="TextDecoder" />

<MemberMeta sourceHref="/source/src/dicom/dicomparser-js/#L766" sourceLabel="dicomParser.js:766" />

The text decoder.

Ref: [https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder).

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/dicom/dicompet-js/#L17" sourceLabel="dicomPet.js:17" />

Related DICOM tag keys.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/dicom/dicomrtstruct-js/#L16" sourceLabel="dicomRTStruct.js:16" />

Related DICOM tag keys.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/dicom/dicomsrcontent-js/#L41" sourceLabel="dicomSRContent.js:41" />

Related DICOM tag keys.

<MemberHeading id="relationshiptypes" depth="3" name="RelationshipTypes" sig="RelationshipTypes" />

<MemberMeta sourceHref="/source/src/dicom/dicomsrcontent-js/#L65" sourceLabel="dicomSRContent.js:65" />

DICOM relationship types.

Ref: [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect\_C.17.3.2.4.html#sect\_C.17.3.2.4](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.17.3.2.4.html#sect_C.17.3.2.4).

<MemberHeading id="valuetypes" depth="3" name="ValueTypes" sig="ValueTypes" />

<MemberMeta sourceHref="/source/src/dicom/dicomsrcontent-js/#L80" sourceLabel="dicomSRContent.js:80" />

DICOM value types.

Ref: [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect\_C.17.3.2.html#sect\_C.17.3.2.1](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.17.3.2.html#sect_C.17.3.2.1).

<MemberHeading id="continuityofcontents" depth="3" name="ContinuityOfContents" sig="ContinuityOfContents" />

<MemberMeta sourceHref="/source/src/dicom/dicomsrcontent-js/#L104" sourceLabel="dicomSRContent.js:104" />

DICOM Continuity Of Contents.

Ref: [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect\_C.18.8.html#table\_C.18.8-1](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.18.8.html#table_C.18.8-1).

<MemberHeading id="valuetypevaluetagname" depth="3" name="ValueTypeValueTagName" sig="ValueTypeValueTagName" />

<MemberMeta sourceHref="/source/src/dicom/dicomsrcontent-js/#L112" sourceLabel="dicomSRContent.js:112" />

DICOM value type to associated tag name.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/dicom/dicomsegment-js/#L25" sourceLabel="dicomSegment.js:25" />

Related DICOM tag keys.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/dicom/dicomsopinstancereference-js/#L9" sourceLabel="dicomSopInstanceReference.js:9" />

Related DICOM tag keys.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/dicom/dicomspatialcoordinate-js/#L19" sourceLabel="dicomSpatialCoordinate.js:19" />

Related DICOM tag keys.

<MemberHeading id="graphictypes" depth="3" name="GraphicTypes" sig="GraphicTypes" />

<MemberMeta sourceHref="/source/src/dicom/dicomspatialcoordinate-js/#L31" sourceLabel="dicomSpatialCoordinate.js:31" />

DICOM graphic types.

Ref: [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect\_C.18.6.html#sect\_C.18.6.1.2](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.18.6.html#sect_C.18.6.1.2).

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/dicom/dicomspatialcoordinate3d-js/#L9" sourceLabel="dicomSpatialCoordinate3D.js:9" />

Related DICOM tag keys.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L28" sourceLabel="dicomVolume.js:28" />

Related DICOM tag keys.

<MemberHeading id="sopclassuids" depth="3" name="SOPClassUIDs" sig="SOPClassUIDs" />

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L56" sourceLabel="dicomVolume.js:56" />

Related SOP class UIDs.

<MemberHeading id="defaultprivatebvaluerules" depth="3" name="defaultPrivateBValueRules" sig="defaultPrivateBValueRules: Array.<PrivateBValueRule>" />

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L70" sourceLabel="dicomVolume.js:70" />

Default private b-value tag rules. Tested in order. Rules are either `{manufacturer, key}` or `{uidPrefix, key}`. Can be used to extend `custom.privateBValueRules`.

<MemberHeading id="defaultvolumeidcandidates" depth="3" name="defaultVolumeIdCandidates" sig="defaultVolumeIdCandidates: Array.<VolumeIdCandidate>" />

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L105" sourceLabel="dicomVolume.js:105" />

Ordered list of candidate volume id getters. Since the tag that actually discriminates volumes is not known until the full data is loaded, `guessVolumeIndices` tries these in order and keeps the first one that produces a valid, consistent per-volume grouping. It is used for the files of a series (see `DicomSliceDataList`) and for the frames of a multi-frame file (see `getSortedFramesGeometry`). Most explicit/reliable discriminators come first, AcquisitionTime (the historical default) comes last. Candidates flagged with `preLoad` are also used while loading (see `getVolumeIdTagValue`): they must not vary between the slices of a single volume. Candidates either read an index (an id without unit, for example TemporalPositionIdentifier) or a value (for example EchoTime). The associated value of indices is guessed once all data is loaded (see `getVolumeValues`), values have none.

<MemberHeading id="volumevaluecandidates" depth="3" name="volumeValueCandidates" sig="volumeValueCandidates: Array.<VolumeIdCandidate>" />

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L155" sourceLabel="dicomVolume.js:155" />

Ordered list of candidate volume associated value getters, used for volume ids that are indices (without unit, for example TemporalPositionIdentifier) once all data is loaded: the first one that gives each volume a time span, the spans not overlapping and following the volume ids order, is kept (see `guessVolumeValues`). The associated value of a volume is its smallest value, relative to the one of the first volume for `relative` candidates. Same shape as volume id candidates (`preLoad` is not used).

<MemberHeading id="loggeddeprecations" depth="3" name="loggedDeprecations" sig="loggedDeprecations: Array.<string>" />

<MemberMeta sourceHref="/source/src/dicom/dicomvolume-js/#L565" sourceLabel="dicomVolume.js:565" />

List of already logged deprecation messages.

<MemberHeading id="writerruleactions" depth="3" name="WriterRuleActions" sig="WriterRuleActions" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L43" sourceLabel="dicomWriter.js:43" />

Writer rule actions.

<MemberHeading id="writeractions" depth="3" name="writerActions" sig="writerActions: Record.<string, function()>" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L83" sourceLabel="dicomWriter.js:83" />

Possible writer actions.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L488" sourceLabel="dicomWriter.js:488" />

Small list of used tag keys.

<MemberHeading id="textencoder" depth="3" name="TextEncoder" sig="TextEncoder" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L767" sourceLabel="dicomWriter.js:767" />

The text encoder.

Ref: [https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder).

<MemberHeading id="dictionary" depth="3" name="dictionary" sig="dictionary: Record.<string, Record.<string, Array.<string>>>" />

<MemberMeta sourceHref="/source/src/dicom/dictionary-js/#L12" sourceLabel="dictionary.js:12" />

DICOM tag dictionary 2024a.

<MemberHeading id="taggroups" depth="3" name="tagGroups" sig="tagGroups: Record.<string, string>" />

<MemberMeta sourceHref="/source/src/dicom/dictionary-js/#L34" sourceLabel="dictionary.js:34" />

Tag groups: key to name pairs. Copied from gdcm-2.6.1\Source\DataDictionary\GroupName.dic -> removed duplicates (commented).

<MemberHeading id="vr32bitvl" depth="3" name="vr32bitVL" sig="vr32bitVL: Record.<string, boolean>" />

<MemberMeta sourceHref="/source/src/dicom/dictionary-js/#L134" sourceLabel="dictionary.js:134" />

List of Value Representation (VR) with 32bit Value Length (VL).

Added locally used 'ox'. See [http://dicom.nema.org/medical/dicom/2024a/output/chtml/part05/chapter\_7.html#table\_7.1-1](http://dicom.nema.org/medical/dicom/2024a/output/chtml/part05/chapter_7.html#table_7.1-1).

<MemberHeading id="vrcharsetstring" depth="3" name="vrCharSetString" sig="vrCharSetString: Record.<string, boolean>" />

<MemberMeta sourceHref="/source/src/dicom/dictionary-js/#L169" sourceLabel="dictionary.js:169" />

List of string VR with extended or replaced default character repertoire defined in Specific Character Set (0008,0005).

See [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part05/chapter\_6.html#sect\_6.1.2.2](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part05/chapter_6.html#sect_6.1.2.2).

<MemberHeading id="vrtypes" depth="3" name="vrTypes" sig="vrTypes: Record.<string, string>" />

<MemberMeta sourceHref="/source/src/dicom/dictionary-js/#L196" sourceLabel="dictionary.js:196" />

VR equivalent javascript types.

See [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part05/sect\_6.2.html#table\_6.2-1](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part05/sect_6.2.html#table_6.2-1).

<MemberHeading id="transfersyntaxes" depth="3" name="transferSyntaxes" sig="transferSyntaxes: Record.<string, string>" />

<MemberMeta sourceHref="/source/src/dicom/dictionary-js/#L240" sourceLabel="dictionary.js:240" />

Transfer syntaxes.

See [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part06/chapter\_A.html#table\_A-1](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part06/chapter_A.html#table_A-1).

<MemberHeading id="transfersyntaxkeywords" depth="3" name="transferSyntaxKeywords" sig="transferSyntaxKeywords: Record.<string, string>" />

<MemberMeta sourceHref="/source/src/dicom/dictionary-js/#L307" sourceLabel="dictionary.js:307" />

Transfer syntaxes indexed by keyword.

<MemberHeading id="sopclassuids" depth="3" name="SOPClassUIDs" sig="SOPClassUIDs: Record.<string, string>" />

<MemberMeta sourceHref="/source/src/dicom/dictionary-js/#L376" sourceLabel="dictionary.js:376" />

Standard SOP Class UIDs indexed by keyword. Not comprehensive, just ones needed by DWV.

See [https://dicom.nema.org/medical/dicom/2024a/output/chtml/part04/sect\_B.5.html#table\_B.5-1](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part04/sect_B.5.html#table_B.5-1).

<MemberHeading id="binderlist" depth="3" name="binderList" sig="binderList" />

<MemberMeta sourceHref="/source/src/gui/binders-js/#L337" sourceLabel="binders.js:337" />

List of binders.

<MemberHeading id="interactioneventnames" depth="3" name="InteractionEventNames" sig="InteractionEventNames" />

<MemberMeta sourceHref="/source/src/gui/generic-js/#L10" sourceLabel="generic.js:10" />

List of interaction event names.

<MemberHeading id="nonpassiveinteractioneventnames" depth="3" name="NonPassiveInteractionEventNames" sig="NonPassiveInteractionEventNames" />

<MemberMeta sourceHref="/source/src/gui/generic-js/#L28" sourceLabel="generic.js:28" />

List of the interaction event names whose default can be prevented by tools (see `LayerGroupPointer`): their listeners are not passive.

<MemberHeading id="annotationgroupeventnames" depth="3" name="annotationGroupEventNames" sig="annotationGroupEventNames: Array.<string>" />

<MemberMeta sourceHref="/source/src/image/annotationgroup-js/#L13" sourceLabel="annotationGroup.js:13" />

List of annotation group event names.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/image/annotationgroupfactory-js/#L62" sourceLabel="annotationGroupFactory.js:62" />

Related DICOM tag keys.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/image/dicombuffertodata-js/#L18" sourceLabel="dicomBufferToData.js:18" />

Related DICOM tag keys.

<MemberHeading id="imageeventnames" depth="3" name="imageEventNames" sig="imageEventNames: Array.<string>" />

<MemberMeta sourceHref="/source/src/image/image-js/#L32" sourceLabel="image.js:32" />

List of image event names.

<MemberHeading id="maxcontoursize" depth="3" name="MAX_CONTOUR_SIZE" sig="MAX_CONTOUR_SIZE: number" />

<MemberMeta sourceHref="/source/src/image/imagecontour-js/#L11" sourceLabel="imageContour.js:11" />

Maximum contour size in pixels.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/image/imagefactory-js/#L37" sourceLabel="imageFactory.js:37" />

Related DICOM tag keys.

<MemberHeading id="metatagkeys" depth="3" name="MetaTagKeys" sig="MetaTagKeys" />

<MemberMeta sourceHref="/source/src/image/imagefactory-js/#L68" sourceLabel="imageFactory.js:68" />

Meta tag keys.

<MemberHeading id="framesgeometrycache" depth="3" name="framesGeometryCache" sig="framesGeometryCache: WeakMap.<DataElements, (Array.<Geometry>|undefined)>" />

<MemberMeta sourceHref="/source/src/image/imagefactory-js/#L245" sourceLabel="imageFactory.js:245" />

Frames geometry cache: frames of a multi-frame data share the same data elements, avoid calculating it for each frame.

<MemberHeading id="lutrangemax" depth="3" name="lut_range_max" sig="lut_range_max" />

<MemberMeta sourceHref="/source/src/image/luts-js/#L5" sourceLabel="luts.js:5" />

Lookup tables for image colour display.

<MemberHeading id="luts" depth="3" name="luts" sig="luts: Record.<string, ColourMap>" />

<MemberMeta sourceHref="/source/src/image/luts-js/#L135" sourceLabel="luts.js:135" />

List of available lookup tables (lut).

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/image/maskfactory-js/#L58" sourceLabel="maskFactory.js:58" />

Related DICOM tag keys.

<MemberHeading id="metatagkeys" depth="3" name="MetaTagKeys" sig="MetaTagKeys" />

<MemberMeta sourceHref="/source/src/image/maskfactory-js/#L67" sourceLabel="maskFactory.js:67" />

Meta tag keys.

<MemberHeading id="requireddicomtags" depth="3" name="RequiredDicomTags" sig="RequiredDicomTags" />

<MemberMeta sourceHref="/source/src/image/maskfactory-js/#L141" sourceLabel="maskFactory.js:141" />

List of DICOM Seg required tags.

<MemberHeading id="mlpermm" depth="3" name="ML_PER_MM" sig="ML_PER_MM" />

<MemberMeta sourceHref="/source/src/image/maskimage-js/#L21" sourceLabel="maskImage.js:21" />

<MemberHeading id="maxlutbitsstored" depth="3" name="MAX_LUT_BITS_STORED" sig="MAX_LUT_BITS_STORED: number" />

<MemberMeta sourceHref="/source/src/image/modalitylut-js/#L10" sourceLabel="modalityLut.js:10" />

Maximum number of bits stored for which a pre-computed LUT is created.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/src/image/rtstructfactory-js/#L33" sourceLabel="rtStructFactory.js:33" />

Related DICOM tag keys.

<MemberHeading id="metatagkeys" depth="3" name="MetaTagKeys" sig="MetaTagKeys" />

<MemberMeta sourceHref="/source/src/image/rtstructfactory-js/#L40" sourceLabel="rtStructFactory.js:40" />

Patient/study/series tags to copy into mask meta.

<MemberHeading id="rtstructrequiredtags" depth="3" name="RTStructRequiredTags" sig="RTStructRequiredTags: Array.<{name: string, enum: Array}>" />

<MemberMeta sourceHref="/source/src/image/rtstructfactory-js/#L78" sourceLabel="rtStructFactory.js:78" />

Required DICOM tags for RT Structure Set Storage.

<MemberHeading id="vieweventnames" depth="3" name="viewEventNames" sig="viewEventNames: Array.<string>" />

<MemberMeta sourceHref="/source/src/image/view-js/#L41" sourceLabel="view.js:41" />

List of view event names.

<MemberHeading id="defaultwlpresets" depth="3" name="defaultWlPresets" sig="defaultWlPresets: Record.<string, Record.<string, WindowLevel>>" />

<MemberMeta sourceHref="/source/src/image/viewfactory-js/#L16" sourceLabel="viewFactory.js:16" />

List of default window level presets.

<MemberHeading id="voilutfunctionnames" depth="3" name="VoiLutFunctionNames" sig="VoiLutFunctionNames" />

<MemberMeta sourceHref="/source/src/image/voilut-js/#L7" sourceLabel="voiLut.js:7" />

<MemberHeading id="filereader" depth="3" name="FileReader" sig="FileReader" />

<MemberMeta sourceHref="/source/src/io/filesloader-js/#L272" sourceLabel="filesLoader.js:272" />

The file reader.

Ref: [https://developer.mozilla.org/en-US/docs/Web/API/FileReader](https://developer.mozilla.org/en-US/docs/Web/API/FileReader).

<MemberHeading id="xmlhttprequest" depth="3" name="XMLHttpRequest" sig="XMLHttpRequest" />

<MemberMeta sourceHref="/source/src/io/urlsloader-js/#L327" sourceLabel="urlsLoader.js:327" />

The http request.

Ref: [https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest).

<MemberHeading id="jszip" depth="3" name="JSZip" sig="JSZip" />

<MemberMeta sourceHref="/source/src/io/ziploader-js/#L13" sourceLabel="zipLoader.js:13" />

The zip library.

Ref: [https://github.com/Stuk/jszip](https://github.com/Stuk/jszip).

<MemberHeading id="orientation" depth="3" name="Orientation" sig="Orientation" />

<MemberMeta sourceHref="/source/src/math/orientation-js/#L40" sourceLabel="orientation.js:40" />

Default anatomical plane orientations.

<MemberHeading id="brushmaskforwardeventtypes" depth="3" name="BRUSH_MASK_FORWARD_EVENT_TYPES" sig="BRUSH_MASK_FORWARD_EVENT_TYPES" />

<MemberMeta sourceHref="/source/src/tools/behaviors/brushdragbehavior-js/#L12" sourceLabel="brushDragBehavior.js:12" />

Event types from [BrushMaskPaint](/brushmaskpaint) forwarded by this behavior.

<MemberHeading id="brushmode" depth="3" name="BrushMode" sig="BrushMode" />

<MemberMeta sourceHref="/source/src/tools/behaviors/brushmaskpaint-js/#L30" sourceLabel="brushMaskPaint.js:30" />

<MemberHeading id="errormessages" depth="3" name="ERROR_MESSAGES" sig="ERROR_MESSAGES" />

<MemberMeta sourceHref="/source/src/tools/behaviors/brushpaintmessages-js/#L6" sourceLabel="brushPaintMessages.js:6" />

Error strings and helpers shared by mask painting ([BrushMaskPaint](/brushmaskpaint), [BrushDragBehavior](/brushdragbehavior)).

<MemberHeading id="openendedtaplimit" depth="3" name="OPEN_ENDED_TAP_LIMIT" sig="OPEN_ENDED_TAP_LIMIT: number" />

<MemberMeta sourceHref="/source/src/tools/behaviors/drawtapbehavior-js/#L19" sourceLabel="drawTapBehavior.js:19" />

Large tap budget when factory `ShapeFactory#getNPoints` is undefined.

<MemberHeading id="magicwand" depth="3" name="MagicWand" sig="MagicWand" />

<MemberMeta sourceHref="/source/src/tools/behaviors/floodfilldragbehavior-js/#L18" sourceLabel="floodfillDragBehavior.js:18" />

The magic wand namespace.

Ref: [https://github.com/Tamersoul/magic-wand-js](https://github.com/Tamersoul/magic-wand-js).

<MemberHeading id="taptolerance" depth="3" name="TAP_TOLERANCE" sig="TAP_TOLERANCE: number" />

<MemberMeta sourceHref="/source/src/tools/behaviors/tapbehavior-js/#L14" sourceLabel="tapBehavior.js:14" />

Tap hit tolerance, in display pixels.

<MemberHeading id="mouseeventbuttons" depth="3" name="MouseEventButtons" sig="MouseEventButtons: Readonly.<{left: 0, middle: 1, right: 2, back: 3, forward: 4}>" />

<MemberMeta sourceHref="/source/src/tools/layergrouppointer-js/#L28" sourceLabel="layerGroupPointer.js:28" />

`MouseEvent#button` values (left through fifth / forward).

- **See:**
  - [https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button)

<MemberHeading id="defaultlabeltexts" depth="3" name="defaultLabelTexts" sig="defaultLabelTexts: Record.<string, Record.<string, string>>" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawbounds-js/#L15" sourceLabel="drawBounds.js:15" />

List of default label texts.

<MemberHeading id="drawdebug" depth="3" name="DRAW_DEBUG" sig="DRAW_DEBUG" />

<MemberMeta sourceHref="/source/src/tools/shapes/drawbounds-js/#L127" sourceLabel="drawBounds.js:127" />

Draw Debug flag.

<MemberHeading id="map" depth="3" name="MAP" sig="MAP: Record.<string, KonvaShapePainter>" />

<MemberMeta sourceHref="/source/src/tools/shapes/shapepainters-js/#L629" sourceLabel="shapePainters.js:629" />

Registry mapping annotator names to their Konva rendering entry.

<MemberHeading id="toollist" depth="3" name="toolList" sig="toolList: Record.<string, any>" />

<MemberMeta sourceHref="/source/src/tools/toollist-js/#L44" sourceLabel="toolList.js:44" />

List of client provided tools to be added to the default ones.

**Example**

<Playground providers="codepen">
  ```js
  import {App, AppOptions, ViewConfig, toolList} from '//esm.sh/dwv';
  // custom tool
  class AlertTool {
    mousedown() {alert('AlertTool mousedown');}
    init() {}
    activate() {}
  }
  // pass it to dwv tool list
  toolList['Alert'] = AlertTool;
  // create the dwv app
  const app = new App();
  // initialise
  const viewConfig0 = new ViewConfig('layerGroup0');
  const viewConfigs = {'*': [viewConfig0]};
  const options = new AppOptions(viewConfigs);
  options.tools = {Alert: {}};
  app.init(options);
  // activate tool
  app.addEventListener('load', function () {
    app.setTool('Alert');
  });
  // load dicom data
  app.loadURLs([
    'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm'
  ]);
  ```
</Playground>

<MemberHeading id="defaulttoollist" depth="3" name="defaultToolList" sig="defaultToolList: Record.<string, any>" />

<MemberMeta sourceHref="/source/src/tools/toollist-js/#L51" sourceLabel="toolList.js:51" />

Default tool list.

<MemberHeading id="tooloptions" depth="3" name="toolOptions" sig="toolOptions: Record.<string, Record.<string, any>>" />

<MemberMeta sourceHref="/source/src/tools/tooloptions-js/#L78" sourceLabel="toolOptions.js:78" />

List of client provided tool options to be added to the default ones.

**Example**

<Playground providers="codepen">
  ```js
  import {App, AppOptions, ViewConfig, toolOptions, ROI, Point2D}
    from '//esm.sh/dwv';
  // custom factory
  class LoveFactory {
    getName() {return 'love';}
    static supports(mathShape) {return mathShape instanceof ROI;}
    getNPoints() {return 1;}
    setAnnotationMathShape(annotation, points) {
      const px = points[0].getX();
      const py = points[0].getY();
      annotation.mathShape = new ROI([
        new Point2D(px+15,py), new Point2D(px+10,py-10),
        new Point2D(px,py), new Point2D(px-10,py-10),
        new Point2D(px-15,py), new Point2D(px,py+20)
      ]);
      annotation.getFactory = function () {return new LoveFactory();}
    }
    createShapeGroup(annotation, style) {
      const roi = annotation.mathShape;
      // konva line
      const arr = [];
      for (let i = 0; i < roi.getLength(); ++i) {
        arr.push(roi.getPoint(i).getX());
        arr.push(roi.getPoint(i).getY());
      }
      const shape = new Konva.Line({
        name: 'shape', points: arr,
        stroke: 'red', strokeWidth: 2,
        closed: true
      });
      // konva group
      const group = new Konva.Group();
      group.name('love-group');
      group.visible(true);
      group.id(annotation.trackingUid);
      group.add(shape);
      return group;
    }
  }
  // pass it to dwv option list
  toolOptions['draw'] = {LoveFactory};
  // create the dwv app
  const app = new App();
  // initialise
  const viewConfig0 = new ViewConfig('layerGroup0');
  const viewConfigs = {'*': [viewConfig0]};
  const options = new AppOptions(viewConfigs);
  options.tools = {Draw: {options: ['Love']}};
  app.init(options);
  // activate tool
  app.addEventListener('load', function () {
    app.setTool('Draw');
    app.setToolFeatures({shapeName: 'Love'});
  });
  // load dicom data
  app.loadURLs([
    'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm'
  ]);
  ```
</Playground>

<MemberHeading id="defaulttooloptions" depth="3" name="defaultToolOptions" sig="defaultToolOptions: Record.<string, Record.<string, any>>" />

<MemberMeta sourceHref="/source/src/tools/tooloptions-js/#L85" sourceLabel="toolOptions.js:85" />

Default tool options.

<MemberHeading id="d65" depth="3" name="d65" sig="d65" />

<MemberMeta sourceHref="/source/src/utils/colour-js/#L183" sourceLabel="colour.js:183" />

CIE Standard Illuminant D65, standard 2° observer.

Ref: [https://en.wikipedia.org/wiki/Illuminant\_D65](https://en.wikipedia.org/wiki/Illuminant_D65).

<MemberHeading id="i18n" depth="3" name="i18n" sig="i18n" />

<MemberMeta sourceHref="/source/src/utils/i18n-js/#L5" sourceLabel="i18n.js:5" />

Namespace for translation function (in a namespace to allow for override from client).

<MemberHeading id="fallbackpoolsize" depth="3" name="FALLBACK_POOL_SIZE" sig="FALLBACK_POOL_SIZE" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L5" sourceLabel="thread.js:5" />

Fallback default thread pool size, used if the number of logical processors is not available.

<MemberHeading id="worker" depth="3" name="Worker" sig="Worker" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L268" sourceLabel="thread.js:268" />

Worker background task.

Ref: [https://developer.mozilla.org/en-US/docs/Web/API/Worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker).

<MemberHeading id="xmlhttprequest" depth="3" name="XMLHttpRequest" sig="XMLHttpRequest" />

<MemberMeta sourceHref="/source/src/utils/uri-js/#L215" sourceLabel="uri.js:215" />

Decode a WEASIS XML manifest.

**Parameters**

- `manifestUri` (string) — The manifest uri.
- `nslices` (number) — The number of slices.
- `callback` (function) — The function to call with the WADO urls.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/tests/dicom/dicomimagereference-test-js/#L15" sourceLabel="dicomImageReference.test.js:15" />

Related DICOM tag keys.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/tests/dicom/dicommanufacturer-test-js/#L16" sourceLabel="dicomManufacturer.test.js:16" />

Related DICOM tag keys.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/tests/dicom/dicommeasuredvalue-test-js/#L13" sourceLabel="dicomMeasuredValue.test.js:13" />

Related DICOM tag keys.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/tests/dicom/dicomnumericmeasurement-test-js/#L14" sourceLabel="dicomNumericMeasurement.test.js:14" />

Related DICOM tag keys.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/tests/dicom/dicompet-test-js/#L8" sourceLabel="dicomPet.test.js:8" />

Related DICOM tag keys.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/tests/dicom/dicomsopinstancereference-test-js/#L16" sourceLabel="dicomSopInstanceReference.test.js:16" />

Related DICOM tag keys.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/tests/dicom/dicomspatialcoordinate-test-js/#L23" sourceLabel="dicomSpatialCoordinate.test.js:23" />

Related DICOM tag keys.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/tests/dicom/dicomspatialcoordinate3d-test-js/#L12" sourceLabel="dicomSpatialCoordinate3D.test.js:12" />

Related DICOM tag keys.

<MemberHeading id="tagkeys" depth="3" name="TagKeys" sig="TagKeys" />

<MemberMeta sourceHref="/source/tests/dicom/dicomvolume-test-js/#L30" sourceLabel="dicomVolume.test.js:30" />

Related DICOM tag keys.

<MemberHeading id="syntax" depth="3" name="Syntax" sig="Syntax" />

<MemberMeta sourceHref="/source/tests/image/dicombuffertodata-test-js/#L93" sourceLabel="dicomBufferToData.test.js:93" />

Tests for the 'image/dicomBufferToData.js' file.

<MemberHeading id="idrsi" depth="3" name="idRsi" sig="idRsi" />

<MemberMeta sourceHref="/source/tests/image/imagehistogram-test-js/#L10" sourceLabel="imageHistogram.test.js:10" />

Tests for the 'image/imageHistogram.js' file.

<MemberHeading id="identity" depth="3" name="IDENTITY" sig="IDENTITY" />

<MemberMeta sourceHref="/source/tests/image/planehelper-test-js/#L20" sourceLabel="planeHelper.test.js:20" />

The 3×3 identity matrix (row-major).

<MemberHeading id="cases" depth="3" name="CASES" sig="CASES" />

<MemberMeta sourceHref="/source/tests/image/planehelper-test-js/#L71" sourceLabel="planeHelper.test.js:71" />

Each entry drives the full per-orientation test suite. All expected values are computed from the image geometry orientation G and the view orientation V.

Terminology: T = getTargetOrientation(G, V) = G.asOneAndZeros() × V L = getLegacyTargetOrientation(G, T) = T, or abs(T) when G matches the canonical coronal orientation (legacy annotation cosines).

To add a new orientation case:

1. Append a new object to CASES.
1. Fill in geoValues, viewValues, and all expected fields.

Field key: t\_123 T \* \[1,2,3] target de-orient, offset tinv\_123 T⁻¹ \* \[1,2,3] target re-orient, getTargetOrientedPositiveXYZ t\_230 T \* \[2,3,0] getOffset3DFromPlaneOffset({x:2,y:3}) v\_123 V \* \[1,2,3] image de-orient (getImageOriented\*) vinv\_123 V⁻¹ \* \[1,2,3] image re-orient (getImageDeOriented\*) plane\_y\_k0 getPositionFromPlanePoint(Point2D(0,1), 0) (T + geo) world\_001 getPlanePointFromPosition(Point(\[0,0,1])) (geo + V) cosines first two columns of T legacy\_cosines first two columns of L.

<MemberHeading id="opaquealpha" depth="3" name="opaqueAlpha" sig="opaqueAlpha" />

<MemberMeta sourceHref="/source/tests/image/utils/viewtesthelpers-js/#L57" sourceLabel="viewTestHelpers.js:57" />

Alpha function that always returns full opacity.

**Returns**

- `number`
