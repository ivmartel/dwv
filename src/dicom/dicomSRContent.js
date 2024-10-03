import {
  NumericMeasurement,
  getNumericMeasurement,
  getDicomNumericMeasurementItem
} from './dicomNumericMeasurement';
import {
  getCode,
  getDicomCodeItem,
  getConceptNameCode,
  getMeasurementUnitsCode
} from './dicomCode';
import {
  getImageReference,
  getDicomImageReferenceItem
} from './dicomImageReference';
import {
  getSopInstanceReference,
  getDicomSopInstanceReferenceItem
} from './dicomSopInstanceReference';
import {
  getSpatialCoordinate,
  getDicomSpatialCoordinateItem
} from './dicomSpatialCoordinate';
import {
  getSpatialCoordinate3D,
  getDicomSpatialCoordinate3DItem
} from './dicomSpatialCoordinate3D';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from './dataElement';
import {DicomCode} from './dicomCode';
import {MeasuredValue} from './dicomMeasuredValue';
/* eslint-enable no-unused-vars */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  ReferencedSOPSequence: '00081199',
  RelationshipType: '0040A010',
  ValueType: '0040A040',
  ConceptNameCodeSequence: '0040A043',
  ConceptCodeSequence: '0040A168',
  ContentSequence: '0040A730',
  DateTime: '0040A120',
  Date: '0040A121',
  Time: '0040A122',
  UID: '0040A124',
  PersonName: '0040A123',
  TextValue: '0040A160',
  ContinuityOfContent: '0040A050'
};

/**
 * DICOM relationship types.
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.17.3.2.4.html#sect_C.17.3.2.4}.
 */
export const RelationshipTypes = {
  contains: 'CONTAINS',
  hasProperties: 'HAS PROPERTIES',
  hasObsContext: 'HAS OBS CONTEXT',
  hasAcqContext: 'HAS ACQ CONTEXT',
  inferredFrom: 'INFERRED FROM',
  selectedFrom: 'SELECTED FROM',
  hasConceptMod: 'HAS CONCEPT MOD'
};

/**
 * DICOM value types.
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.17.3.2.html#sect_C.17.3.2.1}.
 */
export const ValueTypes = {
  text: 'TEXT',
  num: 'NUM',
  code: 'CODE',
  date: 'DATE',
  time: 'TIME',
  datetime: 'DATETIME',
  uidref: 'UIDREF',
  pname: 'PNAME',
  composite: 'COMPOSITE',
  image: 'IMAGE',
  waveform: 'WAVEFORM',
  scoord: 'SCOORD',
  scoord3d: 'SCOORD3D',
  tcoord: 'TCOORD',
  container: 'CONTAINER',
  table: 'TABLE',
};

/**
 * DICOM value type to associated tag name.
 */
export const ValueTypeValueTagName = {
  TEXT: 'TextValue',
  DATE: 'Date',
  TIME: 'Time',
  DATETIME: 'DateTime',
  UIDREF: 'UID',
  PNAME: 'PersonName',
  CONTAINER: 'ContinuityOfContent',
};

/**
 * DICOM SR content: item of a SR content sequence.
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.17.3.html}.
 */
export class DicomSRContent {
  /**
   * Value type.
   *
   * @type {string}
   */
  valueType;
  /**
   * Concept name code.
   *
   * @type {DicomCode|undefined}
   */
  conceptNameCode;
  /**
   * Relationship Type.
   *
   * @type {string}
   */
  relationshipType;

  /**
   * Content sequence (0040,A730).
   *
   * @type {DicomSRContent[]|undefined}
   */
  contentSequence;

  /**
   * Value.
   *
   * @type {object}
   */
  value;

  /**
   * @param {string} valueType The content item value type.
   */
  constructor(valueType) {
    this.valueType = valueType;
  }

  /**
   * Get a string representation of this object.
   *
   * @param {string} [prefix] An optional prefix for recursive content.
   * @returns {string} The object as string.
   */
  toString(prefix) {
    if (typeof prefix === 'undefined') {
      prefix = '';
    }

    let res = '';

    if (typeof this.relationshipType !== 'undefined') {
      res += '(' + this.relationshipType + ') ';
    }

    res += this.valueType + ': ';

    if (typeof this.conceptNameCode !== 'undefined') {
      res += this.conceptNameCode.toString();
    }

    res += ' = ' + this.value.toString();

    if (typeof this.contentSequence !== 'undefined') {
      for (const item of this.contentSequence) {
        res += '\n' + prefix + '- ' + item.toString(prefix + '  ');
      }
    }

    return res;
  }
}

/**
 * Check if two content item objects are equal.
 *
 * @param {DicomCode} item1 The first content item.
 * @param {DicomCode} item2 The second content item.
 * @returns {boolean} True if both content items are equal.
 */
export function isEqualContentItem(item1, item2) {
  return Object.keys(item1).length === Object.keys(item2).length &&
  Object.keys(item1).every(key =>
    Object.prototype.hasOwnProperty.call(item2, key) &&
    item1[key] === item2[key]
  );
}

/**
 * Get a content item object from a dicom element.
 *
 * @param {Object<string, DataElement>} dataElements The dicom element.
 * @returns {DicomSRContent} A content item object.
 */
