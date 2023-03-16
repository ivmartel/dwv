import {
  isObject,
  isArray,
  mergeObjects
} from '../../src/utils/operator';

/**
 * Tests for the 'utils/operator.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */

/**
 * Tests for {@link isObject}.
 *
 * @function module:tests/utils~isObject
 */
QUnit.test('Test isObject.', function (assert) {
  var obj01 = {name: 'dwv', type: 'app'};
  assert.equal(isObject(obj01), true, 'test with object');

  var obj02 = ['one', 'two', 'three'];
  assert.equal(isObject(obj02), true, 'test with array');

  var obj03 = 1;
  assert.equal(isObject(obj03), false, 'test with number');

  var obj04 = null;
  assert.equal(isObject(obj04), false, 'test with null');

  var obj05 = true;
  assert.equal(isObject(obj05), false, 'test with bool');
});

/**
 * Tests for {@link isArray}.
 *
 * @function module:tests/utils~isArray
 */
QUnit.test('Test isArray.', function (assert) {
  var obj01 = {name: 'dwv', type: 'app'};
  assert.equal(isArray(obj01), false, 'test with object');

  var obj02 = ['one', 'two', 'three'];
  assert.equal(isArray(obj02), true, 'test with array');

  var obj03 = 1;
  assert.equal(isArray(obj03), false, 'test with number');

  var obj04 = null;
  assert.equal(isArray(obj04), false, 'test with null');

  var obj05 = true;
  assert.equal(isArray(obj05), false, 'test with bool');
});

/**
 * Tests for {@link mergeObjects}.
 *
 * @function module:tests/utils~mergeObjects
 */
QUnit.test('Test merge objects.', function (assert) {
  var obj001 = {id: {value: 0}, a: {value: 1}, b: {value: 1}};
  var obj002 = {id: {value: 1}, a: {value: 1}, b: {value: 2}};

  // bad id key
  var fbad01 = function () {
    mergeObjects(obj001, obj002, 'x', 'value');
  };
  assert.throws(fbad01, 'merge bad id key');

  // bad value key
  var fbad02 = function () {
    mergeObjects(obj001, obj002, 'id', 'x');
  };
  assert.throws(fbad02, 'merge bad value key');

  // same id
  var obj003 = {id: {value: 0}, a: {value: 1}, b: {value: 2}};
  var fbad03 = function () {
    mergeObjects(obj001, obj003, 'id', 'value');
  };
  assert.throws(fbad03, 'merge with same id value');

  // test #00: simple
  var ref00 = {
    id: {value: [0, 1], merged: true},
    a: {value: 1},
    b: {value: {
      0: {value: 1},
      1: {value: 2}
    }}
  };
  var res00 = mergeObjects(obj001, obj002, 'id', 'value');
  assert.equal(
    JSON.stringify(res00),
    JSON.stringify(ref00),
    'merge objects 00');

  // test #01: array values
  var obj011 = {id: {value: 0}, a: {value: 1}, b: {value: [1]}};
  var obj012 = {id: {value: 1}, a: {value: 1}, b: {value: [2]}};
  var ref01 = {
    id: {value: [0, 1], merged: true},
    a: {value: 1},
    b: {value: {
      0: {value: [1]},
      1: {value: [2]}
    }}
  };
  var res01 = mergeObjects(obj011, obj012, 'id', 'value');
  assert.equal(
    JSON.stringify(res01),
    JSON.stringify(ref01),
    'merge objects 01');

  // test #02: merge with already merged
  var obj021 = {
    id: {value: [0, 1], merged: true},
    a: {value: 1},
    b: {value: {
      0: {value: 1},
      1: {value: 2}
    }}
  };
  var obj022 = {id: {value: 2}, a: {value: 1}, b: {value: 2}};
  var ref02 = {
    id: {value: [0, 1, 2], merged: true},
    a: {value: 1},
    b: {value: {
      0: {value: 1},
      1: {value: 2},
      2: {value: 2}
    }}
  };
  var res02 = mergeObjects(obj021, obj022, 'id', 'value');
  assert.equal(
    JSON.stringify(res02),
    JSON.stringify(ref02),
    'merge objects 02');

  // test #03: merge with already merged that contains a repeated value
  var obj031 = {
    id: {value: [0, 1], merged: true},
    a: {value: 1},
    b: {value: {
      0: {value: 1},
      1: {value: 2}
    }}
  };
  var obj032 = {id: {value: 2}, a: {value: 2}, b: {value: 3}};
  var ref03 = {
    id: {value: [0, 1, 2], merged: true},
    a: {value: {
      0: {value: 1},
      1: {value: 1},
      2: {value: 2}
    }},
    b: {value: {
      0: {value: 1},
      1: {value: 2},
      2: {value: 3}
    }}
  };
  var res03 = mergeObjects(obj031, obj032, 'id', 'value');
  assert.equal(
    JSON.stringify(res03),
    JSON.stringify(ref03),
    'merge objects 03');

  // test #10: missing key in first object
  var obj101 = {id: {value: 0}, a: {value: 1}};
  var obj102 = {id: {value: 1}, a: {value: 2}, b: {value: 1}};
  var ref10 = {
    id: {value: [0, 1], merged: true},
    a: {value: {
      0: {value: 1},
      1: {value: 2}
    }},
    b: {value: {
      0: null,
      1: {value: 1}
    }}
  };
  var res10 = mergeObjects(obj101, obj102, 'id', 'value');
  assert.equal(
    JSON.stringify(res10),
    JSON.stringify(ref10),
    'merge objects 10');

  // test #10: missing key in second object
  var obj111 = {id: {value: 0}, a: {value: 1}, b: {value: 1}};
  var obj112 = {id: {value: 1}, a: {value: 2}};
  var ref11 = {
    id: {value: [0, 1], merged: true},
    a: {value: {
      0: {value: 1},
      1: {value: 2}
    }},
    b: {value: {
      0: {value: 1},
      1: null
    }}
  };
  var res11 = mergeObjects(obj111, obj112, 'id', 'value');
  assert.equal(
    JSON.stringify(res11),
    JSON.stringify(ref11),
    'merge objects 11');

  // test #12: missing value in first object
  var obj121 = {id: {value: 0}, a: {value: 1}, b: {}};
  var obj122 = {id: {value: 1}, a: {value: 2}, b: {value: 1}};
  var ref12 = {
    id: {value: [0, 1], merged: true},
    a: {value: {
      0: {value: 1},
      1: {value: 2}
    }},
    b: {value: {
      0: {},
      1: {value: 1}
    }}
  };
  var res12 = mergeObjects(obj121, obj122, 'id', 'value');
  assert.equal(
    JSON.stringify(res12),
    JSON.stringify(ref12),
    'merge objects 12');

  // test #13: missing value in second object
  var obj131 = {id: {value: 0}, a: {value: 1}, b: {value: 1}};
  var obj132 = {id: {value: 1}, a: {value: 2}, b: {}};
  var ref13 = {
    id: {value: [0, 1], merged: true},
    a: {value: {
      0: {value: 1},
      1: {value: 2}
    }},
    b: {value: {
      0: {value: 1},
      1: {}
    }}
  };
  var res13 = mergeObjects(obj131, obj132, 'id', 'value');
  assert.equal(
    JSON.stringify(res13),
    JSON.stringify(ref13),
    'merge objects 13');

});
