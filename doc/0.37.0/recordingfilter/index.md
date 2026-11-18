---
title: RecordingFilter
kind: class
longname: RecordingFilter
description: Filter entry that stores listeners like shape/DOM-style APIs used by {@link Filter}.
---

# RecordingFilter

<SourceLink href="/source/tests/tools/filter-test-js/#L94" label="filter.test.js:94" />

Filter entry that stores listeners like shape/DOM-style APIs used by [Filter](/filter).

---

## Constructor

<Signature code="new RecordingFilter(app: object): RecordingFilter" />

**Parameters**

- `app` (object) — Associated application.

---

## Instance Methods

<MemberHeading id="addeventlistener" depth="3" name="addEventListener" sig="addEventListener(type: string, cb: function)" />

<MemberMeta sourceHref="/source/tests/tools/filter-test-js/#L113" sourceLabel="filter.test.js:113" />

**Parameters**

- `type` (string) — Event type.
- `cb` (function) — Callback.

<MemberHeading id="removeeventlistener" depth="3" name="removeEventListener" sig="removeEventListener(type: string, cb: function)" />

<MemberMeta sourceHref="/source/tests/tools/filter-test-js/#L123" sourceLabel="filter.test.js:123" />

**Parameters**

- `type` (string) — Event type.
- `cb` (function) — Callback.

<MemberHeading id="emit" depth="3" name="emit" sig="emit(type: string, payload: object)" />

<MemberMeta sourceHref="/source/tests/tools/filter-test-js/#L138" sourceLabel="filter.test.js:138" />

**Parameters**

- `type` (string) — Event type.
- `payload` (object) — Event payload.
