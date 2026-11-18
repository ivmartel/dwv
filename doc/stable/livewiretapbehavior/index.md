---
title: LivewireTapBehavior
kind: class
longname: LivewireTapBehavior
description: Tap-driven livewire (scissors) ROI placement. Extends {@link TapBehavior} and is driven by {@link LayerGroupPointer} ( onTap commits anchors, onUpdate for preview, onEnd / reset ).
---

# LivewireTapBehavior

<SourceLink href="/source/src/tools/behaviors/livewiretapbehavior-js/#L26" label="livewireTapBehavior.js:26" />

Tap-driven livewire (scissors) ROI placement.

Extends [TapBehavior](/tapbehavior) and is driven by [LayerGroupPointer](/layergrouppointer) (`onTap` commits anchors, `onUpdate` for preview, `onEnd` / `reset`).

---

## Constructor

<Signature
  code="new LivewireTapBehavior(
	app: App,
	style: Style,
	drawSelect: DrawSelect,
): LivewireTapBehavior"
/>

**Parameters**

- `app` ([App](/app)) — The associated application.
- `style` ([Style](/style)) — Drawing style (shared with the tool).
- `drawSelect` ([DrawSelect](/drawselect)) — Hepler for selecting and editing existing shapes.

---

## Instance Methods

<MemberHeading id="setfeatures" depth="3" name="setFeatures" sig="setFeatures(features: object)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/livewiretapbehavior-js/#L112" sourceLabel="livewireTapBehavior.js:112" />

**Parameters**

- `features` (object) — Live features (shape, colour, meta, …).

<MemberHeading id="ontap" depth="3" name="onTap" sig="onTap(point: Point2D, layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/livewiretapbehavior-js/#L187" sourceLabel="livewireTapBehavior.js:187" />

Start or continue tool interaction (tap commit).

**Parameters**

- `point` ([Point2D](/point2d)) — The pointer position.
- `layerGroup` ([LayerGroup](/layergroup)) — The layer group under the pointer.

<MemberHeading id="onupdate" depth="3" name="onUpdate" sig="onUpdate(point: Point2D, layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/livewiretapbehavior-js/#L277" sourceLabel="livewireTapBehavior.js:277" />

Move/update preview (mousemove / touchmove).

**Parameters**

- `point` ([Point2D](/point2d)) — The pointer position.
- `layerGroup` ([LayerGroup](/layergroup)) — The layer group under the pointer.

<MemberHeading id="reset" depth="3" name="reset" sig="reset()" />

<MemberMeta sourceHref="/source/src/tools/behaviors/livewiretapbehavior-js/#L373" sourceLabel="livewireTapBehavior.js:373" />

Clear livewire session state and parent tap list.
