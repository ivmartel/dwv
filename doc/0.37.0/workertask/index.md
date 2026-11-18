---
title: WorkerTask
kind: class
longname: WorkerTask
description: Worker task.
---

# WorkerTask

<SourceLink href="/source/src/utils/thread-js/#L380" label="thread.js:380" />

Worker task.

---

## Constructor

<Signature code="new WorkerTask(message: object, info: object): WorkerTask" />

**Parameters**

- `message` (object) — The data to pass to the worker.
- `info` (object) — Information object about the input data.

---

## Instance Methods

<MemberHeading id="getstartmessage" depth="3" name="getStartMessage" sig="getStartMessage(): Object" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L401" sourceLabel="thread.js:401" />

Get the message to post to the worker, called just before running the task. The transferred objects are moved to the worker (no copy) and are no longer usable by the caller. Default returns the start message with no transferred objects.

**Returns**

- `Object` — The message and the list of objects to transfer.

<MemberHeading id="getworker" depth="3" name="getWorker" sig="getWorker(): Worker | undefined" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L411" sourceLabel="thread.js:411" />

Get the task web worker. Defaults returns undefined.

**Returns**

- [`Worker`](/global#worker)` | undefined` — The task worker.

<MemberHeading id="getworker" depth="3" name="getWorker" sig="getWorker(): undefined" />

<MemberMeta sourceHref="/source/tests/image/decoder-test-js/#L22" sourceLabel="decoder.test.js:22" />

**Returns**

- `undefined` — No worker in tests.
