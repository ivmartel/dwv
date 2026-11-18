---
title: TestCommand
kind: class
longname: module:tests/app~TestCommand
description: Test command that records its execute/undo calls.
---

# TestCommand

<SourceLink href="/source/tests/app/undocontroller-test-js/#L15" label="undoController.test.js:15" />

Test command that records its execute/undo calls.

---

## Constructor

<Signature code="new TestCommand(name: string): TestCommand" />

**Parameters**

- `name` (string) — The command name.

---

## Instance Methods

<MemberHeading id="getname" depth="3" name="getName" sig="getName(): string" />

<MemberMeta sourceHref="/source/tests/app/undocontroller-test-js/#L31" sourceLabel="undoController.test.js:31" />

Get the command name.

**Returns**

- `string` — The command name.

<MemberHeading id="execute" depth="3" name="execute" sig="execute()" />

<MemberMeta sourceHref="/source/tests/app/undocontroller-test-js/#L38" sourceLabel="undoController.test.js:38" />

Execute the command.

<MemberHeading id="undo" depth="3" name="undo" sig="undo()" />

<MemberMeta sourceHref="/source/tests/app/undocontroller-test-js/#L45" sourceLabel="undoController.test.js:45" />

Undo the command.
