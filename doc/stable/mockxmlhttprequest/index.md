---
title: MockXMLHttpRequest
kind: class
longname: MockXMLHttpRequest
description: Test double for XMLHttpRequest used by UrlsLoader .
---

# MockXMLHttpRequest

<SourceLink href="/source/tests/io/urlsloader-test-js/#L10" label="urlsLoader.test.js:10" />

Test double for `XMLHttpRequest` used by `UrlsLoader`.

---

## Constructor

<Signature code="new MockXMLHttpRequest(): MockXMLHttpRequest" />

Create a mock XHR instance and track it.

---

## Instance Methods

<MemberHeading id="open" depth="3" name="open" sig="open(method: string, url: string, async: boolean)" />

<MemberMeta sourceHref="/source/tests/io/urlsloader-test-js/#L48" sourceLabel="urlsLoader.test.js:48" />

Simulate `XMLHttpRequest.open`.

**Parameters**

- `method` (string) — The HTTP method.
- `url` (string) — The request URL.
- `async` (boolean) — The async flag.

<MemberHeading id="setrequestheader" depth="3" name="setRequestHeader" sig="setRequestHeader(name: string, value: string)" />

<MemberMeta sourceHref="/source/tests/io/urlsloader-test-js/#L62" sourceLabel="urlsLoader.test.js:62" />

Simulate adding an HTTP request header.

**Parameters**

- `name` (string) — Header name.
- `value` (string) — Header value.

<MemberHeading id="send" depth="3" name="send" sig="send()" />

<MemberMeta sourceHref="/source/tests/io/urlsloader-test-js/#L69" sourceLabel="urlsLoader.test.js:69" />

Simulate request execution according to configured behavior.

<MemberHeading id="abort" depth="3" name="abort" sig="abort()" />

<MemberMeta sourceHref="/source/tests/io/urlsloader-test-js/#L135" sourceLabel="urlsLoader.test.js:135" />

Simulate aborting an in-flight request.
