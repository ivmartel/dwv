---
title: WriterRule
kind: class
longname: WriterRule
description: Writer rule.
---

# WriterRule

<SourceLink href="/source/src/dicom/dicomwriter-js/#L53" label="dicomWriter.js:53" />

Writer rule.

---

## Constructor

<Signature code="new WriterRule(action: string): WriterRule" />

**Parameters**

- `action` (string) — The rule action, one of the `WriterRuleActions` values.

---

## Instance Fields

<MemberHeading id="action" depth="3" name="action" sig="action: string" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L59" sourceLabel="dicomWriter.js:59" />

Rule action, one of the `WriterRuleActions` values.

<MemberHeading id="value" depth="3" name="value" sig="value: any | undefined" />

<MemberMeta sourceHref="/source/src/dicom/dicomwriter-js/#L67" sourceLabel="dicomWriter.js:67" />

Optional value to use for replace action. A single value or an array of values for multi-valued elements (for example `['A', 'B']` or a list of sequence items).
