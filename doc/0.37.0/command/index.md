---
title: Command
kind: class
longname: Command
description: Command interface.
---

# Command

<SourceLink href="/source/src/command/undostack-js/#L4" label="undoStack.js:4" />

Command interface.

---

## Constructor

<Signature code="new Command(): Command" />

---

## Instance Methods

<MemberHeading id="getname" depth="3" name="getName" sig="getName(): string" />

<MemberMeta sourceHref="/source/src/command/undostack-js/#L10" sourceLabel="undoStack.js:10" />

Get the command name.

**Returns**

- `string` — The command name.

<MemberHeading id="execute" depth="3" name="execute" sig="execute()" />

<MemberMeta sourceHref="/source/src/command/undostack-js/#L16" sourceLabel="undoStack.js:16" />

Execute the command.

<MemberHeading id="undo" depth="3" name="undo" sig="undo()" />

<MemberMeta sourceHref="/source/src/command/undostack-js/#L20" sourceLabel="undoStack.js:20" />

Undo the command.
