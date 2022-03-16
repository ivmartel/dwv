/**
 * Tests for the 'utils/array' file.
 */
/** @module tests/utils */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('utils');

// test data
var multipart01 = 'preamble\r\n';
multipart01 += '--boundary\r\n';
multipart01 += '\r\n';
multipart01 += '--boundary--';

// (inspired from https://github.com/jmhmd/parse-multipart-data/blob/master/src/multipart.ts)
var str10 = '------WebKitFormBoundaryvef1fLxmoUdYZWXp\r\n';
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
var multipart10 = {
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
var str11 = 'preamble\r\n';
str11 += str10;
str11 += 'epilogue\r\n';
var multipart11 = {
  str: str11
};

var compareMultipartObjects = function (obj0, obj1) {
  if (obj0.length !== obj1.length) {
    return false;
  }
  for (var i = 0; i < obj0.length; ++i) {
    var keys = Object.keys(obj0[i]);
    for (var k = 0; k < keys.length; ++k) {
      var key = keys[k];
      if (key !== 'data') {
        if (obj0[i][key] !== obj1[i][key]) {
          return false;
        }
      } else {
        for (var j = 0; j < obj0[i].data.length; ++j) {
          if (obj0[i].data[j] !== obj1[i].data[j]) {
            return false;
          }
        }
      }
    }
  }
  return true;
};

var compareBuffers = function (buf1, buf2) {
  if (buf1.byteLength !== buf2.byteLength) {
    console.log('compareBuffers: length', buf1.byteLength, buf2.byteLength);
    return false;
  }
  var dv1 = new Int8Array(buf1);
  var dv2 = new Int8Array(buf2);
  for (var i = 0; i !== buf1.byteLength; i++) {
    if (dv1[i] !== dv2[i]) {
      console.log('compareBuffers: buffer', i, dv1[i], dv2[i]);
      return false;
    }
  }
  return true;
};

/**
 * Tests for {@link dwv.utils.parseMultipart}.
 *
 * @function module:tests/utils~parseMultipart
 */
QUnit.test('Test parseMultipart.', function (assert) {
  // empty
  var res00 = dwv.utils.parseMultipart(new Uint8Array(0).buffer);
  assert.equal(res00.length, 0, 'Empty multipart length');

  // empty part
  var u8Test01 = dwv.utils.stringToUint8Array(multipart01);
  var res01 = dwv.utils.parseMultipart(u8Test01.buffer);
  assert.equal(res01.length, 1, 'Empty multipart part length');
  var keys01 = Object.keys(res01);
  assert.equal(keys01.length, 1, 'Empty multipart part keys length');
  assert.ok(typeof res01[0].data !== 'undefined',
    'Empty multipart part has data');
  assert.equal(res01[0].data.length, 0, 'Empty multipart part data length');

  // test #10
  // parse multipart
  var u8Test10 = dwv.utils.stringToUint8Array(multipart10.str);
  var resMulti10 = dwv.utils.parseMultipart(u8Test10.buffer);
  assert.ok(compareMultipartObjects(resMulti10, multipart10.parts),
    'Compare multipart object #10');
  // build multipart
  var resBuff10 = dwv.utils.buildMultipart(multipart10.parts,
    '----WebKitFormBoundaryvef1fLxmoUdYZWXp');
  assert.ok(compareBuffers(resBuff10, u8Test10),
    'Compare multipart buffer #10');

  // test #11: with preamble and epilogue
  var u8Test11 = dwv.utils.stringToUint8Array(multipart11.str);
  var resMulti11 = dwv.utils.parseMultipart(u8Test11.buffer);
  assert.ok(compareMultipartObjects(resMulti11, multipart10.parts),
    'Compare multipart object #11');
});
