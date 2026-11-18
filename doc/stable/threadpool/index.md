---
title: ThreadPool
kind: class
longname: ThreadPool
description: Thread Pool. Highly inspired from {@link http://www.smartjava.org/content/html5-easily-parallelize-jobs-using-web-workers-and-threadpool}.
---

# ThreadPool

<SourceLink href="/source/src/utils/thread-js/#L62" label="thread.js:62" />

Thread Pool.

Highly inspired from [http://www.smartjava.org/content/html5-easily-parallelize-jobs-using-web-workers-and-threadpool](http://www.smartjava.org/content/html5-easily-parallelize-jobs-using-web-workers-and-threadpool).

---

## Constructor

<Signature code="new ThreadPool(poolSize?: number): ThreadPool" />

**Parameters**

- `poolSize` (number, optional) — The size of the pool, defaults to [getDefaultPoolSize](/global#getdefaultpoolsize). Must be a positive integer, it is clamped to the number of logical processors if available.

---

## Instance Methods

<MemberHeading id="addworkertask" depth="3" name="addWorkerTask" sig="addWorkerTask(workerTask: WorkerTask)" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L121" sourceLabel="thread.js:121" />

Add a worker task to the queue. Will be run when a thread is made available.

**Parameters**

- `workerTask` ([WorkerTask](/workertask)) — The task to add to the queue.

<MemberHeading id="abort" depth="3" name="abort" sig="abort()" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L143" sourceLabel="thread.js:143" />

Abort all threads.

<MemberHeading id="ontaskend" depth="3" name="onTaskEnd" sig="onTaskEnd(workerThread: WorkerThread)" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L158" sourceLabel="thread.js:158" />

Handle a task end.

**Parameters**

- `workerThread` ([WorkerThread](/workerthread)) — The thread to free.

<MemberHeading id="onworkstart" depth="3" name="onworkstart" sig="onworkstart(_event: object)" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L213" sourceLabel="thread.js:213" />

Handle a work start event. Default does nothing.

**Parameters**

- `_event` (object) — The work start event.

<MemberHeading id="onworkitem" depth="3" name="onworkitem" sig="onworkitem(_event: object)" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L222" sourceLabel="thread.js:222" />

Handle a work item event. Default does nothing.

**Parameters**

- `_event` (object) — The work item event fired when a work item ended successfully.

<MemberHeading id="onwork" depth="3" name="onwork" sig="onwork(_event: object)" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L231" sourceLabel="thread.js:231" />

Handle a work event. Default does nothing.

**Parameters**

- `_event` (object) — The work event fired when a work ended successfully.

<MemberHeading id="onworkend" depth="3" name="onworkend" sig="onworkend(_event: object)" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L240" sourceLabel="thread.js:240" />

Handle a work end event. Default does nothing.

**Parameters**

- `_event` (object) — The work end event fired when a work has completed, successfully or not.

<MemberHeading id="onerror" depth="3" name="onerror" sig="onerror(_event: object)" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L248" sourceLabel="thread.js:248" />

Handle an error event. Default does nothing.

**Parameters**

- `_event` (object) — The error event.

<MemberHeading id="onabort" depth="3" name="onabort" sig="onabort(_event: object)" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L256" sourceLabel="thread.js:256" />

Handle an abort event. Default does nothing.

**Parameters**

- `_event` (object) — The abort event.

## Instance Fields

<MemberHeading id="handleworkererror" depth="3" name="handleWorkerError" sig="handleWorkerError" />

<MemberMeta sourceHref="/source/src/utils/thread-js/#L187" sourceLabel="thread.js:187" />

Handle an error message from a worker.

**Parameters**

- `event` (object) — The error event.
