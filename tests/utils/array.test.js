import {stringToUint8Array} from '../../src/utils/string';
import {
  arrayContains,
  arraySortEquals,
  parseMultipart,
  buildMultipart
} from '../../src/utils/array';

/**
 * Tests for the 'utils/array' file.
 */
/** @module tests/utils */

/* global QUnit */
QUnit.module('utils');

/**
 * Tests for {@link arrayContains}.
 *
 * @function module:tests/utils~arraycontains
 */
QUnit.test('arrayContains', function (assert) {
  let arr00;
  let arrTest000;
  assert.false(arrayContains(arr00, arrTest000), 'contains test #000');
  const arrTest001 = null;
  assert.false(arrayContains(arr00, arrTest001), 'contains test #001');
  const arrTest002 = [];
  assert.false(arrayContains(arr00, arrTest002), 'contains test #002');
  const arrTest003 = [''];
  assert.false(arrayContains(arr00, arrTest003), 'contains test #003');
  const arrTest004 = ['a'];
  assert.false(arrayContains(arr00, arrTest004), 'contains test #004');

  const arr10 = null;
  let arrTest100;
  assert.false(arrayContains(arr10, arrTest100), 'contains test #100');
  const arrTest101 = null;
  assert.false(arrayContains(arr10, arrTest101), 'contains test #101');
  const arrTest102 = [];
  assert.false(arrayContains(arr10, arrTest102), 'contains test #102');
  const arrTest103 = [''];
  assert.false(arrayContains(arr10, arrTest103), 'contains test #103');
  const arrTest104 = ['a'];
  assert.false(arrayContains(arr10, arrTest104), 'contains test #104');

  const arr20 = [];
  let arrTest200;
  assert.false(arrayContains(arr20, arrTest200), 'contains test #200');
  const arrTest201 = null;
  assert.false(arrayContains(arr20, arrTest201), 'contains test #201');
  const arrTest202 = [];
  assert.false(arrayContains(arr20, arrTest202), 'contains test #202');
  const arrTest203 = [''];
  assert.false(arrayContains(arr20, arrTest203), 'contains test #203');
  const arrTest204 = ['a'];
  assert.false(arrayContains(arr20, arrTest204), 'contains test #204');

  const arr30 = ['a', 'b', 'c'];
  const arrTest300 = ['a'];
  assert.true(arrayContains(arr30, arrTest300), 'contains test #300');
  const arrTest301 = ['a', 'b'];
  assert.true(arrayContains(arr30, arrTest301), 'contains test #301');
  const arrTest302 = ['b', 'a'];
  assert.true(arrayContains(arr30, arrTest302), 'contains test #302');
  const arrTest303 = ['a', 'b', 'c'];
  assert.true(arrayContains(arr30, arrTest303), 'contains test #303');
  let arrTest310;
  assert.false(arrayContains(arr30, arrTest310), 'contains test #310');
  const arrTest311 = null;
  assert.false(arrayContains(arr30, arrTest311), 'contains test #311');
  const arrTest312 = [];
  assert.false(arrayContains(arr30, arrTest312), 'contains test #312');
  const arrTest313 = [''];
  assert.false(arrayContains(arr30, arrTest313), 'contains test #313');
  const arrTest320 = ['d'];
  assert.false(arrayContains(arr30, arrTest320), 'contains test #320');
  const arrTest321 = ['a', 'd'];
  assert.false(arrayContains(arr30, arrTest321), 'contains test #321');
  const arrTest322 = ['d', 'a'];
  assert.false(arrayContains(arr30, arrTest322), 'contains test #322');
  const arrTest323 = [0, 'a'];
  assert.false(arrayContains(arr30, arrTest323), 'contains test #323');
  const arrTest324 = ['a', 'b', 'c', 0];
  assert.false(arrayContains(arr30, arrTest324), 'contains test #324');
});

/**
 * Tests for {@link arraySortEquals}.
 *
 * @function module:tests/utils~arraysortequals
 */
QUnit.test('arraySortEquals', function (assert) {
  // null
  assert.notOk(arraySortEquals(null, null), '2 null arrays');
  assert.notOk(arraySortEquals(null, [1, 2, 3]), 'left null array');
  assert.notOk(arraySortEquals([1, 2, 3], null), 'right null array');

  // undefined
  assert.notOk(arraySortEquals(undefined, undefined),
    '2 undefined arrays');
  assert.notOk(arraySortEquals(undefined, [1, 2, 3]),
    'left undefined arrays');
  assert.notOk(arraySortEquals([1, 2, 3], undefined),
    'right undefined arrays');

  // empty
  assert.notOk(arraySortEquals([1], []), 'right empty array');
  assert.notOk(arraySortEquals([], [1]), 'left empty array');
  assert.ok(arraySortEquals([], []), '2 empty arrays');

  // simple arrays
  const arr00 = [1, 2, 3];
  assert.ok(arraySortEquals(arr00, arr00), 'array equal #0');
  const arr01 = [3, 2, 1];
  assert.ok(arraySortEquals(arr00, arr01), 'array equal #1');
  const arr02 = [1, 2, 3, 4];
  assert.notOk(arraySortEquals(arr00, arr02), 'array equal #2');
  const arr03 = [1, 'a', null, undefined];
  assert.ok(arraySortEquals(arr03, arr03), 'array equal #3');

  // array of object
  const arr10 = [{a: 0}];
  const arr11 = [{a: 0}];
  assert.notOk(arraySortEquals(arr10, arr11),
    'array of object equal #0');
  const obj = {a: 0};
  const arr12 = [obj];
  const arr13 = [obj];
  assert.ok(arraySortEquals(arr12, arr13),
    'array of object equal #1');
});

