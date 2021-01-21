// namespaces
var dwv = dwv || {};
dwv.dicom = dwv.dicom || {};

/**
 * DicomElements wrapper.
 *
 * @class
 * @param {Array} dicomElements The elements to wrap.
 */
dwv.dicom.DicomElementsWrapper = function (dicomElements) {

  /**
   * Get a DICOM Element value from a group/element key.
   *
   * @param {string} groupElementKey The key to retrieve.
   * @returns {object} The DICOM element.
   */
  this.getDEFromKey = function (groupElementKey) {
    return dicomElements[groupElementKey];
  };

  /**
   * Get a DICOM Element value from a group/element key.
   *
   * @param {string} groupElementKey The key to retrieve.
   * @param {boolean} asArray Get the value as an Array.
   * @returns {object} The DICOM element value.
   */
  this.getFromKey = function (groupElementKey, asArray) {
    // default
    if (typeof asArray === 'undefined') {
      asArray = false;
    }
    var value = null;
    var dElement = dicomElements[groupElementKey];
    if (typeof dElement !== 'undefined') {
      // raw value if only one
      if (dElement.value.length === 1 && asArray === false) {
        value = dElement.value[0];
      } else {
        value = dElement.value;
      }
    }
    return value;
  };

  /**
   * Dump the DICOM tags to an array.
   *
   * @returns {object} The DICOM tags as an object.
   */
  this.dumpToObject = function () {
    var keys = Object.keys(dicomElements);
    var dict = dwv.dicom.dictionary;
    var obj = {};
    var dicomElement = null;
    var dictElement = null;
    var row = null;
    for (var i = 0, leni = keys.length; i < leni; ++i) {
      dicomElement = dicomElements[keys[i]];
      row = {};
      // dictionnary entry (to get name)
      dictElement = null;
      if (typeof dict[dicomElement.tag.group] !== 'undefined' &&
          typeof dict[dicomElement.tag.group][dicomElement.tag.element] !==
          'undefined') {
        dictElement = dict[dicomElement.tag.group][dicomElement.tag.element];
      }
      // name
      var name = 'Unknown Tag & Data';
      if (dictElement !== null) {
        name = dictElement[2];
      }
      // value
      row.value = this.getElementValueAsString(dicomElement);
      // others
      row.group = dicomElement.tag.group;
      row.element = dicomElement.tag.element;
      row.vr = dicomElement.vr;
      row.vl = dicomElement.vl;

      obj[name] = row;
    }
    return obj;
  };

  /**
   * Dump the DICOM tags to a string.
   *
   * @returns {string} The dumped file.
   */
  this.dump = function () {
    var keys = Object.keys(dicomElements);
    var result = '\n';
    result += '# Dicom-File-Format\n';
    result += '\n';
    result += '# Dicom-Meta-Information-Header\n';
    result += '# Used TransferSyntax: ';
    if (dwv.dicom.isNativeLittleEndian()) {
      result += 'Little Endian Explicit\n';
    } else {
      result += 'NOT Little Endian Explicit\n';
    }
    var dicomElement = null;
    var checkHeader = true;
    for (var i = 0, leni = keys.length; i < leni; ++i) {
      dicomElement = dicomElements[keys[i]];
      if (checkHeader && dicomElement.tag.group !== '0x0002') {
        result += '\n';
        result += '# Dicom-Data-Set\n';
        result += '# Used TransferSyntax: ';
        var syntax = dwv.dicom.cleanString(dicomElements.x00020010.value[0]);
        result += dwv.dicom.getTransferSyntaxName(syntax);
        result += '\n';
        checkHeader = false;
      }
      result += this.getElementAsString(dicomElement) + '\n';
    }
    return result;
  };

};

/**
 * Get a data element value as a string.
 *
 * @param {object} dicomElement The DICOM element.
 * @param {boolean} pretty When set to true, returns a 'pretified' content.
 * @returns {string} A string representation of the DICOM element.
 */
