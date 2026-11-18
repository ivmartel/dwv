---
title: Vector3D
kind: class
longname: Vector3D
description: Immutable 3D vector.
---

# Vector3D

<SourceLink href="/source/src/math/vector-js/#L4" label="vector.js:4" />

Immutable 3D vector.

---

## Constructor

<Signature code="new Vector3D(x: number, y: number, z: number): Vector3D" />

**Parameters**

- `x` (number) — The X component of the vector.
- `y` (number) — The Y component of the vector.
- `z` (number) — The Z component of the vector.

---

## Instance Methods

<MemberHeading id="getx" depth="3" name="getX" sig="getX(): number" />

<MemberMeta sourceHref="/source/src/math/vector-js/#L43" sourceLabel="vector.js:43" />

Get the X component of the vector.

**Returns**

- `number` — The X component of the vector.

<MemberHeading id="gety" depth="3" name="getY" sig="getY(): number" />

<MemberMeta sourceHref="/source/src/math/vector-js/#L52" sourceLabel="vector.js:52" />

Get the Y component of the vector.

**Returns**

- `number` — The Y component of the vector.

<MemberHeading id="getz" depth="3" name="getZ" sig="getZ(): number" />

<MemberMeta sourceHref="/source/src/math/vector-js/#L61" sourceLabel="vector.js:61" />

Get the Z component of the vector.

**Returns**

- `number` — The Z component of the vector.

<MemberHeading id="equals" depth="3" name="equals" sig="equals(rhs: Vector3D): boolean" />

<MemberMeta sourceHref="/source/src/math/vector-js/#L71" sourceLabel="vector.js:71" />

Check for Vector3D equality.

**Parameters**

- `rhs` ([Vector3D](/vector3d)) — The other vector to compare to.

**Returns**

- `boolean` — True if both vectors are equal.

<MemberHeading id="tostring" depth="3" name="toString" sig="toString(): string" />

<MemberMeta sourceHref="/source/src/math/vector-js/#L83" sourceLabel="vector.js:83" />

Get a string representation of the Vector3D.

**Returns**

- `string` — The vector as a string.

<MemberHeading id="norm" depth="3" name="norm" sig="norm(): number" />

<MemberMeta sourceHref="/source/src/math/vector-js/#L94" sourceLabel="vector.js:94" />

Get the norm of the vector.

**Returns**

- `number` — The norm.

<MemberHeading id="crossproduct" depth="3" name="crossProduct" sig="crossProduct(vector3D: Vector3D): Vector3D" />

<MemberMeta sourceHref="/source/src/math/vector-js/#L112" sourceLabel="vector.js:112" />

Get the cross product with another Vector3D, ie the vector that is perpendicular to both a and b. If both vectors are parallel, the cross product is a zero vector.

Ref: [https://en.wikipedia.org/wiki/Cross\_product](https://en.wikipedia.org/wiki/Cross_product).

**Parameters**

- `vector3D` ([Vector3D](/vector3d)) — The input vector.

**Returns**

- [`Vector3D`](/vector3d) — The result vector.

<MemberHeading id="dotproduct" depth="3" name="dotProduct" sig="dotProduct(vector3D: Vector3D): number" />

<MemberMeta sourceHref="/source/src/math/vector-js/#L127" sourceLabel="vector.js:127" />

Get the dot product with another Vector3D.

Ref: [https://en.wikipedia.org/wiki/Dot\_product](https://en.wikipedia.org/wiki/Dot_product).

**Parameters**

- `vector3D` ([Vector3D](/vector3d)) — The input vector.

**Returns**

- `number` — The dot product.

<MemberHeading id="iscodirectional" depth="3" name="isCodirectional" sig="isCodirectional(vector3D: Vector3D): boolean" />

<MemberMeta sourceHref="/source/src/math/vector-js/#L139" sourceLabel="vector.js:139" />

Is this vector codirectional to an input one.

**Parameters**

- `vector3D` ([Vector3D](/vector3d)) — The vector to test.

**Returns**

- `boolean` — True if codirectional, false is opposite.
