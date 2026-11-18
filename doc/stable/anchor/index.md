---
title: Anchor
kind: class
longname: Anchor
description: Framework-agnostic anchor point. Carries the anchor's id and (x, y) position. Annotators receive Anchor objects and therefore have no dependency on Konva. The id convention ('anchor0', 'anchor1', …) is owned by this class via the static {@link Anchor.idFromIndex}, {@link Anchor.indexFromId}, and {@link Anchor.fromIndex} helpers. All callers that need to create or look up anchors by numeric index should use these helpers rather than building the string themselves.
---

# Anchor

<SourceLink href="/source/src/tools/shapes/anchor-js/#L13" label="anchor.js:13" />

Framework-agnostic anchor point.

Carries the anchor's id and (x, y) position. Annotators receive Anchor objects and therefore have no dependency on Konva.

The id convention ('anchor0', 'anchor1', …) is owned by this class via the static [Anchor.idFromIndex](/anchor#idfromindex), [Anchor.indexFromId](/anchor#indexfromid), and [Anchor.fromIndex](/anchor#fromindex) helpers. All callers that need to create or look up anchors by numeric index should use these helpers rather than building the string themselves.

---

## Constructor

<Signature code="new Anchor(id: string, x: number, y: number): Anchor" />

**Parameters**

- `id` (string) — Anchor id (e.g. 'anchor0').
- `x` (number) — X coordinate.
- `y` (number) — Y coordinate.

---

## Instance Methods

<MemberHeading id="getid" depth="3" name="getId" sig="getId(): string" />

<MemberMeta sourceHref="/source/src/tools/shapes/anchor-js/#L86" sourceLabel="anchor.js:86" />

Get the anchor id.

**Returns**

- `string` — The id.

<MemberHeading id="getx" depth="3" name="getX" sig="getX(): number" />

<MemberMeta sourceHref="/source/src/tools/shapes/anchor-js/#L95" sourceLabel="anchor.js:95" />

Get the x coordinate.

**Returns**

- `number` — The x coordinate.

<MemberHeading id="gety" depth="3" name="getY" sig="getY(): number" />

<MemberMeta sourceHref="/source/src/tools/shapes/anchor-js/#L104" sourceLabel="anchor.js:104" />

Get the y coordinate.

**Returns**

- `number` — The y coordinate.

<MemberHeading id="setx" depth="3" name="setX" sig="setX(x: number)" />

<MemberMeta sourceHref="/source/src/tools/shapes/anchor-js/#L113" sourceLabel="anchor.js:113" />

Set the x coordinate.

**Parameters**

- `x` (number) — The new x coordinate.

<MemberHeading id="sety" depth="3" name="setY" sig="setY(y: number)" />

<MemberMeta sourceHref="/source/src/tools/shapes/anchor-js/#L122" sourceLabel="anchor.js:122" />

Set the y coordinate.

**Parameters**

- `y` (number) — The new y coordinate.

## Static Methods

<MemberHeading id="idfromindex" depth="3" name="idFromIndex" sig="idFromIndex(index: number): string" />

<MemberMeta badges="static" sourceHref="/source/src/tools/shapes/anchor-js/#L51" sourceLabel="anchor.js:51" />

Return the standard anchor id for a numeric index.

**Parameters**

- `index` (number) — The anchor index (0-based).

**Returns**

- `string` — The anchor id (e.g. 'anchor0').

<MemberHeading id="indexfromid" depth="3" name="indexFromId" sig="indexFromId(id: string): number" />

<MemberMeta badges="static" sourceHref="/source/src/tools/shapes/anchor-js/#L61" sourceLabel="anchor.js:61" />

Parse the numeric index from a standard anchor id.

**Parameters**

- `id` (string) — The anchor id (e.g. 'anchor2').

**Returns**

- `number` — The numeric index.

<MemberHeading id="fromindex" depth="3" name="fromIndex" sig="fromIndex(index: number, x: number, y: number): Anchor" />

<MemberMeta badges="static" sourceHref="/source/src/tools/shapes/anchor-js/#L73" sourceLabel="anchor.js:73" />

Create an anchor using the standard indexed id convention.

**Parameters**

- `index` (number) — The anchor index.
- `x` (number) — X coordinate.
- `y` (number) — Y coordinate.

**Returns**

- [`Anchor`](/anchor) — A new Anchor.