dwv.dicom.DicomElementsWrapper.prototype.getElementValueAsString = function (
  dicomElement, pretty) {
  var str = '';
  var strLenLimit = 65;

  // dafault to pretty output
  if (typeof pretty === 'undefined') {
    pretty = true;
  }
  // check dicom element input
  if (typeof dicomElement === 'undefined' || dicomElement === null) {
    return str;
  }

  // Polyfill for Number.isInteger.
  var isInteger = Number.isInteger || function (value) {
    return typeof value === 'number' &&
        isFinite(value) &&
        Math.floor(value) === value;
  };

  // TODO Support sequences.

  if (dicomElement.vr !== 'SQ' &&
        dicomElement.value.length === 1 && dicomElement.value[0] === '') {
    str += '(no value available)';
  } else if (dicomElement.tag.group === '0x7FE0' &&
        dicomElement.tag.element === '0x0010' &&
        dicomElement.vl === 'u/l') {
    str = '(PixelSequence)';
  } else if (dicomElement.vr === 'DA' && pretty) {
    var daValue = dicomElement.value[0];
    // Two possible date formats:
    // - standard 'YYYYMMDD'
    // - non-standard 'YYYY.MM.DD' (previous ACR-NEMA)
    var monthBeginIndex = 4;
    var dayBeginIndex = 6;
    if (daValue.length !== 8) {
      monthBeginIndex = 5;
      dayBeginIndex = 8;
    }
    var da = new Date(
      parseInt(daValue.substr(0, 4), 10),
      parseInt(daValue.substr(monthBeginIndex, 2), 10) - 1, // 0-11 range
      parseInt(daValue.substr(dayBeginIndex, 2), 10));
    str = da.toLocaleDateString();
  } else if (dicomElement.vr === 'TM' && pretty) {
    var tmValue = dicomElement.value[0];
    var tmHour = tmValue.substr(0, 2);
    var tmMinute = tmValue.length >= 4 ? tmValue.substr(2, 2) : '00';
    var tmSeconds = tmValue.length >= 6 ? tmValue.substr(4, 2) : '00';
    str = tmHour + ':' + tmMinute + ':' + tmSeconds;
  } else {
    var isOtherVR = (dicomElement.vr[0].toUpperCase() === 'O');
    var isFloatNumberVR = (dicomElement.vr === 'FL' ||
            dicomElement.vr === 'FD' ||
            dicomElement.vr === 'DS');
    var valueStr = '';
    for (var k = 0, lenk = dicomElement.value.length; k < lenk; ++k) {
      valueStr = '';
      if (k !== 0) {
        valueStr += '\\';
      }
      if (isFloatNumberVR) {
        var val = dicomElement.value[k];
        if (typeof val === 'string') {
          val = dwv.dicom.cleanString(val);
        }
        var num = Number(val);
        if (!isInteger(num) && pretty) {
          valueStr += num.toPrecision(4);
        } else {
          valueStr += num.toString();
        }
      } else if (isOtherVR) {
        var tmp = dicomElement.value[k].toString(16);
        if (dicomElement.vr === 'OB') {
          tmp = '00'.substr(0, 2 - tmp.length) + tmp;
        } else {
          tmp = '0000'.substr(0, 4 - tmp.length) + tmp;
        }
        valueStr += tmp;
      } else if (typeof dicomElement.value[k] === 'string') {
        valueStr += dwv.dicom.cleanString(dicomElement.value[k]);
      } else {
        valueStr += dicomElement.value[k];
      }
      // check length
      if (str.length + valueStr.length <= strLenLimit) {
        str += valueStr;
      } else {
        str += '...';
        break;
      }
    }
  }
  return str;
};

/**
 * Get a data element value as a string.
 *
 * @param {string} groupElementKey The key to retrieve.
 * @returns {string} The element as a string.
 */
dwv.dicom.DicomElementsWrapper.prototype.getElementValueAsStringFromKey =
function (groupElementKey) {
  return this.getElementValueAsString(this.getDEFromKey(groupElementKey));
};

/**
 * Get a data element as a string.
 *
 * @param {object} dicomElement The DICOM element.
 * @param {string} prefix A string to prepend this one.
 * @returns {string} The element as a string.
 */
