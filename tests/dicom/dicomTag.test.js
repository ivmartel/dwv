import {describe, test, assert} from 'vitest';
import {
  Tag,
  getTagFromKey,
} from '../../src/dicom/dicomTag.js';

/**
 * Tests for the 'dicom/dicomTag.js' file.
 */

describe('dicom', () => {

  /**
   * Tests for {@link Tag}.
   *
   * @function module:tests/dicom~dicomTagClass
   */
  test('DICOM tag class', () => {
    // error cases
    assert.throws(function () {
      new Tag();
    },
    Error,
    'Cannot create tag with no group.',
    'tag with undef group and element.');

    assert.throws(function () {
      new Tag('');
    },
    Error,
    'Cannot create tag with no group.',
    'tag with empty group.');
    assert.throws(function () {
      new Tag('12');
    },
    Error,
    'Cannot create tag with badly sized group: 12',
    'tag with bad group #0.');

    assert.throws(function () {
      new Tag('1234');
    },
    Error,
    'Cannot create tag with no element.',
    'tag with undef element.');
    assert.throws(function () {
      new Tag('1234', '');
    },
    Error,
    'Cannot create tag with no element.',
    'tag with empty element.');
    assert.throws(function () {
      new Tag('1234', '12');
    },
    Error,
    'Cannot create tag with badly sized element: 12',
    'tag with bad element #0.');

    const tag00 = new Tag('1111', '2222');
    assert.notOk(tag00.equals(null), 'equals to null');
    assert.notOk(tag00.equals(), 'equals to undef');
    const tag01 = new Tag('1112', '2222');
    assert.notOk(tag00.equals(tag01), 'not equals #0');
    const tag02 = new Tag('1111', '2221');
    assert.notOk(tag00.equals(tag02), 'not equals #1');
    assert.ok(tag00.equals(tag00), 'equals #0');

    assert.equal(tag00.getKey(), '11112222', 'get key');

    assert.ok(getTagFromKey('11112222').equals(tag00),
      'getTagFromKey');
  });

});