import {
  dateToDateObj,
  getDicomDate,
  dateToTimeObj,
  getDicomTime,
} from '../dicom/dicomDate.js';
import {safeGet} from '../dicom/dataElement.js';
import {
  ValueTypes,
  RelationshipTypes,
  ContinuityOfContents,
  getSRContent,
  getDicomSRContentItem,
  getContentTemplate,
  DicomSRContent,
  getSRContentFromValue
} from '../dicom/dicomSRContent.js';
import {
  DcmCodes,
  getDcmDicomCode,
  getColourCode,
  getQuantificationName,
  getQuantificationUnit,
  DicomCode,
  getMeasurementUnitsCode,
  isEqualCode,
  DwvCodes,
  getDwvDicomCode,
  DWV_CODING_SCHEME_DESIGNATOR,
  getEnglishLanguageCode,
  getImagingProcedureCode,
  getConceptNameCode,
  getDerivationCode,
  isDerivationQuantification,
  getIntensityConceptCode,
  getDerivationQuantificationName
} from '../dicom/dicomCode.js';
import {
  isVersionInBounds,
  getDwvVersionFromImplementationClassUID,
  getImplementationClassUID
} from '../dicom/dicomParser.js';
import {getUID} from '../dicom/dicomWriter.js';
import {MeasuredValue} from '../dicom/dicomMeasuredValue.js';
import {NumericMeasurement} from '../dicom/dicomNumericMeasurement.js';
import {
  getAsSimpleTagValues,
  getElementsFromSimpleTagValues,
  mergeTagValues
} from '../dicom/simpleTagValues.js';
import {ImageReference} from '../dicom/dicomImageReference.js';
import {SopInstanceReference} from '../dicom/dicomSopInstanceReference.js';
import {
  GraphicTypes,
  getScoordFromShape,
  getShapeFromScoord,
  getScoordsFromBidimensional,
  getBidimensionalFromScoords,
  SpatialCoordinate
} from '../dicom/dicomSpatialCoordinate.js';
import {
  SpatialCoordinate3D,
  GraphicTypes3D,
  getScoord3DFromShape
} from '../dicom/dicomSpatialCoordinate3D.js';
import {Line} from '../math/line.js';
import {Protractor} from '../math/protractor.js';
import {BidimensionalLine} from '../math/bidimensionalLine.js';
import {BIG_EPSILON_EXPONENT, precisionRound} from '../math/number.js';
import {logger} from '../utils/logger.js';
import {Annotation} from './annotation.js';
import {AnnotationGroup} from './annotationGroup.js';
import {Point2D, Point3D} from '../math/point.js';

/**
 * @import {DataElement} from '../dicom/dataElement.js';
 * @import {SimpleTagValues} from '../dicom/types.js';
 * @import {PatientCoordinates} from './types.js';
 */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  ImplementationClassUID: '00020012',
  StudyInstanceUID: '0020000D',
  StudyID: '00200010',
  SeriesInstanceUID: '0020000E',
  SeriesNumber: '00200011',
  Modality: '00080060',
  PatientName: '00100010',
  PatientID: '00100020',
  PatientBirthDate: '00100030',
  PatientSex: '00100040',
  CurrentRequestedProcedureEvidenceSequence: '0040A375'
};

/**
 * SR SOP class UIDs.
 */
const SopClassUIDs = {
  comprehensiveSR: '1.2.840.10008.5.1.4.1.1.88.33',
  comprehensive3DSR: '1.2.840.10008.5.1.4.1.1.88.34'
};

/**
 * Type 2 tags of the SR modules (Patient, General Study,
 * SR Document Series, SR Document General, General Equipment),
 * written empty if unknown.
 */
const Type2TagNames = [
  'PatientName',
  'PatientID',
  'PatientBirthDate',
  'PatientSex',
  'StudyDate',
  'StudyTime',
  'ReferringPhysicianName',
  'StudyID',
  'AccessionNumber'
];

/**
 * Type 2 sequences of the SR modules, written empty if unknown.
 */
const Type2SequenceNames = [
  'ReferencedPerformedProcedureStepSequence',
  'PerformedProcedureCodeSequence'
];

/**
 * Image storage SOP class UIDs (without the
 * '1.2.840.10008.5.1.4.1.1.' prefix) per modality.
 */
const ModalitySopClassUIDs = {
  CT: ['2', '2.1', '2.2'],
  MR: ['4', '4.1', '4.3', '4.4']
};

/**
 * Get the modality of an image storage SOP class.
 *
 * @param {string|undefined} uid The SOP class UID.
 * @returns {string|undefined} The modality, for ex 'CT'.
 */
function getModalityFromSopClassUID(uid) {
  const prefix = '1.2.840.10008.5.1.4.1.1.';
  if (typeof uid === 'undefined' || !uid.startsWith(prefix)) {
    return undefined;
  }
  const suffix = uid.substring(prefix.length);
  return Object.keys(ModalitySopClassUIDs).find(function (modality) {
    return ModalitySopClassUIDs[modality].includes(suffix);
  });
}

/**
 * Check if an object is patient coordinates.
 *
 * @param {object} obj The object to check.
 * @returns {boolean} True if patient coordinates.
 */
function isPatientCoordinates(obj) {
  return typeof obj === 'object' &&
    obj !== null &&
    !Array.isArray(obj) &&
    Array.isArray(obj.points) &&
    typeof obj.graphicType === 'string';
}

/**
 * Annotation geometry to write.
 *
 * @typedef {object} WriteGeometry
 * @property {string} type The geometry type: 'region' (TID 1410),
 *   'length', 'angle' or 'bidimensional' (TID 1501), or 'none'
 *   for an annotation without shape (TID 1501 without geometry).
 * @property {object} [shape] The plane shape or patient coordinates,
 *   the long axis for a bidimensional line, undefined for 'none'.
 * @property {object} [shortAxis] The short axis of a bidimensional line.
 * @property {object} [labelPosition] The label position.
 * @property {object} [referencePoints] The reference points.
 */

/**
 * Get the geometry to write of an annotation: from its math shape, or
 * from its patient geometry if it was read from a SCOORD3D and has not
 * been set on a view plane.
 *
 * @param {Annotation} annotation The annotation.
 * @returns {WriteGeometry} The geometry, of type 'none' if
 *   the annotation has no shape.
 */
function getWriteGeometry(annotation) {
  const shape = annotation.mathShape;
  const patient = annotation.patientGeometry;
  if (typeof shape === 'undefined') {
    if (typeof patient === 'undefined') {
      // no shape (for ex a finding without geometry)
      let referencePoints;
      if (typeof annotation.referencePoints !== 'undefined' &&
        annotation.referencePoints.length !== 0) {
        referencePoints = annotation.referencePoints;
      }
      return {
        type: 'none',
        shape: undefined,
        shortAxis: undefined,
        labelPosition: annotation.labelPosition,
        referencePoints
      };
    }
    let type = 'region';
    if (typeof patient.shortAxis !== 'undefined') {
      type = 'bidimensional';
    } else if (patient.shape.graphicType === GraphicTypes3D.polyline) {
      type = patient.shape.points.length === 3 ? 'angle' : 'length';
    }
    return {
      type,
      shape: patient.shape,
      shortAxis: patient.shortAxis,
      labelPosition: patient.labelPosition,
      referencePoints: patient.referencePoints
    };
  }

  const geometry = {
    type: 'region',
    shape,
    shortAxis: undefined,
    labelPosition: annotation.labelPosition,
    referencePoints: undefined
  };
  if (typeof annotation.referencePoints !== 'undefined' &&
    annotation.referencePoints.length !== 0) {
    geometry.referencePoints = annotation.referencePoints;
  }
  if (shape instanceof BidimensionalLine) {
    const axes = getScoordsFromBidimensional(shape);
    geometry.type = 'bidimensional';
    geometry.shape = getShapeFromScoord(axes.longAxis);
    geometry.shortAxis = getShapeFromScoord(axes.shortAxis);
  } else if (shape instanceof Protractor) {
    geometry.type = 'angle';
  } else if (shape instanceof Line) {
    geometry.type = 'length';
  }
  return geometry;
}

/**
 * Response evaluation class.
 */
export class ResponseEvaluation {
  /**
   * Current response.
   *
   * @type {DicomCode}
   */
  current;
  /**
   * Measurement of response (mm).
   *
   * @type {number}
   */
  measure;
}

/**
 * CAD report class.
 */
export class CADReport {
  /**
   * @type {AnnotationGroup[]}
   */
  annotationGroups;

  /**
   * @type {ResponseEvaluation[]}
   */
  responseEvaluations;

  /**
   * @type {string}
   */
  comment;
}

/**
 * {@link AnnotationGroup} factory.
 */
export class AnnotationGroupFactory {

  /**
   * Possible warning created by checkElements.
   *
   * @type {string|undefined}
   */
  #warning;

  /**
   * Flag to know if the referenced frame numbers of the
   * input data are 0-based.
   *
   * @type {boolean}
   */
  #isZeroBasedFrameNumber = false;

  /**
   * Get a warning string if elements are not as expected.
   * Created by checkElements.
   *
   * @returns {string|undefined} The warning.
   */
  getWarning() {
    return this.#warning;
  }

  /**
   * Check if input elements contain a dwv 0.34 annotation.
   *
   * @param {Record<string, DataElement>} dataElements The DICOM data elements.
   * @returns {boolean} True if the elements contain a dwv 0.34 annotation.
   */
  #isDwv034AnnotationDicomSR(dataElements) {
    // version
    const classUID =
      safeGet(dataElements, TagKeys.ImplementationClassUID);
    let dwvVersion;
    if (typeof classUID !== 'undefined') {
      dwvVersion = getDwvVersionFromImplementationClassUID(classUID);
    }
    const isDwv034 = typeof dwvVersion !== 'undefined' &&
      isVersionInBounds(dwvVersion, '0.34.0', '0.35.0-beta.21');

    // content template
    const contentTemplate = getContentTemplate(dataElements);

    // root SR concept
    let rootConcept;
    const srContent = getSRContent(dataElements);
    if (typeof srContent.conceptNameCode !== 'undefined') {
      rootConcept = srContent.conceptNameCode.value;
    }

