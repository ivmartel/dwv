---
title: DataWriter
kind: class
longname: DataWriter
description: Data writer.
---

# DataWriter

<SourceLink href="/source/src/dicom/datawriter-js/#L4" label="dataWriter.js:4" />

Data writer.

---

## Constructor

<Signature
  code="new DataWriter(
	buffer: ArrayBuffer,
	isLittleEndian?: boolean,
): DataWriter"
/>

**Parameters**

- `buffer` (ArrayBuffer) — The input array buffer.
- `isLittleEndian` (boolean, optional) — Flag to tell if the data is little or big endian.

---

## Instance Methods

<MemberHeading id="writeuint8" depth="3" name="writeUint8" sig="writeUint8(byteOffset: number, value: number): number" />

<MemberMeta sourceHref="/source/src/dicom/datawriter-js/#L40" sourceLabel="dataWriter.js:40" />

Write Uint8 data.

**Parameters**

- `byteOffset` (number) — The offset to start writing from.
- `value` (number) — The data to write.

**Returns**

- `number` — The new offset position.

<MemberHeading id="writeint8" depth="3" name="writeInt8" sig="writeInt8(byteOffset: number, value: number): number" />

<MemberMeta sourceHref="/source/src/dicom/datawriter-js/#L52" sourceLabel="dataWriter.js:52" />

Write Int8 data.

**Parameters**

- `byteOffset` (number) — The offset to start writing from.
- `value` (number) — The data to write.

**Returns**

- `number` — The new offset position.

<MemberHeading id="writeuint16" depth="3" name="writeUint16" sig="writeUint16(byteOffset: number, value: number): number" />

<MemberMeta sourceHref="/source/src/dicom/datawriter-js/#L64" sourceLabel="dataWriter.js:64" />

Write Uint16 data.

**Parameters**

- `byteOffset` (number) — The offset to start writing from.
- `value` (number) — The data to write.

**Returns**

- `number` — The new offset position.

<MemberHeading id="writeint16" depth="3" name="writeInt16" sig="writeInt16(byteOffset: number, value: number): number" />

<MemberMeta sourceHref="/source/src/dicom/datawriter-js/#L76" sourceLabel="dataWriter.js:76" />

Write Int16 data.

**Parameters**

- `byteOffset` (number) — The offset to start writing from.
- `value` (number) — The data to write.

**Returns**

- `number` — The new offset position.

<MemberHeading id="writeuint32" depth="3" name="writeUint32" sig="writeUint32(byteOffset: number, value: number): number" />

<MemberMeta sourceHref="/source/src/dicom/datawriter-js/#L88" sourceLabel="dataWriter.js:88" />

Write Uint32 data.

**Parameters**

- `byteOffset` (number) — The offset to start writing from.
- `value` (number) — The data to write.

**Returns**

- `number` — The new offset position.

<MemberHeading id="writeuint64" depth="3" name="writeUint64" sig="writeUint64(byteOffset: number, value: bigint): number" />

<MemberMeta sourceHref="/source/src/dicom/datawriter-js/#L100" sourceLabel="dataWriter.js:100" />

Write Uint64 data.

**Parameters**

- `byteOffset` (number) — The offset to start writing from.
- `value` (bigint) — The data to write.

**Returns**

- `number` — The new offset position.

<MemberHeading id="writeint32" depth="3" name="writeInt32" sig="writeInt32(byteOffset: number, value: number): number" />

<MemberMeta sourceHref="/source/src/dicom/datawriter-js/#L112" sourceLabel="dataWriter.js:112" />

Write Int32 data.

**Parameters**

- `byteOffset` (number) — The offset to start writing from.
- `value` (number) — The data to write.

**Returns**

- `number` — The new offset position.

<MemberHeading id="writeint64" depth="3" name="writeInt64" sig="writeInt64(byteOffset: number, value: bigint): number" />

<MemberMeta sourceHref="/source/src/dicom/datawriter-js/#L124" sourceLabel="dataWriter.js:124" />

Write Int64 data.

**Parameters**

- `byteOffset` (number) — The offset to start writing from.
- `value` (bigint) — The data to write.

**Returns**

- `number` — The new offset position.

<MemberHeading id="writefloat32" depth="3" name="writeFloat32" sig="writeFloat32(byteOffset: number, value: number): number" />

<MemberMeta sourceHref="/source/src/dicom/datawriter-js/#L136" sourceLabel="dataWriter.js:136" />

Write Float32 data.

**Parameters**

- `byteOffset` (number) — The offset to start writing from.
- `value` (number) — The data to write.

**Returns**

- `number` — The new offset position.

<MemberHeading id="writefloat64" depth="3" name="writeFloat64" sig="writeFloat64(byteOffset: number, value: number): number" />

<MemberMeta sourceHref="/source/src/dicom/datawriter-js/#L148" sourceLabel="dataWriter.js:148" />

Write Float64 data.

**Parameters**

- `byteOffset` (number) — The offset to start writing from.
- `value` (number) — The data to write.

**Returns**

- `number` — The new offset position.

<MemberHeading id="writehex" depth="3" name="writeHex" sig="writeHex(byteOffset: number, str: string): number" />

<MemberMeta sourceHref="/source/src/dicom/datawriter-js/#L160" sourceLabel="dataWriter.js:160" />

Write string data of length 4 as hexadecimal (no '0x' prefix).

**Parameters**

