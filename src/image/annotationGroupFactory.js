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
  isEqualCode,
  getPathCode,
  getMeasurementGroupCode,
  getImageRegionCode,
  getReferenceGeometryCode,
  getSourceImageCode,
  getTrackingIdentifierCode,
  getShortLabelCode,
  getReferencePointsCode,
  getColourCode,
  getQuantificationName,
  getQuantificationUnit,
  DicomCode,
  getImagingMeasurementReportCode,
  getImagingMeasurementsCode
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
import {guid} from '../math/stats';
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
  #isDwv034Annotations(dataElements) {
    // content template
    const contentTemplate = getContentTemplate(dataElements);

    // version
    const classUID =
      safeGet(dataElements, TagKeys.ImplementationClassUID);
    const dwvVersion = getDwvVersionFromImplementationClassUID(classUID);
    const isDwv034 = typeof dwvVersion !== 'undefined' &&
      isVersionInBounds(dwvVersion, '0.34.0', '0.35.0-beta.21');

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
  #isTid1500Annotations(dataElements) {
    // content template
    const contentTemplate = getContentTemplate(dataElements);

    // root SR concept
    let rootConcept;
    const srContent = getSRContent(dataElements);
    if (typeof srContent.conceptNameCode !== 'undefined') {
      rootConcept = srContent.conceptNameCode.value;
    }

    return contentTemplate === 'DCMR-1500' &&
      rootConcept === getImagingMeasurementReportCode().value;
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
    //if (!this.#isDwv034Annotations(dataElements)) {
    if (!this.#isDwv034Annotations(dataElements) &&
      !this.#isTid1500Annotations(dataElements)) {
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
      content.relationshipType === RelationshipTypes.selectedFrom &&
      isEqualCode(content.conceptNameCode, getSourceImageCode())) {
      annotation.referenceSopUID =
        content.value.referencedSOPSequence.referencedSOPInstanceUID;
    }
  }

  /**
   * Add content to an annotation.
   *
   * @param {Annotation} annotation The annotation.
   * @param {DicomSRContent} content The content to add.
   */
  #addContentToAnnotation(annotation, content) {
    // annotation id
    if (content.valueType === ValueTypes.uidref &&
      content.relationshipType === RelationshipTypes.hasProperties &&
      isEqualCode(content.conceptNameCode, getTrackingIdentifierCode())) {
      annotation.id = content.value;
    }
    // text expr
    if (content.valueType === ValueTypes.text &&
      content.relationshipType === RelationshipTypes.hasProperties &&
      isEqualCode(content.conceptNameCode, getShortLabelCode())) {
      annotation.textExpr = content.value;
      if (typeof content.contentSequence !== 'undefined') {
        for (const subsubItem of content.contentSequence) {
          if (subsubItem.valueType === ValueTypes.scoord &&
            subsubItem.relationshipType === RelationshipTypes.hasProperties &&
            isEqualCode(
              subsubItem.conceptNameCode, getReferencePointsCode())) {
            annotation.labelPosition = new Point2D(
              subsubItem.value.graphicData[0],
              subsubItem.value.graphicData[1]
            );
          }
        }
      }
    }
    // color
    if (content.valueType === ValueTypes.text &&
      content.relationshipType === RelationshipTypes.hasProperties &&
      isEqualCode(content.conceptNameCode, getColourCode())) {
      annotation.colour = content.value;
    }
    // reference points
    if (content.valueType === ValueTypes.scoord &&
      content.relationshipType === RelationshipTypes.hasProperties &&
      isEqualCode(content.conceptNameCode, getReferencePointsCode()) &&
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
    if (content.valueType === ValueTypes.scoord3d &&
      content.relationshipType === RelationshipTypes.hasProperties &&
      isEqualCode(
        content.conceptNameCode, getReferenceGeometryCode()) &&
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
    // meta
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
   * Convert a DICOM SR content of type 'Measurement group' into an annotation.
   *
   * @param {DicomSRContent} content The input SR content.
   * @returns {Annotation} The annotation.
   */
  #measGroupToAnnotation(content) {
    const annotation = new Annotation();
    // default
    annotation.id = guid();
    annotation.textExpr = '';

    for (const item of content.contentSequence) {
      if (item.valueType === ValueTypes.scoord &&
        item.relationshipType === RelationshipTypes.contains &&
        (isEqualCode(item.conceptNameCode, getImageRegionCode()) ||
        isEqualCode(item.conceptNameCode, getPathCode()))) {
        console.log('got image region');

        console.log('item.value', item.value);
        annotation.mathShape = getShapeFromScoord(item.value);

        console.log('mathShape', annotation.mathShape);

        for (const subItem of item.contentSequence) {
          this.#addSourceImageToAnnotation(annotation, subItem);
        }
      } else {
        this.#addContentToAnnotation(annotation, item);
      }
    }

    console.log('annotation', annotation);
    return annotation;
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
    // default
    annotation.id = guid();
    annotation.textExpr = '';

    for (const item of content.contentSequence) {
      this.#addSourceImageToAnnotation(annotation, item);
      this.#addContentToAnnotation(annotation, item);
    }
    return annotation;
  }

  /**
   * Convert a DICOM SR content folowing TID 1500 into a list of annotations.
   *
   * @param {DicomSRContent} content The input SCOORD.
   * @returns {AnnotationGroup} The annotation group.
   */
  #tid1500ToAnnotationGroup(content) {
    console.log('load TID 1500 ------------------------------');
    // item.conceptNameCode = getImagineMeasurementReportCode()
    if (content.valueType === ValueTypes.container &&
      content.relationshipType === RelationshipTypes.contains &&
      isEqualCode(content.conceptNameCode, getImagingMeasurementReportCode())) {
      console.log('got imaging meas report');
    }
    console.log('content.valueType', content.valueType);
    console.log('content.relationshipType', content.relationshipType);
    console.log('content.conceptNameCode', content.conceptNameCode);

    // tid 1500
    // root: 'Imaging Measurement Report'
    // - 'Imaging Measurements'
    //   - 'Measurement Group'
    //     - scoord
    //     - meta
    const annotations = [];


    for (const item of content.contentSequence) {
      if (item.valueType === ValueTypes.container &&
        item.relationshipType === RelationshipTypes.contains &&
        isEqualCode(item.conceptNameCode, getImagingMeasurementsCode())) {
        console.log('got imaging meas');

        for (const subItem of item.contentSequence) {
          if (subItem.valueType === ValueTypes.container &&
            subItem.relationshipType === RelationshipTypes.contains &&
            isEqualCode(subItem.conceptNameCode, getMeasurementGroupCode())) {
            console.log('got meas group');

            annotations.push(this.#measGroupToAnnotation(subItem));
          }
        }
      }
    }

    return new AnnotationGroup(annotations);
  }

  /**
   * Convert a DICOM SR content 'Measurement group' into a list of annotations.
   *
   * @param {DicomSRContent} content The input.
   * @returns {Annotation[]} The annotation.
   */
  #dwv034MeasGroupToAnnotationGroup(content) {
    // item.conceptNameCode = getMeasurementGroupCode()

    // dwv 0.34:
    // root: 'Measurement group'
    // - scoord
    //   - meta

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
    if (this.#isTid1500Annotations(dataElements)) {
      annotationGroup = this.#tid1500ToAnnotationGroup(srContent);
    } else if (this.#isDwv034Annotations(dataElements)) {
      annotationGroup = this.#dwv034MeasGroupToAnnotationGroup(srContent);
    }

    if (typeof annotationGroup === 'undefined') {
      throw new Error('Cant create annotation group');
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

  #getAnnotationSourceImageContent(annotation) {
    // reference image UID
    const srImage = new DicomSRContent(ValueTypes.image);
    srImage.relationshipType = RelationshipTypes.selectedFrom;
    srImage.conceptNameCode = getSourceImageCode();
    const sopRef = new SopInstanceReference();
    sopRef.referencedSOPClassUID = '';
    sopRef.referencedSOPInstanceUID = annotation.referenceSopUID;
    const imageRef = new ImageReference();
    imageRef.referencedSOPSequence = sopRef;
    srImage.value = imageRef;

    return srImage;
  }

  #getAnnotationContentSequence(annotation) {
    const contentSequence = [];

    // annotation id
    const srUid = new DicomSRContent(ValueTypes.uidref);
    srUid.relationshipType = RelationshipTypes.hasProperties;
    srUid.conceptNameCode = getTrackingIdentifierCode();
    srUid.value = annotation.id;
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
  #annotationToMeasGroup(annotation) {
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
        contentSequence.push(this.#annotationToMeasGroup(annotation));
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
    // class: Basic Text SR Storage
    tags.SOPClassUID = '1.2.840.10008.5.1.4.1.1.88.11';
    tags.MediaStorageSOPClassUID = '1.2.840.10008.5.1.4.1.1.88.11';
    tags.CompletionFlag = 'PARTIAL';
    tags.VerificationFlag = 'UNVERIFIED';

    const now = new Date();
    tags.ContentDate = getDicomDate(dateToDateObj(now));
    tags.ContentTime = getDicomTime(dateToTimeObj(now));

    //const srContent = this.#annotationGroupToDwv034MeasGroup(annotationGroup);
    const srContent = this.#annotationGroupToTid1500(annotationGroup);

    // TID 1500
    tags.ContentTemplateSequence = {
      value: [{
        MappingResource: 'DCMR',
        TemplateIdentifier: '1500'
      }]
    };

    // main
    if (typeof srContent !== 'undefined') {
      tags = {
        ...tags,
        ...getDicomSRContentItem(srContent)
      };
    }

    // merge extra tags if provided
    if (typeof extraTags !== 'undefined') {
      mergeTags(tags, extraTags);
    }

    return getElementsFromJSONTags(tags);
  }

}