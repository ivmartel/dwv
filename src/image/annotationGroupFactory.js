import {
  dateToDateObj,
  getDicomDate,
  dateToTimeObj,
  getDicomTime,
} from '../dicom/dicomDate';
import {
  ValueTypes,
  RelationshipTypes,
  getSRContent,
  getDicomSRContentItem,
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
  getQuantificationUnit
} from '../dicom/dicomCode';
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
import {Line} from '../math/line';
import {Point2D, Point3D} from '../math/point';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from '../dicom/dataElement';
/* eslint-enable no-unused-vars */

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
   * Check dicom elements. Throws an error if not suitable.
   *
   * @param {Object<string, DataElement>} dataElements The DICOM data elements.
   * @returns {string|undefined} A possible warning.
   */
  checkElements(dataElements) {
    // reset
    this.#warning = undefined;

    const srContent = getSRContent(dataElements);
    if (typeof srContent.conceptNameCode !== 'undefined') {
      if (srContent.conceptNameCode.value !== getMeasurementGroupCode().value) {
        this.#warning = 'Not a measurement group';
      }
    } else {
      this.#warning = 'No root concept name code';
    }

    return this.#warning;
  }

  /**
   * Convert a DICOM SR content of type SCOORD into an annotation.
   *
   * @param {DicomSRContent} item The input SCOORD.
   * @returns {Annotation} The annotation.
   */
  #scoordToAnnotation(item) {
    const annotation = new Annotation();
    annotation.mathShape = getShapeFromScoord(item.value);
    // default
    annotation.id = guid();
    annotation.textExpr = '';

    for (const subItem of item.contentSequence) {
      // reference image UID
      if (subItem.valueType === ValueTypes.image &&
        subItem.relationshipType === RelationshipTypes.selectedFrom &&
        isEqualCode(subItem.conceptNameCode, getSourceImageCode())) {
        annotation.referenceSopUID =
          subItem.value.referencedSOPSequence.referencedSOPInstanceUID;
      }
      // annotation id
      if (subItem.valueType === ValueTypes.uidref &&
        subItem.relationshipType === RelationshipTypes.hasProperties &&
        isEqualCode(subItem.conceptNameCode, getTrackingIdentifierCode())) {
        annotation.id = subItem.value;
      }
      // text expr
      if (subItem.valueType === ValueTypes.text &&
        subItem.relationshipType === RelationshipTypes.hasProperties &&
        isEqualCode(subItem.conceptNameCode, getShortLabelCode())) {
        annotation.textExpr = subItem.value;
        if (typeof subItem.contentSequence !== 'undefined') {
          for (const subsubItem of subItem.contentSequence) {
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
      if (subItem.valueType === ValueTypes.text &&
        subItem.relationshipType === RelationshipTypes.hasProperties &&
        isEqualCode(subItem.conceptNameCode, getColourCode())) {
        annotation.colour = subItem.value;
      }
      // reference points
      if (subItem.valueType === ValueTypes.scoord &&
        subItem.relationshipType === RelationshipTypes.hasProperties &&
        isEqualCode(subItem.conceptNameCode, getReferencePointsCode()) &&
        subItem.value.graphicType === GraphicTypes.multipoint) {
        const points = [];
        for (let i = 0; i < subItem.value.graphicData.length; i += 2) {
          points.push(new Point2D(
            subItem.value.graphicData[i],
            subItem.value.graphicData[i + 1]
          ));
        }
        annotation.referencePoints = points;
      }
      // plane points
      if (subItem.valueType === ValueTypes.scoord3d &&
        subItem.relationshipType === RelationshipTypes.hasProperties &&
        isEqualCode(
          subItem.conceptNameCode, getReferenceGeometryCode()) &&
        subItem.value.graphicType === GraphicTypes.multipoint) {
        const data = subItem.value.graphicData;
        const points = [];
        const nPoints = Math.floor(data.length / 3);
        for (let i = 0; i < nPoints; ++i) {
          const j = i * 3;
          points.push(new Point3D(data[j], data[j + 1], data[j + 2]));
        }
        annotation.planePoints = points;
      }
      // quantification
      if (subItem.valueType === ValueTypes.num &&
        subItem.relationshipType === RelationshipTypes.contains) {
        const quantifName =
          getQuantificationName(subItem.conceptNameCode);
        if (typeof quantifName === 'undefined') {
          continue;
        }
        const measuredValue = subItem.value.measuredValue;
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
    return annotation;
  }

  /**
   * Get an {@link Annotation} object from the read DICOM file.
   *
   * @param {Object<string, DataElement>} dataElements The DICOM tags.
   * @returns {AnnotationGroup} A new annotation group.
   */
  create(dataElements) {
    const annotations = [];
    const srContent = getSRContent(dataElements);
    for (const item of srContent.contentSequence) {
      if (item.valueType === ValueTypes.scoord) {
        annotations.push(this.#scoordToAnnotation(item));
      }
    }
    const annotationGroup = new AnnotationGroup(annotations);

    const safeGet = function (key) {
      let res;
      const element = dataElements[key];
      if (typeof element !== 'undefined') {
        res = element.value[0];
      }
      return res;
    };

    // StudyInstanceUID
    annotationGroup.setMetaValue('StudyInstanceUID', safeGet('0020000D'));
    // Modality
    annotationGroup.setMetaValue('Modality', safeGet('00080060'));
    // patient info
    annotationGroup.setMetaValue('PatientName', safeGet('00100010'));
    annotationGroup.setMetaValue('PatientID', safeGet('00100020'));
    annotationGroup.setMetaValue('PatientBirthDate', safeGet('00100030'));
    annotationGroup.setMetaValue('PatientSex', safeGet('00100040'));

    // ReferencedSeriesSequence
    const element = dataElements['00081115'];
    if (typeof element !== 'undefined') {
      const seriesElement = element.value[0]['0020000E'];
      if (typeof seriesElement !== 'undefined') {
        annotationGroup.setMetaValue(
          'ReferencedSeriesSequence', {
            value: [{
              SeriesInstanceUID: seriesElement.value[0]
            }]
          }
        );
      }
    }

    return annotationGroup;
  }

  /**
   * Convert an annotation into a DICOM SCOORD.
   *
   * @param {Annotation} annotation The input annotation.
   * @returns {DicomSRContent} An SR content of type SCOORD.
   */
  #annotationToScoord(annotation) {
    const srScoord = new DicomSRContent(ValueTypes.scoord);
    srScoord.relationshipType = RelationshipTypes.contains;
    if (annotation.mathShape instanceof Line) {
      srScoord.conceptNameCode = getPathCode();
    } else {
      srScoord.conceptNameCode = getImageRegionCode();
    }
    srScoord.value = getScoordFromShape(annotation.mathShape);

    const itemContentSequence = [];

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
    itemContentSequence.push(srImage);

    // annotation id
    const srUid = new DicomSRContent(ValueTypes.uidref);
    srUid.relationshipType = RelationshipTypes.hasProperties;
    srUid.conceptNameCode = getTrackingIdentifierCode();
    srUid.value = annotation.id;
    itemContentSequence.push(srUid);

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
    itemContentSequence.push(shortLabel);

    // colour
    const colour = new DicomSRContent(ValueTypes.text);
    colour.relationshipType = RelationshipTypes.hasProperties;
    colour.conceptNameCode = getColourCode();
    colour.value = annotation.colour;
    itemContentSequence.push(colour);

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
      itemContentSequence.push(referencePoints);
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
      itemContentSequence.push(planePoints);
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
          itemContentSequence.push(quatifContent);
        }
      }
    }

    srScoord.contentSequence = itemContentSequence;
    return srScoord;
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

    const contentSequence = [];
    for (const annotation of annotationGroup.getList()) {
      contentSequence.push(this.#annotationToScoord(annotation));
    }

    // main
    if (contentSequence.length !== 0) {
      const srContent = new DicomSRContent(ValueTypes.container);
      srContent.conceptNameCode = getMeasurementGroupCode();
      srContent.contentSequence = contentSequence;

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