// test data
let multipart01 = 'preamble\r\n';
multipart01 += '--boundary\r\n';
multipart01 += '\r\n';
multipart01 += '--boundary--';

// (inspired from https://github.com/jmhmd/parse-multipart-data/blob/master/src/multipart.ts)
let str10 = '------WebKitFormBoundaryvef1fLxmoUdYZWXp\r\n';
str10 +=
  'Content-Disposition: form-data; name="uploads[]"; filename="A.txt"\r\n';
str10 += 'Content-Type: text/plain\r\n';
str10 += '\r\n';
str10 += '@11X111Y\r\n';
str10 += '111Z\rCCCC\nCCCC\r\nCCCCC@\r\n';
str10 += '\r\n';
str10 += '------WebKitFormBoundaryvef1fLxmoUdYZWXp\r\n';
str10 +=
  'Content-Disposition: form-data; name="uploads[]"; filename="B.txt"\r\n';
str10 += 'Content-Type: text/plain\r\n';
str10 += '\r\n';
str10 += '@22X222Y\r\n';
str10 += '222Z\r222W\n2220\r\n';
str10 += '666@\r\n';
str10 += '\r\n';
str10 += '------WebKitFormBoundaryvef1fLxmoUdYZWXp\r\n';
str10 += 'Content-Disposition: form-data; name="input1"\r\n';
str10 += '\r\n';
str10 += 'value1\r\n';
str10 += '\r\n';
str10 += '------WebKitFormBoundaryvef1fLxmoUdYZWXp--\r\n';

/* eslint-disable array-element-newline */
const multipart10 = {
  str: str10,
  parts: [
    {
      'Content-Disposition': 'form-data; name="uploads[]"; filename="A.txt"',
      'Content-Type': 'text/plain',
      data: new Uint8Array([
        64, 49, 49, 88, 49, 49, 49, 89, 13, 10,
        49, 49, 49, 90, 13, 67, 67, 67, 67, 10, 67, 67, 67, 67, 13, 10,
        67, 67, 67, 67, 67, 64, 13, 10
      ])
    },
    {
      'Content-Disposition': 'form-data; name="uploads[]"; filename="B.txt"',
      'Content-Type': 'text/plain',
      data: new Uint8Array([
        64, 50, 50, 88, 50, 50, 50, 89, 13, 10,
        50, 50, 50, 90, 13, 50, 50, 50, 87, 10, 50, 50, 50, 48, 13, 10,
        54, 54, 54, 64, 13, 10
      ])
    },
    {
      'Content-Disposition': 'form-data; name="input1"',
      data: new Uint8Array([
        118, 97, 108, 117, 101, 49, 13, 10
      ])
    }
  ]
};
/* eslint-enable array-element-newline */

// with preamble and epilogue
let str11 = 'preamble\r\n';
str11 += str10;
str11 += 'epilogue\r\n';
const multipart11 = {
  str: str11
};

const compareMultipartObjects = function (obj0, obj1) {
  if (obj0.length !== obj1.length) {
    return false;
  }
  for (let i = 0; i < obj0.length; ++i) {
    const keys = Object.keys(obj0[i]);
    for (let k = 0; k < keys.length; ++k) {
      const key = keys[k];
      if (key !== 'data') {
        if (obj0[i][key] !== obj1[i][key]) {
          return false;
        }
      } else {
        for (let j = 0; j < obj0[i].data.length; ++j) {
          if (obj0[i].data[j] !== obj1[i].data[j]) {
            return false;
          }
        }
      }
    }
  }
  return true;
};

const compareBuffers = function (buf1, buf2) {
  if (buf1.byteLength !== buf2.byteLength) {
    console.log('compareBuffers: length', buf1.byteLength, buf2.byteLength);
    return false;
  }
  const dv1 = new Int8Array(buf1);
  const dv2 = new Int8Array(buf2);
  for (let i = 0; i !== buf1.byteLength; i++) {
    if (dv1[i] !== dv2[i]) {
      console.log('compareBuffers: buffer', i, dv1[i], dv2[i]);
      return false;
    }
  }
  return true;
};

/**
 * Tests for {@link parseMultipart}.
 *
 * @function module:tests/utils~parse-multipart
 */
QUnit.test('Parse multipart - #DWV-REQ-IO-02-002 Load DICOM multipart URL',
  function (assert) {
    // empty
    const res00 = parseMultipart(new Uint8Array(0).buffer);
    assert.equal(res00.length, 0, 'Empty multipart length');

    // empty part
    const u8Test01 = stringToUint8Array(multipart01);
    const res01 = parseMultipart(u8Test01.buffer);
    assert.equal(res01.length, 1, 'Empty multipart part length');
    const keys01 = Object.keys(res01);
    assert.equal(keys01.length, 1, 'Empty multipart part keys length');
    assert.ok(typeof res01[0].data !== 'undefined',
      'Empty multipart part has data');
    assert.equal(res01[0].data.length, 0, 'Empty multipart part data length');

    // test #10
    // parse multipart
    const u8Test10 = stringToUint8Array(multipart10.str);
    const resMulti10 = parseMultipart(u8Test10.buffer);
    assert.ok(compareMultipartObjects(resMulti10, multipart10.parts),
      'Compare multipart object #10');
    // build multipart
    const resBuff10 = buildMultipart(multipart10.parts,
      '----WebKitFormBoundaryvef1fLxmoUdYZWXp');
    assert.ok(compareBuffers(resBuff10, u8Test10),
      'Compare multipart buffer #10');

    // test #11: with preamble and epilogue
    const u8Test11 = stringToUint8Array(multipart11.str);
    const resMulti11 = parseMultipart(u8Test11.buffer);
    assert.ok(compareMultipartObjects(resMulti11, multipart10.parts),
      'Compare multipart object #11');
  }
);