export function getSRContent(dataElements) {
  // valueType -> ValueType (type1)
  let valueType = '';
  if (typeof dataElements[TagKeys.ValueType] !== 'undefined') {
    valueType = dataElements[TagKeys.ValueType].value[0];
  }

  const content = new DicomSRContent(valueType);

  // relationshipType -> RelationType (type1)
  if (typeof dataElements[TagKeys.RelationshipType] !== 'undefined') {
    content.relationshipType =
      dataElements[TagKeys.RelationshipType].value[0];
  }

  if (typeof dataElements[TagKeys.ConceptNameCodeSequence] !== 'undefined') {
    content.conceptNameCode =
      getCode(dataElements[TagKeys.ConceptNameCodeSequence].value[0]);
  }

  // set value acording to valueType
  // (date and time are stored as string)
  if (valueType === ValueTypes.code) {
    content.value = getCode(
      dataElements[TagKeys.ConceptCodeSequence].value[0]);
  } else if (valueType === ValueTypes.num) {
    content.value = getNumericMeasurement(dataElements);
  } else if (valueType === ValueTypes.image) {
    content.value = getImageReference(dataElements);
  } else if (valueType === ValueTypes.composite) {
    content.value = getSopInstanceReference(
      dataElements[TagKeys.ReferencedSOPSequence].value[0]
    );
  } else if (valueType === ValueTypes.scoord) {
    content.value = getSpatialCoordinate(dataElements);
  } else if (valueType === ValueTypes.scoord3d) {
    content.value = getSpatialCoordinate3D(dataElements);
  } else {
    const valueTagName = ValueTypeValueTagName[valueType];
    if (typeof valueTagName !== 'undefined') {
      content.value = dataElements[TagKeys[valueTagName]].value[0];
    } else {
      console.warn('Unsupported input ValueType: ' + valueType);
    }
  }

  const contentSqEl = dataElements[TagKeys.ContentSequence];
  if (typeof contentSqEl !== 'undefined') {
    content.contentSequence = [];
    for (const item of dataElements[TagKeys.ContentSequence].value) {
      content.contentSequence.push(getSRContent(item));
    }
  }

  return content;
}

/**
 * Get a simple dicom element item from a content item object.
 *
 * @param {DicomSRContent} content The content item object.
 * @returns {Object<string, any>} The item as a list of (key, value) pairs.
 */
export function getDicomSRContentItem(content) {
  // dicom item (tags are in ~group/element order)
  let contentItem = {};

  if (typeof content.relationshipType !== 'undefined') {
    contentItem.RelationshipType = content.relationshipType;
  }
  if (typeof content.valueType !== 'undefined') {
    contentItem.ValueType = content.valueType;
  }
  if (typeof content.conceptNameCode !== 'undefined') {
    contentItem.ConceptNameCodeSequence = {
      value: [getDicomCodeItem(content.conceptNameCode)]
    };
  }

  // set appropriate value tag (data and time are stored as string)
  if (content.valueType === 'CODE') {
    contentItem.ConceptCodeSequence = {
      value: [getDicomCodeItem(content.value)]
    };
  } else if (content.valueType === ValueTypes.num) {
    contentItem = {
      ...contentItem,
      ...getDicomNumericMeasurementItem(content.value)
    };
  } else if (content.valueType === ValueTypes.image) {
    contentItem = {
      ...contentItem,
      ...getDicomImageReferenceItem(content.value)
    };
  } else if (content.valueType === ValueTypes.composite) {
    contentItem = {
      ...contentItem,
      ...getDicomSopInstanceReferenceItem(content.value)
    };
  } else if (content.valueType === ValueTypes.scoord) {
    contentItem = {
      ...contentItem,
      ...getDicomSpatialCoordinateItem(content.value)
    };
  } else if (content.valueType === ValueTypes.scoord3d) {
    contentItem = {
      ...contentItem,
      ...getDicomSpatialCoordinate3DItem(content.value)
    };
  } else {
    const valueTagName = ValueTypeValueTagName[content.valueType];
    if (typeof valueTagName !== 'undefined') {
      contentItem[valueTagName] = content.value;
    } else {
      console.warn('Unsupported output ValueType: ' + content.valueType);
    }
  }

  if (typeof content.contentSequence !== 'undefined') {
    contentItem.ContentSequence = {
      value: []
    };
    for (const item of content.contentSequence) {
      contentItem.ContentSequence.value.push(getDicomSRContentItem(item));
    }
  }

  return contentItem;
}

/**
 * Get a DicomSRContent from a value.
 *
 * @param {string} name The value name.
 * @param {object} value The value.
 * @param {string} unit The values' unit.
 * @returns {DicomSRContent|undefined} The SR content.
 */
export function getSRContentFromValue(name, value, unit) {
  const conceptNameCode = getConceptNameCode(name);

  if (typeof conceptNameCode === 'undefined') {
    return undefined;
  }

  const content = new DicomSRContent(ValueTypes.num);
  content.relationshipType = RelationshipTypes.contains;
  content.conceptNameCode = conceptNameCode;

  const measure = new MeasuredValue();
  measure.numericValue = value;
  measure.measurementUnitsCode = getMeasurementUnitsCode(unit);
  const numMeasure = new NumericMeasurement();
  numMeasure.measuredValue = measure;

  content.value = numMeasure;

  return content;
}