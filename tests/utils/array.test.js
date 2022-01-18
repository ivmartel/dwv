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

// (taken from https://github.com/jmhmd/parse-multipart-data/blob/master/src/multipart.ts)
var multipart10 = 'preamble\r\n';
multipart10 += '------WebKitFormBoundaryvef1fLxmoUdYZWXp\r\n';
multipart10 +=
  'Content-Disposition: form-data; name="uploads[]"; filename="A.txt"\r\n';
multipart10 += 'Content-Type: text/plain\r\n';
multipart10 += '\r\n';
multipart10 += '@11X111Y\r\n';
multipart10 += '111Z\rCCCC\nCCCC\r\nCCCCC@\r\n';
multipart10 += '\r\n';
multipart10 += '------WebKitFormBoundaryvef1fLxmoUdYZWXp\r\n';
multipart10 +=
  'Content-Disposition: form-data; name="uploads[]"; filename="B.txt"\r\n';
multipart10 += 'Content-Type: text/plain\r\n';
multipart10 += '\r\n';
multipart10 += '@22X222Y\r\n';
multipart10 += '222Z\r222W\n2220\r\n';
multipart10 += '666@\r\n';
multipart10 += '------WebKitFormBoundaryvef1fLxmoUdYZWXp\r\n';
multipart10 += 'Content-Disposition: form-data; name="input1"\r\n';
multipart10 += '\r\n';
multipart10 += 'value1\r\n';
multipart10 += '------WebKitFormBoundaryvef1fLxmoUdYZWXp--\r\n';
multipart10 += 'epilogue\r\n';

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

  /* eslint-disable array-element-newline */
  var theo10 = [
    {
      'Content-Disposition': 'form-data; name="uploads[]"; filename="A.txt"',
      'Content-Type': 'text/plain',
      data: new Uint8Array([
        64, 49, 49, 88, 49, 49, 49, 89, 13, 10,
        49, 49, 49, 90, 13, 67, 67, 67, 67, 10, 67, 67, 67, 67, 13, 10,
        67, 67, 67, 67, 67, 64, 13, 10,
        13, 10
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
  ];
  /* eslint-enable array-element-newline */
  var u8Test10 = dwv.utils.stringToUint8Array(multipart10);
  var res10 = dwv.utils.parseMultipart(u8Test10.buffer);
  assert.equal(res10.length, theo10.length, 'Extract size');
  // compare elements
  for (var i = 0; i < res10.length; ++i) {
    var keys = Object.keys(res10[i]);
    for (var k = 0; k < keys.length; ++k) {
      var key = keys[k];
      if (key !== 'data') {
        assert.equal(res10[i][key], theo10[i][key],
          'Extract value ' + i + ':' + k);
      } else {
        var equal = true;
        for (var j = 0; j < res10[i].data.length; ++j) {
          if (res10[i].data[j] !== theo10[i].data[j]) {
            equal = false;
            break;
          }
        }
        assert.ok(equal, 'Extract data');
      }
    }
  }
});
