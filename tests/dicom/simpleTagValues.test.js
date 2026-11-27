// @vitest-environment jsdom
import {describe, test, assert} from 'vitest';
import {DicomParser} from '../../src/dicom/dicomParser.js';
import {DicomWriter} from '../../src/dicom/dicomWriter.js';
import {
  getElementsFromSimpleTagValues
} from '../../src/dicom/simpleTagValues.js';
import {b64urlToArrayBuffer} from './utils.js';

// test data
import dwvTestAnonymise from '/tests/data/dwv-test-anonymise.dcm?inline';

/**
 * Tests for the 'dicom/simpleTagValues.js' file.
 */

describe('dicom', () => {

  /**
   * Tests for {@link getElementsFromSimpleTagValues} with typed array values.
   *
   * @function module:tests/dicom~getElementsFromSimpleTagValuesTypedArray
   */
  test('getElementsFromSimpleTagValues typed array', () => {
    const points = new Float32Array([1.5, -2.25, 3.125]);
    const indices = new Uint16Array([1, 2, 3]);
    const longIndices = new Uint32Array([1, 2, 70000]);
    const elements = getElementsFromSimpleTagValues({
      SurfaceSequence: {
        value: [
          {
            SurfacePointsSequence: {
              value: [{
                NumberOfSurfacePoints: 1,
                PointCoordinatesData: points
              }]
            },
            SurfaceMeshPrimitivesSequence: {
              value: [{
                TrianglePointIndexList: indices,
                LongTrianglePointIndexList: longIndices
              }]
            }
          }
        ]
      }
    });

    const surface = elements['00660002'].value[0];
    const pointsItem = surface['00660011'].value[0];
    assert.equal(pointsItem['00660015'].vr, 'UL', 'number of points vr');
    assert.deepEqual(pointsItem['00660015'].value, [1],
      'number of points value');
    assert.equal(pointsItem['00660016'].vr, 'OF', 'points vr');
    assert.equal(pointsItem['00660016'].value, points, 'points value');
    const meshItem = surface['00660013'].value[0];
    assert.equal(meshItem['00660023'].vr, 'OW', 'indices vr');
    assert.equal(meshItem['00660023'].value, indices, 'indices value');
    assert.equal(meshItem['00660041'].vr, 'OL', 'long indices vr');
    assert.equal(meshItem['00660041'].value, longIndices,
      'long indices value');

    // write and read back
    const parser = new DicomParser();
    parser.parse(b64urlToArrayBuffer(dwvTestAnonymise));
    const fileElements = parser.getDicomElements();
    fileElements['00660002'] = elements['00660002'];

    const newParser = new DicomParser();
    newParser.parse(new DicomWriter().getBuffer(fileElements));
    const readSurface = newParser.getDicomElements()['00660002'].value[0];
    const readPoints = readSurface['00660011'].value[0]['00660016'].value;
    assert.ok(readPoints instanceof Float32Array, 'read points type');
    assert.deepEqual(Array.from(readPoints), Array.from(points),
      'read points value');
    const readMesh = readSurface['00660013'].value[0];
    assert.deepEqual(Array.from(readMesh['00660023'].value),
      Array.from(indices), 'read indices value');
    assert.deepEqual(Array.from(readMesh['00660041'].value),
      Array.from(longIndices), 'read long indices value');
  });

});
