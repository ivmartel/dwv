---
title: Filter
kind: class
longname: Filter
description: Filter tool.
---

# Filter

<SourceLink href="/source/src/tools/filter-js/#L15" label="filter.js:15" />

Filter tool.

---

## Constructor

<Signature code="new Filter(app: App): Filter" />

**Parameters**

- `app` ([App](/app)) — The associated application.

---

## Instance Methods

<MemberHeading id="activate" depth="3" name="activate" sig="activate(bool: boolean)" />

<MemberMeta sourceHref="/source/src/tools/filter-js/#L60" sourceLabel="filter.js:60" />

Activate the tool.

**Parameters**

- `bool` (boolean) — Flag to activate or not.

<MemberHeading id="setoptions" depth="3" name="setOptions" sig="setOptions(options: object)" />

<MemberMeta sourceHref="/source/src/tools/filter-js/#L82" sourceLabel="filter.js:82" />

Set the tool options.

**Parameters**

- `options` (object) — The list of filter names amd classes.

<MemberHeading id="getoptionstype" depth="3" name="getOptionsType" sig="getOptionsType(): string" />

<MemberMeta sourceHref="/source/src/tools/filter-js/#L96" sourceLabel="filter.js:96" />

Get the type of tool options: here 'instance' since the filter list contains instances of each possible filter.

**Returns**

- `string` — The type.

<MemberHeading id="init" depth="3" name="init" sig="init()" />

<MemberMeta sourceHref="/source/src/tools/filter-js/#L103" sourceLabel="filter.js:103" />

Initialise the filter. Called once the image is loaded.

<MemberHeading id="geteventnames" depth="3" name="getEventNames" sig="getEventNames(): Array.<string>" />

<MemberMeta sourceHref="/source/src/tools/filter-js/#L125" sourceLabel="filter.js:125" />

Get the list of event names that this tool can fire.

**Returns**

- `Array.<string>` — The list of event names.

<MemberHeading id="getselectedfilter" depth="3" name="getSelectedFilter" sig="getSelectedFilter(): object" />

<MemberMeta sourceHref="/source/src/tools/filter-js/#L134" sourceLabel="filter.js:134" />

Get the selected filter.

**Returns**

- `object` — The selected filter.

<MemberHeading id="setfeatures" depth="3" name="setFeatures" sig="setFeatures(features: object)" />

<MemberMeta sourceHref="/source/src/tools/filter-js/#L143" sourceLabel="filter.js:143" />

Set the tool live features: filter name.

**Parameters**

- `features` (object) — The list of features.

<MemberHeading id="getfilterlist" depth="3" name="getFilterList" sig="getFilterList(): object | undefined" />

<MemberMeta sourceHref="/source/src/tools/filter-js/#L172" sourceLabel="filter.js:172" />

Get the list of filters.

**Returns**

- `object | undefined` — The list of filter objects.

<MemberHeading id="hasfilter" depth="3" name="hasFilter" sig="hasFilter(name: string): boolean" />

<MemberMeta sourceHref="/source/src/tools/filter-js/#L182" sourceLabel="filter.js:182" />

Check if a filter is in the filter list.

**Parameters**

- `name` (string) — The name to check.

**Returns**

- `boolean` — True if the filter is present.

## Instance Fields

<MemberHeading id="keydown" depth="3" name="keydown" sig="keydown" />

<MemberMeta sourceHref="/source/src/tools/filter-js/#L115" sourceLabel="filter.js:115" />

Handle keydown event.

**Parameters**

- `event` (object) — The keydown event.