dwv.dicom.DicomElementsWrapper.prototype.getElementAsString = function (
  dicomElement, prefix) {
  // default prefix
  prefix = prefix || '';

  // get element from dictionary
  var dict = dwv.dicom.dictionary;
  var dictElement = null;
  if (typeof dict[dicomElement.tag.group] !== 'undefined' &&
      typeof dict[dicomElement.tag.group][dicomElement.tag.element] !==
      'undefined') {
    dictElement = dict[dicomElement.tag.group][dicomElement.tag.element];
  }

  var deSize = dicomElement.value.length;
  var isOtherVR = (dicomElement.vr[0].toUpperCase() === 'O');

  // no size for delimitations
  if (dicomElement.tag.group === '0xFFFE' && (
    dicomElement.tag.element === '0xE00D' ||
            dicomElement.tag.element === '0xE0DD')) {
    deSize = 0;
  } else if (isOtherVR) {
    deSize = 1;
  }

  var isPixSequence = (dicomElement.tag.group === '0x7FE0' &&
        dicomElement.tag.element === '0x0010' &&
        dicomElement.vl === 'u/l');

  var line = null;

  // (group,element)
  line = '(';
  line += dicomElement.tag.group.substr(2, 5).toLowerCase();
  line += ',';
  line += dicomElement.tag.element.substr(2, 5).toLowerCase();
  line += ') ';
  // value representation
  line += dicomElement.vr;
  // value
  if (dicomElement.vr !== 'SQ' &&
    dicomElement.value.length === 1 &&
    dicomElement.value[0] === '') {
    line += ' (no value available)';
    deSize = 0;
  } else {
    // simple number display
    if (dicomElement.vr === 'na') {
      line += ' ';
      line += dicomElement.value[0];
    } else if (isPixSequence) {
      // pixel sequence
      line += ' (PixelSequence #=' + deSize + ')';
    } else if (dicomElement.vr === 'SQ') {
      line += ' (Sequence with';
      if (dicomElement.vl === 'u/l') {
        line += ' undefined';
      } else {
        line += ' explicit';
      }
      line += ' length #=';
      line += dicomElement.value.length;
      line += ')';
    } else if (isOtherVR ||
        dicomElement.vr === 'pi' ||
        dicomElement.vr === 'UL' ||
        dicomElement.vr === 'US' ||
        dicomElement.vr === 'SL' ||
        dicomElement.vr === 'SS' ||
        dicomElement.vr === 'FL' ||
        dicomElement.vr === 'FD' ||
        dicomElement.vr === 'AT') {
      // 'O'ther array, limited display length
      line += ' ';
      line += this.getElementValueAsString(dicomElement, false);
    } else {
      // default
      line += ' [';
      line += this.getElementValueAsString(dicomElement, false);
      line += ']';
    }
  }

  // align #
  var nSpaces = 55 - line.length;
  if (nSpaces > 0) {
    for (var s = 0; s < nSpaces; ++s) {
      line += ' ';
    }
  }
  line += ' # ';
  if (dicomElement.vl < 100) {
    line += ' ';
  }
  if (dicomElement.vl < 10) {
    line += ' ';
  }
  line += dicomElement.vl;
  line += ', ';
  line += deSize; //dictElement[1];
  line += ' ';
  if (dictElement !== null) {
    line += dictElement[2];
  } else {
    line += 'Unknown Tag & Data';
  }

  var message = null;

  // continue for sequence
  if (dicomElement.vr === 'SQ') {
    var item = null;
    for (var l = 0, lenl = dicomElement.value.length; l < lenl; ++l) {
      item = dicomElement.value[l];
      var itemKeys = Object.keys(item);
      if (itemKeys.length === 0) {
        continue;
      }

      // get the item element
      var itemElement = item.xFFFEE000;
      message = '(Item with';
      if (itemElement.vl === 'u/l') {
        message += ' undefined';
      } else {
        message += ' explicit';
      }
      message += ' length #=' + (itemKeys.length - 1) + ')';
      itemElement.value = [message];
      itemElement.vr = 'na';

      line += '\n';
      line += this.getElementAsString(itemElement, prefix + '  ');

      for (var m = 0, lenm = itemKeys.length; m < lenm; ++m) {
        if (itemKeys[m] !== 'xFFFEE000') {
          line += '\n';
          line += this.getElementAsString(item[itemKeys[m]], prefix + '    ');
        }
      }

      message = '(ItemDelimitationItem';
      if (itemElement.vl !== 'u/l') {
        message += ' for re-encoding';
      }
      message += ')';
      var itemDelimElement = {
        tag: {group: '0xFFFE', element: '0xE00D'},
        vr: 'na',
        vl: '0',
        value: [message]
      };
      line += '\n';
      line += this.getElementAsString(itemDelimElement, prefix + '  ');

    }

    message = '(SequenceDelimitationItem';
    if (dicomElement.vl !== 'u/l') {
      message += ' for re-encod.';
    }
    message += ')';
    var sqDelimElement = {
      tag: {group: '0xFFFE', element: '0xE0DD'},
      vr: 'na',
      vl: '0',
      value: [message]
    };
    line += '\n';
    line += this.getElementAsString(sqDelimElement, prefix);
  } else if (isPixSequence) {
    // pixel sequence
    var pixItem = null;
    for (var n = 0, lenn = dicomElement.value.length; n < lenn; ++n) {
      pixItem = dicomElement.value[n];
      line += '\n';
      pixItem.vr = 'pi';
      line += this.getElementAsString(pixItem, prefix + '  ');
    }

    var pixDelimElement = {
      tag: {group: '0xFFFE', element: '0xE0DD'},
      vr: 'na',
      vl: '0',
      value: ['(SequenceDelimitationItem)']
    };
    line += '\n';
    line += this.getElementAsString(pixDelimElement, prefix);
  }

  return prefix + line;
};

