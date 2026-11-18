---
title: LabelFactory
kind: class
longname: LabelFactory
description: Label factory to create and update shape label.
---

# LabelFactory

<SourceLink href="/source/src/tools/shapes/labelfactory-js/#L13" label="labelFactory.js:13" />

Label factory to create and update shape label.

---

## Constructor

<Signature code="new LabelFactory(positionGetter: function): LabelFactory" />

**Parameters**

- `positionGetter` (function) — Default position getter.

---

## Instance Methods

<MemberHeading id="getposition" depth="3" name="getPosition" sig="getPosition(annotation: Annotation): Point2D" />

<MemberMeta sourceHref="/source/src/tools/shapes/labelfactory-js/#L35" sourceLabel="labelFactory.js:35" />

Get the annotation label position.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The annotation.

**Returns**

- [`Point2D`](/point2d) — The position.

<MemberHeading id="create" depth="3" name="create" sig="create(annotation: Annotation, style: Style): Konva.Label" />

<MemberMeta sourceHref="/source/src/tools/shapes/labelfactory-js/#L50" sourceLabel="labelFactory.js:50" />

Creates the konva label.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The associated annotation.
- `style` ([Style](/style)) — The drawing style.

**Returns**

- `Konva.Label` — The Konva label.

<MemberHeading id="updateposition" depth="3" name="updatePosition" sig="updatePosition(annotation: Annotation, group: Konva.Group)" />

<MemberMeta sourceHref="/source/src/tools/shapes/labelfactory-js/#L96" sourceLabel="labelFactory.js:96" />

Update the shape label position.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The associated annotation.
- `group` (Konva.Group) — The shape group.

<MemberHeading id="getlabelanchorsposition" depth="3" name="getLabelAnchorsPosition" sig="getLabelAnchorsPosition(label: Konva.Label): Array.<Point2D>" />

<MemberMeta sourceHref="/source/src/tools/shapes/labelfactory-js/#L118" sourceLabel="labelFactory.js:118" />

Get the anchors positions for the label.

**Parameters**

- `label` (Konva.Label) — The label.

**Returns**

- `Array.<`[`Point2D`](/point2d)`>` — The connectors positions.

<MemberHeading
  id="getclosestpoints"
  depth="3"
  name="getClosestPoints"
  sig="getClosestPoints(
	points1: Array.<Point2D>,
	points2: Array.<Point2D>,
): Array.<Point2D>"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/labelfactory-js/#L138" sourceLabel="labelFactory.js:138" />

Get the two closest points of two points lists.

**Parameters**

- `points1` (Array.\<[Point2D](/point2d)>) — The first point list.
- `points2` (Array.\<[Point2D](/point2d)>) — The second point list.

**Returns**

- `Array.<`[`Point2D`](/point2d)`>` — The closests points.

<MemberHeading
  id="getconnector"
  depth="3"
  name="getConnector"
  sig="getConnector(
	connectorsPos: Array.<Point2D>,
	label: Konva.Label,
	style: Style,
): Konva.Line"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/labelfactory-js/#L163" sourceLabel="labelFactory.js:163" />

Get the connector between this label and its shape.

**Parameters**

- `connectorsPos` (Array.\<[Point2D](/point2d)>) — The shape connectors positions.
- `label` (Konva.Label) — The label.
- `style` ([Style](/style)) — The drawing style.

**Returns**

- `Konva.Line` — The connector.

<MemberHeading
  id="updateconnector"
  depth="3"
  name="updateConnector"
  sig="updateConnector(
	group: Konva.Group,
	connectorsPos: Array.<Point2D>,
)"
/>

<MemberMeta sourceHref="/source/src/tools/shapes/labelfactory-js/#L189" sourceLabel="labelFactory.js:189" />

Update the connector between a label and its shape.

**Parameters**

- `group` (Konva.Group) — The associated shape group.
- `connectorsPos` (Array.\<[Point2D](/point2d)>) — The shape connectors positions.

<MemberHeading id="updatecontent" depth="3" name="updateContent" sig="updateContent(annotation: Annotation, group: Konva.Group)" />

<MemberMeta sourceHref="/source/src/tools/shapes/labelfactory-js/#L223" sourceLabel="labelFactory.js:223" />

Update the shape label.

**Parameters**

- `annotation` ([Annotation](/annotation)) — The associated annotation.
- `group` (Konva.Group) — The shape group.
