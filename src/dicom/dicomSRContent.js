import {
  NumericMeasurement,
  getNumericMeasurement,
  getDicomNumericMeasurementItem
} from './dicomNumericMeasurement.js';
import {
  isEqualCode,
  getCode,
  getDicomCodeItem,
  getConceptNameCode,
  getMeasurementUnitsCode
} from './dicomCode.js';
import {
  getImageReference,
  getDicomImageReferenceItem
} from './dicomImageReference.js';
import {
  getSopInstanceReference,
  getDicomSopInstanceReferenceItem
} from './dicomSopInstanceReference.js';
import {
  getSpatialCoordinate,
  getDicomSpatialCoordinateItem
} from './dicomSpatialCoordinate.js';
import {
  getSpatialCoordinate3D,
  getDicomSpatialCoordinate3DItem
} from './dicomSpatialCoordinate3D.js';

// doc imports
/* eslint-disable no-unused-vars */
import {
  safeGet,
  safeGetAll,
  DataElement
} from './dataElement.js';
import {DicomCode} from './dicomCode.js';
import {MeasuredValue} from './dicomMeasuredValue.js';
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
  ContinuityOfContent: '0040A050',
  ContentTemplateSequence: '0040A504',
  MappingResource: '00080105',
  TemplateIdentifier: '0040DB00'
};

/**
 * DICOM relationship types.
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.17.3.2.4.html#sect_C.17.3.2.4}.
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
 * Ref: {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.17.3.2.html#sect_C.17.3.2.1}.
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
 * DICOM Continuity Of Contents.
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.18.8.html#table_C.18.8-1}.
 */
export const ContinuityOfContents = {
  separate: 'SEPARATE',
  continuous: 'CONTINUOUS'
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
 * Get the content template value.
 *
 * @param {Object<string, DataElement>} dataElements The dicom elements.
 * @returns {string|undefined} The template as
 *   'MappingResource'-'TemplateIdentifier'.
 */
export function getContentTemplate(dataElements) {
  let template;
  // should only be one item
  const templateItem =
    safeGet(dataElements, TagKeys.ContentTemplateSequence);
  if (typeof templateItem !== 'undefined') {
    const mappingResource = safeGet(templateItem, TagKeys.MappingResource);
    const templateId = safeGet(templateItem, TagKeys.TemplateIdentifier);
    if (typeof mappingResource !== 'undefined' &&
      typeof templateId !== 'undefined') {
      template = mappingResource + '-' + templateId;
    }
  }
  return template;
}

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
   * Content sequence.
   *
   * @type {DicomSRContent[]}
   */
  contentSequence = [];

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

    for (const item of this.contentSequence) {
      res += '\n' + prefix + '- ' + item.toString(prefix + '  ');
    }

    return res;
  }

  /**
   * Check if this content has input header values.
   *
   * @param {string} valueType The value type.
   * @param {DicomCode} conceptNameCode The concept name code.
   * @param {string} relationshipType The relationship type.
   * @returns {boolean} True if equal.
   */
  hasHeader(valueType, conceptNameCode, relationshipType) {
    return this.valueType === valueType &&
      isEqualCode(this.conceptNameCode, conceptNameCode) &&
      this.relationshipType === relationshipType;
  }
}

/**
 * Check if two content item objects are equal.
 *
 * @param {DicomSRContent} item1 The first content item.
 * @param {DicomSRContent} item2 The second content item.
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
  let valueType = safeGet(dataElements, TagKeys.ValueType);
  if (typeof valueType === 'undefined') {
    valueType = '';
  }

  const content = new DicomSRContent(valueType);

  // relationshipType -> RelationType (type1)
  content.relationshipType =
    safeGet(dataElements, TagKeys.RelationshipType);

  const conceptNameCode =
    safeGet(dataElements, TagKeys.ConceptNameCodeSequence);
  if (typeof conceptNameCode !== 'undefined') {
    content.conceptNameCode = getCode(conceptNameCode);
  }

  // set value acording to valueType
  // (date and time are stored as string)
  if (valueType === ValueTypes.code) {
    content.value = getCode(
      safeGet(dataElements, TagKeys.ConceptCodeSequence)
    );
  } else if (valueType === ValueTypes.num) {
    content.value = getNumericMeasurement(dataElements);
  } else if (valueType === ValueTypes.image) {
    content.value = getImageReference(dataElements);
  } else if (valueType === ValueTypes.composite) {
    content.value = getSopInstanceReference(
      safeGet(dataElements, TagKeys.ReferencedSOPSequence)
    );
  } else if (valueType === ValueTypes.scoord) {
    content.value = getSpatialCoordinate(dataElements);
  } else if (valueType === ValueTypes.scoord3d) {
    content.value = getSpatialCoordinate3D(dataElements);
  } else {
    const valueTagName = ValueTypeValueTagName[valueType];
    if (typeof valueTagName !== 'undefined') {
      content.value =
        safeGet(dataElements, TagKeys[valueTagName]);
    } else {
      console.warn('Unsupported input ValueType: ' + valueType);
    }
  }

  const contentSq = safeGetAll(dataElements, TagKeys.ContentSequence);
  if (typeof contentSq !== 'undefined') {
    for (const item of contentSq) {
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

  if (content.contentSequence.length !== 0) {
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
 * @param {string} [relation] Optional content relationhip.
 * @returns {DicomSRContent|undefined} The SR content.
 */
export function getSRContentFromValue(
  name, value, unit, relation) {
  const conceptNameCode = getConceptNameCode(name);

  if (typeof conceptNameCode === 'undefined') {
    return undefined;
  }

  let relationShip = RelationshipTypes.contains;
  if (typeof relation !== 'undefined') {
    relationShip = relation;
  }

  const content = new DicomSRContent(ValueTypes.num);
  content.relationshipType = relationShip;
  content.conceptNameCode = conceptNameCode;

  const measure = new MeasuredValue();
  measure.numericValue = value;
  measure.measurementUnitsCode = getMeasurementUnitsCode(unit);
  const numMeasure = new NumericMeasurement();
  numMeasure.measuredValue = measure;

  content.value = numMeasure;

  return content;
}