import {describe, test, assert} from 'vitest';
import {Geometry} from '../../src/image/geometry.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Point3D} from '../../src/math/point.js';
import {MaskImage} from '../../src/image/maskImage.js';
import {SegmentCollection} from '../../src/image/segmentCollection.js';
import {MaskSegment} from '../../src/dicom/dicomSegment.js';
import {DeleteSegmentCommand} from '../../src/command/deleteSegmentCommand.js';

/**
 * Tests for the 'command/deleteSegmentCommand.js' file.
 */

describe('DeleteSegmentCommand', () => {

  /**
   * Build a 3x1x1 mask, loaded-mask style (SegmentCollection filled via
   * addFrame, buffer aliased to the built label map), with segment 1
   * covering offsets 0-1 and segment 2 covering offsets 1-2 (overlap at 1).
   *
   * @returns {{image: MaskImage, collection: SegmentCollection,
   *   seg1: MaskSegment, seg2: MaskSegment}} The test fixture.
   */
  function makeOverlappingMask() {
    const geom = new Geometry(
      [new Point3D(0, 0, 0)], new Size([3, 1, 1]), new Spacing([1, 1, 1]));
    const collection = new SegmentCollection(geom);
    collection.addFrame(1, new Uint8Array([1, 1, 0]), 0, 0, 3, 1);
    collection.addFrame(2, new Uint8Array([0, 1, 1]), 0, 0, 3, 2);

    const image = new MaskImage(geom, collection.getLabelMap(), ['0'],
      collection);

    const seg1 = new MaskSegment(1, 'seg-1', 'MANUAL');
    seg1.displayValue = 1;
    const seg2 = new MaskSegment(2, 'seg-2', 'MANUAL');
    seg2.displayValue = 2;
    image.setMeta({custom: {segments: [seg1, seg2]}});

    return {image, collection, seg1, seg2};
  }

  test('execute removes a non-overlapping segment', () => {
    const {image, seg1} = makeOverlappingMask();
    // label map is [1, 1, 2] (segment 1 wins the overlap at offset 1)
    assert.deepEqual(Array.from(image.getBuffer()), [1, 1, 2]);

    const command = new DeleteSegmentCommand(image, seg1);
    command.execute();

    assert.equal(image.getBuffer()[0], 0, 'offset 0 (seg 1 only) cleared');
  });

  test(
    'execute restores the overlapping segment instead of zeroing it',
    () => {
      const {image, seg1} = makeOverlappingMask();

      const command = new DeleteSegmentCommand(image, seg1);
      command.execute();

      assert.equal(
        image.getBuffer()[1], 2,
        'offset 1 (shared with seg 2) now shows seg 2, not 0'
      );
      assert.equal(image.getBuffer()[2], 2, 'offset 2 (seg 2 only) untouched');
    }
  );

  test(
    'execute keeps segment 2 fully exportable after seg 1 is deleted',
    () => {
      const {image, collection, seg1, seg2} = makeOverlappingMask();

      const command = new DeleteSegmentCommand(image, seg1);
      command.execute();

      const roiBuffers = collection.getSegmentBuffers([seg2]);
      assert.equal(
        roiBuffers[1][0][1], 1, 'seg 2 still covers the ex-overlap voxel'
      );
      assert.equal(roiBuffers[1][0][2], 1, 'seg 2 keeps its own voxel');
    }
  );

  test('undo restores the deleted segment', () => {
    const {image, seg1} = makeOverlappingMask();

    const command = new DeleteSegmentCommand(image, seg1);
    command.execute();
    command.undo();

    assert.deepEqual(
      Array.from(image.getBuffer()), [1, 1, 2],
      'label map back to its pre-delete state'
    );
  });

});
