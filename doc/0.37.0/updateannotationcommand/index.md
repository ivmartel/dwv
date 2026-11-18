---
title: UpdateAnnotationCommand
kind: class
longname: UpdateAnnotationCommand
description: Update annotation command.
---

# UpdateAnnotationCommand

<SourceLink href="/source/src/command/drawcommands-js/#L107" label="drawCommands.js:107" />

Update annotation command.

---

## Constructor

<Signature
  code="new UpdateAnnotationCommand(
	annotation: Annotation,
	originaProps: object,
	newProps: object,
	drawController: DrawController,
): UpdateAnnotationCommand"
/>

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation to update.
- `originaProps` (object) — The original annotation properties.
- `newProps` (object) — The new annotation properties.
- `drawController` ([DrawController](/drawcontroller)) — The associated draw controller.

---

## Instance Methods

<MemberHeading id="getname" depth="3" name="getName" sig="getName(): string" />

<MemberMeta sourceHref="/source/src/command/drawcommands-js/#L151" sourceLabel="drawCommands.js:151" />

Get the command name.

**Returns**

- `string` — The command name.

<MemberHeading id="execute" depth="3" name="execute" sig="execute()" />

<MemberMeta sourceHref="/source/src/command/drawcommands-js/#L158" sourceLabel="drawCommands.js:158" />

Execute the command.

<MemberHeading id="undo" depth="3" name="undo" sig="undo()" />

<MemberMeta sourceHref="/source/src/command/drawcommands-js/#L169" sourceLabel="drawCommands.js:169" />

Undo the command.
