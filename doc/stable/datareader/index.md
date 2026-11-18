---
title: DataReader
kind: class
longname: DataReader
description: Data reader.
---

# DataReader

<SourceLink href="/source/src/dicom/datareader-js/#L33" label="dataReader.js:33" />

Data reader.

---

## Constructor

<Signature
  code="new DataReader(
	buffer: ArrayBuffer,
	isLittleEndian?: boolean,
): DataReader"
/>

**Parameters**

- `buffer` (ArrayBuffer) — The input array buffer.
- `isLittleEndian` (boolean, optional) — Flag to tell if the data is little or big endian (default: true).

---

## Instance Methods

<MemberHeading id="readuint16" depth="3" name="readUint16" sig="readUint16(byteOffset: number): number" />

<MemberMeta sourceHref="/source/src/dicom/datareader-js/#L91" sourceLabel="dataReader.js:91" />

Read Uint16 (2 bytes) data.

**Parameters**

- `byteOffset` (number) — The offset to start reading from.

**Returns**

- `number` — The read data.

<MemberHeading id="readint16" depth="3" name="readInt16" sig="readInt16(byteOffset: number): number" />

<MemberMeta sourceHref="/source/src/dicom/datareader-js/#L101" sourceLabel="dataReader.js:101" />

Read Int16 (2 bytes) data.

**Parameters**

- `byteOffset` (number) — The offset to start reading from.

**Returns**

- `number` — The read data.

<MemberHeading id="readuint32" depth="3" name="readUint32" sig="readUint32(byteOffset: number): number" />

<MemberMeta sourceHref="/source/src/dicom/datareader-js/#L111" sourceLabel="dataReader.js:111" />

Read Uint32 (4 bytes) data.

**Parameters**

- `byteOffset` (number) — The offset to start reading from.

**Returns**

- `number` — The read data.

<MemberHeading id="readbiguint64" depth="3" name="readBigUint64" sig="readBigUint64(byteOffset: number): bigint" />

<MemberMeta sourceHref="/source/src/dicom/datareader-js/#L121" sourceLabel="dataReader.js:121" />

Read BigUint64 (8 bytes) data.

**Parameters**

- `byteOffset` (number) — The offset to start reading from.

**Returns**

- `bigint` — The read data.

<MemberHeading id="readint32" depth="3" name="readInt32" sig="readInt32(byteOffset: number): number" />

<MemberMeta sourceHref="/source/src/dicom/datareader-js/#L131" sourceLabel="dataReader.js:131" />

Read Int32 (4 bytes) data.

**Parameters**

- `byteOffset` (number) — The offset to start reading from.

**Returns**

- `number` — The read data.

<MemberHeading id="readbigint64" depth="3" name="readBigInt64" sig="readBigInt64(byteOffset: number): bigint" />

<MemberMeta sourceHref="/source/src/dicom/datareader-js/#L141" sourceLabel="dataReader.js:141" />

Read BigInt64 (8 bytes) data.

**Parameters**

- `byteOffset` (number) — The offset to start reading from.

**Returns**

- `bigint` — The read data.

<MemberHeading id="readfloat32" depth="3" name="readFloat32" sig="readFloat32(byteOffset: number): number" />

<MemberMeta sourceHref="/source/src/dicom/datareader-js/#L151" sourceLabel="dataReader.js:151" />

Read Float32 (4 bytes) data.

**Parameters**

- `byteOffset` (number) — The offset to start reading from.

**Returns**

- `number` — The read data.

<MemberHeading id="readfloat64" depth="3" name="readFloat64" sig="readFloat64(byteOffset: number): number" />

<MemberMeta sourceHref="/source/src/dicom/datareader-js/#L161" sourceLabel="dataReader.js:161" />

Read Float64 (8 bytes) data.

**Parameters**

- `byteOffset` (number) — The offset to start reading from.

**Returns**

- `number` — The read data.

<MemberHeading
  id="readbinaryarray"
  depth="3"
  name="readBinaryArray"
  sig="readBinaryArray(
	byteOffset: number,
	size: number,
	outputSize?: number,
): Uint8Array"
/>

<MemberMeta sourceHref="/source/src/dicom/datareader-js/#L174" sourceLabel="dataReader.js:174" />

Read binary (0/1) bitpacked array.

**Parameters**

- `byteOffset` (number) — The offset to start reading from.
- `size` (number) — The size of the input array.
- `outputSize` (number, optional) — The size of the output buffer, defaults to 8 times the input size.

**Returns**

- `Uint8Array` — The read data.

<MemberHeading id="readuint8array" depth="3" name="readUint8Array" sig="readUint8Array(byteOffset: number, size: number): Uint8Array" />

<MemberMeta sourceHref="/source/src/dicom/datareader-js/#L204" sourceLabel="dataReader.js:204" />

