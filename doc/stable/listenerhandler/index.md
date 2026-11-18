---
title: ListenerHandler
kind: class
longname: ListenerHandler
description: "ListenerHandler class: handles add/removing and firing listeners. Ref: {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget#example}."
---

# ListenerHandler

<SourceLink href="/source/src/utils/listen-js/#L8" label="listen.js:8" />

ListenerHandler class: handles add/removing and firing listeners.

Ref: [https://developer.mozilla.org/en-US/docs/Web/API/EventTarget#example](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget#example).

---

## Constructor

<Signature code="new ListenerHandler(): ListenerHandler" />

---

## Instance Methods

<MemberHeading id="add" depth="3" name="add" sig="add(type: string, callback: object)" />

<MemberMeta sourceHref="/source/src/utils/listen-js/#L23" sourceLabel="listen.js:23" />

Add an event listener.

**Parameters**

- `type` (string) — The event type.
- `callback` (object) — The method associated with the provided event type, will be called with the fired event.

<MemberHeading id="remove" depth="3" name="remove" sig="remove(type: string, callback: object)" />

<MemberMeta sourceHref="/source/src/utils/listen-js/#L39" sourceLabel="listen.js:39" />

Remove an event listener.

**Parameters**

- `type` (string) — The event type.
- `callback` (object) — The method associated with the provided event type.

## Instance Fields

<MemberHeading id="fireevent" depth="3" name="fireEvent" sig="fireEvent" />

<MemberMeta sourceHref="/source/src/utils/listen-js/#L62" sourceLabel="listen.js:62" />

Fire an event: call all associated listeners with the input event object.

**Parameters**

- `event` (object) — The event to fire.
