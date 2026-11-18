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
 * @property {number} milliseconds The milliseconds number, can be
 *   fractional (DICOM TM has a microsecond precision).
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
  // Two possible formats:
  // - standard 'YYYYMMDD'
  // - non-standard 'YYYY.MM.DD' (previous ACR-NEMA)
  const daValue = element.value[0].replaceAll('.', '');
  const daYears = parseInt(daValue.substring(0, 4), 10);
  // 0-11 range
  const daMonthIndex = daValue.length >= 6
    ? parseInt(daValue.substring(4, 6), 10) - 1 : 0;
  const daDay = daValue.length === 8
    ? parseInt(daValue.substring(6, 8), 10) : 0;
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
  // Two possible formats:
  // - standard 'HH[MMSS.FFFFFF]'
  // - non-standard 'HH:MM:SS.FFFFFF' (previous ACR-NEMA)
  const tmValue = element.value[0].replaceAll(':', '');
  const tmHours = parseInt(tmValue.substring(0, 2), 10);
  const tmMinutes = tmValue.length >= 4
    ? parseInt(tmValue.substring(2, 4), 10) : 0;
  const tmSeconds = tmValue.length >= 6
    ? parseInt(tmValue.substring(4, 6), 10) : 0;
  // fractional seconds (up to 6 digits): keep full precision,
  // milliseconds can be fractional
  let tmMilliSeconds = 0;
  const dotIndex = tmValue.indexOf('.');
  if (dotIndex !== -1 && dotIndex + 1 < tmValue.length) {
    const tmFracSecondsStr = tmValue.substring(dotIndex + 1);
    const tmFracSeconds = parseInt(tmFracSecondsStr, 10);
    const exponent = 3 - tmFracSecondsStr.length;
    // multiply or divide by integers to limit rounding errors
    tmMilliSeconds = exponent >= 0
      ? tmFracSeconds * Math.pow(10, exponent)
      : tmFracSeconds / Math.pow(10, -exponent);
  }
  return {
    hours: tmHours,
    minutes: tmMinutes,
    seconds: tmSeconds,
    milliseconds: tmMilliSeconds
  };
}

/**
 * Get the number of seconds since midnight from a DICOM element
 *   with vr=TM.
 *
 * @param {DataElement} element The DICOM element with time information.
 * @returns {number|undefined} The number of seconds, or undefined if
 *   the element is absent or not a valid time.
 */
export function getTimeInSeconds(element) {
  const timeObj = getTimeObj(element);
  if (typeof timeObj === 'undefined') {
    return undefined;
  }
  const res = timeObj.hours * 3600 +
    timeObj.minutes * 60 +
    timeObj.seconds +
    timeObj.milliseconds / 1000;
  return isNaN(res) ? undefined : res;
}

/**
 * Get a javascript Date object from objects with date information.
 *
 * @param {DateObj} dateObj The date object.
 * @param {TimeObj} [timeObj] Optional time object.
 * @returns {Date|undefined} The full date.
 */
export function getDate(dateObj, timeObj) {
  let res;
  if (typeof dateObj !== 'undefined') {
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    let milliseconds = 0;
    if (typeof timeObj !== 'undefined') {
      if (typeof timeObj.hours !== 'undefined') {
        hours = timeObj.hours;
      }
      if (typeof timeObj.minutes !== 'undefined') {
        minutes = timeObj.minutes;
      }
      if (typeof timeObj.seconds !== 'undefined') {
        seconds = timeObj.seconds;
      }
      if (typeof timeObj.milliseconds !== 'undefined') {
        milliseconds = timeObj.milliseconds;
      }
    }
    res = new Date(
      dateObj.year,
      dateObj.monthIndex,
      dateObj.day,
      hours,
      minutes,
      seconds,
      milliseconds,
    );
  }
  return res;
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
