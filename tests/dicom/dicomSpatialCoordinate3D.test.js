import {describe, test, assert} from 'vitest';
import {
  SpatialCoordinate3D,
  getSpatialCoordinate3D,
  getDicomSpatialCoordinate3DItem
} from '../../src/dicom/dicomSpatialCoordinate3D.js';
import {DataElement} from '../../src/dicom/dataElement.js';

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  GraphicData: '00700022',
  GraphicType: '00700023',
  ReferencedFrameofReferenceUID: '30060024',
  FiducialUID: '0070031A'
};

/**
 * Tests for the 'dicom/dicomSpatialCoordinate3D.js' file.
 */

describe('dicom', () => {

  describe('SpatialCoordinate3D', () => {

    test('constructor creates instance with undefined properties', () => {
      const coord = new SpatialCoordinate3D();
      assert.isUndefined(coord.graphicData);
      assert.isUndefined(coord.graphicType);
      assert.isUndefined(coord.referencedFrameofReferenceUID);
      assert.isUndefined(coord.fiducialUID);
    });

    test('toString with graphic type and data', () => {
      const coord = new SpatialCoordinate3D();
      coord.graphicType = 'POINT';
      coord.graphicData = ['1.0', '2.0', '3.0'];

      const result = coord.toString();
      assert.equal(result, 'POINT {1.0,2.0,3.0}');
    });

    test('toString with multiple graphic data points', () => {
      const coord = new SpatialCoordinate3D();
      coord.graphicType = 'POLYLINE';
      coord.graphicData = ['1.0', '2.0', '3.0', '4.0', '5.0', '6.0'];

      const result = coord.toString();
      assert.equal(result, 'POLYLINE {1.0,2.0,3.0,4.0,5.0,6.0}');
    });

    test('toString with empty graphic data', () => {
      const coord = new SpatialCoordinate3D();
      coord.graphicType = 'POINT';
      coord.graphicData = [];

      const result = coord.toString();
      assert.equal(result, 'POINT {}');
    });

  });

  describe('getSpatialCoordinate3D', () => {

    test('extracts all properties', () => {
      const deGraphicData = new DataElement('OD');
      deGraphicData.value = ['1.0', '2.0', '3.0'];

      const deGraphicType = new DataElement('CS');
      deGraphicType.value = ['POINT'];

      const deFrameUID = new DataElement('UI');
      deFrameUID.value = ['1.2.3.4.5'];

      const deFiducialUID = new DataElement('UI');
      deFiducialUID.value = ['1.2.3.4.6'];

      const dataElements = {
        [TagKeys.GraphicData]: deGraphicData,
        [TagKeys.GraphicType]: deGraphicType,
        [TagKeys.ReferencedFrameofReferenceUID]: deFrameUID,
        [TagKeys.FiducialUID]: deFiducialUID
      };

      const result = getSpatialCoordinate3D(dataElements);

      assert.deepEqual(result.graphicData, ['1.0', '2.0', '3.0']);
      assert.equal(result.graphicType, 'POINT');
      assert.equal(result.referencedFrameofReferenceUID, '1.2.3.4.5');
      assert.equal(result.fiducialUID, '1.2.3.4.6');
    });

    test('extracts only graphic type and data', () => {
      const deGraphicData = new DataElement('OD');
      deGraphicData.value = ['1.0', '2.0', '3.0'];

      const deGraphicType = new DataElement('CS');
      deGraphicType.value = ['POLYLINE'];

      const dataElements = {
        [TagKeys.GraphicData]: deGraphicData,
        [TagKeys.GraphicType]: deGraphicType
      };

      const result = getSpatialCoordinate3D(dataElements);

      assert.deepEqual(result.graphicData, ['1.0', '2.0', '3.0']);
      assert.equal(result.graphicType, 'POLYLINE');
      assert.isUndefined(result.referencedFrameofReferenceUID);
      assert.isUndefined(result.fiducialUID);
    });

    test('extracts graphic data with multiple values', () => {
      const deGraphicData = new DataElement('OD');
      deGraphicData.value = [
        '1.0', '2.0', '3.0', '4.0', '5.0', '6.0', '7.0', '8.0', '9.0'
      ];

      const deGraphicType = new DataElement('CS');
      deGraphicType.value = ['POLYGON'];

      const dataElements = {
        [TagKeys.GraphicData]: deGraphicData,
        [TagKeys.GraphicType]: deGraphicType
      };

      const result = getSpatialCoordinate3D(dataElements);

      assert.equal(result.graphicData.length, 9);
      assert.deepEqual(result.graphicData, [
        '1.0', '2.0', '3.0', '4.0', '5.0', '6.0', '7.0', '8.0', '9.0'
      ]);
    });

    test('extracts only frame reference UID', () => {
      const deFrameUID = new DataElement('UI');
      deFrameUID.value = ['1.2.3.4.5'];

      const dataElements = {
        [TagKeys.ReferencedFrameofReferenceUID]: deFrameUID
      };

      const result = getSpatialCoordinate3D(dataElements);

      assert.isUndefined(result.graphicData);
      assert.isUndefined(result.graphicType);
      assert.equal(result.referencedFrameofReferenceUID, '1.2.3.4.5');
      assert.isUndefined(result.fiducialUID);
    });

    test('extracts only fiducial UID', () => {
      const deFiducialUID = new DataElement('UI');
      deFiducialUID.value = ['1.2.3.4.6'];

      const dataElements = {
        [TagKeys.FiducialUID]: deFiducialUID
      };

      const result = getSpatialCoordinate3D(dataElements);

      assert.isUndefined(result.graphicData);
      assert.isUndefined(result.graphicType);
      assert.isUndefined(result.referencedFrameofReferenceUID);
      assert.equal(result.fiducialUID, '1.2.3.4.6');
    });

    test('returns empty SpatialCoordinate3D when no tags present', () => {
      const result = getSpatialCoordinate3D({});

      assert.isUndefined(result.graphicData);
      assert.isUndefined(result.graphicType);
      assert.isUndefined(result.referencedFrameofReferenceUID);
      assert.isUndefined(result.fiducialUID);
    });

    test('takes first value from graphic type array', () => {
      const deGraphicType = new DataElement('CS');
      deGraphicType.value = ['POINT', 'EXTRA'];

      const dataElements = {
        [TagKeys.GraphicType]: deGraphicType
      };

      const result = getSpatialCoordinate3D(dataElements);

      assert.equal(result.graphicType, 'POINT');
    });

  });

  describe('getDicomSpatialCoordinate3DItem', () => {

    test('converts all properties to item', () => {
      const coord = new SpatialCoordinate3D();
      coord.graphicData = ['1.0', '2.0', '3.0'];
      coord.graphicType = 'POINT';
      coord.referencedFrameofReferenceUID = '1.2.3.4.5';
      coord.fiducialUID = '1.2.3.4.6';

      const item = getDicomSpatialCoordinate3DItem(coord);

      assert.deepEqual(item.GraphicData, ['1.0', '2.0', '3.0']);
      assert.equal(item.GraphicType, 'POINT');
      assert.equal(item.ReferencedFrameofReferenceUID, '1.2.3.4.5');
      assert.equal(item.FiducialUID, '1.2.3.4.6');
    });

    test('converts only graphic type and data', () => {
      const coord = new SpatialCoordinate3D();
      coord.graphicData = ['1.0', '2.0', '3.0'];
      coord.graphicType = 'POLYLINE';

      const item = getDicomSpatialCoordinate3DItem(coord);

      assert.deepEqual(item.GraphicData, ['1.0', '2.0', '3.0']);
      assert.equal(item.GraphicType, 'POLYLINE');
      assert.isUndefined(item.ReferencedFrameofReferenceUID);
      assert.isUndefined(item.FiducialUID);
    });

    test('omits undefined fields', () => {
      const coord = new SpatialCoordinate3D();
      coord.graphicType = 'POINT';
      coord.fiducialUID = '1.2.3.4.6';

      const item = getDicomSpatialCoordinate3DItem(coord);

      assert.isUndefined(item.GraphicData);
      assert.equal(item.GraphicType, 'POINT');
      assert.isUndefined(item.ReferencedFrameofReferenceUID);
      assert.equal(item.FiducialUID, '1.2.3.4.6');
    });

    test('returns empty object when no properties set', () => {
      const coord = new SpatialCoordinate3D();
      const item = getDicomSpatialCoordinate3DItem(coord);

      assert.deepEqual(item, {});
    });

    test('preserves graphic data array', () => {
      const coord = new SpatialCoordinate3D();
      const graphicArray = ['1.0', '2.0', '3.0', '4.0', '5.0', '6.0'];
      coord.graphicData = graphicArray;

      const item = getDicomSpatialCoordinate3DItem(coord);

      assert.deepEqual(item.GraphicData, graphicArray);
      assert.equal(item.GraphicData.length, 6);
    });

  });

  describe('round-trip conversion via items', () => {

    test('dataElements -> SpatialCoordinate3D -> item -> SpatialCoordinate3D',
      () => {
        const deGraphicData = new DataElement('OD');
        deGraphicData.value = ['1.5', '2.5', '3.5'];

        const deGraphicType = new DataElement('CS');
        deGraphicType.value = ['POLYLINE'];

        const deFrameUID = new DataElement('UI');
        deFrameUID.value = ['1.2.3.4.5'];

        const deFiducialUID = new DataElement('UI');
        deFiducialUID.value = ['1.2.3.4.6'];

        const dataElements = {
          [TagKeys.GraphicData]: deGraphicData,
          [TagKeys.GraphicType]: deGraphicType,
          [TagKeys.ReferencedFrameofReferenceUID]: deFrameUID,
          [TagKeys.FiducialUID]: deFiducialUID
        };

        const coord1 = getSpatialCoordinate3D(dataElements);
        const item = getDicomSpatialCoordinate3DItem(coord1);

        // recreate SpatialCoordinate3D from item
        const coord2 = new SpatialCoordinate3D();
        if (typeof item.GraphicData !== 'undefined') {
          coord2.graphicData = item.GraphicData;
        }
        if (typeof item.GraphicType !== 'undefined') {
          coord2.graphicType = item.GraphicType;
        }
        if (typeof item.ReferencedFrameofReferenceUID !== 'undefined') {
          coord2.referencedFrameofReferenceUID =
            item.ReferencedFrameofReferenceUID;
        }
        if (typeof item.FiducialUID !== 'undefined') {
          coord2.fiducialUID = item.FiducialUID;
        }

        // verify round-trip
        assert.deepEqual(coord1.graphicData, coord2.graphicData);
        assert.equal(coord1.graphicType, coord2.graphicType);
        assert.equal(coord1.referencedFrameofReferenceUID,
          coord2.referencedFrameofReferenceUID);
        assert.equal(coord1.fiducialUID, coord2.fiducialUID);
      }
    );

  });

});
