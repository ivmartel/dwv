---
title: MockVideo
kind: class
longname: MockVideo
description: Minimal mock of an HTMLVideoElement that supports manual seeked dispatch. Setting currentTime does NOT auto-fire; call fireSeeked() from the test.
---

# MockVideo

<SourceLink href="/source/tests/image/domreader-test-js/#L70" label="domReader.test.js:70" />

Minimal mock of an HTMLVideoElement that supports manual `seeked` dispatch. Setting `currentTime` does NOT auto-fire; call `fireSeeked()` from the test.

---

## Constructor

<Signature code="new MockVideo(w: number, h: number, duration: number): MockVideo" />

**Parameters**

- `w` (number) — Video width in pixels.
- `h` (number) — Video height in pixels.
- `duration` (number) — Duration in seconds.

---

## Instance Methods

<MemberHeading id="addeventlistener" depth="3" name="addEventListener" sig="addEventListener(event: string, handler: function)" />

<MemberMeta sourceHref="/source/tests/image/domreader-test-js/#L95" sourceLabel="domReader.test.js:95" />

Register a seeked event handler.

**Parameters**

- `event` (string) — Event name.
- `handler` (function) — Handler function.

<MemberHeading id="removeeventlistener" depth="3" name="removeEventListener" sig="removeEventListener(event: string, handler: function)" />

<MemberMeta sourceHref="/source/tests/image/domreader-test-js/#L107" sourceLabel="domReader.test.js:107" />

Remove a seeked event handler.

**Parameters**

- `event` (string) — Event name.
- `handler` (function) — Handler function.

<MemberHeading id="fireseeked" depth="3" name="fireSeeked" sig="fireSeeked()" />

<MemberMeta sourceHref="/source/tests/image/domreader-test-js/#L118" sourceLabel="domReader.test.js:118" />

Simulate the browser firing a `seeked` event. The handler is called with `this` bound to the video element.

## Instance Fields

<MemberHeading id="seekedhandlercount" depth="3" name="seekedHandlerCount" sig="seekedHandlerCount" />

<MemberMeta sourceHref="/source/tests/image/domreader-test-js/#L130" sourceLabel="domReader.test.js:130" />

Return the number of currently registered seeked handlers.

**Returns**

- `number` — Handler count.
