---
title: Brush
kind: class
longname: Brush
description: Brush class.
---

# Brush

<SourceLink href="/source/src/tools/brush-js/#L14" label="brush.js:14" />

Brush class.

---

## Constructor

<Signature code="new Brush(app: App): Brush" />

**Parameters**

- `app` ([App](/app)) — The associated application.

---

## Instance Methods

<MemberHeading id="activate" depth="3" name="activate" sig="activate(bool: boolean)" />

<MemberMeta sourceHref="/source/src/tools/brush-js/#L89" sourceLabel="brush.js:89" />

Activate the tool.

**Parameters**

- `bool` (boolean) — The flag to activate or not.

<MemberHeading id="setfeatures" depth="3" name="setFeatures" sig="setFeatures(features: object)" />

<MemberMeta sourceHref="/source/src/tools/brush-js/#L101" sourceLabel="brush.js:101" />

Set the tool live features. See the documentation of the class members for details.

**Parameters**

- `features` (object) — The list of features.

<MemberHeading id="init" depth="3" name="init" sig="init()" />

<MemberMeta sourceHref="/source/src/tools/brush-js/#L108" sourceLabel="brush.js:108" />

Initialise the tool.

<MemberHeading id="geteventnames" depth="3" name="getEventNames" sig="getEventNames(): Array" />

<MemberMeta sourceHref="/source/src/tools/brush-js/#L117" sourceLabel="brush.js:117" />

Get the list of event names that this tool can fire.

**Returns**

- `Array` — The list of event names.

<MemberHeading id="gethelpkeys" depth="3" name="getHelpKeys" sig="getHelpKeys(): object" />

<MemberMeta sourceHref="/source/src/tools/brush-js/#L132" sourceLabel="brush.js:132" />

Help for this tool.

**Returns**

- `object` — The help content.

## Instance Fields

<MemberHeading id="keydown" depth="3" name="keydown" sig="keydown" />

<MemberMeta sourceHref="/source/src/tools/brush-js/#L53" sourceLabel="brush.js:53" />

Handle key down event.

**Parameters**

- `event` (object) — The key down event.

<MemberHeading id="contextmenu" depth="3" name="contextmenu" sig="contextmenu" />

<MemberMeta sourceHref="/source/src/tools/brush-js/#L80" sourceLabel="brush.js:80" />

Handle context menu event: prevents the browser menu so that the right button can be used by the tool.

**Parameters**

- `event` (MouseEvent) — The context menu event.
