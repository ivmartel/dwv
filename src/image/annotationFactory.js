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
import {Annotation} from './annotation';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from '../dicom/dataElement';
import {ViewController} from '../app/viewController';
/* eslint-enable no-unused-vars */

/**
 * @typedef {Object<string, DataElement>} DataElements
 */

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
   * @param {DataElements} _dataElements The DICOM data elements.
   * @returns {string|undefined} A possible warning.
   */
  checkElements(_dataElements) {
    // reset
    this.#warning = undefined;

    return this.#warning;
  }

  /**
   * Get an {@link Annotation} object from the read DICOM file.
   *
   * @param {DataElements} dataElements The DICOM tags.
   * @param {ViewController} viewController The associated view controller.
   * @returns {Annotation[]} A new annotation list.
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

    return annotations;
  }

  /**
   * Convert an annotation list into a DICOM SR object.
   *
   * @param {Annotation[]} annotations The annotation list.
   * @param {Object<string, any>} [_extraTags] Optional list of extra tags.
   * @returns {Object<string, DataElement>} A list of dicom elements.
   */
  toDicom(annotations, _extraTags) {
    let tags = {};
    tags.TransferSyntaxUID = '1.2.840.10008.1.2.1';
    tags.SOPClassUID = '1.2.840.10008.5.1.4.1.1.88.71';
    tags.SOPInstanceUID = '1.2.840.10008.5.1.4.1.1.88.71.0';
    tags.MediaStorageSOPClassUID = '1.2.840.10008.5.1.4.1.1.88.71';
    tags.MediaStorageSOPInstanceUID = '1.2.840.10008.5.1.4.1.1.88.71.0';
    tags.StudyInstanceUID = '1.2.3.4.5';
    tags.SeriesInstanceUID = '1.2.3.4.5.6';

    tags.Modality = 'SR';
    tags.PatientName = 'dwv^PatientName';
    tags.SeriesNumber = '0';
    tags.InstanceNumber = '1';
    tags.ContentDate = '20240619';
    tags.ContentTime = '164500';
    tags.CompletionFlag = 'PARTIAL';
    tags.VerificationFlag = 'UNVERIFIED';

    const contentSequence = [];

    for (const annotation of annotations) {
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

    return getElementsFromJSONTags(tags);
  }

}