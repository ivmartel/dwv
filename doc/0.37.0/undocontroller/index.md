---
title: UndoController
kind: class
longname: UndoController
description: Undo controller.
---

# UndoController

<SourceLink href="/source/src/app/undocontroller-js/#L18" label="undoController.js:18" />

Undo controller.

---

## Constructor

<Signature code="new UndoController(): UndoController" />

Constructor.

---

## Instance Methods

<MemberHeading id="addtoundostack" depth="3" name="addToUndoStack" sig="addToUndoStack(cmd: object)" />

<MemberMeta sourceHref="/source/src/app/undocontroller-js/#L42" sourceLabel="undoController.js:42" />

Add a command to the undo stack.

**Parameters**

- `cmd` (object) — The command to add.

**Fires**

- `UndoStack#event:undoadd`

<MemberHeading id="removefromundostack" depth="3" name="removeFromUndoStack" sig="removeFromUndoStack(name: string): boolean" />

<MemberMeta sourceHref="/source/src/app/undocontroller-js/#L54" sourceLabel="undoController.js:54" />

Remove a command from the undo stack.

**Parameters**

- `name` (string) — The name of the command to remove.

**Returns**

- `boolean` — True if the command was found and removed.

**Fires**

- `UndoStack#event:undoremove`

<MemberHeading id="undo" depth="3" name="undo" sig="undo()" />

<MemberMeta sourceHref="/source/src/app/undocontroller-js/#L63" sourceLabel="undoController.js:63" />

Undo the last command.

**Fires**

- `UndoStack#event:undo`

<MemberHeading id="redo" depth="3" name="redo" sig="redo()" />

<MemberMeta sourceHref="/source/src/app/undocontroller-js/#L72" sourceLabel="undoController.js:72" />

Redo the next command.

**Fires**

- `UndoStack#event:redo`

<MemberHeading id="getstacksize" depth="3" name="getStackSize" sig="getStackSize(): number" />

<MemberMeta sourceHref="/source/src/app/undocontroller-js/#L81" sourceLabel="undoController.js:81" />

Get the undo stack size.

**Returns**

- `number` — The size of the stack.

<MemberHeading id="getcurrentstackindex" depth="3" name="getCurrentStackIndex" sig="getCurrentStackIndex(): number" />

<MemberMeta sourceHref="/source/src/app/undocontroller-js/#L90" sourceLabel="undoController.js:90" />

Get the current undo stack index.

**Returns**

- `number` — The stack index.

<MemberHeading id="reset" depth="3" name="reset" sig="reset()" />

<MemberMeta sourceHref="/source/src/app/undocontroller-js/#L97" sourceLabel="undoController.js:97" />

Reset the undo/redo history.
