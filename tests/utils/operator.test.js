import {describe, test, assert} from 'vitest';
import {mergeObjects} from '../../src/utils/operator.js';

/**
 * Tests for the 'utils/operator.js' file.
 */

describe('utils', () => {

  /**
   * Tests for {@link mergeObjects}.
   *
   * @function module:tests/utils~mergePbjects
   */
  test('Merge objects', () => {
    const obj001 = {id: {value: ['0']}, a: {value: [1]}, b: {value: [1]}};
    const obj002 = {id: {value: ['1']}, a: {value: [1]}, b: {value: [2]}};

    // bad id key
    const fbad01 = function () {
      mergeObjects(obj001, obj002, 'x', 'value');
    };
    assert.throws(
      fbad01,
      Error,
      'Id key not found in first object while merging: x, obj: [object Object]',
      'merge bad id key');

    // bad value key
    const fbad02 = function () {
      mergeObjects(obj001, obj002, 'id', 'x');
    };
    assert.throws(
      fbad02,
      Error,
      'Id value not found in first object while merging: id, ' +
      'valueKey: x, ojb: [object Object]',
      'merge bad value key');

    // same id
    const obj003 = {id: {value: ['0']}, a: {value: [1]}, b: {value: [2]}};
    const fbad03 = function () {
      mergeObjects(obj001, obj003, 'id', 'value');
    };
    assert.throws(
      fbad03,
      Error,
      'Cannot merge object with same ids: 0, id2: 0',
      'merge with same id value');

    // test #00: simple
    const ref00 = {
      mergeId: ['0', '1'],
      id: {value: {0: ['0'], 1: ['1']}},
      a: {value: [1]},
      b: {value: {
        0: [1],
        1: [2]
      }}
    };
    const res00 = mergeObjects(obj001, obj002, 'id', 'value');
    assert.equal(
      JSON.stringify(res00),
      JSON.stringify(ref00),
      'merge objects 00');

    // test #01: array values
    const obj011 = {id: {value: ['0']}, a: {value: [1]}, b: {value: [1]}};
    const obj012 = {id: {value: ['1']}, a: {value: [1]}, b: {value: [2]}};
    const ref01 = {
      mergeId: ['0', '1'],
      id: {value: {0: ['0'], 1: ['1']}},
      a: {value: [1]},
      b: {value: {
        0: [1],
        1: [2]
      }}
    };
    const res01 = mergeObjects(obj011, obj012, 'id', 'value');
    assert.equal(
      JSON.stringify(res01),
      JSON.stringify(ref01),
      'merge objects 01');

    // test #02: merge with already merged
    const obj021 = {
      mergeId: ['0', '1'],
      id: {value: {0: ['0'], 1: ['1']}},
      a: {value: [1]},
      b: {value: {
        0: [1],
        1: [2]
      }}
    };
    const obj022 = {id: {value: ['2']}, a: {value: [1]}, b: {value: [2]}};
    const ref02 = {
      mergeId: ['0', '1', '2'],
      id: {value: {0: ['0'], 1: ['1'], 2: ['2']}},
      a: {value: [1]},
      b: {value: {
        0: [1],
        1: [2],
        2: [2]
      }}
    };
    const res02 = mergeObjects(obj021, obj022, 'id', 'value');
    assert.equal(
      JSON.stringify(res02),
      JSON.stringify(ref02),
      'merge objects 02');

    // test #03: merge with already merged that contains a repeated value
    const obj031 = {
      mergeId: ['0', '1'],
      id: {value: {0: ['0'], 1: ['1']}},
      a: {value: [1]},
      b: {value: {
        0: [1],
        1: [2]
      }}
    };
    const obj032 = {id: {value: ['2']}, a: {value: [2]}, b: {value: [3]}};
    const ref03 = {
      mergeId: ['0', '1', '2'],
      id: {value: {0: ['0'], 1: ['1'], 2: ['2']}},
      a: {value: {
        0: [1],
        1: [1],
        2: [2]
      }},
      b: {value: {
        0: [1],
        1: [2],
        2: [3]
      }}
    };
    const res03 = mergeObjects(obj031, obj032, 'id', 'value');
    assert.equal(
      JSON.stringify(res03),
      JSON.stringify(ref03),
      'merge objects 03');

    // test #10: missing key in first object
    const obj101 = {id: {value: ['0']}, a: {value: [1]}};
    const obj102 = {id: {value: ['1']}, a: {value: [2]}, b: {value: [1]}};
    const ref10 = {
      mergeId: ['0', '1'],
      id: {value: {0: ['0'], 1: ['1']}},
      a: {value: {
        0: [1],
        1: [2]
      }},
      b: {value: {
        0: undefined,
        1: [1]
      }}
    };
    const res10 = mergeObjects(obj101, obj102, 'id', 'value');
    assert.equal(
      JSON.stringify(res10),
      JSON.stringify(ref10),
      'merge objects 10');

    // test #10: missing key in second object
    const obj111 = {id: {value: ['0']}, a: {value: [1]}, b: {value: [1]}};
    const obj112 = {id: {value: ['1']}, a: {value: [2]}};
    const ref11 = {
      mergeId: ['0', '1'],
      id: {value: {0: ['0'], 1: ['1']}},
      a: {value: {
        0: [1],
        1: [2]
      }},
      b: {value: {
        0: [1],
        1: undefined
      }}
    };
    const res11 = mergeObjects(obj111, obj112, 'id', 'value');
    assert.equal(
      JSON.stringify(res11),
      JSON.stringify(ref11),
      'merge objects 11');

    // test #12: missing value in first object
    const obj121 = {id: {value: ['0']}, a: {value: [1]}, b: {}};
    const obj122 = {id: {value: ['1']}, a: {value: [2]}, b: {value: [1]}};
    const ref12 = {
      mergeId: ['0', '1'],
      id: {value: {0: ['0'], 1: ['1']}},
      a: {value: {
        0: [1],
        1: [2]
      }},
      b: {value: {
        0: undefined,
        1: [1]
      }}
    };
    const res12 = mergeObjects(obj121, obj122, 'id', 'value');
    assert.equal(
      JSON.stringify(res12),
      JSON.stringify(ref12),
      'merge objects 12');

    // test #13: missing value in second object
    const obj131 = {id: {value: ['0']}, a: {value: [1]}, b: {value: [1]}};
    const obj132 = {id: {value: ['1']}, a: {value: [2]}, b: {}};
    const ref13 = {
      mergeId: ['0', '1'],
      id: {value: {0: ['0'], 1: ['1']}},
      a: {value: {
        0: [1],
        1: [2]
      }},
      b: {value: {
        0: [1],
        1: undefined
      }}
    };
    const res13 = mergeObjects(obj131, obj132, 'id', 'value');
    assert.equal(
      JSON.stringify(res13),
      JSON.stringify(ref13),
      'merge objects 13');

    // immutability: simple merge must not change input objects,
    //   and modifying input must not change the merged object
    const obj_i01 = {id: {value: ['0']}, a: {value: [1]}, b: {value: [1]}};
    const obj_i02 = {id: {value: ['1']}, a: {value: [2]}, b: {value: [2]}};
    const res_i0 = mergeObjects(obj_i01, obj_i02, 'id', 'value');
    const res_i0_str = JSON.stringify(res_i0);
    assert.equal(
      JSON.stringify(obj_i01),
      JSON.stringify({id: {value: ['0']}, a: {value: [1]}, b: {value: [1]}}),
      'merge does not mutate first object (simple)');
    assert.equal(
      JSON.stringify(obj_i02),
      JSON.stringify({id: {value: ['1']}, a: {value: [2]}, b: {value: [2]}}),
      'merge does not mutate second object (simple)');
    obj_i01.id.value = ['modified'];
    assert.equal(
      JSON.stringify(res_i0),
      res_i0_str,
      'first object mutation does not change merged object (simple)');

    // immutability: merge with already merged must not change first object,
    //   and modifying input must not change the merged object
    const obj_i11 = {
      mergeId: ['0', '1'],
      id: {value: {0: ['0'], 1: ['1']}},
      a: {value: [1]},
      b: {value: {0: [1], 1: [2]}}
    };
    const obj_i12 = {id: {value: ['2']}, a: {value: [1]}, b: {value: [3]}};
    const res_i1 = mergeObjects(obj_i11, obj_i12, 'id', 'value');
    const res_i1_str = JSON.stringify(res_i1);
    assert.equal(
      JSON.stringify(obj_i11),
      JSON.stringify({
        mergeId: ['0', '1'],
        id: {value: {0: ['0'], 1: ['1']}},
        a: {value: [1]},
        b: {value: {0: [1], 1: [2]}}
      }),
      'merge does not mutate first object (already merged)');
    obj_i11.id.value[0] = ['modified'];
    obj_i11.b.value[0] = [99];
    assert.equal(
      JSON.stringify(res_i1),
      res_i1_str,
      'first object mutation does not change merged object (already merged)');

    // test with idSuffix: simple merge
    const obj_s01 = {id: {value: ['0']}, a: {value: [1]}, b: {value: [1]}};
    const obj_s02 = {id: {value: ['1']}, a: {value: [1]}, b: {value: [2]}};
    const ref_s0 = {
      mergeId: ['0_s', '1_s'],
      id: {value: {'0_s': ['0'], '1_s': ['1']}},
      a: {value: [1]},
      b: {value: {
        '0_s': [1],
        '1_s': [2]
      }}
    };
    const res_s0 = mergeObjects(obj_s01, obj_s02, 'id', 'value', '_s');
    assert.equal(
      JSON.stringify(res_s0),
      JSON.stringify(ref_s0),
      'merge objects with idSuffix s0');

    // test with idSuffix: merge with already merged
    const obj_s11 = {
      mergeId: ['0_s', '1_s'],
      id: {value: {'0_s': ['0'], '1_s': ['1']}},
      a: {value: [1]},
      b: {value: {
        '0_s': [1],
        '1_s': [2]
      }}
    };
    const obj_s12 = {id: {value: ['2']}, a: {value: [1]}, b: {value: [3]}};
    const ref_s1 = {
      mergeId: ['0_s', '1_s', '2_s'],
      id: {value: {'0_s': ['0'], '1_s': ['1'], '2_s': ['2']}},
      a: {value: [1]},
      b: {value: {
        '0_s': [1],
        '1_s': [2],
        '2_s': [3]
      }}
    };
    const res_s1 = mergeObjects(obj_s11, obj_s12, 'id', 'value', '_s');
    assert.equal(
      JSON.stringify(res_s1),
      JSON.stringify(ref_s1),
      'merge objects with idSuffix s1');

    // test with idSuffix: same base id and same suffix should throw
    const obj_sbad1 = {id: {value: ['0']}, a: {value: [1]}};
    const obj_sbad2 = {id: {value: ['0']}, a: {value: [2]}};
    const fbad_s = function () {
      mergeObjects(obj_sbad1, obj_sbad2, 'id', 'value', '_s');
    };
    assert.throws(
      fbad_s,
      Error,
      'Cannot merge object with same ids: 0_s, id2: 0_s',
      'merge with same id after applying suffix');

  });

});
