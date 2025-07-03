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
  isEqualCode
} from '../dicom/dicomCode.js';
import {
  isVersionInBounds,
  getDwvVersionFromImplementationClassUID
} from '../dicom/dicomParser.js';
import {MeasuredValue} from '../dicom/dicomMeasuredValue.js';
import {NumericMeasurement} from '../dicom/dicomNumericMeasurement.js';
import {getAsSimpleElements} from '../dicom/dicomTag.js';
import {getElementsFromJSONTags} from '../dicom/dicomWriter.js';
import {ImageReference} from '../dicom/dicomImageReference.js';
import {SopInstanceReference} from '../dicom/dicomSopInstanceReference.js';
import {
  GraphicTypes,
  getScoordFromShape,
  getShapeFromScoord,
  SpatialCoordinate
} from '../dicom/dicomSpatialCoordinate.js';
import {SpatialCoordinate3D} from '../dicom/dicomSpatialCoordinate3D.js';
import {BIG_EPSILON_EXPONENT} from '../math/matrix.js';
import {precisionRound} from '../utils/string.js';
import {logger} from '../utils/logger.js';
import {Annotation} from './annotation.js';
import {AnnotationGroup} from './annotationGroup.js';
import {Point2D, Point3D} from '../math/point.js';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from '../dicom/dataElement.js';
/* eslint-enable no-unused-vars */

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
 * Merge two tag lists.
 *
 * @param {object} tags1 Base list, will be modified.
 * @param {object} tags2 List to merge.
 */
