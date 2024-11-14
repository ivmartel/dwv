import {DataElement} from './dataElement';

/**
 * Pad an input string with a '0' to form a 2 digit one.
 *
 * @param {string} str The string to pad.
 * @returns {string} The padded string.
 */
function padZeroTwoDigit(str) {
  return ('0' + str).slice(-2);
}

/**
 * Get a 'date' object with {year, monthIndex, day} ready for the
 *   Date constructor from a DICOM element with vr=DA.
 *
 * @param {DataElement} element The DICOM element with date information.
 * @returns {{year, monthIndex, day}|undefined} The 'date' object.
 */
export function getDate(element) {
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
 * @returns {{hours, minutes, seconds, milliseconds}|undefined} The time object.
 */
export function getTime(element) {
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
 * @returns {{date, time}|undefined} The time object.
 */
export function getDateTime(element) {
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
  const dtDate = getDate(dateDataElement);
  const timeDataElement = new DataElement('TM');
  timeDataElement.value = [dtValue.substring(8)];
  const dtTime = dtValue.length >= 9
    ? getTime(timeDataElement) : undefined;
  return {
    date: dtDate,
    time: dtTime
  };
}

/**
 * Extract date values from a Date object.
 *
 * @param {Date} date The input date.
 * @returns {{year, monthIndex, day}} A 'date' object.
 */
export function dateToDateObj(date) {
  return {
    year: date.getFullYear().toString(),
    monthIndex: padZeroTwoDigit((date.getMonth() + 1).toString()),
    day: padZeroTwoDigit(date.getDate().toString())
  };
}

/**
 * Extract time values from a Date object.
 *
 * @param {Date} date The input date.
 * @returns {{hours, minutes, seconds}} A 'time' object.
 */
export function dateToTimeObj(date) {
  return {
    hours: padZeroTwoDigit(date.getHours().toString()),
    minutes: padZeroTwoDigit(date.getMinutes().toString()),
    seconds: padZeroTwoDigit(date.getSeconds().toString())
  };
}

/**
 * Get a DICOM formated date string.
 *
 * @param {{year, monthIndex, day}} dateObj The date to format.
 * @returns {string} The formated date.
 */
export function getDicomDate(dateObj) {
  // YYYYMMDD
  return (
    dateObj.year +
    dateObj.monthIndex +
    dateObj.day
  );
}

/**
 * Get a DICOM formated time string.
 *
 * @param {{hours, minutes, seconds}} dateObj The date to format.
 * @returns {string} The formated time.
 */
export function getDicomTime(dateObj) {
  // HHMMSS
  return (
    dateObj.hours +
    dateObj.minutes +
    dateObj.seconds
  );
}

/**
 * Get a DICOM formated datetime string.
 *
 * @param {{date, time}} datetime The datetime to format.
 * @returns {string} The formated datetime.
 */
export function getDicomDateTime(datetime) {
  // HHMMSS
  let res = getDicomDate(datetime.date);
  if (typeof datetime.time !== 'undefined') {
    res += getDicomTime(datetime.time);
  }
  return res;
}
