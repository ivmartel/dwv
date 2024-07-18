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
  DicomSRContent
} from '../dicom/dicomSRContent';
import {
  isEqualCode,
  getPathCode,
  getMeasurementGroupCode,
  getImageRegionCode,
  getSourceImageCode,
  getTrackingIdentifierCode,
  getShortLabelCode,
  getReferencePointsCode
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
import {guid} from '../math/stats';
import {logger} from '../utils/logger';
import {Annotation, AnnotationGroup} from './annotation';
import {Line} from '../math/line';
import {Point2D} from '../math/point';

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
 * {@link Annotation} factory.
 */
export class AnnotationFactory {

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
   * Get an {@link Annotation} object from the read DICOM file.
   *
   * @param {Object<string, DataElement>} dataElements The DICOM tags.
   * @returns {AnnotationGroup} A new annotation group.
   */
  create(dataElements) {
    const srContent = getSRContent(dataElements);

    const annotations = [];

    for (const item of srContent.contentSequence) {
      if (item.valueType === ValueTypes.scoord) {
        const annotation = new Annotation();
        annotation.mathShape = getShapeFromScoord(item.value);
        // default
        annotation.id = guid();
        annotation.textExpr = '';

        for (const subItem of item.contentSequence) {
          if (subItem.valueType === ValueTypes.image &&
            subItem.relationshipType === RelationshipTypes.selectedFrom &&
            isEqualCode(subItem.conceptNameCode, getSourceImageCode())) {
            annotation.referenceSopUID =
              subItem.value.referencedSOPSequence.referencedSOPInstanceUID;
          }
          if (subItem.valueType === ValueTypes.uidref &&
            subItem.relationshipType === RelationshipTypes.hasProperties &&
            isEqualCode(subItem.conceptNameCode, getTrackingIdentifierCode())) {
            annotation.id = subItem.value;
          }
          if (subItem.valueType === ValueTypes.text &&
            subItem.relationshipType === RelationshipTypes.hasProperties &&
            isEqualCode(subItem.conceptNameCode, getShortLabelCode())) {
            annotation.textExpr = subItem.value;
          }
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
        }

        annotations.push(annotation);
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
      const srScoord = new DicomSRContent(ValueTypes.scoord);
      srScoord.relationshipType = RelationshipTypes.contains;
      if (annotation.mathShape instanceof Line) {
        srScoord.conceptNameCode = getPathCode();
      } else {
        srScoord.conceptNameCode = getImageRegionCode();
      }
      srScoord.value = getScoordFromShape(annotation.mathShape);

      const itemContentSequence = [];

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

      const srUid = new DicomSRContent(ValueTypes.uidref);
      srUid.relationshipType = RelationshipTypes.hasProperties;
      srUid.conceptNameCode = getTrackingIdentifierCode();
      srUid.value = annotation.id;
      itemContentSequence.push(srUid);

      const shortLabel = new DicomSRContent(ValueTypes.text);
      shortLabel.relationshipType = RelationshipTypes.hasProperties;
      shortLabel.conceptNameCode = getShortLabelCode();
      shortLabel.value = annotation.textExpr;
      itemContentSequence.push(shortLabel);

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

      srScoord.contentSequence = itemContentSequence;
      contentSequence.push(srScoord);
    }

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