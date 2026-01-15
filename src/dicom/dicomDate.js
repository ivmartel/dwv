import {DataElement} from './dataElement.js';

/**
 * Date object.
 *
 * @typedef {object} DateObj
 * @property {number} year The year number.
 * @property {number} monthIndex The month index ([0, 11] range).
 * @property {number} day The day number.
 */

/**
 * Time object.
 *
 * @typedef {object} TimeObj
 * @property {number} hours The hours number.
 * @property {number} minutes The minutes number.
 * @property {number} seconds The seconds number.
 * @property {number} milliseconds The milliseconds number.
 */

/**
 * Get a 'date' object with {year, monthIndex, day} ready for the
 *   Date constructor from a DICOM element with vr=DA.
 *
 * @param {DataElement} element The DICOM element with date information.
 * @returns {DateObj|undefined} The 'date' object.
 */
export function getDateObj(element) {
  if (typeof element === 'undefined') {
    return undefined;
  }
  if (element.value.length !== 1) {
    return undefined;
  }
  const daValue = element.value[0];
  // Two possible formats:
  // - standard 'YYYYMMDD'
  // - non-standard 'YYYY.MM.DD' (previous ACR-NEMA)
  let monthBeginIndex = 4;
  let dayBeginIndex = 6;
  if (daValue.length === 10) {
    monthBeginIndex = 5;
    dayBeginIndex = 8;
  }
  const daYears = parseInt(daValue.substring(0, 4), 10);
  // 0-11 range
  const daMonthIndex = daValue.length >= monthBeginIndex + 2
    ? parseInt(daValue.substring(
      monthBeginIndex, monthBeginIndex + 2), 10) - 1 : 0;
  const daDay = daValue.length === dayBeginIndex + 2
    ? parseInt(daValue.substring(
      dayBeginIndex, dayBeginIndex + 2), 10) : 0;
  return {
    year: daYears,
    monthIndex: daMonthIndex,
    day: daDay
  };
}

/**
 * Get a time object with {hours, minutes, seconds} ready for the
 *   Date constructor from a DICOM element with vr=TM.
 *
 * @param {DataElement} element The DICOM element with date information.
 * @returns {TimeObj|undefined} The time object.
 */
export function getTimeObj(element) {
  if (typeof element === 'undefined') {
    return undefined;
  }
  if (element.value.length !== 1) {
    return undefined;
  }
  // format: HH[MMSS.FFFFFF]
  const tmValue = element.value[0];
  const tmHours = parseInt(tmValue.substring(0, 2), 10);
  const tmMinutes = tmValue.length >= 4
    ? parseInt(tmValue.substring(2, 4), 10) : 0;
  const tmSeconds = tmValue.length >= 6
    ? parseInt(tmValue.substring(4, 6), 10) : 0;
  const tmFracSecondsStr = tmValue.length >= 8
    ? tmValue.substring(7, 10) : 0;
  const tmMilliSeconds = tmFracSecondsStr === 0 ? 0
    : parseInt(tmFracSecondsStr, 10) *
      Math.pow(10, 3 - tmFracSecondsStr.length);
  return {
    hours: tmHours,
    minutes: tmMinutes,
    seconds: tmSeconds,
    milliseconds: tmMilliSeconds
  };
}

/**
 * Get a 'dateTime' object with {date, time} ready for the
 *   Date constructor from a DICOM element with vr=DT.
 *
 * @param {DataElement} element The DICOM element with date-time information.
 * @returns {{date: DateObj, time: TimeObj}|undefined} The time object.
 */
export function getDateTimeObj(element) {
  if (typeof element === 'undefined') {
    return undefined;
  }
  if (element.value.length !== 1) {
    return undefined;
  }
  // format: YYYYMMDDHHMMSS.FFFFFF&ZZXX
  const dtFullValue = element.value[0];
  // remove offset (&ZZXX)
  const dtValue = dtFullValue.split('&')[0];
  const dateDataElement = new DataElement('DA');
  dateDataElement.value = [dtValue.substring(0, 8)];
  const dtDate = getDateObj(dateDataElement);
  const timeDataElement = new DataElement('TM');
  timeDataElement.value = [dtValue.substring(8)];
  const dtTime = dtValue.length >= 9
    ? getTimeObj(timeDataElement) : undefined;
  return {
    date: dtDate,
    time: dtTime
  };
}

/**
 * Extract date values from a Date object.
 *
 * @param {Date} date The input date.
 * @returns {DateObj|undefined} A 'date' object.
 */
export function dateToDateObj(date) {
  let res;
  if (typeof date !== 'undefined') {
    res = {
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
      day: date.getDate()
    };
  }
  return res;
}

/**
 * Extract time values from a Date object.
 *
 * @param {Date} date The input date.
 * @returns {TimeObj|undefined} A 'time' object.
 */
export function dateToTimeObj(date) {
  let res;
  if (typeof date !== 'undefined') {
    res = {
      hours: date.getHours(),
      minutes: date.getMinutes(),
      seconds: date.getSeconds(),
      milliseconds: date.getMilliseconds()
    };
  }
  return res;
}

/**
 * Get a DICOM formated date string 'YYYYMMDD'.
 *
 * @param {DateObj} dateObj The date to format.
 * @returns {string|undefined} The formated date.
 */
export function getDicomDate(dateObj) {
  let res;
  if (typeof dateObj !== 'undefined') {
    // YYYYMMDD
    res =
      dateObj.year.toString() +
      (dateObj.monthIndex + 1).toString().padStart(2, '0') +
      dateObj.day.toString().padStart(2, '0')
    ;
  }
  return res;
}

/**
 * Get a DICOM formated time string as 'HHMMSS'.
 *
 * @param {TimeObj} dateObj The date object to format.
 * @returns {string|undefined} The formated time.
 */
export function getDicomTime(dateObj) {
  let res;
  if (typeof dateObj !== 'undefined') {
    // HHMMSS
    res =
      dateObj.hours.toString().padStart(2, '0') +
      dateObj.minutes.toString().padStart(2, '0') +
      dateObj.seconds.toString().padStart(2, '0')
    ;
  }
  return res;
}

/**
 * Get a DICOM formated datetime string.
 *
 * @param {{date, time}} datetime The datetime to format.
 * @returns {string|undefined} The formated datetime.
 */
export function getDicomDateTime(datetime) {
  let res;
  if (typeof datetime !== 'undefined') {
    if (typeof datetime.date !== 'undefined') {
      res = getDicomDate(datetime.date);
    }
    if (typeof res !== 'undefined' &&
      typeof datetime.time !== 'undefined'
    ) {
      res += getDicomTime(datetime.time);
    }
  }
  return res;
}
