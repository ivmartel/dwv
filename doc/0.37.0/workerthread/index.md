---
title: WorkerThread
kind: class
longname: WorkerThread
description: Worker thread.
---

# WorkerThread

<SourceLink href="/source/src/utils/thread-js/#L271" label="thread.js:271" />

Worker thread.

---

## Constructor

<Signature code="new WorkerThread(parentPool: ThreadPool): WorkerThread" />

**Parameters**

- `parentPool` ([ThreadPool](/threadpool)) — The parent pool.

---

## Instance Methods

<MemberHeading id="getid" depth="3" name="getId" sig="getId(): string" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L303" sourceLabel="thread.js:303" />

Get the thread ID.

**Returns**

- `string` — The thread ID (alphanumeric).

<MemberHeading id="run" depth="3" name="run" sig="run(workerTask: WorkerTask)" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L312" sourceLabel="thread.js:312" />

Run a worker task.

**Parameters**

- `workerTask` ([WorkerTask](/workertask)) — The task to run.

<MemberHeading id="stop" depth="3" name="stop" sig="stop()" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L330" sourceLabel="thread.js:330" />

Finish a task.

## Instance Fields

<MemberHeading id="parentpool" depth="3" name="parentPool" sig="parentPool: ThreadPool" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L275" sourceLabel="thread.js:275" />

<MemberHeading id="id" depth="3" name="id" sig="id: string" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L279" sourceLabel="thread.js:279" />

<MemberHeading id="runningtask" depth="3" name="runningTask" sig="runningTask: WorkerTask" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L283" sourceLabel="thread.js:283" />

<MemberHeading id="worker" depth="3" name="worker" sig="worker: Worker" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L287" sourceLabel="thread.js:287" />

<MemberHeading id="onmessage" depth="3" name="onmessage" sig="onmessage" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L347" sourceLabel="thread.js:347" />

Message event handler. For now assume we only get a single callback from a worker which also indicates the end of this worker.

**Parameters**

- `event` (object) — The message event.

<MemberHeading id="onerror" depth="3" name="onerror" sig="onerror" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L364" sourceLabel="thread.js:364" />

Error event handler.

**Parameters**

- `event` (object) — The error event.
