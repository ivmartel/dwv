---
title: WindowLevel
kind: class
longname: WindowLevel
description: Window and Level also known as window width and center.
---

# WindowLevel

<SourceLink href="/source/src/image/windowlevel-js/#L6" label="windowLevel.js:6" />

Window and Level also known as window width and center.

---

## Constructor

<Signature code="new WindowLevel(center: number, width: number): WindowLevel" />

**Parameters**

- `center` (number) — The window center.
- `width` (number) — The window width.

---

## Instance Methods

<MemberHeading id="activate" depth="3" name="activate" sig="activate(bool: boolean)" />

<MemberMeta sourceHref="/source/src/tools/windowlevel-js/#L92" sourceLabel="windowLevel.js:92" />

Activate the tool.

**Parameters**

- `bool` (boolean) — The flag to activate or not.

<MemberHeading id="init" depth="3" name="init" sig="init()" />

<MemberMeta sourceHref="/source/src/tools/windowlevel-js/#L101" sourceLabel="windowLevel.js:101" />

Initialise the tool.

<MemberHeading id="setfeatures" depth="3" name="setFeatures" sig="setFeatures(features: object)" />

<MemberMeta sourceHref="/source/src/tools/windowlevel-js/#L115" sourceLabel="windowLevel.js:115" />

Set the tool live features.

**Parameters**

- `features` (object) — The list of features.
  - `features.strictViewLayer` (boolean, optional) — Deprecated active view layer only for W/L drag and double-click (see [WindowLevelDragBehavior](/windowleveldragbehavior)).
  - `features.activeViewLayerOnly` (boolean, optional) — Active view layer only for W/L drag and double-click (see [WindowLevelDragBehavior](/windowleveldragbehavior)).

## Instance Fields

<MemberHeading id="center" depth="3" name="center" sig="center: number" />

<MemberMeta sourceHref="/source/src/image/windowlevel-js/#L12" sourceLabel="windowLevel.js:12" />

The window center.

<MemberHeading id="width" depth="3" name="width" sig="width: number" />

<MemberMeta sourceHref="/source/src/image/windowlevel-js/#L19" sourceLabel="windowLevel.js:19" />

The window width.

<MemberHeading id="keydown" depth="3" name="keydown" sig="keydown" />

<MemberMeta sourceHref="/source/src/tools/windowlevel-js/#L82" sourceLabel="windowLevel.js:82" />

Handle key down event.

**Parameters**

- `event` (object) — The key down event.
