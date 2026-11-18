---
title: AddAnnotationCommand
kind: class
longname: AddAnnotationCommand
description: Add annotation command.
---

# AddAnnotationCommand

<SourceLink href="/source/src/command/drawcommands-js/#L11" label="drawCommands.js:11" />

Add annotation command.

---

## Constructor

<Signature
  code="new AddAnnotationCommand(
	annotation: Annotation,
	drawController: DrawController,
): AddAnnotationCommand"
/>

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation to add.
- `drawController` ([DrawController](/drawcontroller)) — The associated draw controller.

---

## Instance Methods

<MemberHeading id="getname" depth="3" name="getName" sig="getName(): string" />

<MemberMeta sourceHref="/source/src/command/drawcommands-js/#L37" sourceLabel="drawCommands.js:37" />

Get the command name.

**Returns**

- `string` — The command name.

<MemberHeading id="execute" depth="3" name="execute" sig="execute()" />

<MemberMeta sourceHref="/source/src/command/drawcommands-js/#L44" sourceLabel="drawCommands.js:44" />

Execute the command.

<MemberHeading id="undo" depth="3" name="undo" sig="undo()" />

<MemberMeta sourceHref="/source/src/command/drawcommands-js/#L51" sourceLabel="drawCommands.js:51" />

Undo the command.
