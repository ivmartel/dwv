import {describe, test, assert} from 'vitest';
import {
  getDateObj,
  getTimeObj,
  getDateTimeObj,
  dateToDateObj,
  dateToTimeObj,
  getDicomDate,
  getDicomTime,
  getDicomDateTime
} from '../../src/dicom/dicomDate.js';

/**
 * Tests for the 'dicom/dicomDate.js' file.
 */

describe('dicom', () => {

  /**
   * Tests for getDateObj.
   *
   * @function module:tests/dicom~get-date-obj
   */
  test('getDateObj', () => {
    const da00 = getDateObj(undefined);
    const daTheo00 = undefined;
    assert.equal(da00, daTheo00, 'test date #00');

    const da10 = getDateObj({value: ['20230501']});
    const daTheo10 = {year: 2023, monthIndex: 4, day: 1};
    assert.deepEqual(da10, daTheo10, 'test date #10');

    const da11 = getDateObj({value: ['20230131']});
    const daTheo11 = {year: 2023, monthIndex: 0, day: 31};
    assert.deepEqual(da11, daTheo11, 'test date #11');
  });

  /**
   * Tests for getTimeObj.
   *
   * @function module:tests/dicom~get-time-obj
   */
  test('getTimeObj', () => {
    const tm00 = getTimeObj(undefined);
    const tmTheo00 = undefined;
    assert.equal(tm00, tmTheo00, 'test time #00');

    const tm10 = getTimeObj({value: ['19']});
    const tmTheo10 = {hours: 19, minutes: 0, seconds: 0, milliseconds: 0};
    assert.deepEqual(tm10, tmTheo10, 'test time #10');

    const tm11 = getTimeObj({value: ['1936']});
    const tmTheo11 = {hours: 19, minutes: 36, seconds: 0, milliseconds: 0};
    assert.deepEqual(tm11, tmTheo11, 'test time #11');

    const tm12 = getTimeObj({value: ['193610']});
    const tmTheo12 = {hours: 19, minutes: 36, seconds: 10, milliseconds: 0};
    assert.deepEqual(tm12, tmTheo12, 'test time #12');

    const tm13 = getTimeObj({value: ['193610.012345']});
    const tmTheo13 = {hours: 19, minutes: 36, seconds: 10, milliseconds: 12};
    assert.deepEqual(tm13, tmTheo13, 'test time #13');
  });

  /**
   * Tests for getDateTimeObj.
   *
   * @function module:tests/dicom~get-datetime-obj
   */
  test('getDatetimeObj', () => {
    const dt00 = getDateTimeObj(undefined);
    const dtTheo00 = undefined;
    assert.equal(dt00, dtTheo00, 'test date-time #00');

    const dt10 = getDateTimeObj({value: ['2023']});
    const dtTheo10 = {
      date: {year: 2023, monthIndex: 0, day: 0},
      time: undefined
    };
    assert.deepEqual(dt10, dtTheo10, 'test time #10');

    const dt11 = getDateTimeObj({value: ['202305']});
    const dtTheo11 = {
      date: {year: 2023, monthIndex: 4, day: 0},
      time: undefined
    };
    assert.deepEqual(dt11, dtTheo11, 'test time #11');

    const dt12 = getDateTimeObj({value: ['20230501']});
    const dtTheo12 = {
      date: {year: 2023, monthIndex: 4, day: 1},
      time: undefined
    };
    assert.deepEqual(dt12, dtTheo12, 'test time #12');

    const dt13 = getDateTimeObj({value: ['2023050119']});
    const dtTheo13 = {
      date: {year: 2023, monthIndex: 4, day: 1},
      time: {hours: 19, minutes: 0, seconds: 0, milliseconds: 0}
    };
    assert.deepEqual(dt13, dtTheo13, 'test time #13');

    const dt14 = getDateTimeObj({value: ['202305011936']});
    const dtTheo14 = {
      date: {year: 2023, monthIndex: 4, day: 1},
      time: {hours: 19, minutes: 36, seconds: 0, milliseconds: 0}
    };
    assert.deepEqual(dt14, dtTheo14, 'test time #14');

    const dt15 = getDateTimeObj({value: ['20230501193610']});
    const dtTheo15 = {
      date: {year: 2023, monthIndex: 4, day: 1},
      time: {hours: 19, minutes: 36, seconds: 10, milliseconds: 0}
    };
    assert.deepEqual(dt15, dtTheo15, 'test time #15');

    const dt16 = getDateTimeObj({value: ['20230501193610.012345']});
    const dtTheo16 = {
      date: {year: 2023, monthIndex: 4, day: 1},
      time: {hours: 19, minutes: 36, seconds: 10, milliseconds: 12}
    };
    assert.deepEqual(dt16, dtTheo16, 'test time #16');

    const dt17 = getDateTimeObj({value: ['20230501193610.012345&0200']});
    const dtTheo17 = {
      date: {year: 2023, monthIndex: 4, day: 1},
      time: {hours: 19, minutes: 36, seconds: 10, milliseconds: 12}
    };
    assert.deepEqual(dt17, dtTheo17, 'test time #17');
  });

  /**
   * Tests for dateToDateObj.
   *
   * @function module:tests/dicom~date-to-date-obj
   */
  test('dateToDateObj', () => {
    assert.equal(dateToDateObj(), undefined, 'dateToDateObj #00');

    const dateObj0 = {
      year: 2025,
      monthIndex: 4,
      day: 1
    };
    const date0 = new Date(
      dateObj0.year,
      dateObj0.monthIndex,
      dateObj0.day);
    assert.deepEqual(dateToDateObj(date0), dateObj0, 'dateToDateObj #01');
  });

  /**
   * Tests for dateToTimeObj.
   *
   * @function module:tests/dicom~date-to-time-obj
   */
  test('dateToTimeObj', () => {
    assert.equal(dateToTimeObj(), undefined, 'dateToTimeObj #00');

    const dateObj0 = {
      year: 2025,
      monthIndex: 4,
      day: 1
    };
    const timeObj0 = {
      hours: 12,
      minutes: 5,
      seconds: 30,
      milliseconds: 0
    };
    const date0 = new Date(
      dateObj0.year,
      dateObj0.monthIndex - 1,
      dateObj0.day,
      timeObj0.hours,
      timeObj0.minutes,
      timeObj0.seconds
    );
    assert.deepEqual(dateToTimeObj(date0), timeObj0, 'dateToTimeObj #01');
  });

  /**
   * Tests for getDicomDate.
   *
   * @function module:tests/dicom~get-dicom-date
   */
  test('getDicomDate', () => {
    assert.equal(getDicomDate(), undefined, 'getDicomDate #00');

    const dateObj0 = {
      year: 2025,
      monthIndex: 4,
      day: 1
    };
    assert.equal(getDicomDate(dateObj0), '20250501', 'getDicomDate #01');
  });

  /**
   * Tests for getDicomTime.
   *
   * @function module:tests/dicom~get-dicom-time
   */
  test('getDicomTime', () => {
    assert.equal(getDicomTime(), undefined, 'getDicomTime #00');

    const timeObj0 = {
      hours: 12,
      minutes: 5,
      seconds: 30
    };
    assert.equal(getDicomTime(timeObj0), '120530', 'getDicomTime #01');
  });

  /**
   * Tests for getDicomDateTime.
   *
   * @function module:tests/dicom~get-dicom-date-time
   */
  test('getDicomDateTime', () => {
    assert.equal(getDicomDateTime(), undefined, 'getDicomDateTime #00');

    const dateObj0 = {
      year: 2025,
      monthIndex: 4,
      day: 1
    };
    const dateTime0 = {
      date: dateObj0
    };
    assert.equal(getDicomDateTime(dateTime0), '20250501',
      'getDicomDateTime #01');

    const timeObj0 = {
      hours: 12,
      minutes: 5,
      seconds: 30
    };
    dateTime0.time = timeObj0;
    assert.equal(getDicomDateTime(dateTime0), '20250501120530',
      'getDicomDateTime #02');
  });

});