function mergeTags(tags1, tags2) {
  const keys2 = Object.keys(tags2);
  for (const tagName2 of keys2) {
    if (tags1[tagName2] !== undefined) {
      logger.debug('Overwritting tag: ' + tagName2);
    }
    tags1[tagName2] = tags2[tagName2];
  }
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
   * @param {Object<string, DataElement>} dataElements The DICOM data elements.
   * @returns {boolean} True if the elements contain a dwv 0.34 annotation.
   */
  #isDwv034AnnotationDicomSR(dataElements) {
    // version
    const classUID =
      safeGet(dataElements, TagKeys.ImplementationClassUID);
    const dwvVersion = getDwvVersionFromImplementationClassUID(classUID);
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
   * Check if input elements contain a TID 1500 annotation.
   * Ref: {@link https://dicom.nema.org/medical/Dicom/2022a/output/chtml/part16/chapter_A.html#sect_TID_1500}.
   *
   * @param {Object<string, DataElement>} dataElements The DICOM data elements.
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
      //   - MeasurementGroup
      //     - ImageRegion (SCOORD) OR TID 300 Measure
      const imagingMeas = srContent.contentSequence.find(
        this.#isImagingMeasurementsItem
      );
      if (typeof imagingMeas !== 'undefined') {
        const measGroup = imagingMeas.contentSequence.find(
          this.#isMeasurementGroupItem
        );
        if (typeof measGroup !== 'undefined') {
          const imageRegion = measGroup.contentSequence.find(
            this.#isImageRegionItem
          );
          const measure = measGroup.contentSequence.find(
            this.#isTid300Measurement
          );
          if (typeof imageRegion !== 'undefined' ||
            typeof measure !== 'undefined'
          ) {
            res = true;
          }
        }
      }
    }
    return res;
  }

  /**
   * Check if input elements contain a TID 4100 template.
   * Ref: {@link https://dicom.nema.org/medical/Dicom/2022a/output/chtml/part16/chapter_A.html#sect_TID_4100}.
   *
   * @param {Object<string, DataElement>} dataElements The DICOM data elements.
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
   * @param {Object<string, DataElement>} dataElements The DICOM data elements.
   * @returns {string|undefined} A possible warning.
   * @throws Error for missing or wrong data.
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
   */
  #addSourceImageToAnnotation(annotation, content) {
    if (content.valueType === ValueTypes.image &&
      content.relationshipType === RelationshipTypes.selectedFrom) {
      annotation.referencedSopClassUID =
        content.value.referencedSOPSequence.referencedSOPClassUID;
      annotation.referencedSopInstanceUID =
        content.value.referencedSOPSequence.referencedSOPInstanceUID;
      if (typeof content.value.referencedFrameNumber !== 'undefined') {
        annotation.referencedFrameNumber =
          parseInt(content.value.referencedFrameNumber, 10);
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

    // quantification
    this.#addQuantificationToAnnotation(annotation, content);
    // meta
    this.#addMetaToAnnotation(annotation, content);
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
    let relation;
    if (typeof relationshipType === 'undefined') {
      relation = RelationshipTypes.contains;
    }
    if (content.valueType === ValueTypes.num &&
      content.relationshipType === relation) {
      const quantifName =
        getQuantificationName(content.conceptNameCode);
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
   * Check if a DicomSRContent is an 'ImageRegion'.
   *
   * @param {DicomSRContent} item The item to check.
   * @returns {boolean} True if item has the properties:
   *   (CONTAINS) SCOORD: (111030, DCM, 'Image Region').
   */
  #isImageRegionItem(item) {
    return item.hasHeader(
      ValueTypes.scoord,
      getDcmDicomCode(DcmCodes.ImageRegion),
      RelationshipTypes.contains
    );
  }

  /**
   * Check is a measurement group follows TID 1410:
   * it must contain an image region.
   * Ref: {@link https://dicom.nema.org/medical/Dicom/2022a/output/chtml/part16/chapter_A.html#sect_TID_1410}.
   *
   * @param {DicomSRContent} content The SR content.
   * @returns {boolean} True if an image region was found.
   */
  #isTid1410MeasGroup(content) {
    const scoord = content.contentSequence.find(
      this.#isImageRegionItem
    );
    return typeof scoord !== 'undefined';
  }

  /**
   * Convert a TID 1410 measurement group into an annotation.
   *
   * @param {DicomSRContent} content The SR content.
   * @returns {Annotation|undefined} The annotation.
   */
  #tid1410MeasGroupToAnnotation(content) {
    let annotation;

    // get shape from scoord
    const scoord = content.contentSequence.find(
      this.#isImageRegionItem
    );
    if (typeof scoord !== 'undefined') {
      annotation = new Annotation();
      // shape
      annotation.mathShape = getShapeFromScoord(scoord.value);
      // shape source image
      const fromImage = scoord.contentSequence.find(function (item) {
        return item.valueType === ValueTypes.image &&
          item.relationshipType === RelationshipTypes.selectedFrom;
      });
      if (typeof fromImage !== 'undefined') {
        this.#addSourceImageToAnnotation(annotation, fromImage);
      }

      for (const item of content.contentSequence) {
        // shape ids
        this.#addIdsToAnnotation(annotation, item);
        // shape extra
        this.#addContentToAnnotation(annotation, item);
      }
    }
    return annotation;
  }

  /**
   * Check is an SR content follows TID 300: it must be
   *   a 'contains' numeric value with an 'inferred from' scoord.
   * Ref: {@link https://dicom.nema.org/medical/Dicom/2022a/output/chtml/part16/chapter_A.html#sect_TID_300}.
   *
   * @param {DicomSRContent} item The SR content.
   * @returns {boolean} True if TID 300 measure.
   */
  #isTid300Measurement(item) {
    // no specific concept
    const isContainedNum =
      item.valueType === ValueTypes.num &&
      item.relationshipType === RelationshipTypes.contains;
    let scoord;
    if (isContainedNum) {
      // no specific concept (?)
      scoord = item.contentSequence.find(function (subItem) {
        return subItem.valueType === ValueTypes.scoord &&
          subItem.relationshipType === RelationshipTypes.inferredFrom;
      });
    }
    return typeof scoord !== 'undefined';
  }

  /**
   * Check is an SR content follows TID 1400: it must be
   *   a 'has properties' numeric value with an 'inferred from' scoord.
   * Ref: {@link https://dicom.nema.org/medical/Dicom/current/output/chtml/part16/chapter_A.html#sect_TID_1400}.
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
   * Check is a measurement group follows TID 1501:
   * it must contain a measure.
   * Ref: {@link https://dicom.nema.org/medical/Dicom/2022a/output/chtml/part16/chapter_A.html#sect_TID_1501}.
   *
   * @param {DicomSRContent} content The SR content.
   * @returns {boolean} True if a measure was found.
   */
  #isTid1501MeasGroup(content) {
    const measure = content.contentSequence.find(
      this.#isTid300Measurement
    );
    return typeof measure !== 'undefined';
  }

  /**
   * Convert a TID 1501 measurement group into an annotation.
   *
   * @param {DicomSRContent} content The SR content.
   * @returns {Annotation|undefined} The annotation.
   */
  #tid1501MeasGroupToAnnotation(content) {
    let annotation;

    // just use the first measure to get the scoord
    // (expecting all measures to refer to the same scoord)
    const measure = content.contentSequence.find(
      this.#isTid300Measurement
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
        this.#addQuantificationToAnnotation(annotation, measure);
        // add meta
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
   * Supports TID1500 > TID1410 ("Planar ROI Measurements
   * and Qualitative Evaluations”) or TID1501 (“Measurement and
   * Qualitative Evaluation Group”).
   *
   * @param {DicomSRContent} content The SR content.
   * @returns {AnnotationGroup|undefined} The annotation group.
   */
  #imagingMeasToAnnotationGroup(content) {
    if (content.contentSequence.length === 0) {
      return undefined;
    }
    const item0 = content.contentSequence[0];
    let isTid1410 = false;
    let isTid1501 = false;
    if (this.#isMeasurementGroupItem(item0)) {
      isTid1410 = this.#isTid1410MeasGroup(item0);
      isTid1501 = this.#isTid1501MeasGroup(item0);
    }

    const annotations = [];
    let hasMeasGroup = false;
    for (const item of content.contentSequence) {
      // measurement group content
      if (this.#isMeasurementGroupItem(item)) {
        hasMeasGroup = true;
        let annotation;
        if (isTid1410) {
          annotation = this.#tid1410MeasGroupToAnnotation(item);
        } else if (isTid1501) {
          annotation = this.#tid1501MeasGroupToAnnotation(item);
        }
        if (typeof annotation !== 'undefined') {
          annotations.push(annotation);
        }
      }
    }

    let annotationGroup;
    if (!hasMeasGroup) {
      logger.warn('No measurement groups in TID 1500 SR');
    } else {
      if (annotations.length !== 0) {
        annotationGroup = new AnnotationGroup(annotations);
      } else {
        logger.warn('No valid measurement groups in TID 1500 SR');
      }
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
    } else {
      if (annotations.length !== 0) {
        annotationGroups.push(new AnnotationGroup(annotations));
      } else {
        logger.warn('No valid measurement groups in TID 4100 SR');
      }
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
   * @param {Object<string, DataElement>} dataElements The DICOM tags.
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
      const evidences = getAsSimpleElements(evidenceSqElement);
      annotationGroup.setMetaValue(
        'CurrentRequestedProcedureEvidenceSequence',
        evidences.CurrentRequestedProcedureEvidenceSequence
      );
    }
  }

  /**
   * Get an {@link AnnotationGroup} object from the read DICOM file.
   *
   * @param {Object<string, DataElement>} dataElements The DICOM tags.
   * @returns {AnnotationGroup} A new annotation group.
   * @throws Error for missing or wrong data.
   */
  create(dataElements) {
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
      throw new Error('Cannot create annotation group from ' + srType);
    }

    // add dicom meta
    this.#addMetaToAnnotationGroup(annotationGroup, dataElements);

    return annotationGroup;
  }

  /**
   * Get an {@link CADReport} object from the read DICOM file.
   *
   * @param {Object<string, DataElement>} dataElements The DICOM tags.
   * @returns {CADReport|undefined} A new CAD report.
   */
  createCADReport(dataElements) {
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
   * Get the annotation meta as SR content list.
   *
   * @param {Annotation} annotation The input annotation.
   * @returns {DicomSRContent[]} The SR content list.
   */
  #getAnnotationContentSequence(annotation) {
    const contentSequence = [];

    // annotation id
    const srId = new DicomSRContent(ValueTypes.text);
    srId.relationshipType = RelationshipTypes.hasObsContext;
    srId.conceptNameCode = getDcmDicomCode(DcmCodes.TrackingIdentifier);
    srId.value = annotation.trackingId;
    contentSequence.push(srId);

    // annotation uid
    const srUid = new DicomSRContent(ValueTypes.uidref);
    srUid.relationshipType = RelationshipTypes.hasObsContext;
    srUid.conceptNameCode = getDcmDicomCode(DcmCodes.TrackingUniqueIdentifier);
    srUid.value = annotation.trackingUid;
    contentSequence.push(srUid);

    // text expr
    if (typeof annotation.textExpr !== 'undefined' &&
      annotation.textExpr.length !== 0
    ) {
      const shortLabel = new DicomSRContent(ValueTypes.text);
      shortLabel.relationshipType = RelationshipTypes.hasConceptMod;
      shortLabel.conceptNameCode = getDcmDicomCode(DcmCodes.ShortLabel);
      shortLabel.value = annotation.textExpr;
      // label position
      if (typeof annotation.labelPosition !== 'undefined') {
        const labelPosition = new DicomSRContent(ValueTypes.scoord);
        labelPosition.relationshipType = RelationshipTypes.hasProperties;
        labelPosition.conceptNameCode =
          getDcmDicomCode(DcmCodes.ReferencePoints);
        const labelPosScoord = new SpatialCoordinate();
        labelPosScoord.graphicType = GraphicTypes.point;
        const graphicData = [
          annotation.labelPosition.getX().toString(),
          annotation.labelPosition.getY().toString()
        ];
        labelPosScoord.graphicData = graphicData;
        labelPosition.value = labelPosScoord;
        const srcImage = this.#getAnnotationSourceImageContent(annotation);
        labelPosition.contentSequence = [srcImage];

        // add position to label sequence
        shortLabel.contentSequence = [labelPosition];
      }
      contentSequence.push(shortLabel);
    }

    // colour
    const colour = new DicomSRContent(ValueTypes.text);
    colour.relationshipType = RelationshipTypes.hasConceptMod;
    colour.conceptNameCode = getColourCode();
    colour.value = annotation.colour;
    contentSequence.push(colour);

    // reference points
    if (typeof annotation.referencePoints !== 'undefined') {
      const referencePoints = new DicomSRContent(ValueTypes.scoord);
      referencePoints.relationshipType = RelationshipTypes.hasConceptMod;
      referencePoints.conceptNameCode =
        getDcmDicomCode(DcmCodes.ReferencePoints);
      const refPointsScoord = new SpatialCoordinate();
      refPointsScoord.graphicType = GraphicTypes.multipoint;
      const graphicData = [];
      for (const point of annotation.referencePoints) {
        graphicData.push(point.getX().toString());
        graphicData.push(point.getY().toString());
      }
      refPointsScoord.graphicData = graphicData;

      referencePoints.value = refPointsScoord;
      const srcImage = this.#getAnnotationSourceImageContent(annotation);
      referencePoints.contentSequence = [srcImage];

      contentSequence.push(referencePoints);
    }

    // plane points
    if (typeof annotation.planePoints !== 'undefined') {
      const planePoints = new DicomSRContent(ValueTypes.scoord3d);
      planePoints.relationshipType = RelationshipTypes.contains;
      planePoints.conceptNameCode = getDcmDicomCode(DcmCodes.ReferenceGeometry);
      const pointsScoord = new SpatialCoordinate3D();
      pointsScoord.graphicType = GraphicTypes.multipoint;
      const graphicData = [];
      for (const planePoint of annotation.planePoints) {
        graphicData.push(planePoint.getX().toString());
        graphicData.push(planePoint.getY().toString());
        graphicData.push(planePoint.getZ().toString());
      }
      pointsScoord.graphicData = graphicData;

      planePoints.value = pointsScoord;
      const srcImage = this.#getAnnotationSourceImageContent(annotation);
      planePoints.contentSequence = [srcImage];

      contentSequence.push(planePoints);
    }

    // quantification
    if (typeof annotation.quantification !== 'undefined') {
      for (const key in annotation.quantification) {
        const quantifContent = getSRContentFromValue(
          key,
          precisionRound(
            annotation.quantification[key].value,
            BIG_EPSILON_EXPONENT
          ),
          annotation.quantification[key].unit
        );
        if (typeof quantifContent !== 'undefined') {
          contentSequence.push(quantifContent);
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
      contentSequence.push(meta);
    }

    return contentSequence;
  }

  /**
   * Convert an annotation into a 'Measurement Group' SR content.
   *
   * @param {Annotation} annotation The input annotation.
   * @returns {DicomSRContent} The result SR content.
   */
  #annotationToTid1410MeasGroup(annotation) {
    // measurement group
    const srContent = new DicomSRContent(ValueTypes.container);
    srContent.relationshipType = RelationshipTypes.contains;
    srContent.conceptNameCode = getDcmDicomCode(DcmCodes.MeasurementGroup);
    srContent.value = ContinuityOfContents.separate;

    // scoord
    const srScoord = new DicomSRContent(ValueTypes.scoord);
    srScoord.relationshipType = RelationshipTypes.contains;
    srScoord.conceptNameCode = getDcmDicomCode(DcmCodes.ImageRegion);
    srScoord.value = getScoordFromShape(annotation.mathShape);
    const srcImage = this.#getAnnotationSourceImageContent(annotation);
    srScoord.contentSequence = [srcImage];

    // add extras
    srContent.contentSequence = [srScoord].concat(
      this.#getAnnotationContentSequence(annotation));

    return srContent;
  }

  /**
   * Convert an annotation group into a TID 1500 report SR content
   * (internally using TID 1410).
   *
   * @param {AnnotationGroup} annotationGroup The input annotation group.
   * @returns {DicomSRContent|undefined} The result SR content.
   */
  #annotationGroupToTid1500(annotationGroup) {
    let srContent;

    if (annotationGroup.getList().length !== 0) {
      // imaging measurements
      const measContent = new DicomSRContent(ValueTypes.container);
      measContent.conceptNameCode =
        getDcmDicomCode(DcmCodes.ImagingMeasurements);
      measContent.relationshipType = RelationshipTypes.contains;
      measContent.value = ContinuityOfContents.separate;
      const contentSequence = [];
      for (const annotation of annotationGroup.getList()) {
        contentSequence.push(
          this.#annotationToTid1410MeasGroup(annotation)
        );
      }
      measContent.contentSequence = contentSequence;

      // imaging measurements report
      srContent = new DicomSRContent(ValueTypes.container);
      srContent.conceptNameCode =
        getDcmDicomCode(DcmCodes.ImagingMeasurementReport);
      srContent.value = ContinuityOfContents.separate;
      srContent.contentSequence = [measContent];
    }

    return srContent;
  }

  /**
   * Convert an annotation group into a DICOM SR object using the
   * TID 1500 template.
   *
   * @param {AnnotationGroup} annotationGroup The annotation group.
   * @param {Object<string, any>} [extraTags] Optional list of extra tags.
   * @returns {Object<string, DataElement>} A list of dicom elements.
   */
  toDicom(annotationGroup, extraTags) {
    let tags = annotationGroup.getMeta();

    // transfer syntax: ExplicitVRLittleEndian
    tags.TransferSyntaxUID = '1.2.840.10008.1.2.1';
    // class: Comprehensive 3D SR Storage
    // https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_A.35.13.html
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
    for (const annotation of annotationGroup.getList()) {
      const ref = {
        ReferencedSOPInstanceUID: annotation.referencedSopInstanceUID,
        ReferencedSOPClassUID: annotation.referencedSopClassUID
      };
      const isSameRef = function (item) {
        return item.ReferencedSOPInstanceUID === ref.ReferencedSOPInstanceUID &&
          item.ReferencedSOPClassUID === ref.ReferencedSOPClassUID;
      };
      if (typeof refs.find(isSameRef) === 'undefined') {
        refs.push(ref);
      }
    }

    // TID 1500
    tags.ContentTemplateSequence = {
      value: [{
        MappingResource: 'DCMR',
        TemplateIdentifier: '1500'
      }]
    };

    const srContent = this.#annotationGroupToTid1500(annotationGroup);

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
      mergeTags(tags, extraTags);
    }

    return getElementsFromJSONTags(tags);
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
   * @param {Object<string, any>} [extraTags] Optional list of extra tags.
   * @returns {Object<string, DataElement>} A list of dicom elements.
   */
  toDicomCADReport(report, extraTags) {
    // first group as tag base
    let tags = report.annotationGroups[0].getMeta();

    // transfer syntax: ExplicitVRLittleEndian
    tags.TransferSyntaxUID = '1.2.840.10008.1.2.1';
    // class: Comprehensive 3D SR Storage
    // https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_A.35.13.html
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
      mergeTags(tags, extraTags);
    }

    return getElementsFromJSONTags(tags);
  }

}
