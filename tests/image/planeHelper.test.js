import {describe, test, assert, beforeEach} from 'vitest';
import {PlaneHelper} from '../../src/image/planeHelper.js';
import {Matrix33} from '../../src/math/matrix.js';
import {Vector3D} from '../../src/math/vector.js';
import {Point, Point2D, Point3D} from '../../src/math/point.js';
import {Index} from '../../src/math/index.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Geometry} from '../../src/image/geometry.js';

/**
 * Tests for the 'image/planeHelper.js' file.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** The 3×3 identity matrix (row-major). */
const IDENTITY = new Matrix33([1, 0, 0, 0, 1, 0, 0, 0, 1]);

/**
 * Build a Geometry.
 *
 * @param {number[]} sizeArr Size in voxels.
 * @param {number[]} [spacingArr] Spacing per axis (default: all 1).
 * @param {Point3D} [origin] World origin (default: 0,0,0).
 * @param {Matrix33} [orientation] Image orientation (default: identity).
 * @returns {Geometry} The geometry.
 */
function makeGeometry(
  sizeArr,
  spacingArr = sizeArr.map(() => 1),
  origin = new Point3D(0, 0, 0),
  orientation = undefined
) {
  return new Geometry(
    [origin], new Size(sizeArr), new Spacing(spacingArr), orientation
  );
}

// ---------------------------------------------------------------------------
// Orientation test cases
// ---------------------------------------------------------------------------

/**
 * Each entry drives the full per-orientation test suite.
 * All expected values are computed from the image geometry orientation G
 * and the view orientation V.
 *
 * Terminology:
 *   T = getTargetOrientation(G, V) = G.asOneAndZeros() × V
 *   (with an abs() applied when G matches the canonical coronal orientation).
 *
 * To add a new orientation case:
 *   1. Append a new object to CASES.
 *   2. Fill in geoValues, viewValues, and all expected fields.
 *
 * Field key:
 *   t_123      T  * [1,2,3]    target de-orient, cosines, offset
 *   tinv_123   T⁻¹ * [1,2,3]  target re-orient, getTargetOrientedPositiveXYZ
 *   t_230      T  * [2,3,0]    getOffset3DFromPlaneOffset({x:2,y:3})
 *   v_123      V  * [1,2,3]    image de-orient (getImageOriented*)
 *   vinv_123   V⁻¹ * [1,2,3]  image re-orient (getImageDeOriented*)
 *   plane_y_k0 getPositionFromPlanePoint(Point2D(0,1), 0)  (T + geo)
 *   world_001  getPlanePointFromPosition(Point([0,0,1]))    (geo + V).
 */