    // dwv 0.34 annotations do not have template
    return isDwv034 &&
      typeof contentTemplate === 'undefined' &&
      rootConcept === DcmCodes.MeasurementGroup.value;
  }

  /**
   * Check if input elements were written by a dwv version that used
   * 0-based referenced frame numbers (up to v0.37.0-beta.17).
   *
   * @param {Record<string, DataElement>} dataElements The DICOM data elements.
   * @returns {boolean} True if the frame numbers are 0-based.
   */
  #hasZeroBasedFrameNumber(dataElements) {
    const classUID =
      safeGet(dataElements, TagKeys.ImplementationClassUID);
    let dwvVersion;
    if (typeof classUID !== 'undefined') {
      dwvVersion = getDwvVersionFromImplementationClassUID(classUID);
    }
    return typeof dwvVersion !== 'undefined' &&
      isVersionInBounds(dwvVersion, '0.34.0', '0.37.0-beta.17');
  }

  /**
   * Check if input elements contain a TID 1500 annotation.
   * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part16/chapter_A.html#sect_TID_1500}.
   *
   * @param {Record<string, DataElement>} dataElements The DICOM data elements.
   * @returns {boolean} True if the elements contain a TID 1500 annotation.
   */
  #isTid1500AnnotationDicomSR(dataElements) {
    // content template
    const contentTemplate = getContentTemplate(dataElements);
    const isTid1500Template = contentTemplate === 'DCMR-1500';

    // root SR concept
    let rootConcept;
    const srContent = getSRContent(dataElements);
    if (typeof srContent.conceptNameCode !== 'undefined') {
      rootConcept = srContent.conceptNameCode.value;
    }
    const isImagingMeasurementReport =
      rootConcept === DcmCodes.ImagingMeasurementReport.value;

    let res = false;
    if (isTid1500Template && isImagingMeasurementReport) {
      // check for at least one:
      // ImagingMeasurements
      //   - MeasurementGroup with a geometry: ImageRegion (SCOORD or
      //     SCOORD3D), TID 300 measure or group level SCOORD
      const imagingMeas = srContent.contentSequence.find(
        this.#isImagingMeasurementsItem
      );
      if (typeof imagingMeas !== 'undefined') {
        res = imagingMeas.contentSequence.some((item) => {
          return this.#isMeasurementGroupItem(item) &&
            typeof this.#getGroupGeometry(item) !== 'undefined';
        });
      }
    }
    return res;
  }

  /**
   * Check if input elements contain a TID 4100 template.
   * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part16/sect_ChestCADSRIODTemplates.html#sect_TID_4100}.
   *
   * @param {Record<string, DataElement>} dataElements The DICOM data elements.
   * @returns {boolean} True if the elements contain a TID 4100 template.
   */
  #isTid4100DicomSR(dataElements) {
    // content template
    const contentTemplate = getContentTemplate(dataElements);
    return contentTemplate === 'DCMR-4100';
  }

  /**
   * Check dicom elements.
   *
   * @param {Record<string, DataElement>} dataElements The DICOM data elements.
   * @returns {string|undefined} A possible warning.
   */
  checkElements(dataElements) {
    // reset
    this.#warning = undefined;

    if (!this.#isDwv034AnnotationDicomSR(dataElements) &&
      !this.#isTid1500AnnotationDicomSR(dataElements) &&
      !this.#isTid4100DicomSR(dataElements)) {
      this.#warning = 'Not a dwv supported annotation';
    }

    return this.#warning;
  }

  /**
   * Add the source image to an annotation.
   *
   * @param {Annotation} annotation The annotation.
   * @param {DicomSRContent} content The content to add.
   * @param {string} [relationshipType] The expected relationship type,
   *   defaults to SELECTED FROM.
   */
  #addSourceImageToAnnotation(annotation, content, relationshipType) {
    if (typeof relationshipType === 'undefined') {
      relationshipType = RelationshipTypes.selectedFrom;
    }
    if (content.valueType === ValueTypes.image &&
      content.relationshipType === relationshipType) {
      annotation.referencedSopClassUID =
        content.value.referencedSOPSequence.referencedSOPClassUID;
      annotation.referencedSopInstanceUID =
        content.value.referencedSOPSequence.referencedSOPInstanceUID;
      if (typeof content.value.referencedFrameNumber !== 'undefined') {
        let frameNumber = parseInt(content.value.referencedFrameNumber, 10);
        // backwards compatibility: 0-based frame number
        if (this.#isZeroBasedFrameNumber) {
          frameNumber += 1;
        }
        annotation.referencedFrameNumber = frameNumber;
      }
    }
  }

  /**
   * Add ids to an annotation folowing the (wrong)
   * dwv 0.34 format.
   *
   * @param {Annotation} annotation The annotation.
   * @param {DicomSRContent} content The content to add.
   */
  #addDwv034IdToAnnotation(annotation, content) {
    // annotation id
    if (content.hasHeader(
      ValueTypes.uidref,
      getDcmDicomCode(DcmCodes.TrackingIdentifier),
      RelationshipTypes.hasProperties
    )) {
      annotation.trackingId = content.value;
      // use it as uid
      annotation.trackingUid = content.value;
    }
  }

  /**
   * Add ids to an annotation.
   *
   * @param {Annotation} annotation The annotation.
   * @param {DicomSRContent} content The content to add.
   */
  #addIdsToAnnotation(annotation, content) {
    // annotation id
    if (content.hasHeader(
      ValueTypes.text,
      getDcmDicomCode(DcmCodes.TrackingIdentifier),
      RelationshipTypes.hasObsContext
    )) {
      annotation.trackingId = content.value;
    }

    // annotation uid
    if (content.hasHeader(
      ValueTypes.uidref,
      getDcmDicomCode(DcmCodes.TrackingUniqueIdentifier),
      RelationshipTypes.hasObsContext
    )) {
      annotation.trackingUid = content.value;
    }
  }

  /**
   * Add content to an annotation.
   *
   * @param {Annotation} annotation The annotation.
   * @param {DicomSRContent} content The content to add.
   * @param {boolean} [isDwv034] True if the content was written using dwv 0.34,
   * defaults to false.
   */
  #addContentToAnnotation(annotation, content, isDwv034) {
    this.#addLegacyContentToAnnotation(annotation, content, isDwv034);
    // quantification
    this.#addQuantificationToAnnotation(annotation, content);
    // meta
    this.#addMetaToAnnotation(annotation, content);
  }

  /**
   * Add content written by dwv up to v0.37 to an annotation: label,
   * colour, reference and plane points.
   *
   * @param {Annotation} annotation The annotation.
   * @param {DicomSRContent} content The content to add.
   * @param {boolean} [isDwv034] True if the content was written using dwv 0.34,
   * defaults to false.
   */
  #addLegacyContentToAnnotation(annotation, content, isDwv034) {
    if (typeof isDwv034 === 'undefined') {
      isDwv034 = false;
    }
    let relationshipType = RelationshipTypes.hasConceptMod;
    if (isDwv034) {
      relationshipType = RelationshipTypes.hasProperties;
    }

    // text expr
    if (content.hasHeader(
      ValueTypes.text,
      getDcmDicomCode(DcmCodes.ShortLabel),
      relationshipType
    )) {
      annotation.textExpr = content.value;
      // optional label position
      const scoord = content.contentSequence.find(function (item) {
        return item.hasHeader(
          ValueTypes.scoord,
          getDcmDicomCode(DcmCodes.ReferencePoints),
          RelationshipTypes.hasProperties
        );
      });
      if (typeof scoord !== 'undefined') {
        annotation.labelPosition = new Point2D(
          scoord.value.graphicData[0],
          scoord.value.graphicData[1]
        );
      }
    }

    // color
    if (content.hasHeader(
      ValueTypes.text,
      getColourCode(),
      relationshipType
    )) {
      annotation.colour = content.value;
    }

    // reference points
    if (content.hasHeader(
      ValueTypes.scoord,
      getDcmDicomCode(DcmCodes.ReferencePoints),
      relationshipType) &&
      content.value.graphicType === GraphicTypes.multipoint
    ) {
      const points = [];
      for (let i = 0; i < content.value.graphicData.length; i += 2) {
        points.push(new Point2D(
          content.value.graphicData[i],
          content.value.graphicData[i + 1]
        ));
      }
      annotation.referencePoints = points;
    }

    // plane points
    if (content.hasHeader(
      ValueTypes.scoord3d,
      getDcmDicomCode(DcmCodes.ReferenceGeometry),
      RelationshipTypes.contains) &&
      content.value.graphicType === GraphicTypes.multipoint
    ) {
      const data = content.value.graphicData;
      const points = [];
      const nPoints = Math.floor(data.length / 3);
      for (let i = 0; i < nPoints; ++i) {
        const j = i * 3;
        points.push(new Point3D(data[j], data[j + 1], data[j + 2]));
      }
      annotation.planePoints = points;
    }
  }

  /**
   * Add quantification to an annotation.
   *
   * @param {Annotation} annotation The annotation.
   * @param {DicomSRContent} content The content to add.
   * @param {string} [relationshipType] The content relationshipType, defaults
   *   to 'CONTAINS'.
   */
  #addQuantificationToAnnotation(annotation, content, relationshipType) {
    const relation = relationshipType ?? RelationshipTypes.contains;
    if (content.valueType === ValueTypes.num &&
      content.relationshipType === relation) {
      const quantifName = getQuantificationName(content.conceptNameCode);
      if (typeof quantifName !== 'undefined') {
        const measuredValue = content.value.measuredValue;
        const quantifUnit = getQuantificationUnit(
          measuredValue.measurementUnitsCode);
        if (typeof annotation.quantification === 'undefined') {
          annotation.quantification = {};
        }
        annotation.quantification[quantifName] = {
          value: measuredValue.numericValue,
          unit: quantifUnit
        };
      }
    }
  }

  /**
   * Add meta to an annotation.
   *
   * @param {Annotation} annotation The annotation.
   * @param {DicomSRContent} content The content to add.
   */
  #addMetaToAnnotation(annotation, content) {
    if ((content.valueType === ValueTypes.code ||
      content.valueType === ValueTypes.text) &&
      content.relationshipType === RelationshipTypes.contains) {
      annotation.addMetaItem(
        content.conceptNameCode,
        content.value
      );
    }
  }

  /**
   * Check if a DicomSRContent is an 'ImagingMeasurements'.
   *
   * @param {DicomSRContent} item The item to check.
   * @returns {boolean} True if item has the properties:
   *   (CONTAINS) CONTAINER: (126010, DCM, 'Imaging Measurements').
   */
  #isImagingMeasurementsItem(item) {
    return item.hasHeader(
      ValueTypes.container,
      getDcmDicomCode(DcmCodes.ImagingMeasurements),
      RelationshipTypes.contains
    );
  }

  /**
   * Check if a DicomSRContent is a 'MeasurementGroup'.
   *
   * @param {DicomSRContent} item The item to check.
   * @returns {boolean} True if item has the properties:
   *   (CONTAINS) CONTAINER: (125007, DCM, 'Measurement Group').
   */
  #isMeasurementGroupItem(item) {
    return item.hasHeader(
      ValueTypes.container,
      getDcmDicomCode(DcmCodes.MeasurementGroup),
      RelationshipTypes.contains
    );
  }

  /**
   * Check if a DicomSRContent is a 'SingleImageFinding' code.
   *
   * @param {DicomSRContent} item The item to check.
   * @returns {boolean} True if item has the properties:
   *   (INFERRED FROM) CODE: (111059, DCM, 'Single Image Finding').
   */
  #isSingleImageFindingItem(item) {
    return item.hasHeader(
      ValueTypes.code,
      getDcmDicomCode(DcmCodes.SingleImageFinding),
      RelationshipTypes.inferredFrom
    );
  }

  /**
   * Check if a DicomSRContent is a 'ResponseEvaluation' container.
   *
   * @param {DicomSRContent} item The item to check.
   * @returns {boolean} True if item has the properties:
   *   (HAS PROPERTIES) CODE: (112020, DCM, 'Response Evaluation').
   */
  #isResponseEvaluationItem(item) {
    return item.hasHeader(
      ValueTypes.container,
      getDcmDicomCode(DcmCodes.ResponseEvaluation),
      RelationshipTypes.hasProperties
    );
  }

  /**
   * Check if a DicomSRContent is a 'Comment' text.
   *
   * @param {DicomSRContent} item The item to check.
   * @returns {boolean} True if item has the properties:
   *   (CONTAINS) TEXT: (121106, DCM, 'Comment').
   */
  #isCommentItem(item) {
    return item.hasHeader(
      ValueTypes.text,
      getDcmDicomCode(DcmCodes.Comment),
      RelationshipTypes.contains
    );
  }

  /**
   * Check if a DicomSRContent is a 'CurrentResponse' code.
   *
   * @param {DicomSRContent} item The item to check.
   * @returns {boolean} True if item has the properties:
   *   (CONTAINS) CODE: (112048, DCM, 'Current Response').
   */
  #isCurrentResponseItem(item) {
    return item.hasHeader(
      ValueTypes.code,
      getDcmDicomCode(DcmCodes.CurrentResponse),
      RelationshipTypes.contains
    );
  }

  /**
   * Check if a DicomSRContent is a 'MeasurementOfResponse' number.
   *
   * @param {DicomSRContent} item The item to check.
   * @returns {boolean} True if item has the properties:
   *   (CONTAINS) NUM: (112051, DCM, 'Measurement Of Response').
   */
  #isMeasurementOfResponseItem(item) {
    return item.hasHeader(
      ValueTypes.num,
      getDcmDicomCode(DcmCodes.MeasurementOfResponse),
      RelationshipTypes.contains
    );
  }

  /**
   * Check if a DicomSRContent is a 'CADProcessingAndFindingsSummary' code.
   *
   * @param {DicomSRContent} item The item to check.
   * @returns {boolean} True if item has the properties:
   *   (CONTAINS) CODE: (111017, DCM, 'CAD Processing and Findings Summary').
   */
  #isCadProcessingSummaryItem(item) {
    return item.hasHeader(
      ValueTypes.code,
      getDcmDicomCode(DcmCodes.CADProcessingAndFindingsSummary),
      RelationshipTypes.contains
    );
  }

  /**
   * Check if a DicomSRContent is a SCOORD or a SCOORD3D.
   *
   * @param {DicomSRContent} item The item to check.
   * @returns {boolean} True if item is a spatial coordinate.
   */
  #isScoordItem(item) {
    return item.valueType === ValueTypes.scoord ||
      item.valueType === ValueTypes.scoord3d;
  }

  /**
   * Check if a DicomSRContent has a dwv local concept name.
   *
   * @param {DicomSRContent} item The item to check.
   * @param {object} [code] Optional dwv code to check for.
   * @returns {boolean} True if the item has a dwv concept name.
   */
  #isDwvItem(item, code) {
    const concept = item.conceptNameCode;
    if (typeof concept === 'undefined' ||
      concept.schemeDesignator !== DWV_CODING_SCHEME_DESIGNATOR) {
      return false;
    }
    return typeof code === 'undefined' || concept.value === code.value;
  }

  /**
   * Check if a DicomSRContent is an 'ImageRegion'.
   *
   * @param {DicomSRContent} item The item to check.
   * @returns {boolean} True if item has the properties:
   *   (CONTAINS) SCOORD or SCOORD3D: (111030, DCM, 'Image Region').
   */
  #isImageRegionItem(item) {
    return this.#isScoordItem(item) &&
      item.relationshipType === RelationshipTypes.contains &&
      isEqualCode(item.conceptNameCode,
        getDcmDicomCode(DcmCodes.ImageRegion));
  }

  /**
   * Get the 'inferred from' SCOORD or SCOORD3D of a measurement.
   *
   * @param {DicomSRContent} item The measurement.
   * @returns {DicomSRContent|undefined} The spatial coordinate.
   */
  #getInferredFromScoord(item) {
    return item.contentSequence.find((subItem) => {
      return this.#isScoordItem(subItem) &&
        subItem.relationshipType === RelationshipTypes.inferredFrom;
    });
  }

  /**
   * Check is an SR content follows TID 300: it must be
   *   a 'contains' numeric value with an 'inferred from' scoord
   *   (TID 320 'Image or Spatial Coordinates').
   * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part16/chapter_A.html#sect_TID_300}.
   *
   * @param {DicomSRContent} item The SR content.
   * @returns {boolean} True if TID 300 measure.
   */
  #isTid300Measurement(item) {
    return item.valueType === ValueTypes.num &&
      item.relationshipType === RelationshipTypes.contains &&
      typeof this.#getInferredFromScoord(item) !== 'undefined';
  }

  /**
   * Check is an SR content follows TID 1400: it must be
   *   a 'has properties' numeric value with an 'inferred from' scoord.
   * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part16/chapter_A.html#sect_TID_1400}.
   *
   * @param {DicomSRContent} item The SR content.
   * @returns {boolean} True if TID 300 measure.
   */
  #isTid1400LinearMeasurement(item) {
    // no specific concept
    const isHasPropNum =
      item.valueType === ValueTypes.num &&
      item.relationshipType === RelationshipTypes.hasProperties;
    let scoord;
    if (isHasPropNum) {
      // no specific concept (?)
      scoord = item.contentSequence.find(function (subItem) {
        return subItem.valueType === ValueTypes.scoord &&
          subItem.relationshipType === RelationshipTypes.inferredFrom;
      });
    }
    return typeof scoord !== 'undefined';
  }

  /**
   * Get the geometry items of a measurement group, in order:
   * - TID 1410: the image region,
   * - TID 1501: the scoord of the first TID 300 measurement, or the long
   *   and short axis scoords of a bidimensional measurement,
   * - TID 1501: a group level scoord (row 10c).
   *
   * @param {DicomSRContent} group The measurement group.
   * @returns {{shape: DicomSRContent, shortAxis?: DicomSRContent}|undefined}
   *   The geometry items.
   */
  #getGroupGeometry(group) {
    const items = group.contentSequence;

    const region = items.find((item) => this.#isImageRegionItem(item));
    if (typeof region !== 'undefined') {
      return {shape: region};
    }

    const measures = items.filter((item) => this.#isTid300Measurement(item));
    if (measures.length !== 0) {
      const findMeasure = function (name) {
        return measures.find(function (item) {
          return getQuantificationName(item.conceptNameCode) === name;
        });
      };
      const longAxis = findMeasure('longAxis');
      const shortAxis = findMeasure('shortAxis');
      if (typeof longAxis !== 'undefined' &&
        typeof shortAxis !== 'undefined') {
        const longScoord = this.#getInferredFromScoord(longAxis);
        const shortScoord = this.#getInferredFromScoord(shortAxis);
        if (longScoord.valueType === shortScoord.valueType) {
          return {shape: longScoord, shortAxis: shortScoord};
        }
      }
      return {shape: this.#getInferredFromScoord(measures[0])};
    }

    const geometry = items.find((item) => {
      return this.#isScoordItem(item) &&
        item.relationshipType === RelationshipTypes.contains &&
        !this.#isDwvItem(item);
    });
    if (typeof geometry !== 'undefined') {
      return {shape: geometry};
    }

    return undefined;
  }

  /**
   * Get patient coordinates from a SCOORD3D content.
   *
   * @param {DicomSRContent} content The SCOORD3D content.
   * @returns {PatientCoordinates} The patient coordinates.
   */
  #getPatientCoordinates(content) {
    const data = content.value.graphicData;
    const points = [];
    for (let i = 0; i + 2 < data.length; i += 3) {
      points.push(new Point3D(
        parseFloat(data[i]),
        parseFloat(data[i + 1]),
        parseFloat(data[i + 2])
      ));
    }
    return {
      graphicType: content.value.graphicType,
      points,
      frameOfReferenceUID: content.value.referencedFrameOfReferenceUID
    };
  }

  /**
   * Get the points of a SCOORD content.
   *
   * @param {DicomSRContent} content The SCOORD content.
   * @returns {Point2D[]} The points.
   */
  #getScoordPoints(content) {
    const data = content.value.graphicData;
    const points = [];
    for (let i = 0; i + 1 < data.length; i += 2) {
      points.push(new Point2D(
        parseFloat(data[i]),
        parseFloat(data[i + 1])
      ));
    }
    return points;
  }

  /**
   * Add a measurement to the quantification of an annotation: a size
   * measurement, or a statistic as derivation modifier of an intensity
   * measurement (TID 1419), or a legacy dwv statistic code.
   *
   * @param {Annotation} annotation The annotation.
   * @param {DicomSRContent} content The content to add.
   */
  #addNumToAnnotation(annotation, content) {
    if (content.valueType !== ValueTypes.num ||
      content.relationshipType !== RelationshipTypes.contains ||
      typeof content.value?.measuredValue === 'undefined') {
      return;
    }
    let name;
    const derivation = content.contentSequence.find(function (item) {
      return item.hasHeader(
        ValueTypes.code,
        getDcmDicomCode(DcmCodes.Derivation),
        RelationshipTypes.hasConceptMod
      );
    });
    if (typeof derivation !== 'undefined') {
      name = getDerivationQuantificationName(derivation.value);
    } else {
      name = getQuantificationName(content.conceptNameCode);
    }
    if (typeof name === 'undefined') {
      return;
    }
    const measuredValue = content.value.measuredValue;
    if (typeof annotation.quantification === 'undefined') {
      annotation.quantification = {};
    }
    annotation.quantification[name] = {
      value: measuredValue.numericValue,
      unit: getQuantificationUnit(measuredValue.measurementUnitsCode)
    };
  }

  /**
   * Add the label and dwv local content to an annotation:
   * short label with label position, colour and reference points.
   *
   * @param {Annotation} annotation The annotation.
   * @param {DicomSRContent} content The content to add.
   */
  #addDwvContentToAnnotation(annotation, content) {
    const geometry = annotation.patientGeometry;

    // label
    if (content.hasHeader(
      ValueTypes.text,
      getDcmDicomCode(DcmCodes.ShortLabel),
      RelationshipTypes.contains
    )) {
      annotation.textExpr = content.value;
      const position = content.contentSequence.find((item) => {
        return this.#isScoordItem(item) &&
          item.relationshipType === RelationshipTypes.hasProperties &&
          this.#isDwvItem(item, DwvCodes.LabelPosition);
      });
      if (typeof position !== 'undefined') {
        if (position.valueType === ValueTypes.scoord3d) {
          if (typeof geometry !== 'undefined') {
            geometry.labelPosition = this.#getPatientCoordinates(position);
          }
        } else {
          annotation.labelPosition = this.#getScoordPoints(position)[0];
        }
      }
    }

    // colour
    if (content.valueType === ValueTypes.text &&
      content.relationshipType === RelationshipTypes.hasConceptMod &&
      this.#isDwvItem(content, DwvCodes.Colour)) {
      annotation.colour = content.value;
    }

    // reference points
    if (this.#isScoordItem(content) &&
      content.relationshipType === RelationshipTypes.contains &&
      this.#isDwvItem(content, DwvCodes.ReferencePoints)) {
      if (content.valueType === ValueTypes.scoord3d) {
        if (typeof geometry !== 'undefined') {
          geometry.referencePoints = this.#getPatientCoordinates(content);
        }
      } else {
        annotation.referencePoints = this.#getScoordPoints(content);
      }
    }
  }

  /**
   * Convert a measurement group into an annotation: TID 1410
   * (image region and its measurements) or TID 1501 (TID 300
   * measurements inferred from a scoord, or a group level scoord).
   * Also reads groups written by dwv up to v0.37.
   *
   * Shapes in patient coordinates (SCOORD3D) are kept as the annotation
   * patient geometry, they get a math shape once a view is set.
   * A TID 1501 group without geometry gives an annotation without
   * shape, its source image is read from an IMAGE item (row 10b).
   *
   * @param {DicomSRContent} group The measurement group.
   * @returns {Annotation|undefined} The annotation, undefined if the group
   *   is empty.
   */
  #measGroupToAnnotation(group) {
    if (group.contentSequence.length === 0) {
      return undefined;
    }
    const geometry = this.#getGroupGeometry(group);

    const annotation = new Annotation();
    const shapeItem = geometry?.shape;
    if (typeof shapeItem === 'undefined') {
      const sourceImage = group.contentSequence.find(function (item) {
        return item.hasHeader(
          ValueTypes.image,
          getDcmDicomCode(DcmCodes.SourceOfMeasurement),
          RelationshipTypes.contains
        );
      });
      if (typeof sourceImage !== 'undefined') {
        this.#addSourceImageToAnnotation(
          annotation, sourceImage, RelationshipTypes.contains);
      }
    } else if (shapeItem.valueType === ValueTypes.scoord3d) {
      annotation.patientGeometry = {
        shape: this.#getPatientCoordinates(shapeItem)
      };
      if (typeof geometry.shortAxis !== 'undefined') {
        annotation.patientGeometry.shortAxis =
          this.#getPatientCoordinates(geometry.shortAxis);
      }
    } else {
      if (typeof geometry.shortAxis !== 'undefined') {
        annotation.mathShape = getBidimensionalFromScoords(
          shapeItem.value, geometry.shortAxis.value);
      } else {
        annotation.mathShape = getShapeFromScoord(shapeItem.value);
        // point with an extra point (for ex cornerstone arrows)
        if (annotation.mathShape instanceof Point2D &&
          shapeItem.value.graphicData.length >= 4
        ) {
          annotation.referencePoints = [this.#getScoordPoints(shapeItem)[1]];
        }
      }
      // shape source image
      const fromImage = shapeItem.contentSequence.find(function (item) {
        return item.valueType === ValueTypes.image &&
          item.relationshipType === RelationshipTypes.selectedFrom;
      });
      if (typeof fromImage !== 'undefined') {
        this.#addSourceImageToAnnotation(annotation, fromImage);
      }
    }

    const shortLabel = getDcmDicomCode(DcmCodes.ShortLabel);
    for (const item of group.contentSequence) {
      this.#addIdsToAnnotation(annotation, item);
      this.#addNumToAnnotation(annotation, item);
      this.#addDwvContentToAnnotation(annotation, item);
      this.#addLegacyContentToAnnotation(annotation, item);
      if (!isEqualCode(item.conceptNameCode, shortLabel)) {
        this.#addMetaToAnnotation(annotation, item);
      }
    }

    return annotation;
  }

  /**
   * Convert a TID 4104 image finding into an annotation.
   * Similar to tid1501MeasGroupToAnnotation apart from measure
   *  code and quantification relationship.
   *
   * @param {DicomSRContent} content The SR content.
   * @returns {Annotation|undefined} The annotation.
   */
  #singleImageFindingToAnnotation(content) {
    let annotation;

    // just use the first measure to get the scoord
    // (expecting all measures to refer to the same scoord)
    const measure = content.contentSequence.find(
      this.#isTid1400LinearMeasurement
    );
    if (typeof measure !== 'undefined') {
      annotation = new Annotation();
      // shape
      // no specific concept (?)
      const scoord = measure.contentSequence.find(function (subItem) {
        return subItem.valueType === ValueTypes.scoord &&
          subItem.relationshipType === RelationshipTypes.inferredFrom;
      });
      annotation.mathShape = getShapeFromScoord(scoord.value);
      // special point/arrow case
      // TODO: not very valid...
      if (annotation.mathShape instanceof Point2D &&
        scoord.value.graphicData.length >= 4
      ) {
        annotation.referencePoints = [
          new Point2D(scoord.value.graphicData[2], scoord.value.graphicData[3])
        ];
      }
      // shape source image
      // no specific concept (?)
      const fromImage = scoord.contentSequence.find(function (item) {
        return item.valueType === ValueTypes.image &&
          item.relationshipType === RelationshipTypes.selectedFrom;
      });
      if (typeof fromImage !== 'undefined') {
        this.#addSourceImageToAnnotation(annotation, fromImage);
      }
    }

    // shape extra
    if (typeof annotation !== 'undefined') {
      for (const item of content.contentSequence) {
        // add ids
        this.#addIdsToAnnotation(annotation, item);
        // add quantification
        this.#addQuantificationToAnnotation(
          annotation, measure, RelationshipTypes.hasProperties);
        // add meta
        this.#addMetaToAnnotation(annotation, item);
      }
    }

    return annotation;
  }

  /**
   * Convert an imaging measurement into an annotation group.
   * Each measurement group can follow TID 1410 ("Planar ROI Measurements
   * and Qualitative Evaluations") or TID 1501 ("Measurement and
   * Qualitative Evaluation Group").
   *
   * @param {DicomSRContent} content The SR content.
   * @returns {AnnotationGroup|undefined} The annotation group.
   */
  #imagingMeasToAnnotationGroup(content) {
    const annotations = [];
    let hasMeasGroup = false;
    for (const item of content.contentSequence) {
      if (this.#isMeasurementGroupItem(item)) {
        hasMeasGroup = true;
        const annotation = this.#measGroupToAnnotation(item);
        if (typeof annotation !== 'undefined') {
          annotations.push(annotation);
        }
      }
    }

    let annotationGroup;
    if (!hasMeasGroup) {
      logger.warn('No measurement groups in TID 1500 SR');
    } else if (annotations.length !== 0) {
      annotationGroup = new AnnotationGroup(annotations);
    } else {
      logger.warn('No valid measurement groups in TID 1500 SR');
    }
    return annotationGroup;
  }

  /**
   * Convert a CAD processing summary into an annotation group.
   *
   * @param {DicomSRContent} content The SR content.
   * @returns {AnnotationGroup[]|undefined} The annotation group.
   */
  #cadProcessingSummaryToAnnotationGroups(content) {
    // get annotations
    const annotations = [];
    let hasMeasGroup = false;
    for (const item of content.contentSequence) {
      // measurement group content
      if (this.#isSingleImageFindingItem(item)) {
        hasMeasGroup = true;
        const annotation = this.#singleImageFindingToAnnotation(item);
        if (typeof annotation !== 'undefined') {
          annotations.push(annotation);
        }
      }
    }

    // TODO: split annotations according to referenced image.

    // create group
    const annotationGroups = [];
    if (!hasMeasGroup) {
      logger.warn('No image findings in TID 4100 SR');
    } else if (annotations.length !== 0) {
      annotationGroups.push(new AnnotationGroup(annotations));
    } else {
      logger.warn('No valid measurement groups in TID 4100 SR');
    }
    return annotationGroups;
  }

  /**
   * Convert a DICOM SR content of type SCOORD into an annotation.
   *
   * @param {DicomSRContent} content The input SCOORD.
   * @returns {Annotation} The annotation.
   */
  #dwv034ScoordToAnnotation(content) {
    const annotation = new Annotation();
    // shape
    annotation.mathShape = getShapeFromScoord(content.value);

    for (const item of content.contentSequence) {
      // shape source image
      this.#addSourceImageToAnnotation(annotation, item);
      // shape id
      this.#addDwv034IdToAnnotation(annotation, item);
      // shape extra
      this.#addContentToAnnotation(annotation, item, true);
    }
    return annotation;
  }

  /**
   * Convert a DICOM SR content folowing TID 1500 into a list of annotations.
   *
   * Structure: 'Imaging Measurement Report' >
   * 'Imaging Measurements' > 'Measurement Group'.
   *
   * Measurement Group can follow TID1410 "Planar ROI Measurements
   * and Qualitative Evaluations” (scoord and measurements at
   * same level) or TID1501 “Measurement and Qualitative Evaluation Group”
   * (measurements with scoord child).
   *
   * @param {DicomSRContent} content The input SR content.
   * @returns {AnnotationGroup|undefined} The annotation group.
   */
  #tid1500ToAnnotationGroup(content) {
    if (!(content.valueType === ValueTypes.container &&
      isEqualCode(
        content.conceptNameCode,
        getDcmDicomCode(DcmCodes.ImagingMeasurementReport)
      )
    )) {
      logger.warn('Not the expected TID 1500 SR content header');
    }

    let annotationGroup;

    // imaging measurements content
    const imagingMeas = content.contentSequence.find(
      this.#isImagingMeasurementsItem
    );
    if (typeof imagingMeas !== 'undefined') {
      annotationGroup = this.#imagingMeasToAnnotationGroup(imagingMeas);
    } else {
      logger.warn('No imaging measurements in TID 1500 SR');
    }

    return annotationGroup;
  }

  /**
   * Get the CAD processing and findings summary from
   *   and input SR content.
   *
   * @param {DicomSRContent} content The input SR content.
   * @returns {DicomSRContent|undefined} The summary.
   */
  #getTid4100Summary(content) {
    if (!(content.valueType === ValueTypes.container &&
      isEqualCode(
        content.conceptNameCode,
        getDcmDicomCode(DcmCodes.ChestCADReport)
      )
    )) {
      logger.warn('Not the expected TID 4100 SR content header');
    }

    // CAD processing summary content
    return content.contentSequence.find(
      this.#isCadProcessingSummaryItem
    );
  }

  /**
   * Convert a DICOM SR content 'Measurement group' into a list of annotations.
   *
   * Structure: (root) 'Measurement group'
   * - scoord,
   *   - meta.
   *
   * @param {DicomSRContent} content The input.
   * @returns {AnnotationGroup|undefined} The annotation.
   */
  #dwv034MeasGroupToAnnotationGroup(content) {
    if (!(content.valueType === ValueTypes.container &&
      isEqualCode(
        content.conceptNameCode,
        getDcmDicomCode(DcmCodes.MeasurementGroup)
      )
    )) {
      console.warn('Not the expected dwv034 content header');
    }

    const annotations = [];
    for (const item of content.contentSequence) {
      if (item.valueType === ValueTypes.scoord) {
        annotations.push(this.#dwv034ScoordToAnnotation(item));
      }
    }
    return new AnnotationGroup(annotations);
  }

  /**
   * Add root meta data to an annotation group.
   *
   * @param {AnnotationGroup} annotationGroup The group to add meta to.
   * @param {Record<string, DataElement>} dataElements The DICOM tags.
   */
  #addMetaToAnnotationGroup(annotationGroup, dataElements) {
    const safeGetLocal = function (key) {
      return safeGet(dataElements, key);
    };

    // study
    annotationGroup.setMetaValue('StudyInstanceUID',
      safeGetLocal(TagKeys.StudyInstanceUID));
    annotationGroup.setMetaValue('StudyID',
      safeGetLocal(TagKeys.StudyID));
    // series
    annotationGroup.setMetaValue('SeriesInstanceUID',
      safeGetLocal(TagKeys.SeriesInstanceUID));
    annotationGroup.setMetaValue('SeriesNumber',
      safeGetLocal(TagKeys.SeriesNumber));
    // modality
    annotationGroup.setMetaValue('Modality',
      safeGetLocal(TagKeys.Modality));
    // patient
    annotationGroup.setMetaValue('PatientName',
      safeGetLocal(TagKeys.PatientName));
    annotationGroup.setMetaValue('PatientID',
      safeGetLocal(TagKeys.PatientID));
    annotationGroup.setMetaValue('PatientBirthDate',
      safeGetLocal(TagKeys.PatientBirthDate));
    annotationGroup.setMetaValue('PatientSex',
      safeGetLocal(TagKeys.PatientSex));

    // reference
    const evidenceTagKey = TagKeys.CurrentRequestedProcedureEvidenceSequence;
    const evidenceSq = dataElements[evidenceTagKey];
    if (typeof evidenceSq !== 'undefined') {
      const evidenceSqElement = {
        [evidenceTagKey]: evidenceSq
      };
      const evidences = getAsSimpleTagValues(evidenceSqElement);
      annotationGroup.setMetaValue(
        'CurrentRequestedProcedureEvidenceSequence',
        evidences.CurrentRequestedProcedureEvidenceSequence
      );
    }
  }

  /**
   * Get an {@link AnnotationGroup} object from the read DICOM file.
   *
   * @param {Record<string, DataElement>} dataElements The DICOM tags.
   * @returns {AnnotationGroup} A new annotation group.
   * @throws {Error} Error for missing or wrong data.
   */
  create(dataElements) {
    this.#isZeroBasedFrameNumber =
      this.#hasZeroBasedFrameNumber(dataElements);
    const srContent = getSRContent(dataElements);

    let annotationGroup;
    let srType;
    if (this.#isTid1500AnnotationDicomSR(dataElements)) {
      srType = 'TID 1500 SR';
      annotationGroup = this.#tid1500ToAnnotationGroup(srContent);
    } else if (this.#isDwv034AnnotationDicomSR(dataElements)) {
      logger.warn('DWV v0.34 annotation');
      srType = 'DWV v0.34 SR';
      annotationGroup = this.#dwv034MeasGroupToAnnotationGroup(srContent);
    }

    // CAD report
    if (this.#isTid4100DicomSR(dataElements)) {
      srType = 'TID 4100 SR';
      const report = this.createCADReport(dataElements);
      if (typeof report !== 'undefined') {
        annotationGroup = report.annotationGroups[0];
        // console.log('-- CAD report -- ');
        // console.log('comment', report.comment);
        // console.log('evaluations', report.responseEvaluations);
      }
    }

    if (typeof annotationGroup === 'undefined') {
      throw new Error(`Cannot create annotation group from ${srType}`);
    }

    // add dicom meta
    this.#addMetaToAnnotationGroup(annotationGroup, dataElements);

    return annotationGroup;
  }

  /**
   * Get an {@link CADReport} object from the read DICOM file.
   *
   * @param {Record<string, DataElement>} dataElements The DICOM tags.
   * @returns {CADReport|undefined} A new CAD report.
   */
  createCADReport(dataElements) {
    this.#isZeroBasedFrameNumber =
      this.#hasZeroBasedFrameNumber(dataElements);
    const srContent = getSRContent(dataElements);

    // get the summary
    const summary = this.#getTid4100Summary(srContent);
    if (typeof summary === 'undefined') {
      logger.warn('No CAD processing and Findings Summary in TID 4100 SR');
      return;
    }

    let annotationGroups = [];
    if (this.#isTid4100DicomSR(dataElements)) {
      annotationGroups = this.#cadProcessingSummaryToAnnotationGroups(summary);
    }

    if (typeof annotationGroups === 'undefined') {
      throw new Error('Cannot create annotation groups from TID 4100 SR');
    }

    // add dicom meta
    for (const group of annotationGroups) {
      this.#addMetaToAnnotationGroup(group, dataElements);
    }

    // evaluations
    const evaluations = [];
    let comment;
    for (const item of summary.contentSequence) {
      // measurement group content
      if (this.#isResponseEvaluationItem(item)) {
        const evaluation = this.#tid4106ResponseEvaluationToResponse(item);
        if (typeof evaluation !== 'undefined') {
          evaluations.push(evaluation);
        }
      } else if (this.#isCommentItem(item)) {
        comment = item.value;
      }
    }

    const report = new CADReport();
    report.annotationGroups = annotationGroups;
    report.responseEvaluations = evaluations;
    report.comment = comment;

    return report;
  }

  /**
   * Get the annotation source image as SR content.
   *
   * @param {Annotation} annotation The input annotation.
   * @returns {DicomSRContent} The SR content.
   */
  #getAnnotationSourceImageContent(annotation) {
    // reference image UID
    const srImage = new DicomSRContent(ValueTypes.image);
    srImage.relationshipType = RelationshipTypes.selectedFrom;
    srImage.conceptNameCode = getDcmDicomCode(DcmCodes.SourceImage);
    const sopRef = new SopInstanceReference();
    sopRef.referencedSOPClassUID = annotation.referencedSopClassUID;
    sopRef.referencedSOPInstanceUID = annotation.referencedSopInstanceUID;
    const imageRef = new ImageReference();
    imageRef.referencedSOPSequence = sopRef;
    if (typeof annotation.referencedFrameNumber !== 'undefined') {
      imageRef.referencedFrameNumber =
        annotation.referencedFrameNumber.toString();
    }
    srImage.value = imageRef;

    return srImage;
  }

  /**
   * Get an SR content for a plane shape: a SCOORD selected from the
   * annotation source image, or a SCOORD3D in patient coordinates
   * for annotations on a non acquisition plane (no SELECTED FROM child,
   * SCOORD3D has no children).
   *
   * @param {Annotation} annotation The annotation.
   * @param {object} shape The plane shape, a list of Point2D for
   *   a MULTIPOINT, or patient coordinates (written as is).
   * @param {DicomCode} conceptNameCode The content concept name code.
   * @param {string} relationshipType The content relationship type.
   * @returns {DicomSRContent} The SR content.
   */
  #getShapeContent(annotation, shape, conceptNameCode, relationshipType) {
    let content;
    if (isPatientCoordinates(shape)) {
      content = new DicomSRContent(ValueTypes.scoord3d);
      const scoord3d = new SpatialCoordinate3D();
      scoord3d.graphicType = shape.graphicType;
      scoord3d.graphicData = [];
      for (const point of shape.points) {
        scoord3d.graphicData.push(
          point.getX().toString(),
          point.getY().toString(),
          point.getZ().toString()
        );
      }
      scoord3d.referencedFrameOfReferenceUID = shape.frameOfReferenceUID;
      content.value = scoord3d;
    } else if (typeof annotation.planePoints !== 'undefined') {
      content = new DicomSRContent(ValueTypes.scoord3d);
      const toPatient = function (points) {
        return annotation.getPlanePositions(points);
      };
      const frameOfReferenceUID = annotation.getFrameOfReferenceUID();
      if (Array.isArray(shape)) {
        const scoord3d = new SpatialCoordinate3D();
        scoord3d.graphicType = GraphicTypes3D.multipoint;
        scoord3d.graphicData = [];
        for (const point of toPatient(shape)) {
          scoord3d.graphicData.push(
            point.getX().toString(),
            point.getY().toString(),
            point.getZ().toString()
          );
        }
        scoord3d.referencedFrameOfReferenceUID = frameOfReferenceUID;
        content.value = scoord3d;
      } else {
        content.value =
          getScoord3DFromShape(shape, toPatient, frameOfReferenceUID);
      }
    } else {
      content = new DicomSRContent(ValueTypes.scoord);
      if (Array.isArray(shape)) {
        const scoord = new SpatialCoordinate();
        scoord.graphicType = GraphicTypes.multipoint;
        scoord.graphicData = [];
        for (const point of shape) {
          scoord.graphicData.push(
            point.getX().toString(),
            point.getY().toString()
          );
        }
        content.value = scoord;
      } else {
        content.value = getScoordFromShape(shape);
      }
      content.contentSequence =
        [this.#getAnnotationSourceImageContent(annotation)];
    }
    content.relationshipType = relationshipType;
    content.conceptNameCode = conceptNameCode;
    return content;
  }

  /**
   * Get a NUM SR content.
   *
   * @param {DicomCode} conceptNameCode The concept name code.
   * @param {number} value The numeric value.
   * @param {string} unit The quantification unit.
   * @param {string} relationshipType The relationship type.
   * @returns {DicomSRContent} The SR content.
   */
  #getNumContent(conceptNameCode, value, unit, relationshipType) {
    const content = new DicomSRContent(ValueTypes.num);
    content.relationshipType = relationshipType;
    content.conceptNameCode = conceptNameCode;
    const measure = new MeasuredValue();
    measure.numericValue = precisionRound(value, BIG_EPSILON_EXPONENT);
    measure.measurementUnitsCode = getMeasurementUnitsCode(unit);
    const numMeasure = new NumericMeasurement();
    numMeasure.measuredValue = measure;
    content.value = numMeasure;
    return content;
  }

  /**
   * Get the intensity measured property of the ROI statistics of an
   * annotation (CID 7180): from the pixel unit, or the modality of the
   * referenced image, or a dwv local code if none fits.
   *
   * @param {Annotation} annotation The annotation.
   * @param {string} unit The statistics unit.
   * @returns {DicomCode} The concept name code.
   */
  #getIntensityConcept(annotation, unit) {
    let code;
    if (unit === 'HU') {
      code = getDcmDicomCode(DcmCodes.AttenuationCoefficient);
    } else if (unit === 'SUV') {
      code = getDcmDicomCode(DcmCodes.SUVbw);
    } else {
      code = getIntensityConceptCode(
        getModalityFromSopClassUID(annotation.referencedSopClassUID));
    }
    if (typeof code === 'undefined') {
      code = getDwvDicomCode(DwvCodes.PixelValue);
    }
    return code;
  }

  /**
   * Get the TID 1410 'Planar ROI Measurements' content of an annotation:
   * the image region and its TID 1419 'ROI Measurements'.
   * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part16/chapter_A.html#sect_TID_1410}.
   *
   * @param {Annotation} annotation The annotation.
   * @param {WriteGeometry} geometry The annotation geometry.
   * @returns {DicomSRContent[]} The SR content list.
   */
  #getTid1410Content(annotation, geometry) {
    const contentSequence = [
      this.#getShapeContent(
        annotation,
        geometry.shape,
        getDcmDicomCode(DcmCodes.ImageRegion),
        RelationshipTypes.contains
      )
    ];

    const quantification = annotation.quantification ?? {};
    for (const key in quantification) {
      const value = quantification[key].value;
      const unit = quantification[key].unit;
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        continue;
      }
      if (isDerivationQuantification(key)) {
        // statistic: intensity measurement with a derivation modifier
        const num = this.#getNumContent(
          this.#getIntensityConcept(annotation, unit),
          value,
          unit,
          RelationshipTypes.contains
        );
        const derivation = new DicomSRContent(ValueTypes.code);
        derivation.relationshipType = RelationshipTypes.hasConceptMod;
        derivation.conceptNameCode = getDcmDicomCode(DcmCodes.Derivation);
        derivation.value = getDerivationCode(key);
        num.contentSequence = [derivation];
        contentSequence.push(num);
      } else {
        const concept = getConceptNameCode(key);
        if (typeof concept !== 'undefined') {
          contentSequence.push(this.#getNumContent(
            concept, value, unit, RelationshipTypes.contains));
        }
      }
    }

    return contentSequence;
  }

  /**
   * Get the TID 300 'Measurement' content of open shapes (line,
   * protractor, bidimensional line): measurements inferred from their
   * SCOORD, or the SCOORD alone if there is no measurement.
   * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part16/chapter_A.html#sect_TID_300}.
   *
   * @param {Annotation} annotation The annotation.
   * @param {WriteGeometry} geometry The annotation geometry.
   * @returns {DicomSRContent[]} The SR content list.
   */
  #getTid1501Content(annotation, geometry) {
    const contentSequence = [];
    const quantification = annotation.quantification ?? {};
    const source = getDcmDicomCode(DcmCodes.SourceOfMeasurement);

    const addMeasurement = (name, shape) => {
      const quantif = quantification[name];
      const concept = getConceptNameCode(name);
      if (typeof quantif !== 'undefined' &&
        typeof quantif.value === 'number' &&
        Number.isFinite(quantif.value) &&
        typeof concept !== 'undefined') {
        const num = this.#getNumContent(
          concept, quantif.value, quantif.unit, RelationshipTypes.contains);
        num.contentSequence = [this.#getShapeContent(
          annotation, shape, source, RelationshipTypes.inferredFrom)];
        contentSequence.push(num);
      } else {
        // no measurement: keep the geometry (TID 1501 row 10c)
        contentSequence.push(this.#getShapeContent(
          annotation, shape, source, RelationshipTypes.contains));
      }
    };

    if (geometry.type === 'bidimensional') {
      addMeasurement('longAxis', geometry.shape);
      addMeasurement('shortAxis', geometry.shortAxis);
    } else if (geometry.type === 'angle') {
      addMeasurement('angle', geometry.shape);
    } else {
      addMeasurement('length', geometry.shape);
    }

    return contentSequence;
  }

  /**
   * Get the annotation label, meta and dwv specific properties
   * as SR content list.
   *
   * @param {Annotation} annotation The input annotation.
   * @param {WriteGeometry} geometry The annotation geometry.
   * @returns {DicomSRContent[]} The SR content list.
   */
  #getAnnotationExtrasContent(annotation, geometry) {
    const contentSequence = [];

    // label: free text qualitative evaluation (TID 1410 row 13,
    // TID 1501 row 12)
    if (typeof annotation.textExpr !== 'undefined' &&
      annotation.textExpr.length !== 0
    ) {
      const shortLabel = new DicomSRContent(ValueTypes.text);
      shortLabel.relationshipType = RelationshipTypes.contains;
      shortLabel.conceptNameCode = getDcmDicomCode(DcmCodes.ShortLabel);
      shortLabel.value = annotation.textExpr;
      // label position
      if (typeof geometry.labelPosition !== 'undefined') {
        shortLabel.contentSequence = [this.#getShapeContent(
          annotation,
          geometry.labelPosition,
          getDwvDicomCode(DwvCodes.LabelPosition),
          RelationshipTypes.hasProperties
        )];
      }
      contentSequence.push(shortLabel);
    }

    // meta
    const conceptIds = annotation.getMetaConceptIds();
    for (const conceptId of conceptIds) {
      const item = annotation.getMetaItem(conceptId);
      let valueType = ValueTypes.text;
      if (item.value instanceof DicomCode) {
        valueType = ValueTypes.code;
      }
      const meta = new DicomSRContent(valueType);
      meta.relationshipType = RelationshipTypes.contains;
      meta.conceptNameCode = item.concept;
      meta.value = item.value;
      contentSequence.push(meta);
    }

    // colour
    if (typeof annotation.colour !== 'undefined') {
      const colour = new DicomSRContent(ValueTypes.text);
      colour.relationshipType = RelationshipTypes.hasConceptMod;
      colour.conceptNameCode = getDwvDicomCode(DwvCodes.Colour);
      colour.value = annotation.colour;
      contentSequence.push(colour);
    }

    // reference points (for ex arrow tail)
    if (typeof geometry.referencePoints !== 'undefined') {
      contentSequence.push(this.#getShapeContent(
        annotation,
        geometry.referencePoints,
        getDwvDicomCode(DwvCodes.ReferencePoints),
        RelationshipTypes.contains
      ));
    }

    return contentSequence;
  }

  /**
   * Convert an annotation into a 'Measurement Group' SR content:
   * TID 1410 for regions and points, TID 1501 for open shapes and
   * annotations without shape.
   *
   * @param {Annotation} annotation The input annotation.
   * @returns {DicomSRContent|undefined} The result SR content, undefined
   *   if the annotation cannot be exported.
   */
  #annotationToMeasGroup(annotation) {
    const geometry = getWriteGeometry(annotation);

    // non acquisition plane annotations need their view
    // to get patient coordinates
    const canGetPatientPositions =
      typeof annotation.getPlanePositions([]) !== 'undefined' &&
      typeof annotation.getFrameOfReferenceUID() !== 'undefined';
    if (typeof annotation.mathShape !== 'undefined' &&
      typeof annotation.planePoints !== 'undefined' &&
      !canGetPatientPositions) {
      logger.warn('Cannot export an annotation on a non acquisition ' +
        `plane without its view: ${annotation.trackingId}`);
      return undefined;
    }

    const srContent = new DicomSRContent(ValueTypes.container);
    srContent.relationshipType = RelationshipTypes.contains;
    srContent.conceptNameCode = getDcmDicomCode(DcmCodes.MeasurementGroup);
    srContent.value = ContinuityOfContents.separate;

    const contentSequence = [];

    // tracking ids
    if (typeof annotation.trackingId !== 'undefined') {
      const srId = new DicomSRContent(ValueTypes.text);
      srId.relationshipType = RelationshipTypes.hasObsContext;
      srId.conceptNameCode = getDcmDicomCode(DcmCodes.TrackingIdentifier);
      srId.value = annotation.trackingId;
      contentSequence.push(srId);
    }
    if (typeof annotation.trackingUid !== 'undefined') {
      const srUid = new DicomSRContent(ValueTypes.uidref);
      srUid.relationshipType = RelationshipTypes.hasObsContext;
      srUid.conceptNameCode =
        getDcmDicomCode(DcmCodes.TrackingUniqueIdentifier);
      srUid.value = annotation.trackingUid;
      contentSequence.push(srUid);
    }

    // geometry and measurements
    if (geometry.type === 'none') {
      // no geometry, just the source image (TID 1501 row 10b)
      if (typeof annotation.referencedSopInstanceUID !== 'undefined') {
        const srcImage = this.#getAnnotationSourceImageContent(annotation);
        srcImage.relationshipType = RelationshipTypes.contains;
        srcImage.conceptNameCode =
          getDcmDicomCode(DcmCodes.SourceOfMeasurement);
        contentSequence.push(srcImage);
      }
    } else if (geometry.type === 'region') {
      contentSequence.push(...this.#getTid1410Content(annotation, geometry));
    } else {
      contentSequence.push(...this.#getTid1501Content(annotation, geometry));
    }

    // label, meta and dwv extras
    contentSequence.push(
      ...this.#getAnnotationExtrasContent(annotation, geometry));

    srContent.contentSequence = contentSequence;
    return srContent;
  }

  /**
   * Get the TID 1600 'Image Library' of a list of annotations: one
   * image library group with an entry per referenced image.
   * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part16/chapter_A.html#sect_TID_1600}.
   *
   * @param {Annotation[]} annotations The annotations.
   * @returns {DicomSRContent} The SR content.
   */
  #getImageLibraryContent(annotations) {
    const library = new DicomSRContent(ValueTypes.container);
    library.relationshipType = RelationshipTypes.contains;
    library.conceptNameCode = getDcmDicomCode(DcmCodes.ImageLibrary);
    library.value = ContinuityOfContents.separate;

    const entries = [];
    const uids = [];
    for (const annotation of annotations) {
      const uid = annotation.referencedSopInstanceUID;
      if (typeof uid === 'undefined' || uids.includes(uid)) {
        continue;
      }
      uids.push(uid);
      const entry = new DicomSRContent(ValueTypes.image);
      entry.relationshipType = RelationshipTypes.contains;
      const sopRef = new SopInstanceReference();
      sopRef.referencedSOPClassUID = annotation.referencedSopClassUID;
      sopRef.referencedSOPInstanceUID = uid;
      const imageRef = new ImageReference();
      imageRef.referencedSOPSequence = sopRef;
      entry.value = imageRef;
      entries.push(entry);
    }

    if (entries.length !== 0) {
      const group = new DicomSRContent(ValueTypes.container);
      group.relationshipType = RelationshipTypes.contains;
      group.conceptNameCode = getDcmDicomCode(DcmCodes.ImageLibraryGroup);
      group.value = ContinuityOfContents.separate;
      group.contentSequence = entries;
      library.contentSequence = [group];
    }

    return library;
  }

  /**
   * Get the TID 1500 header content: language (TID 1204), observation
   * context (TID 1001, dwv as device observer) and procedure reported.
   *
   * @returns {DicomSRContent[]} The SR content list.
   */
  #getTid1500HeaderContent() {
    const language = new DicomSRContent(ValueTypes.code);
    language.relationshipType = RelationshipTypes.hasConceptMod;
    language.conceptNameCode =
      getDcmDicomCode(DcmCodes.LanguageOfContentItemAndDescendants);
    language.value = getEnglishLanguageCode();

    // TID 1002 / 1004 (order is significant)
    const observerType = new DicomSRContent(ValueTypes.code);
    observerType.relationshipType = RelationshipTypes.hasObsContext;
    observerType.conceptNameCode = getDcmDicomCode(DcmCodes.ObserverType);
    observerType.value = getDcmDicomCode(DcmCodes.Device);

    const observerUid = new DicomSRContent(ValueTypes.uidref);
    observerUid.relationshipType = RelationshipTypes.hasObsContext;
    observerUid.conceptNameCode =
      getDcmDicomCode(DcmCodes.DeviceObserverUID);
    observerUid.value = getImplementationClassUID();

    const observerName = new DicomSRContent(ValueTypes.text);
    observerName.relationshipType = RelationshipTypes.hasObsContext;
    observerName.conceptNameCode =
      getDcmDicomCode(DcmCodes.DeviceObserverName);
    observerName.value = 'dwv';

    const procedure = new DicomSRContent(ValueTypes.code);
    procedure.relationshipType = RelationshipTypes.hasConceptMod;
    procedure.conceptNameCode = getDcmDicomCode(DcmCodes.ProcedureReported);
    procedure.value = getImagingProcedureCode();

    return [language, observerType, observerUid, observerName, procedure];
  }

  /**
   * Convert an annotation group into a TID 1500 'Measurement Report'
   * SR content.
   * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part16/chapter_A.html#sect_TID_1500}.
   *
   * @param {AnnotationGroup} annotationGroup The input annotation group.
   * @returns {DicomSRContent|undefined} The result SR content.
   */
  #annotationGroupToTid1500(annotationGroup) {
    const annotations = [];
    const groups = [];
    for (const annotation of annotationGroup.getList()) {
      const group = this.#annotationToMeasGroup(annotation);
      if (typeof group !== 'undefined') {
        annotations.push(annotation);
        groups.push(group);
      }
    }
    if (groups.length === 0) {
      return undefined;
    }

    // imaging measurements
    const measContent = new DicomSRContent(ValueTypes.container);
    measContent.conceptNameCode =
      getDcmDicomCode(DcmCodes.ImagingMeasurements);
    measContent.relationshipType = RelationshipTypes.contains;
    measContent.value = ContinuityOfContents.separate;
    measContent.contentSequence = groups;

    // imaging measurements report
    const srContent = new DicomSRContent(ValueTypes.container);
    srContent.conceptNameCode =
      getDcmDicomCode(DcmCodes.ImagingMeasurementReport);
    srContent.value = ContinuityOfContents.separate;
    srContent.contentSequence = [
      ...this.#getTid1500HeaderContent(),
      this.#getImageLibraryContent(annotations),
      measContent
    ];

    return srContent;
  }

  /**
   * Check if an SR content tree contains SCOORD3D content.
   *
   * @param {DicomSRContent} content The SR content.
   * @returns {boolean} True if a SCOORD3D was found.
   */
  #hasScoord3D(content) {
    return content.valueType === ValueTypes.scoord3d ||
      content.contentSequence.some((item) => this.#hasScoord3D(item));
  }

  /**
   * Convert an annotation group into a DICOM SR object using the
   * TID 1500 template.
   *
   * The SOP class is Comprehensive SR, or Comprehensive 3D SR if some
   * annotations are on a non acquisition plane (SCOORD3D content).
   * Missing mandatory attributes (instance and series UID and number,
   * manufacturer...) get default values, all can be overwritten via
   * the extra tags.
   *
   * @param {AnnotationGroup} annotationGroup The annotation group.
   * @param {SimpleTagValues} [extraTags] Optional list of extra tags.
   * @returns {Record<string, DataElement>} A list of dicom elements.
   */
  toDicom(annotationGroup, extraTags) {
    const srContent = this.#annotationGroupToTid1500(annotationGroup);
    if (typeof srContent === 'undefined') {
      throw new Error('No annotation group SR content');
    }

    // copy meta to not modify the group
    let tags = structuredClone(annotationGroup.getMeta());
    // remove undefined values
    for (const key of Object.keys(tags)) {
      if (typeof tags[key] === 'undefined') {
        delete tags[key];
      }
    }

    // transfer syntax: ExplicitVRLittleEndian
    tags.TransferSyntaxUID = '1.2.840.10008.1.2.1';
    // class: Comprehensive SR or Comprehensive 3D SR
    // https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_A.35.3.html
    // https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_A.35.13.html
    const sopClassUID = this.#hasScoord3D(srContent)
      ? SopClassUIDs.comprehensive3DSR
      : SopClassUIDs.comprehensiveSR;
    tags.SOPClassUID = sopClassUID;
    tags.MediaStorageSOPClassUID = sopClassUID;
    tags.Modality = 'SR';

    // instance and series (type 1)
    if (typeof tags.SOPInstanceUID === 'undefined') {
      tags.SOPInstanceUID = getUID();
    }
    tags.MediaStorageSOPInstanceUID = tags.SOPInstanceUID;
    if (typeof tags.SeriesInstanceUID === 'undefined') {
      tags.SeriesInstanceUID = getUID();
    }
    if (typeof tags.SeriesNumber === 'undefined') {
      tags.SeriesNumber = 1;
    }
    if (typeof tags.InstanceNumber === 'undefined') {
      tags.InstanceNumber = 1;
    }
    // type 2
    if (typeof tags.Manufacturer === 'undefined') {
      tags.Manufacturer = 'dwv';
    }
    for (const key of Type2TagNames) {
      if (typeof tags[key] === 'undefined') {
        tags[key] = '';
      }
    }
    for (const key of Type2SequenceNames) {
      if (typeof tags[key] === 'undefined') {
        tags[key] = {value: []};
      }
    }

    tags.CompletionFlag = 'PARTIAL';
    tags.VerificationFlag = 'UNVERIFIED';

    // date
    const now = new Date();
    tags.ContentDate = getDicomDate(dateToDateObj(now));
    tags.ContentTime = getDicomTime(dateToTimeObj(now));

    // local coding scheme
    tags.CodingSchemeIdentificationSequence = {
      value: [{
        CodingSchemeDesignator: DWV_CODING_SCHEME_DESIGNATOR,
        CodingSchemeName: 'DWV local codes'
      }]
    };

    // reference: required if instances are referenced in the content
    this.#addEvidenceReferences(tags, annotationGroup.getList());

    // TID 1500
    tags.ContentTemplateSequence = {
      value: [{
        MappingResource: 'DCMR',
        TemplateIdentifier: '1500'
      }]
    };

    // main
    tags = {
      ...tags,
      ...getDicomSRContentItem(srContent)
    };

    // merge extra tags if provided
    if (typeof extraTags !== 'undefined') {
      mergeTagValues(tags, extraTags);
    }

    // character set: UTF-8 if not ASCII
    // eslint-disable-next-line no-control-regex
    if (/[^\x00-\x7F]/.test(JSON.stringify(tags))) {
      tags.SpecificCharacterSet = 'ISO_IR 192';
    }

    return getElementsFromSimpleTagValues(tags);
  }

  /**
   * Add the annotations references to the
   * CurrentRequestedProcedureEvidenceSequence of the tags.
   *
   * @param {Record<string, any>} tags The tags to update.
   * @param {Annotation[]} annotations The annotations.
   */
  #addEvidenceReferences(tags, annotations) {
    const evidenceSq = tags.CurrentRequestedProcedureEvidenceSequence;
    // hoping for just one element...
    const refSeriesSq0 =
      evidenceSq?.value?.[0]?.ReferencedSeriesSequence?.value?.[0];
    if (typeof refSeriesSq0 === 'undefined') {
      logger.warn('No referenced series in annotation group meta');
      return;
    }
    let refSopSq = refSeriesSq0.ReferencedSOPSequence;
    if (typeof refSopSq === 'undefined') {
      refSeriesSq0.ReferencedSOPSequence = {
        value: []
      };
      refSopSq = refSeriesSq0.ReferencedSOPSequence;
    }
    const refs = refSopSq.value;
    // add reference if not yet present
    for (const annotation of annotations) {
      if (typeof annotation.referencedSopInstanceUID === 'undefined') {
        continue;
      }
      const ref = {
        ReferencedSOPClassUID: annotation.referencedSopClassUID,
        ReferencedSOPInstanceUID: annotation.referencedSopInstanceUID
      };
      const isSameRef = function (item) {
        return item.ReferencedSOPInstanceUID === ref.ReferencedSOPInstanceUID &&
          item.ReferencedSOPClassUID === ref.ReferencedSOPClassUID;
      };
      if (typeof refs.find(isSameRef) === 'undefined') {
        refs.push(ref);
      }
    }
  }

  /**
   * Convert an annotation into a 'Single Image Finding' SR content.
   *
   * @param {Annotation} annotation The input annotation.
   * @returns {DicomSRContent} The result SR content.
   */
  #annotationToTid4104SingleImageFinding(annotation) {
    // image finding
    const srContent = new DicomSRContent(ValueTypes.code);
    srContent.relationshipType = RelationshipTypes.inferredFrom;
    srContent.conceptNameCode = getDcmDicomCode(DcmCodes.SingleImageFinding);
    // TODO: CID 6101
    srContent.value = getDcmDicomCode(DcmCodes.SelectedRegion);

    srContent.contentSequence = [];

    // annotation id
    const srId = new DicomSRContent(ValueTypes.text);
    srId.relationshipType = RelationshipTypes.hasObsContext;
    srId.conceptNameCode = getDcmDicomCode(DcmCodes.TrackingIdentifier);
    srId.value = annotation.trackingId;
    srContent.contentSequence.push(srId);

    // annotation uid
    const srUid = new DicomSRContent(ValueTypes.uidref);
    srUid.relationshipType = RelationshipTypes.hasObsContext;
    srUid.conceptNameCode = getDcmDicomCode(DcmCodes.TrackingUniqueIdentifier);
    srUid.value = annotation.trackingUid;
    srContent.contentSequence.push(srUid);

    // quantification
    if (typeof annotation.quantification !== 'undefined') {
      for (const key in annotation.quantification) {
        const quantifContent = getSRContentFromValue(
          key,
          precisionRound(
            annotation.quantification[key].value,
            BIG_EPSILON_EXPONENT
          ),
          annotation.quantification[key].unit,
          RelationshipTypes.hasProperties
        );
        if (typeof quantifContent !== 'undefined') {
          // scoord as 'has properties'
          const srScoord = new DicomSRContent(ValueTypes.scoord);
          srScoord.relationshipType = RelationshipTypes.inferredFrom;
          srScoord.conceptNameCode = getDcmDicomCode(DcmCodes.Path);
          srScoord.value = getScoordFromShape(annotation.mathShape);
          const srcImage = this.#getAnnotationSourceImageContent(annotation);
          srScoord.contentSequence = [srcImage];

          // add scoord to quantif
          quantifContent.contentSequence = [srScoord];
          // add quantif to root
          srContent.contentSequence.push(quantifContent);
        }
      }
    }

    // meta
    const conceptIds = annotation.getMetaConceptIds();
    for (const conceptId of conceptIds) {
      const item = annotation.getMetaItem(conceptId);
      let valueType = ValueTypes.text;
      if (item.value instanceof DicomCode) {
        valueType = ValueTypes.code;
      }
      const meta = new DicomSRContent(valueType);
      meta.relationshipType = RelationshipTypes.contains;
      meta.conceptNameCode = item.concept;
      meta.value = item.value;
      srContent.contentSequence.push(meta);
    }

    return srContent;
  }

  /**
   * Convert an annotation group into a TID 1500 report SR content
   * (internally using TID 1410).
   *
   * @param {AnnotationGroup} annotationGroup The input annotation group.
   * @param {DicomSRContent[]} contentSequence The content sequence to add to.
   */
  #addAnnotationGroupToTid4101Sequence(annotationGroup, contentSequence) {
    if (annotationGroup.getList().length !== 0) {
      for (const annotation of annotationGroup.getList()) {
        contentSequence.push(
          this.#annotationToTid4104SingleImageFinding(annotation)
        );
      }
    }
  }

  /**
   * Get the SR content for a response evaluation.
   *
   * @param {ResponseEvaluation|undefined} response The response evaluation.
   * @returns {DicomSRContent} The SR content.
   */
  #responseToTid4106ResponseEvaluation(response) {
    const srEvalutation = new DicomSRContent(ValueTypes.container);
    srEvalutation.relationshipType = RelationshipTypes.hasProperties;
    srEvalutation.conceptNameCode =
      getDcmDicomCode(DcmCodes.ResponseEvaluation);
    srEvalutation.value = ContinuityOfContents.separate;
    srEvalutation.contentSequence = [];

    // method: RECIST
    const srMethod = new DicomSRContent(ValueTypes.code);
    srMethod.relationshipType = RelationshipTypes.hasObsContext;
    srMethod.conceptNameCode =
      getDcmDicomCode(DcmCodes.ResponseEvaluationMethod);
    srMethod.value = getDcmDicomCode(DcmCodes.RECIST);
    srEvalutation.contentSequence.push(srMethod);

    if (typeof response !== 'undefined') {
      // current response
      if (typeof response.current !== 'undefined') {
        const srResponse = new DicomSRContent(ValueTypes.code);
        srResponse.relationshipType = RelationshipTypes.contains;
        srResponse.conceptNameCode = getDcmDicomCode(DcmCodes.CurrentResponse);
        srResponse.value = response.current;
        srEvalutation.contentSequence.push(srResponse);
      }

      // measurement of response
      if (typeof response.measure !== 'undefined') {
        const srMeas = new DicomSRContent(ValueTypes.num);
        srMeas.relationshipType = RelationshipTypes.contains;
        srMeas.conceptNameCode =
          getDcmDicomCode(DcmCodes.MeasurementOfResponse);
        const measure = new MeasuredValue();
        measure.numericValue = response.measure;
        measure.measurementUnitsCode = getMeasurementUnitsCode('unit.mm');
        const numMeasure = new NumericMeasurement();
        numMeasure.measuredValue = measure;
        srMeas.value = numMeasure;
        srEvalutation.contentSequence.push(srMeas);
      }
    }

    return srEvalutation;
  }

  /**
   * Convert a TID 4106 response evaluation into an response evaluation.
   *
   * @param {DicomSRContent} content The SR content.
   * @returns {ResponseEvaluation|undefined} The response.
   */
  #tid4106ResponseEvaluationToResponse(content) {
    let currentResponse;
    let measure;
    for (const item of content.contentSequence) {
      if (this.#isCurrentResponseItem(item)) {
        currentResponse = item.value;
      } else if (this.#isMeasurementOfResponseItem(item)) {
        measure = item.value.measuredValue.numericValue;
      }
    }

    let response;
    if (typeof currentResponse !== 'undefined') {
      response = new ResponseEvaluation();
      response.current = currentResponse;
      if (typeof measure !== 'undefined') {
        response.measure = measure;
      }
    }
    return response;
  }

  /**
   * Convert a CAD report into a DICOM CAD report SR object using
   *   the TID 4100 template.
   *
   * @param {CADReport} report The CAD report.
   * @param {SimpleTagValues} [extraTags] Optional list of extra tags.
   * @returns {Record<string, DataElement>} A list of dicom elements.
   */
  toDicomCADReport(report, extraTags) {
    // first group as tag base
    let tags = report.annotationGroups[0].getMeta();

    // transfer syntax: ExplicitVRLittleEndian
    tags.TransferSyntaxUID = '1.2.840.10008.1.2.1';
    // class: Comprehensive 3D SR Storage
    // https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_A.35.13.html
    tags.SOPClassUID = '1.2.840.10008.5.1.4.1.1.88.34';
    tags.MediaStorageSOPClassUID = '1.2.840.10008.5.1.4.1.1.88.34';
    tags.CompletionFlag = 'PARTIAL';
    tags.VerificationFlag = 'UNVERIFIED';

    // date
    const now = new Date();
    tags.ContentDate = getDicomDate(dateToDateObj(now));
    tags.ContentTime = getDicomTime(dateToTimeObj(now));

    // reference
    const evidenceSq = tags.CurrentRequestedProcedureEvidenceSequence;
    // hoping for just one element...
    const evidenceSq0 = evidenceSq.value[0];
    const refSeriesSq = evidenceSq0.ReferencedSeriesSequence;
    // hoping for just one element...
    const refSeriesSq0 = refSeriesSq.value[0];
    let refSopSq = refSeriesSq0.ReferencedSOPSequence;
    if (typeof refSopSq === 'undefined') {
      refSeriesSq0.ReferencedSOPSequence = {
        value: []
      };
      refSopSq = refSeriesSq0.ReferencedSOPSequence;
    }
    const refs = refSopSq.value;
    // add reference if not yet present
    for (const annotationGroup of report.annotationGroups) {
      for (const annotation of annotationGroup.getList()) {
        const ref = {
          ReferencedSOPInstanceUID: annotation.referencedSopInstanceUID,
          ReferencedSOPClassUID: annotation.referencedSopClassUID
        };
        const isSameRef = function (item) {
          return item.ReferencedSOPInstanceUID ===
            ref.ReferencedSOPInstanceUID &&
            item.ReferencedSOPClassUID ===
            ref.ReferencedSOPClassUID;
        };
        if (typeof refs.find(isSameRef) === 'undefined') {
          refs.push(ref);
        }
      }
    }

    // TID 4100
    tags.ContentTemplateSequence = {
      value: [{
        MappingResource: 'DCMR',
        TemplateIdentifier: '4100'
      }]
    };

    // findings summary
    const srSummary = new DicomSRContent(ValueTypes.code);
    srSummary.relationshipType = RelationshipTypes.contains;
    srSummary.conceptNameCode =
      getDcmDicomCode(DcmCodes.CADProcessingAndFindingsSummary);
    // TODO: CID 6047 (All algorithms succeeded, ...)
    srSummary.value =
      getDcmDicomCode(DcmCodes.AllAlgorithmsSucceededWithFindings);
    srSummary.contentSequence = [];

    // response evaluation
    for (const response of report.responseEvaluations) {
      const srResponse =
        this.#responseToTid4106ResponseEvaluation(response);
      srSummary.contentSequence.push(srResponse);
    }

    // findings
    for (const annotationGroup of report.annotationGroups) {
      this.#addAnnotationGroupToTid4101Sequence(
        annotationGroup, srSummary.contentSequence);
    }

    // comment (not part of TID 4100)
    if (typeof report.comment !== 'undefined') {
      const srComment = new DicomSRContent(ValueTypes.text);
      srComment.relationshipType = RelationshipTypes.contains;
      srComment.conceptNameCode = getDcmDicomCode(DcmCodes.Comment);
      srComment.value = report.comment;
      srSummary.contentSequence.push(srComment);
    }

    // main content
    const srContent = new DicomSRContent(ValueTypes.container);
    srContent.conceptNameCode = getDcmDicomCode(DcmCodes.ChestCADReport);
    srContent.value = ContinuityOfContents.separate;
    srContent.contentSequence.push(srSummary);

    // main
    if (typeof srContent !== 'undefined') {
      tags = {
        ...tags,
        ...getDicomSRContentItem(srContent)
      };
    } else {
      throw new Error('No annotation group SR content');
    }

    // merge extra tags if provided
    if (typeof extraTags !== 'undefined') {
      mergeTagValues(tags, extraTags);
    }

    return getElementsFromSimpleTagValues(tags);
  }

}