/**
 * Get a DICOM Element value from a group and an element.
 *
 * @param {number} group The group.
 * @param {number} element The element.
 * @returns {object} The DICOM element value.
 */
dwv.dicom.DicomElementsWrapper.prototype.getFromGroupElement = function (
  group, element) {
  return this.getFromKey(
    dwv.dicom.getGroupElementKey(group, element));
};

/**
 * Get a DICOM Element value from a tag name.
 * Uses the DICOM dictionary.
 *
 * @param {string} name The tag name.
 * @returns {object} The DICOM element value.
 */
dwv.dicom.DicomElementsWrapper.prototype.getFromName = function (name) {
  var value = null;
  var tagGE = dwv.dicom.getGroupElementFromName(name);
  // check that we are not at the end of the dictionary
  if (tagGE.group !== null && tagGE.element !== null) {
    value = this.getFromKey(
      dwv.dicom.getGroupElementKey(tagGE.group, tagGE.element)
    );
  }
  return value;
};

/**
 * Get the file list from a DICOMDIR
 *
 * @param {object} data The buffer data of the DICOMDIR
 * @returns {Array} The file list as an array ordered by
 *   STUDY > SERIES > IMAGES.
 */
dwv.dicom.getFileListFromDicomDir = function (data) {
  // parse file
  var parser = new dwv.dicom.DicomParser();
  parser.parse(data);
  var elements = parser.getRawDicomElements();

  // Directory Record Sequence
  if (typeof elements.x00041220 === 'undefined' ||
        typeof elements.x00041220.value === 'undefined') {
    dwv.logger.warn('No Directory Record Sequence found in DICOMDIR.');
    return;
  }
  var dirSeq = elements.x00041220.value;

  if (dirSeq.length === 0) {
    dwv.logger.warn('The Directory Record Sequence of the DICOMDIR is empty.');
    return;
  }

  var records = [];
  var series = null;
  var study = null;
  for (var i = 0; i < dirSeq.length; ++i) {
    // Directory Record Type
    if (typeof dirSeq[i].x00041430 === 'undefined' ||
            typeof dirSeq[i].x00041430.value === 'undefined') {
      continue;
    }
    var recType = dwv.dicom.cleanString(dirSeq[i].x00041430.value[0]);

    // supposed to come in order...
    if (recType === 'STUDY') {
      study = [];
      records.push(study);
    } else if (recType === 'SERIES') {
      series = [];
      study.push(series);
    } else if (recType === 'IMAGE') {
      // Referenced File ID
      if (typeof dirSeq[i].x00041500 === 'undefined' ||
                typeof dirSeq[i].x00041500.value === 'undefined') {
        continue;
      }
      var refFileIds = dirSeq[i].x00041500.value;
      // clean and join ids
      var refFileId = '';
      for (var j = 0; j < refFileIds.length; ++j) {
        if (j !== 0) {
          refFileId += '/';
        }
        refFileId += dwv.dicom.cleanString(refFileIds[j]);
      }
      series.push(refFileId);
    }
  }
  return records;
};