- `byteOffset` (number) — The offset to start writing from.
- `str` (string) — The hexadecimal string to write ('####').

**Returns**

- `number` — The new offset position.

<MemberHeading
  id="writebinaryarray"
  depth="3"
  name="writeBinaryArray"
  sig="writeBinaryArray(
	byteOffset: number,
	array: Array | Uint8Array,
): number"
/>

<MemberMeta sourceHref="/source/src/dicom/datawriter-js/#L174" sourceLabel="dataWriter.js:174" />

Write a boolean array as bitpacked Uint8 array.

**Parameters**

- `byteOffset` (number) — The offset to start writing from.
- `array` (Array | Uint8Array) — The array to write.

**Returns**

- `number` — The new offset position.

<MemberHeading
  id="writeuint8array"
  depth="3"
  name="writeUint8Array"
  sig="writeUint8Array(
	byteOffset: number,
	array: Array | Uint8Array,
): number"
/>

<MemberMeta sourceHref="/source/src/dicom/datawriter-js/#L198" sourceLabel="dataWriter.js:198" />

Write Uint8 array.

**Parameters**

- `byteOffset` (number) — The offset to start writing from.
- `array` (Array | Uint8Array) — The array to write.

**Returns**

- `number` — The new offset position.

<MemberHeading id="writeint8array" depth="3" name="writeInt8Array" sig="writeInt8Array(byteOffset: number, array: Array): number" />

<MemberMeta sourceHref="/source/src/dicom/datawriter-js/#L212" sourceLabel="dataWriter.js:212" />

Write Int8 array.

**Parameters**

- `byteOffset` (number) — The offset to start writing from.
- `array` (Array) — The array to write.

**Returns**

- `number` — The new offset position.

<MemberHeading id="writeuint16array" depth="3" name="writeUint16Array" sig="writeUint16Array(byteOffset: number, array: Array): number" />

<MemberMeta sourceHref="/source/src/dicom/datawriter-js/#L226" sourceLabel="dataWriter.js:226" />

Write Uint16 array.

**Parameters**

- `byteOffset` (number) — The offset to start writing from.
- `array` (Array) — The array to write.

**Returns**

- `number` — The new offset position.

<MemberHeading id="writeint16array" depth="3" name="writeInt16Array" sig="writeInt16Array(byteOffset: number, array: Array): number" />

<MemberMeta sourceHref="/source/src/dicom/datawriter-js/#L240" sourceLabel="dataWriter.js:240" />

Write Int16 array.

**Parameters**

- `byteOffset` (number) — The offset to start writing from.
- `array` (Array) — The array to write.

**Returns**

- `number` — The new offset position.

<MemberHeading id="writeuint32array" depth="3" name="writeUint32Array" sig="writeUint32Array(byteOffset: number, array: Array): number" />

<MemberMeta sourceHref="/source/src/dicom/datawriter-js/#L254" sourceLabel="dataWriter.js:254" />

Write Uint32 array.

**Parameters**

- `byteOffset` (number) — The offset to start writing from.
- `array` (Array) — The array to write.

**Returns**

- `number` — The new offset position.

<MemberHeading id="writeuint64array" depth="3" name="writeUint64Array" sig="writeUint64Array(byteOffset: number, array: Array): number" />

<MemberMeta sourceHref="/source/src/dicom/datawriter-js/#L268" sourceLabel="dataWriter.js:268" />

Write Uint64 array.

**Parameters**

- `byteOffset` (number) — The offset to start writing from.
- `array` (Array) — The array to write.

**Returns**

- `number` — The new offset position.

<MemberHeading id="writeint32array" depth="3" name="writeInt32Array" sig="writeInt32Array(byteOffset: number, array: Array): number" />

<MemberMeta sourceHref="/source/src/dicom/datawriter-js/#L282" sourceLabel="dataWriter.js:282" />

Write Int32 array.

**Parameters**

- `byteOffset` (number) — The offset to start writing from.
- `array` (Array) — The array to write.

**Returns**

- `number` — The new offset position.

<MemberHeading id="writeint64array" depth="3" name="writeInt64Array" sig="writeInt64Array(byteOffset: number, array: Array): number" />

<MemberMeta sourceHref="/source/src/dicom/datawriter-js/#L296" sourceLabel="dataWriter.js:296" />

Write Int64 array.

**Parameters**

- `byteOffset` (number) — The offset to start writing from.
- `array` (Array) — The array to write.

**Returns**

- `number` — The new offset position.

<MemberHeading id="writefloat32array" depth="3" name="writeFloat32Array" sig="writeFloat32Array(byteOffset: number, array: Array): number" />

<MemberMeta sourceHref="/source/src/dicom/datawriter-js/#L310" sourceLabel="dataWriter.js:310" />

Write Float32 array.

**Parameters**

- `byteOffset` (number) — The offset to start writing from.
- `array` (Array) — The array to write.

**Returns**

- `number` — The new offset position.

<MemberHeading id="writefloat64array" depth="3" name="writeFloat64Array" sig="writeFloat64Array(byteOffset: number, array: Array): number" />

<MemberMeta sourceHref="/source/src/dicom/datawriter-js/#L324" sourceLabel="dataWriter.js:324" />

Write Float64 array.

**Parameters**

- `byteOffset` (number) — The offset to start writing from.
- `array` (Array) — The array to write.

**Returns**

- `number` — The new offset position.
