---
title: RunFilterCommand
kind: class
longname: RunFilterCommand
description: Run filter command.
---

# RunFilterCommand

<SourceLink href="/source/src/command/runfiltercommand-js/#L10" label="runFilterCommand.js:10" />

Run filter command.

---

## Constructor

<Signature
  code="new RunFilterCommand(
	filter: object,
	dataId: string,
	app: App,
): RunFilterCommand"
/>

**Parameters**

- `filter` (object) — The filter to run.
- `dataId` (string) — The data to filter.
- `app` ([App](/app)) — The associated application.

---

## Instance Methods

<MemberHeading id="getname" depth="3" name="getName" sig="getName(): string" />

<MemberMeta sourceHref="/source/src/command/runfiltercommand-js/#L50" sourceLabel="runFilterCommand.js:50" />

Get the command name.

**Returns**

- `string` — The command name.

<MemberHeading id="execute" depth="3" name="execute" sig="execute()" />

<MemberMeta sourceHref="/source/src/command/runfiltercommand-js/#L59" sourceLabel="runFilterCommand.js:59" />

Execute the command.

**Fires**

- `RunFilterCommand#event:filterrun`

<MemberHeading id="undo" depth="3" name="undo" sig="undo()" />

<MemberMeta sourceHref="/source/src/command/runfiltercommand-js/#L87" sourceLabel="runFilterCommand.js:87" />

Undo the command.

**Fires**

- `RunFilterCommand#event:filterundo`

<MemberHeading id="onexecute" depth="3" name="onExecute" sig="onExecute(_event: object)" />

<MemberMeta sourceHref="/source/src/command/runfiltercommand-js/#L114" sourceLabel="runFilterCommand.js:114" />

Handle an execute event.

**Parameters**

- `_event` (object) — The execute event with type and id.

<MemberHeading id="onundo" depth="3" name="onUndo" sig="onUndo(_event: object)" />

<MemberMeta sourceHref="/source/src/command/runfiltercommand-js/#L123" sourceLabel="runFilterCommand.js:123" />

Handle an undo event.

**Parameters**

- `_event` (object) — The undo event with type and id.

## Events

<MemberHeading id="filterrun" depth="3" name="filterrun" sig="filterrun: object" />

<MemberMeta badges="event" sourceHref="/source/src/command/runfiltercommand-js/#L73" sourceLabel="runFilterCommand.js:73" />

Filter run event.

**Properties**

- `type` (string) — The event type: filterrun.
- `id` (number) — The id of the run command.

<MemberHeading id="filterundo" depth="3" name="filterundo" sig="filterundo: object" />

<MemberMeta badges="event" sourceHref="/source/src/command/runfiltercommand-js/#L101" sourceLabel="runFilterCommand.js:101" />

Filter undo event.

**Properties**

- `type` (string) — The event type: filterundo.
- `id` (number) — The id of the undone run command.
