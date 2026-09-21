import {describe, test, assert, vi} from 'vitest';
import {Geometry} from '../../src/image/geometry.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Point3D} from '../../src/math/point.js';
import {Matrix33} from '../../src/math/matrix.js';
import {Image} from '../../src/image/image.js';
import {MaskImage} from '../../src/image/maskImage.js';
import {SegmentCollection} from '../../src/image/segmentCollection.js';

/**
 * Tests for the 'image/maskImage.js' file.
 */

describe('MaskImage', () => {

  test('isMask/getHasOverlap defaults differ from a plain Image', () => {
    const geom = new Geometry(
      [new Point3D(0, 0, 0)], new Size([2, 2, 1]), new Spacing([1, 1, 1]));
    const image = new Image(geom, new Uint8Array(4), ['0']);
    const mask = new MaskImage(geom, new Uint8Array(4), ['0']);

    assert.equal(image.isMask(), false, 'plain image is not a mask');
    assert.equal(mask.isMask(), true, 'mask image is a mask');
    assert.equal(image.getHasOverlap(), false, 'plain image never overlaps');
    assert.equal(
      mask.getHasOverlap(), false, 'freshly created mask has no overlap'
    );
  });

  test(
    'constructing without a SegmentCollection creates one aliased ' +
    'to the buffer (brush path)',
    () => {
      const geom = new Geometry(
        [new Point3D(0, 0, 0)], new Size([3, 1, 1]), new Spacing([1, 1, 1]));
      const buffer = new Uint8Array([1, 0, 2]);
      const mask = new MaskImage(geom, buffer, ['0']);

      assert.equal(
        mask.getSegmentCollection().getLabelMap(), mask.getBuffer(),
        'label map aliases the image buffer'
      );
    }
  );

  test(
    'constructing with a SegmentCollection uses it as-is (loaded-mask path)',
    () => {
      const geom = new Geometry(
        [new Point3D(0, 0, 0)], new Size([3, 1, 1]), new Spacing([1, 1, 1]));
      const collection = new SegmentCollection(geom);
      collection.addFrame(1, new Uint8Array([1, 1, 0]), 0, 0, 3, 1);
      const mask = new MaskImage(geom, collection.getLabelMap(), ['0'],
        collection);

      assert.equal(
        mask.getSegmentCollection(), collection,
        'the exact collection instance is used'
      );
    }
  );

  test(
    'segment collection label map follows the buffer after a realloc',
    () => {
      // single-slice mask, mirrors Brush#createMask
      const size1 = new Size([2, 2, 1]);
      const spacing = new Spacing([1, 1, 1]);
      const geom0 = new Geometry([new Point3D(0, 0, 0)], size1, spacing);
      const mask = new MaskImage(geom0, new Uint8Array(4), ['0']);
      mask.setMeta({PixelRepresentation: 0, numberOfFiles: 2});

      // paint segment 1 on slice 0
      mask.setAtOffsetsAndGetOriginals([[0]], 1);

      // append a second slice: triggers Image#realloc since the buffer
      // must grow from 4 to 8 elements
      const geom1 = new Geometry([new Point3D(0, 0, 1)], size1, spacing);
      const slice = new Image(geom1, new Uint8Array(4), ['1']);
      slice.setMeta({PixelRepresentation: 0, numberOfFiles: 2});
      mask.appendSlice(slice);

      // paint segment 1 on the newly appended slice 1
      mask.setAtOffsetsAndGetOriginals([[4]], 1);

      const collection = mask.getSegmentCollection();
      assert.equal(
        collection.getLabelMap(), mask.getBuffer(),
        'label map still aliases the (reallocated) image buffer'
      );
      assert.equal(
        collection.getLabelMap()[4], 1,
        'edit made on the appended slice is visible in the label map'
      );
    }
  );

  test(
    'setAtOffsets keeps the segment collection in sync (e.g. ' +
    'DeleteSegmentCommand / ChangeSegmentColourCommand)',
    () => {
      // mimic a mask loaded via MaskFactory: per-segment data in
      // #segments, buffer aliased to the built label map
      const size1 = new Size([3, 1, 1]);
      const spacing = new Spacing([1, 1, 1]);
      const geom = new Geometry([new Point3D(0, 0, 0)], size1, spacing);
      const collection = new SegmentCollection(geom);
      const pixelBuffer = new Uint8Array([1, 1, 0]);
      collection.addFrame(1, pixelBuffer, 0, 0, 3, 1);

      const mask = new MaskImage(geom, collection.getLabelMap(), ['0'],
        collection);

      // simulate ChangeSegmentColourCommand renumbering segment 1 to 3
      mask.setAtOffsets([0, 1], 3);

      const oldBuffers = collection.getSegmentBuffers([{number: 1}]);
      assert.ok(
        oldBuffers[0][0].every(v => v === 0),
        'old segment number no longer carries these pixels'
      );
      const newBuffers = collection.getSegmentBuffers([{number: 3}]);
      assert.equal(newBuffers[2][0][0], 1, 'pixel tracked under new number');
      assert.equal(newBuffers[2][0][1], 1, 'pixel tracked under new number');
    }
  );

  test('getOffsets returns offsets matching a value', () => {
    const size0 = 3;
    const geom = new Geometry(
      [new Point3D(0, 0, 0)], new Size([size0, size0, 1]),
      new Spacing([1, 1, 1]));
    const buffer0 = [];
    buffer0[0] = 1;
    for (let i0 = 1; i0 < 2 * size0; ++i0) {
      buffer0[i0] = 0;
    }
    for (let i1 = 2 * size0; i1 < size0 * size0; ++i1) {
      buffer0[i1] = 1;
    }
    const theoOffset0 = [1, 2, 3, 4, 5];
    const theoOffset1 = [0, 6, 7, 8];

    const mask = new MaskImage(geom, buffer0, ['0']);

    assert.deepEqual(mask.getOffsets(0), theoOffset0, 'Image offsets 0');
    assert.deepEqual(mask.getOffsets(1), theoOffset1, 'Image offsets 1');
  });

  test('clone copies the segment collection, not just the buffer', () => {
    const geom = new Geometry(
      [new Point3D(0, 0, 0)], new Size([3, 1, 1]), new Spacing([1, 1, 1]));
    const collection = new SegmentCollection(geom);
    collection.addFrame(1, new Uint8Array([1, 1, 0]), 0, 0, 3, 1);
    collection.addFrame(2, new Uint8Array([0, 0, 1]), 0, 0, 3, 2);
    const mask = new MaskImage(geom, collection.getLabelMap(), ['0'],
      collection);

    const clone = mask.clone();

    assert.ok(clone instanceof MaskImage, 'clone is a MaskImage');
    assert.notEqual(
      clone.getSegmentCollection(), collection,
      'clone has its own SegmentCollection instance'
    );
    assert.equal(
      clone.getSegmentCollection().getLabelMap(), clone.getBuffer(),
      'clone label map aliases the clone (not the original) buffer'
    );

    // mutating the clone must not affect the original
    clone.setAtOffsets([2], 1);
    assert.equal(
      mask.getBuffer()[2], 2, 'original buffer unaffected (still segment 2)'
    );
    assert.equal(
      collection.getSegmentBuffers([{number: 2}])[1][0][2], 1,
      'original segment 2 still owns offset 2'
    );
    assert.equal(
      clone.getSegmentCollection().getSegmentBuffers([{number: 1}])[0][0][2],
      1,
      'clone segment 1 now owns offset 2'
    );
  });

  test('initializeContour/getContour', () => {
    const geom = new Geometry(
      new Point3D(0, 0, 0), new Size([3, 3, 1]), new Spacing([1, 1, 1]));
    const buffer = new Uint8Array(9).fill(1);
    const mask = new MaskImage(geom, buffer);

    assert.notOk(
      mask.getContour().isInitialized(),
      'contour not initialized before initializeContour'
    );

    mask.initializeContour();

    assert.ok(
      mask.getContour().isInitialized(),
      'contour initialized after initializeContour'
    );

    /* eslint-disable @stylistic/js/array-element-newline */
    const orientation = new Matrix33([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ]);
    /* eslint-enable @stylistic/js/array-element-newline */

    assert.equal(
      typeof mask.getContour().getDistance(4, orientation),
      'number',
      'getDistance returns a number'
    );
  });

  test(
    'appendSlice shifts the contour buffer in step with the image buffer',
    () => {
      const size = 2;
      const spacing = new Spacing([1, 1, 1]);
      // 2 initial slices (z=0, z=1), room reserved for 3 via numberOfFiles
      const geometry = new Geometry(
        [new Point3D(0, 0, 0)], new Size([size, size, 1]), spacing);
      geometry.appendOrigin(new Point3D(0, 0, 1), 1);
      const buffer = new Uint8Array(size * size * 2).fill(1);
      const mask = new MaskImage(geometry, buffer, ['0', '1']);
      mask.setMeta({PixelRepresentation: 0, numberOfFiles: 3});
      mask.initializeContour();

      const shiftSliceSpy = vi.spyOn(mask.getContour(), 'shiftSlice');

      // insert a slice before existing content -> triggers a shift
      const sliceGeometry = new Geometry(
        [new Point3D(0, 0, -1)], new Size([size, size, 1]), spacing);
      const slice = new Image(
        sliceGeometry, new Uint8Array(size * size).fill(2), ['2']);
      slice.setMeta({PixelRepresentation: 0, numberOfFiles: 3});
      mask.appendSlice(slice);

      // image-space shift: indexOffset=0, insertSize=sliceSize(4),
      // maxOffset=2*sliceSize(8); contour tracks 3 values per voxel
      // (numberOfComponents is 1 for a mask), so scale by 3
      assert.deepEqual(
        shiftSliceSpy.mock.calls[0], [0, 12, 24],
        'contour shift scaled to contour-space offsets'
      );
      assert.ok(
        mask.getContour().isInitialized(), 'contour still initialized'
      );
    }
  );

  test(
    'appendSlice + brush-add on the new slice keeps segments on ' +
    'distinct, correctly-indexed slices (export round-trip)',
    () => {
      // a SEG loaded with a segment on only one of the source's 2 slices:
      // mask geometry starts with a single slice at z=1
      const size = 2;
      const spacing = new Spacing([1, 1, 1]);
      const geometry = new Geometry(
        [new Point3D(0, 0, 1)], new Size([size, size, 1]), spacing);
      const collection = new SegmentCollection(geometry);
      collection.addFrame(
        1, new Uint8Array([1, 1, 1, 1]), 0, 0, size * size, 1);
      const mask = new MaskImage(
        geometry, collection.getLabelMap(), ['1'], collection);
      mask.setMeta({PixelRepresentation: 0, numberOfFiles: 2});

      // append the other slice, z=0, which sorts *before* the existing
      // one and so shifts the existing segment's buffer content
      const sliceGeometry = new Geometry(
        [new Point3D(0, 0, 0)], new Size([size, size, 1]), spacing);
      const slice = new Image(sliceGeometry, new Uint8Array(size * size),
        ['0']);
      slice.setMeta({PixelRepresentation: 0, numberOfFiles: 2});
      mask.appendSlice(slice);

      // brush-paint a new segment 2 onto the newly appended slice (z=0,
      // now buffer offsets 0..3)
      mask.setAtOffsetsAndGetOriginals([[0, 1, 2, 3]], 2);

      const roiBuffers = mask.getSegmentCollection().getSegmentBuffers(
        [{number: 1}, {number: 2}]);

      assert.deepEqual(
        Object.keys(roiBuffers[0]), ['1'],
        'segment 1 re-indexed to its shifted slice (1), not left at 0'
      );
      assert.deepEqual(
        Object.keys(roiBuffers[1]), ['0'],
        'segment 2 stays on the slice it was painted on (0)'
      );
    }
  );

});