const CASES = [
  {
    label: 'identity geo, identity view',
    // G = I, V = I  →  T = I
    geoValues: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    viewValues: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    isAcquisition: true,
    scrollDimIndex: 2,
    nativeScrollDimIndex: 2,
    t_123: [1, 2, 3],
    tinv_123: [1, 2, 3],
    t_230: [2, 3, 0],
    v_123: [1, 2, 3],
    vinv_123: [1, 2, 3],
    plane_y_k0: [0, 1, 0], // I*[0,1,0] through identity geo
    world_001: [0, 0, 1], // identity geo, then I⁻¹*[0,0,1]
    cosines: [1, 0, 0, 0, 1, 0],
  },
  {
    label: 'identity geo, coronal view',
    // G = I, V = C = [1,0,0, 0,0,-1, 0,1,0]  →  T = C
    // C*[x,y,z] = [x,-z,y],  C⁻¹*[x,y,z] = [x,z,-y]
    geoValues: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    viewValues: [1, 0, 0, 0, 0, -1, 0, 1, 0],
    isAcquisition: false,
    scrollDimIndex: 1, // V col2=[0,-1,0] → abs-max at row 1
    nativeScrollDimIndex: 2, // G = I, col2 abs-max at row 2
    t_123: [1, -3, 2],
    tinv_123: [1, 3, -2],
    t_230: [2, 0, 3],
    v_123: [1, -3, 2], // V = T here, so same as t_123
    vinv_123: [1, 3, -2],
    plane_y_k0: [0, 0, 1], // V*[0,1,0]=[0,0,1] through identity geo
    world_001: [0, 1, 0], // identity geo, V⁻¹*[0,0,1]=[0,1,0]
    cosines: [1, 0, 0, 0, 0, 1],
  },
  {
    label: 'coronal geo, identity view',
    // G = DWV coronal [1,0,0, 0,0,1, 0,-1,0],  V = I
    // T = abs(G × I) = [1,0,0, 0,0,1, 0,1,0],  T*[x,y,z]=[x,z,y]
    // T is symmetric so T⁻¹ = T
    geoValues: [1, 0, 0, 0, 0, 1, 0, -1, 0],
    viewValues: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    isAcquisition: true, // isIdentityMat33(V = I)
    scrollDimIndex: 2, // V = I, col2 abs-max at row 2
    nativeScrollDimIndex: 1, // G col2=[0,1,0] → abs-max at row 1
    t_123: [1, 3, 2],
    tinv_123: [1, 3, 2], // T symmetric → T⁻¹ = T
    t_230: [2, 0, 3],
    v_123: [1, 2, 3], // V = I, pass-through
    vinv_123: [1, 2, 3],
    // V=I → [0,1,0]; geo G*[0,1,0] = [0,0,-1]
    plane_y_k0: [0, 0, -1],
    // geo G⁻¹*[0,0,1] = [0,-1,0]; V=I → [0,-1,0]
    world_001: [0, -1, 0],
    cosines: [1, 0, 0, 0, 0, 1],
  },
];

// ---------------------------------------------------------------------------
// Per-orientation test suite (runs once per CASES entry)
// ---------------------------------------------------------------------------

