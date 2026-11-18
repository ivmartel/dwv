---
title: LayerGroupPointer
kind: class
longname: LayerGroupPointer
description: Normalises layer mouse/touch input into a single-pointer drag lifecycle. Per-move deltas are computed inside {@link DragBehavior#onUpdate}. Hover ({@link HoverBehavior}) is driven from mouse events only, not touch. Extends {@link EventTarget} so subclasses (tools) can use addEventListener / dispatchEvent like other UI tools. Event entry points use the same names as tools ( mousedown , mousemove , wheel , dblclick , …). Those handlers are arrow functions so they stay bound when the toolbox invokes them as bare callbacks ( func(event) ). preventDefault is only called on the NonPassiveInteractionEventNames (from gui/generic.js ), the events the layers listen to as not passive.
---

# LayerGroupPointer

<SourceLink href="/source/src/tools/layergrouppointer-js/#L85" label="layerGroupPointer.js:85" />

Normalises layer mouse/touch input into a single-pointer drag lifecycle. Per-move deltas are computed inside [DragBehavior#onUpdate](/dragbehavior#onupdate). Hover ([HoverBehavior](/hoverbehavior)) is driven from mouse events only, not touch.

Extends `EventTarget` so subclasses (tools) can use `addEventListener` / `dispatchEvent` like other UI tools.

Event entry points use the same names as tools (`mousedown`, `mousemove`, `wheel`, `dblclick`, …). Those handlers are arrow functions so they stay bound when the toolbox invokes them as bare callbacks (`func(event)`).

`preventDefault` is only called on the `NonPassiveInteractionEventNames` (from `gui/generic.js`), the events the layers listen to as not passive.

---

## Constructor

<Signature
  code="new LayerGroupPointer(
	options: LayerGroupPointerOptions,
): LayerGroupPointer"
/>

**Parameters**

- `options` ([LayerGroupPointerOptions](/layergrouppointeroptions)) — Constructor options.

---

## Instance Methods

<MemberHeading id="geteventnames" depth="3" name="getEventNames" sig="getEventNames(): Array.<string>" />

<MemberMeta sourceHref="/source/src/tools/layergrouppointer-js/#L239" sourceLabel="layerGroupPointer.js:239" />

Get the list of event names that this tool can fire. Default implementation returns an empty array.

**Returns**

- `Array.<string>` — The list of event names.

<MemberHeading id="cancel" depth="3" name="cancel" sig="cancel()" />

<MemberMeta sourceHref="/source/src/tools/layergrouppointer-js/#L306" sourceLabel="layerGroupPointer.js:306" />

End behaviors that have end method.

## Instance Fields

<MemberHeading id="wheel" depth="3" name="wheel" sig="wheel" />

<MemberMeta sourceHref="/source/src/tools/layergrouppointer-js/#L249" sourceLabel="layerGroupPointer.js:249" />

Handle mouse wheel. Prevents the default (page scroll) only when the tool has a wheel behaviour.

**Parameters**

- `event` (WheelEvent) — The mouse wheel event.

<MemberHeading id="dblclick" depth="3" name="dblclick" sig="dblclick" />

<MemberMeta sourceHref="/source/src/tools/layergrouppointer-js/#L271" sourceLabel="layerGroupPointer.js:271" />

**Parameters**

- `event` (MouseEvent) — The double click event.

<MemberHeading id="mousedown" depth="3" name="mousedown" sig="mousedown" />

<MemberMeta sourceHref="/source/src/tools/layergrouppointer-js/#L332" sourceLabel="layerGroupPointer.js:332" />

Handle mouse down.

**Parameters**

- `event` (MouseEvent) — The mouse down event.

<MemberHeading id="mousemove" depth="3" name="mousemove" sig="mousemove" />

<MemberMeta sourceHref="/source/src/tools/layergrouppointer-js/#L359" sourceLabel="layerGroupPointer.js:359" />

Handle mouse move.

**Parameters**

- `event` (MouseEvent) — The mouse move event.

<MemberHeading id="mouseup" depth="3" name="mouseup" sig="mouseup" />

<MemberMeta sourceHref="/source/src/tools/layergrouppointer-js/#L388" sourceLabel="layerGroupPointer.js:388" />

Handle mouse up.

**Parameters**

- `event` (MouseEvent) — The mouse up event.

<MemberHeading id="mouseout" depth="3" name="mouseout" sig="mouseout" />

<MemberMeta sourceHref="/source/src/tools/layergrouppointer-js/#L420" sourceLabel="layerGroupPointer.js:420" />

**Parameters**

- `_event` (MouseEvent) — The mouse out event.

<MemberHeading id="touchstart" depth="3" name="touchstart" sig="touchstart" />

<MemberMeta sourceHref="/source/src/tools/layergrouppointer-js/#L447" sourceLabel="layerGroupPointer.js:447" />

Handle touch start. Always prevents the default to stop the browser from scrolling or zooming the page and from emulating mouse events (which would be handled a second time by the mouse handlers).

**Parameters**

- `event` (TouchEvent) — The touch start event.

<MemberHeading id="touchmove" depth="3" name="touchmove" sig="touchmove" />

<MemberMeta sourceHref="/source/src/tools/layergrouppointer-js/#L483" sourceLabel="layerGroupPointer.js:483" />

**Parameters**

- `event` (TouchEvent) — The touch move event.

<MemberHeading id="touchend" depth="3" name="touchend" sig="touchend" />

<MemberMeta sourceHref="/source/src/tools/layergrouppointer-js/#L510" sourceLabel="layerGroupPointer.js:510" />

**Parameters**

- `event` (TouchEvent) — The touch end event.

<MemberHeading id="touchcancel" depth="3" name="touchcancel" sig="touchcancel" />

<MemberMeta sourceHref="/source/src/tools/layergrouppointer-js/#L551" sourceLabel="layerGroupPointer.js:551" />

Handle touch cancel: the browser or the system interrupted the touch (for example an incoming call or an OS gesture), end it with [LayerGroupPointer#cancel](/layergrouppointer#cancel).

**Parameters**

- `_event` (TouchEvent) — The touch cancel event.
