---
title: DrawBrushCommand
kind: class
longname: DrawBrushCommand
description: Draw brush command.
---

# DrawBrushCommand

<SourceLink href="/source/src/command/drawbrushcommand-js/#L44" label="drawBrushCommand.js:44" />

Draw brush command.

---

## Constructor

<Signature
  code="new DrawBrushCommand(
	properties: DrawBrushCommandProperties,
): DrawBrushCommand"
/>

**Parameters**

- `properties` ([DrawBrushCommandProperties](/drawbrushcommandproperties)) — The command properties.

---

## Instance Methods

<MemberHeading id="getoriginalvalueslists" depth="3" name="getOriginalValuesLists" sig="getOriginalValuesLists(): Array | undefined" />

<MemberMeta sourceHref="/source/src/command/drawbrushcommand-js/#L91" sourceLabel="drawBrushCommand.js:91" />

Get the original values before applying brush.

**Returns**

- `Array | undefined` — Lists of original value iterators, undefined when erasing.

<MemberHeading id="getexecuteevent" depth="3" name="getExecuteEvent" sig="getExecuteEvent(): CustomEvent" />

<MemberMeta sourceHref="/source/src/command/drawbrushcommand-js/#L100" sourceLabel="drawBrushCommand.js:100" />

Get the execute event.

**Returns**

- `CustomEvent` — The event.

<MemberHeading id="getname" depth="3" name="getName" sig="getName(): string" />

<MemberMeta sourceHref="/source/src/command/drawbrushcommand-js/#L117" sourceLabel="drawBrushCommand.js:117" />

Get the command name.

**Returns**

- `string` — The command name.

<MemberHeading id="execute" depth="3" name="execute" sig="execute()" />

<MemberMeta sourceHref="/source/src/command/drawbrushcommand-js/#L126" sourceLabel="drawBrushCommand.js:126" />

Execute the command.

**Fires**

- `DrawBrushCommand#event:brushdraw`

<MemberHeading id="undo" depth="3" name="undo" sig="undo()" />

<MemberMeta sourceHref="/source/src/command/drawbrushcommand-js/#L164" sourceLabel="drawBrushCommand.js:164" />

Undo the command.

**Fires**

- `DrawBrushCommand#event:brushremove`

<MemberHeading id="onexecute" depth="3" name="onExecute" sig="onExecute(_event: CustomEvent)" />

<MemberMeta sourceHref="/source/src/command/drawbrushcommand-js/#L193" sourceLabel="drawBrushCommand.js:193" />

Handle an execute event.

**Parameters**

- `_event` (CustomEvent) — The execute event with type and id.

<MemberHeading id="onundo" depth="3" name="onUndo" sig="onUndo(_event: CustomEvent)" />

<MemberMeta sourceHref="/source/src/command/drawbrushcommand-js/#L202" sourceLabel="drawBrushCommand.js:202" />

Handle an undo event.

**Parameters**

- `_event` (CustomEvent) — The undo event with type and id.

## Events

<MemberHeading id="brushdraw" depth="3" name="brushdraw" sig="brushdraw: object" />

<MemberMeta badges="event" sourceHref="/source/src/command/drawbrushcommand-js/#L155" sourceLabel="drawBrushCommand.js:155" />

Draw create event.

**Properties**

- `id` (number) — The id of the created brush.
