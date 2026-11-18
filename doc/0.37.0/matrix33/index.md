---
title: Matrix33
kind: class
longname: Matrix33
description: Immutable 3x3 Matrix.
---

# Matrix33

<SourceLink href="/source/src/math/matrix-js/#L14" label="matrix.js:14" />

Immutable 3x3 Matrix.

---

## Constructor

<Signature code="new Matrix33(values: Array.<number>): Matrix33" />

**Parameters**

- `values` (Array.\<number>) — Row-major ordered 9 values.

---

## Instance Methods

<MemberHeading id="get" depth="3" name="get" sig="get(row: number, col: number): number | undefined" />

<MemberMeta sourceHref="/source/src/math/matrix-js/#L44" sourceLabel="matrix.js:44" />

Get a value of the matrix.

**Parameters**

- `row` (number) — The row at wich to get the value.
- `col` (number) — The column at wich to get the value.

**Returns**

- `number | undefined` — The value at the position.

<MemberHeading id="getinverse" depth="3" name="getInverse" sig="getInverse(): Matrix33 | undefined" />

<MemberMeta sourceHref="/source/src/math/matrix-js/#L54" sourceLabel="matrix.js:54" />

Get the inverse of this matrix.

**Returns**

- [`Matrix33`](/matrix33)` | undefined` — The inverse matrix or undefined if the determinant is zero.

<MemberHeading id="equals" depth="3" name="equals" sig="equals(rhs: Matrix33): boolean" />

<MemberMeta sourceHref="/source/src/math/matrix-js/#L67" sourceLabel="matrix.js:67" />

Check for Matrix33 equality.

**Parameters**

- `rhs` ([Matrix33](/matrix33)) — The other matrix to compare to.

**Returns**

- `boolean` — True if both matrices are equal.

<MemberHeading id="issimilar" depth="3" name="isSimilar" sig="isSimilar(rhs: Matrix33, tol?: number): boolean" />

<MemberMeta sourceHref="/source/src/math/matrix-js/#L88" sourceLabel="matrix.js:88" />

Check for Matrix33 similarity.

**Parameters**

- `rhs` ([Matrix33](/matrix33)) — The other matrix to compare to.
- `tol` (number, optional) — Optional number comparison tolerance, defaults to Number.EPSILON.

**Returns**

- `boolean` — True if both matrices are similar.

<MemberHeading id="tostring" depth="3" name="toString" sig="toString(): string" />

<MemberMeta sourceHref="/source/src/math/matrix-js/#L106" sourceLabel="matrix.js:106" />

Get a string representation of the Matrix33.

**Returns**

- `string` — The matrix as a string.

<MemberHeading id="multiply" depth="3" name="multiply" sig="multiply(rhs: Matrix33): Matrix33" />

<MemberMeta sourceHref="/source/src/math/matrix-js/#L129" sourceLabel="matrix.js:129" />

Multiply this matrix by another.

**Parameters**

- `rhs` ([Matrix33](/matrix33)) — The matrix to multiply by.

**Returns**

- [`Matrix33`](/matrix33) — The product matrix.

<MemberHeading id="getabs" depth="3" name="getAbs" sig="getAbs(): Matrix33" />

<MemberMeta sourceHref="/source/src/math/matrix-js/#L148" sourceLabel="matrix.js:148" />

Get the absolute value of this matrix.

**Returns**

- [`Matrix33`](/matrix33) — The result matrix.

<MemberHeading id="multiplyarray3d" depth="3" name="multiplyArray3D" sig="multiplyArray3D(array3D: Array.<number>): Array.<number>" />

<MemberMeta sourceHref="/source/src/math/matrix-js/#L164" sourceLabel="matrix.js:164" />

Multiply this matrix by a 3D array.

**Parameters**

- `array3D` (Array.\<number>) — The input 3D array.

**Returns**

- `Array.<number>` — The result 3D array.