Read Uint8 array.

**Parameters**

- `byteOffset` (number) — The offset to start reading from.
- `size` (number) — The size of the array.

**Returns**

- `Uint8Array` — The read data.

<MemberHeading id="readint8array" depth="3" name="readInt8Array" sig="readInt8Array(byteOffset: number, size: number): Int8Array" />

<MemberMeta sourceHref="/source/src/dicom/datareader-js/#L215" sourceLabel="dataReader.js:215" />

Read Int8 array.

**Parameters**

- `byteOffset` (number) — The offset to start reading from.
- `size` (number) — The size of the array.

**Returns**

- `Int8Array` — The read data.

<MemberHeading id="readuint16array" depth="3" name="readUint16Array" sig="readUint16Array(byteOffset: number, size: number): Uint16Array" />

<MemberMeta sourceHref="/source/src/dicom/datareader-js/#L226" sourceLabel="dataReader.js:226" />

Read Uint16 array.

**Parameters**

- `byteOffset` (number) — The offset to start reading from.
- `size` (number) — The size of the array.

**Returns**

- `Uint16Array` — The read data.

<MemberHeading id="readint16array" depth="3" name="readInt16Array" sig="readInt16Array(byteOffset: number, size: number): Int16Array" />

<MemberMeta sourceHref="/source/src/dicom/datareader-js/#L254" sourceLabel="dataReader.js:254" />

Read Int16 array.

**Parameters**

- `byteOffset` (number) — The offset to start reading from.
- `size` (number) — The size of the array.

**Returns**

- `Int16Array` — The read data.

<MemberHeading id="readuint32array" depth="3" name="readUint32Array" sig="readUint32Array(byteOffset: number, size: number): Uint32Array" />

<MemberMeta sourceHref="/source/src/dicom/datareader-js/#L282" sourceLabel="dataReader.js:282" />

Read Uint32 array.

**Parameters**

- `byteOffset` (number) — The offset to start reading from.
- `size` (number) — The size of the array.

**Returns**

- `Uint32Array` — The read data.

<MemberHeading
  id="readuint64array"
  depth="3"
  name="readUint64Array"
  sig="readUint64Array(
	byteOffset: number,
	size: number,
): BigUint64Array"
/>

<MemberMeta sourceHref="/source/src/dicom/datareader-js/#L310" sourceLabel="dataReader.js:310" />

Read Uint64 array.

**Parameters**

- `byteOffset` (number) — The offset to start reading from.
- `size` (number) — The size of the array.

**Returns**

- `BigUint64Array` — The read data.

<MemberHeading id="readint32array" depth="3" name="readInt32Array" sig="readInt32Array(byteOffset: number, size: number): Int32Array" />

<MemberMeta sourceHref="/source/src/dicom/datareader-js/#L338" sourceLabel="dataReader.js:338" />

Read Int32 array.

**Parameters**

- `byteOffset` (number) — The offset to start reading from.
- `size` (number) — The size of the array.

**Returns**

- `Int32Array` — The read data.

<MemberHeading id="readint64array" depth="3" name="readInt64Array" sig="readInt64Array(byteOffset: number, size: number): BigInt64Array" />

<MemberMeta sourceHref="/source/src/dicom/datareader-js/#L366" sourceLabel="dataReader.js:366" />

Read Int64 array.

**Parameters**

- `byteOffset` (number) — The offset to start reading from.
- `size` (number) — The size of the array.

**Returns**

- `BigInt64Array` — The read data.

<MemberHeading id="readfloat32array" depth="3" name="readFloat32Array" sig="readFloat32Array(byteOffset: number, size: number): Float32Array" />

<MemberMeta sourceHref="/source/src/dicom/datareader-js/#L394" sourceLabel="dataReader.js:394" />

Read Float32 array.

**Parameters**

- `byteOffset` (number) — The offset to start reading from.
- `size` (number) — The size of the array.

**Returns**

- `Float32Array` — The read data.

<MemberHeading id="readfloat64array" depth="3" name="readFloat64Array" sig="readFloat64Array(byteOffset: number, size: number): Float64Array" />

<MemberMeta sourceHref="/source/src/dicom/datareader-js/#L422" sourceLabel="dataReader.js:422" />

Read Float64 array.

**Parameters**

- `byteOffset` (number) — The offset to start reading from.
- `size` (number) — The size of the array.

**Returns**

- `Float64Array` — The read data.

<MemberHeading id="readhex" depth="3" name="readHex" sig="readHex(byteOffset: number): string" />

<MemberMeta sourceHref="/source/src/dicom/datareader-js/#L449" sourceLabel="dataReader.js:449" />

Read data as an hexadecimal string of length 4 (no '0x' prefix).

**Parameters**

- `byteOffset` (number) — The offset to start reading from.

**Returns**

- `string` — The read data ('####').