describe.each(CASES)('PlaneHelper $label', (c) => {

  let helper;

  beforeEach(() => {
    const geo = makeGeometry(
      [4, 4, 4],
      undefined,
      undefined,
      new Matrix33(c.geoValues)
    );
    helper = new PlaneHelper(geo, new Matrix33(c.viewValues));
  });

  // -- orientation flags ----------------------------------------------------

  test('isAquisitionOrientation', () => {
    assert.equal(helper.isAquisitionOrientation(), c.isAcquisition);
  });

  test('getScrollDimIndex', () => {
    assert.equal(helper.getScrollDimIndex(), c.scrollDimIndex);
  });

  test('getNativeScrollDimIndex', () => {
    assert.equal(helper.getNativeScrollDimIndex(), c.nativeScrollDimIndex);
  });

  // -- target-space transforms (targetOrientation = T) ----------------------

  test('getTargetOrientedVector3D applies T⁻¹', () => {
    const out = helper.getTargetOrientedVector3D(new Vector3D(1, 2, 3));
    assert.equal(out.getX(), c.tinv_123[0], 'x');
    assert.equal(out.getY(), c.tinv_123[1], 'y');
    assert.equal(out.getZ(), c.tinv_123[2], 'z');
  });

  test('getTargetDeOrientedVector3D applies T', () => {
    const out = helper.getTargetDeOrientedVector3D(new Vector3D(1, 2, 3));
    assert.equal(out.getX(), c.t_123[0], 'x');
    assert.equal(out.getY(), c.t_123[1], 'y');
    assert.equal(out.getZ(), c.t_123[2], 'z');
  });

  test('getTargetDeOrientedPoint3D applies T', () => {
    const out = helper.getTargetDeOrientedPoint3D(new Point3D(1, 2, 3));
    assert.equal(out.getX(), c.t_123[0], 'x');
    assert.equal(out.getY(), c.t_123[1], 'y');
    assert.equal(out.getZ(), c.t_123[2], 'z');
  });

  // -- image-space transforms (viewOrientation = V) -------------------------

  test('getImageOrientedVector3D applies V', () => {
    const out = helper.getImageOrientedVector3D(new Vector3D(1, 2, 3));
    assert.equal(out.getX(), c.v_123[0], 'x');
    assert.equal(out.getY(), c.v_123[1], 'y');
    assert.equal(out.getZ(), c.v_123[2], 'z');
  });

  test('getImageDeOrientedVector3D applies V⁻¹', () => {
    const out = helper.getImageDeOrientedVector3D(new Vector3D(1, 2, 3));
    assert.equal(out.getX(), c.vinv_123[0], 'x');
    assert.equal(out.getY(), c.vinv_123[1], 'y');
    assert.equal(out.getZ(), c.vinv_123[2], 'z');
  });

  test('getImageOrientedPoint3D applies V', () => {
    const out = helper.getImageOrientedPoint3D(new Point3D(1, 2, 3));
    assert.equal(out.getX(), c.v_123[0], 'x');
    assert.equal(out.getY(), c.v_123[1], 'y');
    assert.equal(out.getZ(), c.v_123[2], 'z');
  });

  test('getImageDeOrientedPoint3D applies V⁻¹', () => {
    const out = helper.getImageDeOrientedPoint3D(new Point3D(1, 2, 3));
    assert.equal(out.getX(), c.vinv_123[0], 'x');
    assert.equal(out.getY(), c.vinv_123[1], 'y');
    assert.equal(out.getZ(), c.vinv_123[2], 'z');
  });

  // -- offset conversions (targetOrientation = T, spacing from geo) ---------

  test('getOffset3DFromPlaneOffset maps {x:2,y:3} via T', () => {
    const v = helper.getOffset3DFromPlaneOffset({x: 2, y: 3});
    assert.equal(v.getX(), c.t_230[0], 'x');
    assert.equal(v.getY(), c.t_230[1], 'y');
    assert.equal(v.getZ(), c.t_230[2], 'z');
  });

  test('getPlaneOffsetFromOffset3D inverts getOffset3DFromPlaneOffset', () => {
    const off = helper.getPlaneOffsetFromOffset3D({
      x: c.t_230[0], y: c.t_230[1], z: c.t_230[2]
    });
    assert.equal(off.x, 2, 'x');
    assert.equal(off.y, 3, 'y');
  });

  test('offset round-trip: 2D → 3D → 2D', () => {
    const input = {x: 2, y: 3};
    const v3d = helper.getOffset3DFromPlaneOffset(input);
    const back = helper.getPlaneOffsetFromOffset3D({
      x: v3d.getX(), y: v3d.getY(), z: v3d.getZ()
    });
    assert.equal(back.x, input.x, 'x');
    assert.equal(back.y, input.y, 'y');
  });

  // -- position conversions (V + image geo) ---------------------------------

  test('getPositionFromPlanePoint: plane (0,1) k=0 → world', () => {
    const p3d = helper.getPositionFromPlanePoint(new Point2D(0, 1), 0);
    assert.equal(p3d.getX(), c.plane_y_k0[0], 'x');
    assert.equal(p3d.getY(), c.plane_y_k0[1], 'y');
    assert.equal(p3d.getZ(), c.plane_y_k0[2], 'z');
  });

  test('getPlanePointFromPosition: world (0,0,1) → plane', () => {
    const p3d = helper.getPlanePointFromPosition(new Point([0, 0, 1]));
    assert.equal(p3d.getX(), c.world_001[0], 'x');
    assert.equal(p3d.getY(), c.world_001[1], 'y');
    assert.equal(p3d.getZ(), c.world_001[2], 'z');
  });

  test('position round-trip', () => {
    const plane = new Point2D(1, 2);
    const slice = 0;
    const w = helper.getPositionFromPlanePoint(plane, slice);
    const back = helper.getPlanePointFromPosition(
      new Point([w.getX(), w.getY(), w.getZ()])
    );
    assert.equal(back.getX(), plane.getX(), 'x');
    assert.equal(back.getY(), plane.getY(), 'y');
    assert.equal(back.getZ(), slice, 'z = slice index');
  });

  // -- other ----------------------------------------------------------------

  test('getCosines returns first two columns of T', () => {
    const cosines = helper.getCosines();
    for (let i = 0; i < 6; ++i) {
      assert.equal(cosines[i], c.cosines[i], `cosines[${i}]`);
    }
  });

  test('getTargetOrientedPositiveXYZ applies T⁻¹', () => {
    const out = helper.getTargetOrientedPositiveXYZ({x: 1, y: 2, z: 3});
    assert.equal(out.x, c.tinv_123[0], 'x');
    assert.equal(out.y, c.tinv_123[1], 'y');
    assert.equal(out.z, c.tinv_123[2], 'z');
  });

}); // describe.each