<MemberHeading
  id="multiplytypedarray3d"
  depth="3"
  name="multiplyTypedArray3D"
  sig="multiplyTypedArray3D(
	sourceArray: TypedArray,
	outArray: TypedArray,
)"
/>

<MemberMeta sourceHref="/source/src/math/matrix-js/#L195" sourceLabel="matrix.js:195" />

Multiply this matrix by a 3D typed array.

**Parameters**

- `sourceArray` ([TypedArray](/typedarray)) — The input 3D array.
- `outArray` ([TypedArray](/typedarray)) — The array to write to.

<MemberHeading id="multiplyvector3d" depth="3" name="multiplyVector3D" sig="multiplyVector3D(vector3D: Vector3D): Vector3D" />

<MemberMeta sourceHref="/source/src/math/matrix-js/#L220" sourceLabel="matrix.js:220" />

Multiply this matrix by a 3D vector.

**Parameters**

- `vector3D` ([Vector3D](/vector3d)) — The input 3D vector.

**Returns**

- [`Vector3D`](/vector3d) — The result 3D vector.

<MemberHeading id="multiplypoint3d" depth="3" name="multiplyPoint3D" sig="multiplyPoint3D(point3D: Point3D): Point3D" />

<MemberMeta sourceHref="/source/src/math/matrix-js/#L233" sourceLabel="matrix.js:233" />

Multiply this matrix by a 3D point.

**Parameters**

- `point3D` ([Point3D](/point3d)) — The input 3D point.

**Returns**

- [`Point3D`](/point3d) — The result 3D point.

<MemberHeading id="multiplyindex3d" depth="3" name="multiplyIndex3D" sig="multiplyIndex3D(index3D: Index): Index" />

<MemberMeta sourceHref="/source/src/math/matrix-js/#L246" sourceLabel="matrix.js:246" />

Multiply this matrix by a 3D index.

**Parameters**

- `index3D` ([Index](/index)) — The input 3D index.

**Returns**

- [`Index`](/index) — The result 3D index.

<MemberHeading id="getrowabsmax" depth="3" name="getRowAbsMax" sig="getRowAbsMax(row: number): object" />

<MemberMeta sourceHref="/source/src/math/matrix-js/#L257" sourceLabel="matrix.js:257" />

Get the index of the maximum in absolute value of a row.

**Parameters**

- `row` (number) — The row to get the maximum from.

**Returns**

- `object` — The {value,index} of the maximum.

<MemberHeading id="getcolabsmax" depth="3" name="getColAbsMax" sig="getColAbsMax(col: number): object" />

<MemberMeta sourceHref="/source/src/math/matrix-js/#L277" sourceLabel="matrix.js:277" />

Get the index of the maximum in absolute value of a column.

**Parameters**

- `col` (number) — The column to get the maximum from.

**Returns**

- `object` — The {value,index} of the maximum.

<MemberHeading id="asoneandzeros" depth="3" name="asOneAndZeros" sig="asOneAndZeros(): Matrix33" />

<MemberMeta sourceHref="/source/src/math/matrix-js/#L296" sourceLabel="matrix.js:296" />

Get this matrix with only zero and +/- ones instead of the maximum.

**Returns**

- [`Matrix33`](/matrix33) — The simplified matrix.

<MemberHeading id="getthirdcolmajordirection" depth="3" name="getThirdColMajorDirection" sig="getThirdColMajorDirection(): number" />

<MemberMeta sourceHref="/source/src/math/matrix-js/#L318" sourceLabel="matrix.js:318" />

Get the third column direction index of an orientation matrix.

**Returns**

- `number` — The index of the absolute maximum of the last column.

<MemberHeading id="getvalues" depth="3" name="getValues" sig="getValues(): Array.<number>" />

<MemberMeta sourceHref="/source/src/math/matrix-js/#L327" sourceLabel="matrix.js:327" />

Get the values of the matrix as an array.

**Returns**

- `Array.<number>` — The matrix.
