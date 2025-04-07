import {
  dateToDateObj,
  getDicomDate,
  dateToTimeObj,
  getDicomTime,
} from '../dicom/dicomDate';
import {
  safeGet,
  safeGetAll
} from '../dicom/dataElement';
import {
  ValueTypes,
  RelationshipTypes,
  getSRContent,
  getDicomSRContentItem,
  getContentTemplate,
  DicomSRContent,
  getSRContentFromValue
} from '../dicom/dicomSRContent';
import {
  getMeasurementGroupCode,
  getImageRegionCode,
  getReferenceGeometryCode,
  getSourceImageCode,
  getTrackingIdentifierCode,
  getTrackingUniqueIdentifierCode,
  getShortLabelCode,
  getReferencePointsCode,
  getColourCode,
  getQuantificationName,
  getQuantificationUnit,
  DicomCode,
  getImagingMeasurementReportCode,
  getImagingMeasurementsCode,
  isEqualCode
} from '../dicom/dicomCode';
import {
  isVersionInBounds,
  getDwvVersionFromImplementationClassUID
} from '../dicom/dicomParser';
import {getElementsFromJSONTags} from '../dicom/dicomWriter';
import {ImageReference} from '../dicom/dicomImageReference';
import {SopInstanceReference} from '../dicom/dicomSopInstanceReference';
import {
  GraphicTypes,
  getScoordFromShape,
  getShapeFromScoord,
  SpatialCoordinate
} from '../dicom/dicomSpatialCoordinate';
import {SpatialCoordinate3D} from '../dicom/dicomSpatialCoordinate3D';
import {logger} from '../utils/logger';
import {Annotation} from './annotation';
import {AnnotationGroup} from './annotationGroup';
import {Point2D, Point3D} from '../math/point';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from '../dicom/dataElement';
/* eslint-enable no-unused-vars */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  ImplementationClassUID: '00020012',
  StudyInstanceUID: '0020000D',
  SeriesInstanceUID: '0020000E',
  Modality: '00080060',
  PatientName: '00100010',
  PatientID: '00100020',
  PatientBirthDate: '00100030',
  PatientSex: '00100040',
  ReferencedSeriesSequence: '00081115',
  ContentTemplateSequence: '0040A504',
  MappingResource: '00080105',
  TemplateIdentifier: '0040DB00'
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
      logger.trace('Overwritting tag: ' + tagName2);
    }
    tags1[tagName2] = tags2[tagName2];
  }
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
      rootConcept === getMeasurementGroupCode().value;
  }

  /**
   * Check if input elements contain a TID 1500 annotation.
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
      rootConcept === getImagingMeasurementReportCode().value;

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
            this.#isTid300Measure
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
      !this.#isTid1500AnnotationDicomSR(dataElements)) {
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
      getTrackingIdentifierCode(),
      RelationshipTypes.hasProperties
    )) {
      annotation.id = content.value;
      // use it as uid
      annotation.uid = content.value;
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
      getTrackingIdentifierCode(),
      RelationshipTypes.hasObsContext
    )) {
      annotation.id = content.value;
    }

    // annotation uid
    if (content.hasHeader(
      ValueTypes.uidref,
      getTrackingUniqueIdentifierCode(),
      RelationshipTypes.hasObsContext
    )) {
      annotation.uid = content.value;
    }
  }

  /**
   * Add content to an annotation.
   *
   * @param {Annotation} annotation The annotation.
   * @param {DicomSRContent} content The content to add.
   */
  #addContentToAnnotation(annotation, content) {
    // ids
    this.#addIdsToAnnotation(annotation, content);

    // text expr
    if (content.hasHeader(
      ValueTypes.text, getShortLabelCode(), RelationshipTypes.hasProperties
    )) {
      annotation.textExpr = content.value;
      // optional label position
      const scoord = content.contentSequence.find(function (item) {
        return item.hasHeader(
          ValueTypes.scoord,
          getReferencePointsCode(),
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
      ValueTypes.text, getColourCode(), RelationshipTypes.hasProperties
    )) {
      annotation.colour = content.value;
    }

    // reference points
    if (content.hasHeader(
      ValueTypes.scoord,
      getReferencePointsCode(),
      RelationshipTypes.hasProperties) &&
      content.value.graphicType === GraphicTypes.multipoint) {
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
      getReferenceGeometryCode(),
      RelationshipTypes.hasProperties) &&
      content.value.graphicType === GraphicTypes.multipoint) {
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
   */
  #addQuantificationToAnnotation(annotation, content) {
    if (content.valueType === ValueTypes.num &&
      content.relationshipType === RelationshipTypes.contains) {
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
      getImagingMeasurementsCode(),
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
      getMeasurementGroupCode(),
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
      getImageRegionCode(),
      RelationshipTypes.contains
    );
  }

  /**
   * Check is a measurement group follows TID 1410:
   * it must contain an image region.
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
      annotation.mathShape = getShapeFromScoord(scoord.value);
      // get source image from scoord content
      const fromImage = scoord.contentSequence.find(function (item) {
        return item.valueType === ValueTypes.image &&
          item.relationshipType === RelationshipTypes.selectedFrom;
      });
      if (typeof fromImage !== 'undefined') {
        this.#addSourceImageToAnnotation(annotation, fromImage);
      }
      // add other meta
      for (const item of content.contentSequence) {
        this.#addContentToAnnotation(annotation, item);
      }
    }
    return annotation;
  }

  /**
   * Check is an SR content follows TID 300:
   * it must contain a numberic value that contains an
   * inferred from image.
   *
   * @param {DicomSRContent} item The SR content.
   * @returns {boolean} True if TID 300 measure.
   */
  #isTid300Measure(item) {
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
   * Check is a measurement group follows TID 1501:
   * it must contain a measure.
   *
   * @param {DicomSRContent} content The SR content.
   * @returns {boolean} True if a measure was found.
   */
  #isTid1501MeasGroup(content) {
    const measure = content.contentSequence.find(
      this.#isTid300Measure
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
      this.#isTid300Measure
    );
    if (typeof measure !== 'undefined') {
      annotation = new Annotation();
      // no specific concept (?)
      const scoord = measure.contentSequence.find(function (subItem) {
        return subItem.valueType === ValueTypes.scoord &&
          subItem.relationshipType === RelationshipTypes.inferredFrom;
      });
      annotation.mathShape = getShapeFromScoord(scoord.value);
      // get source image from scoord content
      // no specific concept (?)
      const fromImage = scoord.contentSequence.find(function (item) {
        return item.valueType === ValueTypes.image &&
          item.relationshipType === RelationshipTypes.selectedFrom;
      });
      if (typeof fromImage !== 'undefined') {
        this.#addSourceImageToAnnotation(annotation, fromImage);
      }
    }

    // add meta
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
   * Convert an imaging measurement into an annotation group.
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
   * Convert a DICOM SR content of type SCOORD into an annotation.
   *
   * @param {DicomSRContent} content The input SCOORD.
   * @returns {Annotation} The annotation.
   */
  #dwv034ScoordToAnnotation(content) {
    const annotation = new Annotation();
    annotation.mathShape = getShapeFromScoord(content.value);

    for (const item of content.contentSequence) {
      this.#addSourceImageToAnnotation(annotation, item);
      this.#addDwv034IdToAnnotation(annotation, item);
      this.#addContentToAnnotation(annotation, item);
    }
    return annotation;
  }

  /**
   * Convert a DICOM SR content folowing TID 1500 into a list of annotations.
   *
   * Structure: (root) 'Imaging Measurement Report'
   * - 'Imaging Measurements',
   *   - 'Measurement Group',
   *     - scoord,
   *     - meta.
   *
   * @param {DicomSRContent} content The input SCOORD.
   * @returns {AnnotationGroup|undefined} The annotation group.
   */
  #tid1500ToAnnotationGroup(content) {
    if (!(content.valueType === ValueTypes.container &&
      isEqualCode(content.conceptNameCode, getImagingMeasurementReportCode())
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
      isEqualCode(content.conceptNameCode, getMeasurementGroupCode())
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
   * Get an {@link Annotation} object from the read DICOM file.
   *
   * @param {Object<string, DataElement>} dataElements The DICOM tags.
   * @returns {AnnotationGroup} A new annotation group.
   * @throws Error for missing or wrong data.
   */
  create(dataElements) {
    const srContent = getSRContent(dataElements);

    let annotationGroup;
    if (this.#isTid1500AnnotationDicomSR(dataElements)) {
      annotationGroup = this.#tid1500ToAnnotationGroup(srContent);
    } else if (this.#isDwv034AnnotationDicomSR(dataElements)) {
      logger.warn('DWV v0.34 annotation');
      annotationGroup = this.#dwv034MeasGroupToAnnotationGroup(srContent);
    }

    if (typeof annotationGroup === 'undefined') {
      throw new Error('Cannot create annotation group from TID 1500 SR');
    }

    const safeGetLocal = function (key) {
      return safeGet(dataElements, key);
    };

    // StudyInstanceUID
    annotationGroup.setMetaValue('StudyInstanceUID',
      safeGetLocal(TagKeys.StudyInstanceUID));
    // Modality
    annotationGroup.setMetaValue('Modality',
      safeGetLocal(TagKeys.Modality));
    // patient info
    annotationGroup.setMetaValue('PatientName',
      safeGetLocal(TagKeys.PatientName));
    annotationGroup.setMetaValue('PatientID',
      safeGetLocal(TagKeys.PatientID));
    annotationGroup.setMetaValue('PatientBirthDate',
      safeGetLocal(TagKeys.PatientBirthDate));
    annotationGroup.setMetaValue('PatientSex',
      safeGetLocal(TagKeys.PatientSex));

    // ReferencedSeriesSequence
    const refSeriesSq = safeGetLocal(TagKeys.ReferencedSeriesSequence);
    if (typeof refSeriesSq !== 'undefined') {
      const seriesUIDs = safeGetAll(refSeriesSq, TagKeys.SeriesInstanceUID);
      if (typeof seriesUIDs !== 'undefined') {
        const uids = [];
        for (const uid of seriesUIDs) {
          uids.push({SeriesInstanceUID: uid});
        }
        annotationGroup.setMetaValue(
          'ReferencedSeriesSequence', {value: uids}
        );
      }
    }

    return annotationGroup;
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
    srImage.conceptNameCode = getSourceImageCode();
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
    srId.conceptNameCode = getTrackingIdentifierCode();
    srId.value = annotation.id;
    contentSequence.push(srId);

    // annotation uid
    const srUid = new DicomSRContent(ValueTypes.uidref);
    srUid.relationshipType = RelationshipTypes.hasObsContext;
    srUid.conceptNameCode = getTrackingUniqueIdentifierCode();
    srUid.value = annotation.uid;
    contentSequence.push(srUid);

    // text expr
    const shortLabel = new DicomSRContent(ValueTypes.text);
    shortLabel.relationshipType = RelationshipTypes.hasProperties;
    shortLabel.conceptNameCode = getShortLabelCode();
    shortLabel.value = annotation.textExpr;
    // label position
    if (typeof annotation.labelPosition !== 'undefined') {
      const labelPosition = new DicomSRContent(ValueTypes.scoord);
      labelPosition.relationshipType = RelationshipTypes.hasProperties;
      labelPosition.conceptNameCode = getReferencePointsCode();
      const labelPosScoord = new SpatialCoordinate();
      labelPosScoord.graphicType = GraphicTypes.point;
      const graphicData = [
        annotation.labelPosition.getX().toString(),
        annotation.labelPosition.getY().toString()
      ];
      labelPosScoord.graphicData = graphicData;
      labelPosition.value = labelPosScoord;

      // add position to label sequence
      shortLabel.contentSequence = [labelPosition];
    }
    contentSequence.push(shortLabel);

    // colour
    const colour = new DicomSRContent(ValueTypes.text);
    colour.relationshipType = RelationshipTypes.hasProperties;
    colour.conceptNameCode = getColourCode();
    colour.value = annotation.colour;
    contentSequence.push(colour);

    // reference points
    if (typeof annotation.referencePoints !== 'undefined') {
      const referencePoints = new DicomSRContent(ValueTypes.scoord);
      referencePoints.relationshipType = RelationshipTypes.hasProperties;
      referencePoints.conceptNameCode = getReferencePointsCode();
      const refPointsScoord = new SpatialCoordinate();
      refPointsScoord.graphicType = GraphicTypes.multipoint;
      const graphicData = [];
      for (const point of annotation.referencePoints) {
        graphicData.push(point.getX().toString());
        graphicData.push(point.getY().toString());
      }
      refPointsScoord.graphicData = graphicData;

      referencePoints.value = refPointsScoord;
      contentSequence.push(referencePoints);
    }

    // plane points
    if (typeof annotation.planePoints !== 'undefined') {
      const planePoints = new DicomSRContent(ValueTypes.scoord3d);
      planePoints.relationshipType = RelationshipTypes.hasProperties;
      planePoints.conceptNameCode = getReferenceGeometryCode();
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
      contentSequence.push(planePoints);
    }

    // quantification
    if (typeof annotation.quantification !== 'undefined') {
      for (const key in annotation.quantification) {
        const quatifContent = getSRContentFromValue(
          key,
          annotation.quantification[key].value,
          annotation.quantification[key].unit
        );
        if (typeof quatifContent !== 'undefined') {
          contentSequence.push(quatifContent);
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
  #annotationToMeasurementGroup(annotation) {
    // measurement group
    const srContent = new DicomSRContent(ValueTypes.container);
    srContent.relationshipType = RelationshipTypes.contains;
    srContent.conceptNameCode = getMeasurementGroupCode();

    // scoord
    const srScoord = new DicomSRContent(ValueTypes.scoord);
    srScoord.relationshipType = RelationshipTypes.contains;
    srScoord.conceptNameCode = getImageRegionCode();
    srScoord.value = getScoordFromShape(annotation.mathShape);
    const srcImage = this.#getAnnotationSourceImageContent(annotation);
    srScoord.contentSequence = [srcImage];

    // add extras
    srContent.contentSequence = [srScoord].concat(
      this.#getAnnotationContentSequence(annotation));

    return srContent;
  }

  /**
   * Convert an annotation group into a TID 1500 report SR content.
   *
   * @param {AnnotationGroup} annotationGroup The input annotation group.
   * @returns {DicomSRContent|undefined} The result SR content.
   */
  #annotationGroupToTid1500(annotationGroup) {
    let srContent;

    if (annotationGroup.getList().length !== 0) {
      // imaging measurements
      const measContent = new DicomSRContent(ValueTypes.container);
      measContent.conceptNameCode = getImagingMeasurementsCode();
      measContent.relationshipType = RelationshipTypes.contains;
      const contentSequence = [];
      for (const annotation of annotationGroup.getList()) {
        contentSequence.push(this.#annotationToMeasurementGroup(annotation));
      }
      measContent.contentSequence = contentSequence;

      // imaging measurements report
      srContent = new DicomSRContent(ValueTypes.container);
      srContent.conceptNameCode = getImagingMeasurementReportCode();
      srContent.contentSequence = [measContent];
    }

    return srContent;
  }

  /**
   * Convert an annotation group into a DICOM SR object.
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

    const now = new Date();
    tags.ContentDate = getDicomDate(dateToDateObj(now));
    tags.ContentTime = getDicomTime(dateToTimeObj(now));

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

}