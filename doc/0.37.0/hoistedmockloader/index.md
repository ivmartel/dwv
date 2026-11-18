---
title: HoistedMockLoader
kind: class
longname: HoistedMockLoader
description: Test double for the IO loaders used by the load controller. Callbacks are driven manually by the tests.
---

# HoistedMockLoader

<SourceLink href="/source/tests/app/loadcontroller-test-js/#L8" label="loadController.test.js:8" />

Test double for the IO loaders used by the load controller. Callbacks are driven manually by the tests.

---

## Constructor

<Signature code="new HoistedMockLoader(): HoistedMockLoader" />

Create a mock loader and keep track of it.

---

## Instance Methods

<MemberHeading id="setdefaultcharacterset" depth="3" name="setDefaultCharacterSet" sig="setDefaultCharacterSet(charset: string)" />

<MemberMeta sourceHref="/source/tests/app/loadcontroller-test-js/#L41" sourceLabel="loadController.test.js:41" />

Store the default character set.

**Parameters**

- `charset` (string) — The character set.

<MemberHeading id="load" depth="3" name="load" sig="load(data: Array, options?: object)" />

<MemberMeta sourceHref="/source/tests/app/loadcontroller-test-js/#L51" sourceLabel="loadController.test.js:51" />

Store the load arguments, throw if configured to.

**Parameters**

- `data` (Array) — The data to load.
- `options` (object, optional) — The load options.

<MemberHeading id="abort" depth="3" name="abort" sig="abort()" />

<MemberMeta sourceHref="/source/tests/app/loadcontroller-test-js/#L61" sourceLabel="loadController.test.js:61" />

Record abort.

## Static Methods

<MemberHeading id="reset" depth="3" name="reset" sig="reset()" />

<MemberMeta badges="static" sourceHref="/source/tests/app/loadcontroller-test-js/#L30" sourceLabel="loadController.test.js:30" />

Reset static state between tests.
