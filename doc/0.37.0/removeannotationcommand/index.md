---
title: RemoveAnnotationCommand
kind: class
longname: RemoveAnnotationCommand
description: Remove annotation command.
---

# RemoveAnnotationCommand

<SourceLink href="/source/src/command/drawcommands-js/#L59" label="drawCommands.js:59" />

Remove annotation command.

---

## Constructor

<Signature
  code="new RemoveAnnotationCommand(
	annotation: Annotation,
	drawController: DrawController,
): RemoveAnnotationCommand"
/>

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation to remove.
- `drawController` ([DrawController](/drawcontroller)) — The associated draw controller.

---

## Instance Methods

<MemberHeading id="getname" depth="3" name="getName" sig="getName(): string" />

<MemberMeta sourceHref="/source/src/command/drawcommands-js/#L85" sourceLabel="drawCommands.js:85" />

Get the command name.

**Returns**

- `string` — The command name.

<MemberHeading id="execute" depth="3" name="execute" sig="execute()" />

<MemberMeta sourceHref="/source/src/command/drawcommands-js/#L92" sourceLabel="drawCommands.js:92" />

Execute the command.

<MemberHeading id="undo" depth="3" name="undo" sig="undo()" />

<MemberMeta sourceHref="/source/src/command/drawcommands-js/#L99" sourceLabel="drawCommands.js:99" />

Undo the command.
