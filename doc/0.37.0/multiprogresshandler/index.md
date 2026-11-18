---
title: MultiProgressHandler
kind: class
longname: MultiProgressHandler
description: Multiple progresses handler. Stores a multi dimensional list of progresses to allow to calculate a global progress.
---

# MultiProgressHandler

<SourceLink href="/source/src/utils/progress-js/#L7" label="progress.js:7" />

Multiple progresses handler. Stores a multi dimensional list of progresses to allow to calculate a global progress.

---

## Constructor

<Signature
  code="new MultiProgressHandler(
	callback: function,
): MultiProgressHandler"
/>

**Parameters**

- `callback` (function) — The function to pass the global progress to.

---

## Instance Methods

<MemberHeading id="setnumberofdimensions" depth="3" name="setNumberOfDimensions" sig="setNumberOfDimensions(num: number)" />

<MemberMeta sourceHref="/source/src/utils/progress-js/#L46" sourceLabel="progress.js:46" />

Set the number of dimensions.

**Parameters**

- `num` (number) — The number.

<MemberHeading id="setntoload" depth="3" name="setNToLoad" sig="setNToLoad(n: number)" />

<MemberMeta sourceHref="/source/src/utils/progress-js/#L55" sourceLabel="progress.js:55" />

Set the number of data to load.

**Parameters**

- `n` (number) — The number of data to load.

<MemberHeading id="getmonoprogresshandler" depth="3" name="getMonoProgressHandler" sig="getMonoProgressHandler(index: number, subindex: number): eventFn" />

<MemberMeta sourceHref="/source/src/utils/progress-js/#L148" sourceLabel="progress.js:148" />

Create a mono progress event handler.

**Parameters**

- `index` (number) — The index of the data.
- `subindex` (number) — The sub-index of the data.

**Returns**

- [`eventFn`](/eventfn) — A progress handler function.

<MemberHeading id="getundefinedmonoprogresshandler" depth="3" name="getUndefinedMonoProgressHandler" sig="getUndefinedMonoProgressHandler(subindex: number): eventFn" />

<MemberMeta sourceHref="/source/src/utils/progress-js/#L163" sourceLabel="progress.js:163" />

Create a mono progress event handler with an undefined index. Warning: The caller handles the progress index.

**Parameters**

- `subindex` (number) — The sub-index of the data.

**Returns**

- [`eventFn`](/eventfn) — A progress handler function.

## Instance Fields

<MemberHeading id="onprogress" depth="3" name="onprogress" sig="onprogress" />

<MemberMeta sourceHref="/source/src/utils/progress-js/#L70" sourceLabel="progress.js:70" />

Handle a load progress. Call the member callback with a global event.

**Parameters**

- `event` (object) — The progress event.
