---
title: PositionSetTapBehavior
kind: class
longname: PositionSetTapBehavior
description: "Tap sets the current slice/index from the display position (plane point). It then emits a tap event, on every tap, with as detail: position : the tapped position values, annotations : an {@link AnnotationTapHit} for the top most annotation under the tap, one per draw layer with a hit, segments : a {@link SegmentationTapHit} per mask view layer with segments under the tap. Empty annotations and segments mean that nothing was hit, for example to reset a selection."
---

# PositionSetTapBehavior

<SourceLink href="/source/src/tools/behaviors/tapbehavior-js/#L135" label="tapBehavior.js:135" />

Tap sets the current slice/index from the display position (plane point). It then emits a `tap` event, on every tap, with as detail:

- `position`: the tapped position values,
- `annotations`: an [AnnotationTapHit](/annotationtaphit) for the top most annotation under the tap, one per draw layer with a hit,
- `segments`: a [SegmentationTapHit](/segmentationtaphit) per mask view layer with segments under the tap. Empty `annotations` and `segments` mean that nothing was hit, for example to reset a selection.

---

## Constructor

<Signature code="new PositionSetTapBehavior(): PositionSetTapBehavior" />

---

## Instance Methods

<MemberHeading id="ontap" depth="3" name="onTap" sig="onTap(point: Point2D, layerGroup: LayerGroup)" />

<MemberMeta sourceHref="/source/src/tools/behaviors/tapbehavior-js/#L145" sourceLabel="tapBehavior.js:145" />

Set stack position from the tapped display point (plane coordinates) and emit the `tap` event.

**Parameters**

- `point` ([Point2D](/point2d)) — Display position.
- `layerGroup` ([LayerGroup](/layergroup)) — The layer group.
