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
  getMeasurementGroupCode,
  getImageRegionCode,
  getSourceImageCode,
  getTrackingIdentifierCode,
  getShortLabelCode
} from '../dicom/dicomCode';
import {getElementsFromJSONTags} from '../dicom/dicomWriter';
import {ImageReference} from '../dicom/dicomImageReference';
import {SopInstanceReference} from '../dicom/dicomSopInstanceReference';
import {
  getScoordFromShape,
  getShapeFromScoord
} from '../dicom/dicomSpatialCoordinate';
import {guid} from '../math/stats';
import {logger} from '../utils/logger';
import {Annotation, AnnotationList} from './annotation';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from '../dicom/dataElement';
import {ViewController} from '../app/viewController';
/* eslint-enable no-unused-vars */

/**
 * @typedef {Object<string, DataElement>} DataElements
 */

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
   * @param {DataElements} dataElements The DICOM data elements.
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
   * @param {DataElements} dataElements The DICOM tags.
   * @param {ViewController} viewController The associated view controller.
   * @returns {AnnotationList} A new annotation list.
   */
  create(dataElements, viewController) {
    const srContent = getSRContent(dataElements);

    const annotations = [];

    for (const item of srContent.contentSequence) {
      if (item.valueType === ValueTypes.scoord) {
        const annotation = new Annotation(viewController);
        annotation.mathShape = getShapeFromScoord(item.value);
        // default
        annotation.id = guid();
        annotation.textExpr = '';

        for (const subItem of item.contentSequence) {
          if (subItem.valueType === ValueTypes.image &&
            subItem.relationshipType === RelationshipTypes.selectedFrom) {
            annotation.referenceSopUID =
              subItem.value.referencedSOPSequence.referencedSOPInstanceUID;
          }
          if (subItem.valueType === ValueTypes.uidref &&
            subItem.relationshipType === RelationshipTypes.hasProperties) {
            annotation.id = subItem.value;
          }
          if (subItem.valueType === ValueTypes.text &&
            subItem.relationshipType === RelationshipTypes.hasProperties) {
            annotation.textExpr = subItem.value;
            annotation.updateQuantification();
          }
        }

        annotations.push(annotation);
      }
    }

    const annotationList = new AnnotationList(annotations);

    annotationList.setMeta(
      'StudyInstanceUID',
      dataElements['0020000D'].value[0]
    );

    return annotationList;
  }

  /**
   * Convert an annotation list into a DICOM SR object.
   *
   * @param {AnnotationList} annotationList The annotation list.
   * @param {Object<string, any>} [extraTags] Optional list of extra tags.
   * @returns {Object<string, DataElement>} A list of dicom elements.
   */
  toDicom(annotationList, extraTags) {
    let tags = {};
    tags.TransferSyntaxUID = '1.2.840.10008.1.2.1';
    tags.SOPClassUID = '1.2.840.10008.5.1.4.1.1.88.71';
    tags.SOPInstanceUID = '1.2.840.10008.5.1.4.1.1.88.71.0';
    tags.MediaStorageSOPClassUID = '1.2.840.10008.5.1.4.1.1.88.71';
    tags.MediaStorageSOPInstanceUID = '1.2.840.10008.5.1.4.1.1.88.71.0';

    tags.StudyInstanceUID = annotationList.getMeta('StudyInstanceUID');

    tags.SeriesInstanceUID = '1.2.3.4.5.6';

    tags.Modality = 'SR';
    tags.CompletionFlag = 'PARTIAL';
    tags.VerificationFlag = 'UNVERIFIED';

    const now = new Date();
    tags.ContentDate = getDicomDate(dateToDateObj(now));
    tags.ContentTime = getDicomTime(dateToTimeObj(now));

    const contentSequence = [];

    for (const annotation of annotationList.getList()) {
      const srImage = new DicomSRContent(ValueTypes.image);
      srImage.relationshipType = RelationshipTypes.selectedFrom;
      srImage.conceptNameCode = getSourceImageCode();
      const sopRef = new SopInstanceReference();
      sopRef.referencedSOPClassUID = '';
      sopRef.referencedSOPInstanceUID = annotation.referenceSopUID;
      const imageRef = new ImageReference();
      imageRef.referencedSOPSequence = sopRef;
      srImage.value = imageRef;

      const srUid = new DicomSRContent(ValueTypes.uidref);
      srUid.relationshipType = RelationshipTypes.hasProperties;
      srUid.conceptNameCode = getTrackingIdentifierCode();
      srUid.value = annotation.id;

      const shortLabel = new DicomSRContent(ValueTypes.text);
      shortLabel.relationshipType = RelationshipTypes.hasProperties;
      shortLabel.conceptNameCode = getShortLabelCode();
      shortLabel.value = annotation.textExpr;

      const srScoord = new DicomSRContent(ValueTypes.scoord);
      srScoord.relationshipType = RelationshipTypes.contains;
      srScoord.conceptNameCode = getImageRegionCode();
      srScoord.value = getScoordFromShape(annotation.mathShape);
      srScoord.contentSequence = [srImage, srUid, shortLabel];

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
    if (extraTags !== undefined) {
      mergeTags(tags, extraTags);
    }

    return getElementsFromJSONTags(tags);
  }

}