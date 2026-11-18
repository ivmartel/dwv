---
title: Draw
kind: class
longname: Draw
description: Drawing tool.
---

# Draw

<SourceLink href="/source/src/tools/draw-js/#L17" label="draw.js:17" />

Drawing tool.

---

## Constructor

<Signature code="new Draw(app: App): Draw" />

**Parameters**

- `app` ([App](/app)) — The associated application.

---

## Instance Methods

<MemberHeading id="cancel" depth="3" name="cancel" sig="cancel()" />

<MemberMeta sourceHref="/source/src/tools/draw-js/#L128" sourceLabel="draw.js:128" />

Cancel the current placement: clear the shape preview and end the behaviors.

<MemberHeading id="activate" depth="3" name="activate" sig="activate(bool: boolean)" />

<MemberMeta sourceHref="/source/src/tools/draw-js/#L139" sourceLabel="draw.js:139" />

Activate the tool.

**Parameters**

- `bool` (boolean) — The flag to activate or not.

<MemberHeading id="setoptions" depth="3" name="setOptions" sig="setOptions(options: object)" />

<MemberMeta sourceHref="/source/src/tools/draw-js/#L152" sourceLabel="draw.js:152" />

Set the tool configuration options.

**Parameters**

- `options` (object) — The list of shape names amd classes.

<MemberHeading id="getoptionstype" depth="3" name="getOptionsType" sig="getOptionsType(): string" />

<MemberMeta sourceHref="/source/src/tools/draw-js/#L163" sourceLabel="draw.js:163" />

Get the type of tool options: here 'factory' since the shape list contains factories to create each possible shape.

**Returns**

- `string` — The type.

<MemberHeading id="setfeatures" depth="3" name="setFeatures" sig="setFeatures(features: object)" />

<MemberMeta sourceHref="/source/src/tools/draw-js/#L172" sourceLabel="draw.js:172" />

Set the tool live features.

**Parameters**

- `features` (object) — The list of features.

<MemberHeading id="init" depth="3" name="init" sig="init()" />

<MemberMeta sourceHref="/source/src/tools/draw-js/#L183" sourceLabel="draw.js:183" />

Initialise the tool.

<MemberHeading id="geteventnames" depth="3" name="getEventNames" sig="getEventNames(): Array.<string>" />

<MemberMeta sourceHref="/source/src/tools/draw-js/#L192" sourceLabel="draw.js:192" />

Get the list of event names that this tool can fire.

**Returns**

- `Array.<string>` — The list of event names.

<MemberHeading id="hasshape" depth="3" name="hasShape" sig="hasShape(name: string): boolean" />

<MemberMeta sourceHref="/source/src/tools/draw-js/#L204" sourceLabel="draw.js:204" />

Check if the shape is in the shape list.

**Parameters**

- `name` (string) — The name of the shape.

**Returns**

- `boolean` — True if there is a factory for the shape.

## Instance Fields

<MemberHeading id="keydown" depth="3" name="keydown" sig="keydown" />

<MemberMeta sourceHref="/source/src/tools/draw-js/#L89" sourceLabel="draw.js:89" />

Handle key down event.

**Parameters**

- `event` (object) — The key down event.
