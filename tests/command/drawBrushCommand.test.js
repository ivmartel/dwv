import {describe, test, assert} from 'vitest';
import {
  DrawBrushCommand,
  DrawBrushCommandProperties
} from '../../src/command/drawBrushCommand.js';
import {MaskImage} from '../../src/image/maskImage.js';
import {Geometry} from '../../src/image/geometry.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Point3D} from '../../src/math/point.js';

/**
 * Tests for the 'command/drawBrushCommand.js' file.
 */

/**
 * Get a 4x4 single slice mask: segment 1 at offsets 0 and 1,
 *   segment 2 at offset 5. Segments 1 and 2 are AUTOMATIC,
 *   segment 3 is MANUAL.
 *
 * @returns {MaskImage} The mask.
 */
function getMask() {
  const geometry = new Geometry(
    [new Point3D(0, 0, 0)],
    new Size([4, 4, 1]),
    new Spacing([1, 1, 1])
  );
  const buffer = new Uint8Array(16);
  buffer[0] = 1;
  buffer[1] = 1;
  buffer[5] = 2;
  const mask = new MaskImage(geometry, buffer, ['0']);
  mask.setMeta({
    custom: {
      segments: [
        {
          number: 1,
          label: 's1',
          algorithmType: 'AUTOMATIC',
          algorithmName: 'algo'
        },
        {
          number: 2,
          label: 's2',
          algorithmType: 'AUTOMATIC',
          algorithmName: 'algo'
        },
        {number: 3, label: 's3', algorithmType: 'MANUAL'}
      ]
    }
  });
  return mask;
}

/**
 * Get the algorithm types of the mask segments.
 *
 * @param {MaskImage} mask The mask.
 * @returns {string[]} The types, in segment order.
 */
function getTypes(mask) {
  return mask.getMeta().custom.segments.map(item => item.algorithmType);
}

/**
 * Get a brush command.
 *
 * @param {MaskImage} mask The mask.
 * @param {number[]} offsets The brush offsets.
 * @param {string} mode The brush mode ('add' or 'del').
 * @param {number} segmentNumber The brush segment number.
 * @param {Array} [originalValuesLists] Optional original values.
 * @returns {DrawBrushCommand} The command.
 */
function getCommand(mask, offsets, mode, segmentNumber, originalValuesLists) {
  const props = new DrawBrushCommandProperties();
  props.mask = mask;
  props.dataId = '0';
  props.offsetsLists = [offsets];
  props.mode = mode;
  props.segmentNumber = segmentNumber;
  props.srclayerid = 'layer0';
  props.originalValuesLists = originalValuesLists;
  return new DrawBrushCommand(props);
}

describe('command', () => {

  test('DrawBrushCommand: drawing over a segment edits it', () => {
    const mask = getMask();
    // manual segment 3 over a pixel of segment 1
    const command = getCommand(mask, [0, 8], 'add', 3);
    command.execute();
    assert.deepEqual(getTypes(mask),
      ['SEMIAUTOMATIC', 'AUTOMATIC', 'MANUAL'], 'execute');
    assert.equal(mask.getBuffer()[0], 3, 'drawn pixel');

    command.undo();
    assert.deepEqual(getTypes(mask),
      ['AUTOMATIC', 'AUTOMATIC', 'MANUAL'], 'undo');
    assert.equal(mask.getBuffer()[0], 1, 'restored pixel');

    command.execute();
    assert.deepEqual(getTypes(mask),
      ['SEMIAUTOMATIC', 'AUTOMATIC', 'MANUAL'], 'redo');
  });

  test('DrawBrushCommand: drawing a segment edits it', () => {
    const mask = getMask();
    // segment 2 on empty pixels
    const command = getCommand(mask, [10, 11], 'add', 2);
    command.execute();
    assert.deepEqual(getTypes(mask),
      ['AUTOMATIC', 'SEMIAUTOMATIC', 'MANUAL'], 'execute');
    command.undo();
    assert.deepEqual(getTypes(mask),
      ['AUTOMATIC', 'AUTOMATIC', 'MANUAL'], 'undo');
  });

  test('DrawBrushCommand: erasing edits the erased segments', () => {
    const mask = getMask();
    // erase a pixel of segment 2
    const command = getCommand(mask, [5, 6], 'del', 1);
    command.execute();
    assert.deepEqual(getTypes(mask),
      ['AUTOMATIC', 'SEMIAUTOMATIC', 'MANUAL'], 'execute');
    command.undo();
    assert.deepEqual(getTypes(mask),
      ['AUTOMATIC', 'AUTOMATIC', 'MANUAL'], 'undo');

    // erasing empty pixels edits nothing
    const command2 = getCommand(mask, [12, 13], 'del', 1);
    command2.execute();
    assert.deepEqual(getTypes(mask),
      ['AUTOMATIC', 'AUTOMATIC', 'MANUAL'], 'empty erase');
  });

  test('DrawBrushCommand: already applied stroke', () => {
    const mask = getMask();
    // brush stroke: values set before the command creation
    const originals = mask.setAtOffsetsAndGetOriginals([[1, 2]], 3);
    const command = getCommand(mask, [1, 2], 'add', 3, originals);
    command.updateSegmentTypes();
    assert.deepEqual(getTypes(mask),
      ['SEMIAUTOMATIC', 'AUTOMATIC', 'MANUAL'], 'update');

    command.undo();
    assert.deepEqual(getTypes(mask),
      ['AUTOMATIC', 'AUTOMATIC', 'MANUAL'], 'undo');
    assert.equal(mask.getBuffer()[1], 1, 'restored pixel');

    command.execute();
    assert.deepEqual(getTypes(mask),
      ['SEMIAUTOMATIC', 'AUTOMATIC', 'MANUAL'], 'redo');
    assert.equal(mask.getBuffer()[1], 3, 'redrawn pixel');
  });

});
