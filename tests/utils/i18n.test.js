import {describe, test, assert} from 'vitest';
import {i18n} from '../../src/utils/i18n.js';

/**
 * Tests for the 'utils/colour' file.
 */

describe('utils', () => {

  /**
   * Tests for {@link i18n}.
   *
   * @function module:tests/utils~i18n
   */
  test('i18n', () => {
    const t0 = i18n.t('unit.mm');
    assert.equal(t0, 'mm', 'test #0');

    const t1 = i18n.t('unitt.mm');
    assert.equal(t1, 'unitt.mm', 'test #1');

    const t2 = i18n.t('unit.cm');
    assert.equal(t2, undefined, 'test #2');
  });

});