// ---------------------------------------------------------------------------
// Orientation-independent tests
// ---------------------------------------------------------------------------

describe('PlaneHelper orientation-independent', () => {

  let helper;

  beforeEach(() => {
    helper = new PlaneHelper(makeGeometry([4, 4, 4]), IDENTITY);
  });

  test('getViewOrientation returns the constructor argument', () => {
    assert.equal(helper.getViewOrientation(), IDENTITY);
  });

  test('getTargetOrientation returns a Matrix33', () => {
    assert.ok(helper.getTargetOrientation() instanceof Matrix33);
  });

  test('worldToIndex/indexToWorld round-trip', () => {
    const idx = new Index([1, 2, 3]);
    const world = helper.indexToWorld(idx);
    const back = helper.worldToIndex(world);
    assert.equal(back.get(0), 1, 'i');
    assert.equal(back.get(1), 2, 'j');
    assert.equal(back.get(2), 3, 'k');
  });

  test('getOffset3DFromPlaneOffset scales by spacing', () => {
    const h = new PlaneHelper(
      makeGeometry([4, 4, 4], [2, 3, 1]), IDENTITY);
    const v = h.getOffset3DFromPlaneOffset({x: 1, y: 1});
    assert.equal(v.getX(), 2, 'x scaled by spacing 2');
    assert.equal(v.getY(), 3, 'y scaled by spacing 3');
    assert.equal(v.getZ(), 0, 'z = 0');
  });

}); // describe orientation-independent

// ---------------------------------------------------------------------------
// Non-zero origin geometry
// ---------------------------------------------------------------------------

describe('PlaneHelper non-zero origin', () => {

  const ORIGIN = new Point3D(10, 20, 30);
  let originHelper;

  beforeEach(() => {
    originHelper = new PlaneHelper(
      makeGeometry([4, 4, 4], [1, 1, 1], ORIGIN),
      IDENTITY
    );
  });

  test('getPositionFromPlanePoint adds origin', () => {
    const p3d = originHelper.getPositionFromPlanePoint(
      new Point2D(1, 2), 0);
    assert.equal(p3d.getX(), 11, 'x = 1 + origin.x');
    assert.equal(p3d.getY(), 22, 'y = 2 + origin.y');
    assert.equal(p3d.getZ(), 30, 'z = 0 + origin.z');
  });

  test('getPlanePointFromPosition subtracts origin', () => {
    const p3d = originHelper.getPlanePointFromPosition(
      new Point([11, 22, 30]));
    assert.equal(p3d.getX(), 1, 'x = 11 - origin.x');
    assert.equal(p3d.getY(), 2, 'y = 22 - origin.y');
    assert.equal(p3d.getZ(), 0, 'z = 30 - origin.z');
  });

  test('position round-trip with non-zero origin', () => {
    const plane = new Point2D(2, 3);
    const slice = 1;
    const world = originHelper.getPositionFromPlanePoint(plane, slice);
    const back = originHelper.getPlanePointFromPosition(
      new Point([world.getX(), world.getY(), world.getZ()])
    );
    assert.equal(back.getX(), plane.getX(), 'x round-trip');
    assert.equal(back.getY(), plane.getY(), 'y round-trip');
    assert.equal(back.getZ(), slice, 'z = slice index');
  });

}); // describe non-zero origin
