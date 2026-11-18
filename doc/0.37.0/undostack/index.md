---
title: UndoStack
kind: class
longname: UndoStack
description: UndoStack class.
---

# UndoStack

<SourceLink href="/source/src/command/undostack-js/#L26" label="undoStack.js:26" />

UndoStack class.

---

## Constructor

<Signature code="new UndoStack(): UndoStack" />

---

## Instance Methods

<MemberHeading id="getstacksize" depth="3" name="getStackSize" sig="getStackSize(): number" />

<MemberMeta sourceHref="/source/src/command/undostack-js/#L47" sourceLabel="undoStack.js:47" />

Get the stack size.

**Returns**

- `number` — The size of the stack.

<MemberHeading id="getcurrentstackindex" depth="3" name="getCurrentStackIndex" sig="getCurrentStackIndex(): number" />

<MemberMeta sourceHref="/source/src/command/undostack-js/#L57" sourceLabel="undoStack.js:57" />

Get the current stack index. Warning: 1 based.

**Returns**

- `number` — The stack index.

<MemberHeading id="getcurrentcommand" depth="3" name="getCurrentCommand" sig="getCurrentCommand(): Command" />

<MemberMeta sourceHref="/source/src/command/undostack-js/#L66" sourceLabel="undoStack.js:66" />

Get the current command.

**Returns**

- [`Command`](/command) — The command.

<MemberHeading id="add" depth="3" name="add" sig="add(cmd: Command)" />

<MemberMeta sourceHref="/source/src/command/undostack-js/#L76" sourceLabel="undoStack.js:76" />

Add a command to the stack.

**Parameters**

- `cmd` ([Command](/command)) — The command to add.

**Fires**

- `UndoStack#event:undoadd`

<MemberHeading id="remove" depth="3" name="remove" sig="remove(name: string): boolean" />

<MemberMeta sourceHref="/source/src/command/undostack-js/#L99" sourceLabel="undoStack.js:99" />

Remove a command from the stack.

**Parameters**

- `name` (string) — The name of the command to remove.

**Returns**

- `boolean` — True if the command was found and removed.

**Fires**

- `UndoStack#event:undoremove`

<MemberHeading id="undo" depth="3" name="undo" sig="undo()" />

<MemberMeta sourceHref="/source/src/command/undostack-js/#L131" sourceLabel="undoStack.js:131" />

Undo the last command.

**Fires**

- `UndoStack#event:undo`

<MemberHeading id="redo" depth="3" name="redo" sig="redo()" />

<MemberMeta sourceHref="/source/src/command/undostack-js/#L152" sourceLabel="undoStack.js:152" />

Redo the last command.

**Fires**

- `UndoStack#event:redo`

## Events

<MemberHeading id="undoadd" depth="3" name="undoadd" sig="undoadd: Event" />

<MemberMeta badges="event" sourceHref="/source/src/command/undostack-js/#L89" sourceLabel="undoStack.js:89" />

Add command to undo stack event.

<MemberHeading id="undoremove" depth="3" name="undoremove" sig="undoremove: CustomEvent" />

<MemberMeta badges="event" sourceHref="/source/src/command/undostack-js/#L115" sourceLabel="undoStack.js:115" />

Remove command from undo stack event. Get the removed command name from the `event.detail`.

<MemberHeading id="undo" depth="3" name="undo" sig="undo: Event" />

<MemberMeta badges="event" sourceHref="/source/src/command/undostack-js/#L139" sourceLabel="undoStack.js:139" />

Command undo event.

<MemberHeading id="redo" depth="3" name="redo" sig="redo: Event" />

<MemberMeta badges="event" sourceHref="/source/src/command/undostack-js/#L164" sourceLabel="undoStack.js:164" />

Command redo event.
