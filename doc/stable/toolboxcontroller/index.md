---
title: ToolboxController
kind: class
longname: ToolboxController
description: Toolbox controller.
---

# ToolboxController

<SourceLink href="/source/src/app/toolboxcontroller-js/#L28" label="toolboxController.js:28" />

Toolbox controller.

---

## Constructor

<Signature
  code="new ToolboxController(
	toolList: object,
	rootDocument?: DocumentFragment,
): ToolboxController"
/>

**Parameters**

- `toolList` (object) — The list of tool objects.
- `rootDocument` (DocumentFragment, optional) — Optional root document to listen to for keyboard shortcuts, defaults to `document`.

---

## Instance Methods

<MemberHeading id="init" depth="3" name="init" sig="init()" />

<MemberMeta sourceHref="/source/src/app/toolboxcontroller-js/#L99" sourceLabel="toolboxController.js:99" />

Initialise.

<MemberHeading id="enableshortcuts" depth="3" name="enableShortcuts" sig="enableShortcuts(flag: boolean)" />

<MemberMeta sourceHref="/source/src/app/toolboxcontroller-js/#L118" sourceLabel="toolboxController.js:118" />

Enable or disable shortcuts. The 'init' methods enables shortcuts by default. Call this method after init to disable shortcuts.

Shortcuts are keydown events listened to on the root document in the bubbling phase and passed to the selected tool. Events with a prevented default or coming from editable elements (input, select, text area, content editable) are ignored.

**Parameters**

- `flag` (boolean) — True to enable shortcuts.

<MemberHeading id="gettoollist" depth="3" name="getToolList" sig="getToolList(): Array" />

<MemberMeta sourceHref="/source/src/app/toolboxcontroller-js/#L149" sourceLabel="toolboxController.js:149" />

Get the tool list.

**Returns**

- `Array` — The list of tool objects.

<MemberHeading id="hastool" depth="3" name="hasTool" sig="hasTool(name: string): boolean" />

<MemberMeta sourceHref="/source/src/app/toolboxcontroller-js/#L159" sourceLabel="toolboxController.js:159" />

Check if a tool is in the tool list.

**Parameters**

- `name` (string) — The name to check.

**Returns**

- `boolean` — The tool list element for the given name.

<MemberHeading id="getselectedtool" depth="3" name="getSelectedTool" sig="getSelectedTool(): object" />

<MemberMeta sourceHref="/source/src/app/toolboxcontroller-js/#L168" sourceLabel="toolboxController.js:168" />

Get the selected tool.

**Returns**

- `object` — The selected tool.

<MemberHeading
  id="getselectedtooleventhandler"
  depth="3"
  name="getSelectedToolEventHandler"
  sig="getSelectedToolEventHandler(
	eventType: string,
): EventListener | undefined"
/>

<MemberMeta sourceHref="/source/src/app/toolboxcontroller-js/#L180" sourceLabel="toolboxController.js:180" />

Get the selected tool event handler.

**Parameters**

- `eventType` (string) — The event type, for example mousedown, touchstart...

**Returns**

- `EventListener | undefined` — The event handler, undefined if no tool is selected.

<MemberHeading id="setselectedtool" depth="3" name="setSelectedTool" sig="setSelectedTool(name: string)" />

<MemberMeta sourceHref="/source/src/app/toolboxcontroller-js/#L192" sourceLabel="toolboxController.js:192" />

Set the selected tool.

**Parameters**

- `name` (string) — The name of the tool.

<MemberHeading id="settoolfeatures" depth="3" name="setToolFeatures" sig="setToolFeatures(list: object)" />

<MemberMeta sourceHref="/source/src/app/toolboxcontroller-js/#L212" sourceLabel="toolboxController.js:212" />

Set the selected tool live features.

**Parameters**

- `list` (object) — The list of features.

<MemberHeading
  id="bindlayergroup"
  depth="3"
  name="bindLayerGroup"
  sig="bindLayerGroup(
	layerGroup: LayerGroup,
	layer: ViewLayer | DrawLayer,
)"
/>

<MemberMeta sourceHref="/source/src/app/toolboxcontroller-js/#L224" sourceLabel="toolboxController.js:224" />

Listen to layer interaction events.

**Parameters**

- `layerGroup` ([LayerGroup](/layergroup)) — The associated layer group.
- `layer` ([ViewLayer](/viewlayer) | [DrawLayer](/drawlayer)) — The layer to listen to.
