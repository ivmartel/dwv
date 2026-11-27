import {describe, test, assert, vi, expect} from 'vitest';
import {
  AnnotationGroupFactory
} from '../../src/image/annotationGroupFactory.js';
import {Annotation} from '../../src/image/annotation.js';
import {AnnotationGroup} from '../../src/image/annotationGroup.js';
import {DicomWriter} from '../../src/dicom/dicomWriter.js';
import {DicomParser} from '../../src/dicom/dicomParser.js';
import {safeGet} from '../../src/dicom/dataElement.js';
import {
  DicomCode,
  DcmCodes,
  getDcmDicomCode
} from '../../src/dicom/dicomCode.js';
import {
  getSRContent,
  ValueTypes,
  RelationshipTypes
} from '../../src/dicom/dicomSRContent.js';
import {Circle} from '../../src/math/circle.js';
import {Line} from '../../src/math/line.js';
import {Point, Point2D, Point3D} from '../../src/math/point.js';
import {Ellipse} from '../../src/math/ellipse.js';
import {ROI} from '../../src/math/roi.js';
import {Matrix33} from '../../src/math/matrix.js';
import {
  getCoronalMat33,
  getViewOrientation
} from '../../src/math/orientation.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Geometry} from '../../src/image/geometry.js';
import {PlaneHelper} from '../../src/image/planeHelper.js';
import {Protractor} from '../../src/math/protractor.js';
import {Rectangle} from '../../src/math/rectangle.js';
import {BidimensionalLine} from '../../src/math/bidimensionalLine.js';

/**
 * @import {DicomSRContent} from '../../src/dicom/dicomSRContent.js';
 * @import {DataElement} from '../../src/dicom/dataElement.js';
 */

/**
 * Tests for the TID 1500 annotation writer.
 */
/** @module tests/annotation */

const CT_SOP_CLASS = '1.2.840.10008.5.1.4.1.1.2';
const MR_SOP_CLASS = '1.2.840.10008.5.1.4.1.1.4';
const US_SOP_CLASS = '1.2.840.10008.5.1.4.1.1.6.1';
const REF_UID = '1.2.3.4.100';

const TagKeys = {
  SpecificCharacterSet: '00080005',
  SOPClassUID: '00080016',
  SOPInstanceUID: '00080018',
  Modality: '00080060',
  Manufacturer: '00080070',
  CodingSchemeIdentificationSequence: '00080110',
  CodingSchemeDesignator: '00080102',
  SeriesInstanceUID: '0020000E',
  SeriesNumber: '00200011',
  InstanceNumber: '00200013',
  AccessionNumber: '00080050',
  PerformedProcedureCodeSequence: '0040A372',
  CurrentRequestedProcedureEvidenceSequence: '0040A375',
  TemplateIdentifier: '0040DB00',
  ContentTemplateSequence: '0040A504'
};

/**
 * Relationship constraints of the Comprehensive SR IOD
 * (PS3.3 Table A.35.3-2), with the extra Comprehensive 3D SR
 * targets (Table A.35.13-2).
 */
const BASE_TARGETS = [
  'TEXT', 'CODE', 'NUM', 'DATETIME', 'DATE', 'TIME', 'UIDREF', 'PNAME'
];
const Constraints = {
  CONTAINS: {
    sources: ['CONTAINER'],
    targets: BASE_TARGETS.concat(['SCOORD',
      'TCOORD',
      'COMPOSITE',
      'IMAGE',
      'WAVEFORM',
      'CONTAINER']),
    targets3D: ['SCOORD3D']
  },
  'HAS OBS CONTEXT': {
    sources: ['TEXT', 'CODE', 'NUM', 'CONTAINER'],
    targets: BASE_TARGETS.concat(['COMPOSITE']),
    targets3D: []
  },
  'HAS CONCEPT MOD': {
    sources: undefined,
    targets: ['TEXT', 'CODE'],
    targets3D: []
  },
  'HAS PROPERTIES': {
    sources: ['TEXT', 'CODE', 'NUM'],
    targets: BASE_TARGETS.concat(['IMAGE',
      'WAVEFORM',
      'COMPOSITE',
      'SCOORD',
      'TCOORD',
      'CONTAINER']),
    targets3D: ['SCOORD3D']
  },
  'INFERRED FROM': {
    sources: ['TEXT', 'CODE', 'NUM'],
    targets: BASE_TARGETS.concat(['IMAGE',
      'WAVEFORM',
      'COMPOSITE',
      'SCOORD',
      'TCOORD',
      'CONTAINER']),
    targets3D: ['SCOORD3D']
  },
  'SELECTED FROM': {
    sources: ['SCOORD'],
    targets: ['IMAGE'],
    targets3D: []
  }
};

/**
 * Check the relationship constraints of a content tree.
 *
 * @param {DicomSRContent} content The content to check.
 * @param {boolean} is3D True for Comprehensive 3D SR.
 * @param {string} path The content path, for messages.
 */
function checkConstraints(content, is3D, path) {
  if (content.valueType === ValueTypes.scoord3d) {
    assert.ok(is3D, `${path}: SCOORD3D only in Comprehensive 3D SR`);
    assert.equal(content.contentSequence.length, 0,
      `${path}: SCOORD3D has no children`);
    assert.ok(typeof content.value.referencedFrameOfReferenceUID !==
      'undefined', `${path}: SCOORD3D frame of reference`);
  }
  if (content.valueType === ValueTypes.scoord) {
    const selected = content.contentSequence.filter(function (item) {
      return item.relationshipType === RelationshipTypes.selectedFrom &&
        item.valueType === ValueTypes.image;
    });
    assert.ok(selected.length >= 1,
      `${path}: SCOORD needs a SELECTED FROM IMAGE`);
  }
  for (const item of content.contentSequence) {
    const itemPath = `${path} > ${item.relationshipType} ${item.valueType} ` +
      `${item.conceptNameCode?.meaning}`;
    const constraint = Constraints[item.relationshipType];
    assert.ok(typeof constraint !== 'undefined',
      `${itemPath}: known relationship`);
    if (typeof constraint.sources !== 'undefined') {
      assert.ok(constraint.sources.includes(content.valueType),
        `${itemPath}: valid source ${content.valueType}`);
    }
    let targets = constraint.targets;
    if (is3D) {
      targets = targets.concat(constraint.targets3D);
    }
    assert.ok(targets.includes(item.valueType),
      `${itemPath}: valid target`);
    checkConstraints(item, is3D, itemPath);
  }
}

/**
 * Get an annotation group with the meta of an
 * App.createAnnotationData call.
 *
 * @param {Annotation[]} annotations The annotations.
 * @returns {AnnotationGroup} The group.
 */
function getAnnotationGroup(annotations) {
  const group = new AnnotationGroup(annotations);
  group.setMetaValue('Modality', 'SR');
  group.setMetaValue('PatientName', 'Doe^John');
  group.setMetaValue('PatientID', '123');
  group.setMetaValue('StudyInstanceUID', '1.2.3.4');
  group.setMetaValue('StudyDate', undefined);
  group.setMetaValue('CurrentRequestedProcedureEvidenceSequence', {
    value: [{
      ReferencedSeriesSequence: {
        value: [{SeriesInstanceUID: '1.2.3.4.1'}]
      },
      StudyInstanceUID: '1.2.3.4'
    }]
  });
  return group;
}

/**
 * Get an annotation referencing the test image.
 *
 * @param {object} shape The math shape.
 * @param {string} [sopClassUID] Optional referenced SOP class,
 *   defaults to CT.
 * @returns {Annotation} The annotation.
 */
function getAnnotation(shape, sopClassUID) {
  const annotation = new Annotation();
  annotation.mathShape = shape;
  annotation.referencedSopClassUID = sopClassUID ?? CT_SOP_CLASS;
  annotation.referencedSopInstanceUID = REF_UID;
  return annotation;
}

/**
 * Write and parse back an annotation group.
 *
 * @param {AnnotationGroup} group The group.
 * @returns {Record<string, DataElement>} The parsed elements.
 */
function writeAndParse(group) {
  const elements = new AnnotationGroupFactory().toDicom(group);
  const buffer = new DicomWriter().getBuffer(elements);
  const parser = new DicomParser();
  parser.parse(buffer);
  return parser.getDicomElements();
}

/**
 * Find the content items with a concept name code value.
 *
 * @param {DicomSRContent} content The parent content.
 * @param {string} value The concept name code value.
 * @returns {DicomSRContent[]} The items.
 */
function findByConcept(content, value) {
  return content.contentSequence.filter(function (item) {
    return item.conceptNameCode?.value === value;
  });
}

/**
 * Get the measurement groups of a report.
 *
 * @param {DicomSRContent} root The report root content.
 * @returns {DicomSRContent[]} The measurement groups.
 */
function getMeasurementGroups(root) {
  const measurements = findByConcept(root, '126010');
  assert.equal(measurements.length, 1, 'one Imaging Measurements');
  return findByConcept(measurements[0], '125007');
}

describe('annotation', () => {

  /**
   * Tests for {@link AnnotationGroupFactory} toDicom on acquisition
   * plane annotations: Comprehensive SR, TID 1410 and TID 1501 groups.
   *
   * @function module:tests/annotation~writeTid1500Annotations
   */
  test('Write TID 1500 annotations', () => {
    // ruler
    const ruler = getAnnotation(
      new Line(new Point2D(10, 10), new Point2D(30, 10)));
    ruler.quantification = {length: {value: 20.5, unit: 'unit.mm'}};
    ruler.textExpr = 'ruler';
    ruler.labelPosition = new Point2D(35, 12);
    ruler.colour = '#ff0000';
    // circle with stats
    const circle = getAnnotation(new Circle(new Point2D(50, 50), 10));
    circle.quantification = {
      radius: {value: 5, unit: 'unit.mm'},
      surface: {value: 0.78, unit: 'unit.cm2'},
      mean: {value: 40.2, unit: 'HU'},
      stdDev: {value: 3.1, unit: 'HU'},
      p25: {value: 38, unit: 'HU'}
    };
    // arrow
    const arrow = getAnnotation(new Point2D(5, 6));
    arrow.referencePoints = [new Point2D(15, 16)];
    // protractor
    const protractor = getAnnotation(new Protractor([
      new Point2D(0, 0), new Point2D(10, 0), new Point2D(10, 10)
    ]));
    protractor.quantification = {angle: {value: 90, unit: 'unit.degree'}};
    // bidimensional
    const bline = new BidimensionalLine(
      new Point2D(10, 10), new Point2D(30, 10));
    bline.shortAxisCenter = new Point2D(20, 10);
    bline.shortAxisLength = 8;
    const bidimensional = getAnnotation(bline);
    bidimensional.quantification = {
      longAxis: {value: 20, unit: 'unit.mm'},
      shortAxis: {value: 8, unit: 'unit.mm'}
    };
    // ruler without quantification
    const noQuantif = getAnnotation(
      new Line(new Point2D(1, 1), new Point2D(2, 2)));

    const group = getAnnotationGroup(
      [ruler, circle, arrow, protractor, bidimensional, noQuantif]);
    const elements = writeAndParse(group);

    // header
    assert.equal(safeGet(elements, TagKeys.SOPClassUID),
      '1.2.840.10008.5.1.4.1.1.88.33', 'Comprehensive SR');
    assert.equal(safeGet(elements, TagKeys.Modality), 'SR', 'modality');
    assert.ok(typeof safeGet(elements, TagKeys.SOPInstanceUID) !==
      'undefined', 'SOP instance UID');
    assert.ok(typeof safeGet(elements, TagKeys.SeriesInstanceUID) !==
      'undefined', 'series instance UID');
    assert.equal(safeGet(elements, TagKeys.SeriesNumber), 1, 'series number');
    assert.equal(safeGet(elements, TagKeys.InstanceNumber), 1,
      'instance number');
    assert.equal(safeGet(elements, TagKeys.Manufacturer), 'dwv',
      'manufacturer');
    assert.ok(typeof elements[TagKeys.AccessionNumber] !== 'undefined',
      'type 2 accession number');
    assert.ok(typeof elements[TagKeys.PerformedProcedureCodeSequence] !==
      'undefined', 'type 2 performed procedure code sequence');
    assert.equal(typeof elements[TagKeys.SpecificCharacterSet], 'undefined',
      'no specific character set for ASCII');
    const schemeItem =
      safeGet(elements, TagKeys.CodingSchemeIdentificationSequence);
    assert.equal(safeGet(schemeItem, TagKeys.CodingSchemeDesignator), '99DWV',
      'local coding scheme');
    const templateItem = safeGet(elements, TagKeys.ContentTemplateSequence);
    assert.equal(safeGet(templateItem, TagKeys.TemplateIdentifier), '1500',
      'template');
    assert.ok(typeof elements[
      TagKeys.CurrentRequestedProcedureEvidenceSequence] !== 'undefined',
    'evidence');
    // the group meta is not modified
    assert.equal(group.getMetaValue('SOPInstanceUID'), undefined,
      'group meta not modified');

    // content
    const root = getSRContent(elements);
    checkConstraints(root, false, 'root');
    assert.equal(root.conceptNameCode.value, '126000', 'report');

    // TID 1500 header rows
    const language = findByConcept(root, '121049');
    assert.equal(language.length, 1, 'language');
    assert.equal(language[0].value.value, 'en-US', 'language value');
    const observerType = findByConcept(root, '121005');
    assert.equal(observerType[0].value.value, '121007', 'device observer');
    assert.equal(findByConcept(root, '121012').length, 1,
      'device observer uid');
    assert.equal(findByConcept(root, '121058')[0].value.value, '363679005',
      'procedure reported');
    // image library: one entry for the single referenced image
    const library = findByConcept(root, '111028');
    assert.equal(library.length, 1, 'image library');
    const libraryGroup = findByConcept(library[0], '126200');
    assert.equal(libraryGroup[0].contentSequence.length, 1,
      'image library entries');
    assert.equal(libraryGroup[0].contentSequence[0].value
      .referencedSOPSequence.referencedSOPInstanceUID, REF_UID,
    'image library entry uid');

    const groups = getMeasurementGroups(root);
    assert.equal(groups.length, 6, 'measurement groups');

    // ruler: TID 1501, length inferred from a 2 points polyline
    const rulerGroup = groups[0];
    assert.equal(findByConcept(rulerGroup, '112039')[0].value,
      ruler.trackingId, 'tracking id');
    assert.equal(findByConcept(rulerGroup, '112040')[0].value,
      ruler.trackingUid, 'tracking uid');
    const length = findByConcept(rulerGroup, '410668003');
    assert.equal(length.length, 1, 'length');
    assert.equal(length[0].valueType, ValueTypes.num, 'length NUM');
    assert.equal(length[0].value.measuredValue.measurementUnitsCode.value,
      'mm', 'length unit');
    const lengthScoord = length[0].contentSequence[0];
    assert.equal(lengthScoord.relationshipType,
      RelationshipTypes.inferredFrom, 'length inferred from');
    assert.equal(lengthScoord.conceptNameCode.value, '121112',
      'source of measurement');
    assert.equal(lengthScoord.value.graphicType, 'POLYLINE', 'ruler type');
    assert.equal(lengthScoord.value.graphicData.length, 4, 'ruler points');
    assert.equal(findByConcept(rulerGroup, '111030').length, 0,
      'no image region for a ruler');
    // label with position
    const label = findByConcept(rulerGroup, '125309');
    assert.equal(label.length, 1, 'short label');
    assert.equal(label[0].relationshipType, RelationshipTypes.contains,
      'short label relationship');
    assert.equal(label[0].value, 'ruler', 'short label value');
    const labelPosition = label[0].contentSequence[0];
    assert.equal(labelPosition.conceptNameCode.value, 'LABEL_POSITION',
      'label position');
    assert.equal(labelPosition.value.graphicType, 'POINT',
      'label position type');
    // colour
    const colour = findByConcept(rulerGroup, 'COLOUR');
    assert.equal(colour[0].conceptNameCode.schemeDesignator, '99DWV',
      'colour scheme');
    assert.equal(colour[0].value, '#ff0000', 'colour value');

    // circle: TID 1410 image region with TID 1419 measurements
    const circleGroup = groups[1];
    const region = findByConcept(circleGroup, '111030');
    assert.equal(region.length, 1, 'image region');
    assert.equal(region[0].value.graphicType, 'CIRCLE', 'circle type');
    assert.equal(findByConcept(circleGroup, '42798000').length, 1, 'area');
    assert.equal(findByConcept(circleGroup, '131190003').length, 1, 'radius');
    const intensities = findByConcept(circleGroup, '112031');
    assert.equal(intensities.length, 2, 'attenuation coefficients');
    const derivations = intensities.map(function (item) {
      assert.equal(item.contentSequence[0].conceptNameCode.value, '121401',
        'derivation');
      return item.contentSequence[0].value.value;
    });
    assert.deepEqual(derivations, ['373098007', '386136009'],
      'mean and standard deviation');
    assert.equal(intensities[0].value.measuredValue.measurementUnitsCode.value,
      '[hnsf\'U]', 'HU unit');

    // arrow: TID 1410 point and reference points
    const arrowGroup = groups[2];
    assert.equal(findByConcept(arrowGroup, '111030')[0].value.graphicType,
      'POINT', 'arrow point');
    const refPoints = findByConcept(arrowGroup, 'REFERENCE_POINTS');
    assert.equal(refPoints[0].relationshipType, RelationshipTypes.contains,
      'reference points relationship');
    assert.equal(refPoints[0].value.graphicType, 'MULTIPOINT',
      'reference points type');

    // protractor: angle inferred from a 3 points polyline
    const angle = findByConcept(groups[3], '1483009');
    assert.equal(angle[0].contentSequence[0].value.graphicData.length, 6,
      'angle points');

    // bidimensional: long and short axes, each with its polyline
    const longAxis = findByConcept(groups[4], '103339001');
    const shortAxis = findByConcept(groups[4], '103340004');
    assert.equal(longAxis.length, 1, 'long axis');
    assert.equal(shortAxis.length, 1, 'short axis');
    assert.deepEqual(longAxis[0].contentSequence[0].value.graphicData,
      [10, 10, 30, 10], 'long axis points');
    assert.deepEqual(shortAxis[0].contentSequence[0].value.graphicData,
      [20, 14, 20, 6], 'short axis points');

    // ruler without quantification: geometry kept
    const geometry = findByConcept(groups[5], '121112');
    assert.equal(geometry[0].relationshipType, RelationshipTypes.contains,
      'geometry relationship');
    assert.equal(geometry[0].valueType, ValueTypes.scoord, 'geometry SCOORD');
  });

  /**
   * Tests for the intensity concept of ROI statistics.
   *
   * @function module:tests/annotation~writeIntensityConcept
   */
  test('Write intensity concept', () => {
    const cases = [
      {sopClass: MR_SOP_CLASS, unit: undefined, concept: '110852'},
      {sopClass: US_SOP_CLASS, unit: undefined, concept: 'PIXEL_VALUE'},
      {sopClass: US_SOP_CLASS, unit: 'SUV', concept: '126401'}
    ];
    for (const testCase of cases) {
      const annotation = getAnnotation(
        new Rectangle(new Point2D(0, 0), new Point2D(5, 5)),
        testCase.sopClass);
      annotation.quantification = {
        min: {value: 1, unit: testCase.unit}
      };
      const elements = writeAndParse(getAnnotationGroup([annotation]));
      const groups = getMeasurementGroups(getSRContent(elements));
      const intensity = findByConcept(groups[0], testCase.concept);
      assert.equal(intensity.length, 1, `concept ${testCase.concept}`);
      assert.equal(intensity[0].contentSequence[0].value.value, '255605001',
        'minimum derivation');
    }
  });

  /**
   * Tests for the character set of a non ASCII label.
   *
   * @function module:tests/annotation~writeCharacterSet
   */
  test('Write character set', () => {
    const annotation = getAnnotation(new Point2D(5, 6));
    annotation.textExpr = 'Lésion';
    const elements = writeAndParse(getAnnotationGroup([annotation]));
    assert.equal(safeGet(elements, TagKeys.SpecificCharacterSet),
      'ISO_IR 192', 'UTF-8');
    const groups = getMeasurementGroups(getSRContent(elements));
    assert.equal(findByConcept(groups[0], '125309')[0].value, 'Lésion',
      'label');
  });

  /**
   * Tests for annotations on a non acquisition plane: SCOORD3D in a
   * Comprehensive 3D SR.
   *
   * @function module:tests/annotation~writeScoord3D
   */
  test('Write non acquisition plane annotations', () => {
    /**
     * Fake plane to patient conversion: coronal plane at y=-10,
     * spacing x=0.5mm, z=2mm.
     *
     * @param {Point2D[]} points The plane points.
     * @returns {Point3D[]} The patient positions.
     */
    function toPatient(points) {
      return points.map(function (point) {
        return new Point3D(point.getX() * 0.5, -10, point.getY() * 2);
      });
    }
    /**
     * Make an annotation non acquisition plane.
     *
     * @param {Annotation} annotation The annotation.
     */
    function setPlane(annotation) {
      annotation.planePoints = [
        new Point3D(0, -10, 0), new Point3D(1, 0, 0), new Point3D(0, 0, -1)
      ];
      annotation.getPlanePositions = toPatient;
      annotation.getFrameOfReferenceUID = function () {
        return '1.2.3.4.200';
      };
    }

    const circle = getAnnotation(new Circle(new Point2D(10, 10), 2));
    circle.textExpr = 'circle';
    circle.labelPosition = new Point2D(1, 1);
    setPlane(circle);
    const rectangle = getAnnotation(
      new Rectangle(new Point2D(0, 0), new Point2D(4, 4)));
    setPlane(rectangle);
    const ruler = getAnnotation(
      new Line(new Point2D(0, 0), new Point2D(4, 0)));
    ruler.quantification = {length: {value: 2, unit: 'unit.mm'}};
    setPlane(ruler);
    // acquisition plane annotation in the same group
    const point = getAnnotation(new Point2D(1, 2));

    const elements =
      writeAndParse(getAnnotationGroup([circle, rectangle, ruler, point]));
    assert.equal(safeGet(elements, TagKeys.SOPClassUID),
      '1.2.840.10008.5.1.4.1.1.88.34', 'Comprehensive 3D SR');

    const root = getSRContent(elements);
    checkConstraints(root, true, 'root');
    const groups = getMeasurementGroups(root);

    // circle: ELLIPSE with the major axis (z, 2mm spacing) first
    const circleRegion = findByConcept(groups[0], '111030')[0];
    assert.equal(circleRegion.valueType, ValueTypes.scoord3d, 'SCOORD3D');
    assert.equal(circleRegion.value.graphicType, 'ELLIPSE', 'circle type');
    assert.deepEqual(circleRegion.value.graphicData, [
      5, -10, 16, 5, -10, 24, 4, -10, 20, 6, -10, 20
    ], 'circle points');
    assert.equal(circleRegion.value.referencedFrameOfReferenceUID,
      '1.2.3.4.200', 'frame of reference');
    // label position as SCOORD3D
    const labelPosition = findByConcept(groups[0], '125309')[0]
      .contentSequence[0];
    assert.equal(labelPosition.valueType, ValueTypes.scoord3d,
      'label position SCOORD3D');
    // source image (TID 1501 row 10b) and dwv plane
    const sourceImage = findByConcept(groups[0], '121112')[0];
    assert.equal(sourceImage.valueType, ValueTypes.image, 'source IMAGE');
    assert.equal(sourceImage.relationshipType, RelationshipTypes.contains,
      'source relationship');
    assert.equal(
      sourceImage.value.referencedSOPSequence.referencedSOPInstanceUID,
      REF_UID, 'source uid');
    const planePoints = findByConcept(groups[0], 'PLANE_POINTS')[0];
    assert.equal(planePoints.valueType, ValueTypes.text, 'plane points TEXT');
    assert.equal(planePoints.value, '0,-10,0,1,0,0,0,0,-1', 'plane points');
    // only the shape as SCOORD3D at the group level
    assert.equal(groups[0].contentSequence.filter(function (item) {
      return item.valueType === ValueTypes.scoord3d;
    }).length, 1, 'one group SCOORD3D');

    // rectangle: closed polyline as POLYGON
    const rectRegion = findByConcept(groups[1], '111030')[0];
    assert.equal(rectRegion.value.graphicType, 'POLYGON', 'rectangle type');
    assert.equal(rectRegion.value.graphicData.length, 15, 'rectangle points');

    // ruler: POLYLINE
    const length = findByConcept(groups[2], '410668003')[0];
    assert.equal(length.contentSequence[0].valueType, ValueTypes.scoord3d,
      'ruler SCOORD3D');
    assert.equal(length.contentSequence[0].value.graphicType, 'POLYLINE',
      'ruler type');

    // acquisition plane point: SCOORD
    assert.equal(findByConcept(groups[3], '111030')[0].valueType,
      ValueTypes.scoord, 'point SCOORD');
  });

  /**
   * Tests for a non acquisition plane annotation without view.
   *
   * @function module:tests/annotation~writeScoord3DNoView
   */
  test('Write non acquisition plane annotation without view', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const annotation = getAnnotation(new Point2D(1, 2));
    annotation.planePoints = [
      new Point3D(0, 0, 0), new Point3D(1, 0, 0), new Point3D(0, 0, -1)
    ];
    const factory = new AnnotationGroupFactory();
    assert.throws(() => {
      factory.toDicom(getAnnotationGroup([annotation]));
    }, 'No annotation group SR content');

    expect(consoleSpy).toHaveBeenCalledWith(
      'Cannot export an annotation on a non acquisition plane ' +
      `without its view: ${annotation.trackingId}`);
    consoleSpy.mockRestore();
  });


  /**
   * Read back an annotation group written by the factory.
   *
   * @param {AnnotationGroup} group The group to write.
   * @returns {AnnotationGroup} The read group.
   */
  function roundTrip(group) {
    const elements = writeAndParse(group);
    const factory = new AnnotationGroupFactory();
    assert.equal(factory.checkElements(elements), undefined,
      'supported annotation');
    return factory.create(elements);
  }

  /**
   * Check that two points are close.
   *
   * @param {Point2D} actual The actual point.
   * @param {Point2D} expected The expected point.
   * @param {string} message The message.
   */
  function assertPointClose(actual, expected, message) {
    assert.closeTo(actual.getX(), expected.getX(), 1e-4, `${message} x`);
    assert.closeTo(actual.getY(), expected.getY(), 1e-4, `${message} y`);
  }

  /**
   * Tests for {@link AnnotationGroupFactory} round trip of acquisition
   * plane annotations.
   *
   * @function module:tests/annotation~roundTripTid1500Annotations
   */
  test(
    'Round trip TID 1500 annotations - ' +
    '#DWV-REQ-IO-06-003 Load DICOM SR annotations',
    () => {
      const ruler = getAnnotation(
        new Line(new Point2D(10.5, 10), new Point2D(30, 12.25)));
      ruler.quantification = {length: {value: 20.5, unit: 'unit.mm'}};
      ruler.textExpr = 'ruler';
      ruler.labelPosition = new Point2D(35, 12);
      ruler.colour = '#ff0000';
      ruler.referencedFrameNumber = 3;

      const circle = getAnnotation(new Circle(new Point2D(50, 50), 10));
      circle.quantification = {
        radius: {value: 5, unit: 'unit.mm'},
        surface: {value: 0.78, unit: 'unit.cm2'},
        min: {value: -12, unit: 'HU'},
        max: {value: 80, unit: 'HU'},
        mean: {value: 40.2, unit: 'HU'},
        stdDev: {value: 3.1, unit: 'HU'},
        median: {value: 41, unit: 'HU'}
      };

      const arrow = getAnnotation(new Point2D(5, 6));
      arrow.referencePoints = [new Point2D(15, 16)];
      arrow.textExpr = 'arrow';

      const protractor = getAnnotation(new Protractor([
        new Point2D(0, 0), new Point2D(10, 0), new Point2D(10, 10)
      ]));
      protractor.quantification = {angle: {value: 90, unit: 'unit.degree'}};

      const bline = new BidimensionalLine(
        new Point2D(10, 10), new Point2D(30, 10));
      bline.shortAxisCenter = new Point2D(16, 10);
      bline.shortAxisL1 = 7;
      bline.shortAxisL2 = 5;
      bline.shortAxisLength = 12;
      const bidimensional = getAnnotation(bline);
      bidimensional.quantification = {
        longAxis: {value: 20, unit: 'unit.mm'},
        shortAxis: {value: 12, unit: 'unit.mm'}
      };

      const rectangle = getAnnotation(
        new Rectangle(new Point2D(1, 2), new Point2D(11, 22)));
      const ellipse = getAnnotation(new Ellipse(new Point2D(40, 40), 5, 9));
      const roi = getAnnotation(new ROI([
        new Point2D(0, 0), new Point2D(10, 0), new Point2D(5, 8)
      ]));

      const inputs = [
        ruler,
        circle,
        arrow,
        protractor,
        bidimensional,
        rectangle,
        ellipse,
        roi
      ];
      const list = roundTrip(getAnnotationGroup(inputs)).getList();
      assert.equal(list.length, inputs.length, 'annotations');

      for (let i = 0; i < inputs.length; ++i) {
        const input = inputs[i];
        const output = list[i];
        const prefix = `annotation ${i}`;
        assert.equal(output.trackingId, input.trackingId,
          `${prefix} tracking id`);
        assert.equal(output.trackingUid, input.trackingUid,
          `${prefix} tracking uid`);
        assert.equal(output.referencedSopInstanceUID, REF_UID,
          `${prefix} referenced uid`);
        assert.equal(output.referencedSopClassUID, CT_SOP_CLASS,
          `${prefix} referenced class`);
        assert.equal(output.colour, input.colour, `${prefix} colour`);
        assert.equal(output.textExpr, input.textExpr, `${prefix} label`);
        assert.equal(output.mathShape.constructor.name,
          input.mathShape.constructor.name, `${prefix} shape type`);
        // quantification
        const inQuantif = input.quantification ?? {};
        const outQuantif = output.quantification ?? {};
        assert.deepEqual(Object.keys(outQuantif).sort(),
          Object.keys(inQuantif).sort(), `${prefix} quantification keys`);
        for (const key in inQuantif) {
          assert.closeTo(Number(outQuantif[key].value), inQuantif[key].value,
            1e-6, `${prefix} ${key} value`);
          assert.equal(outQuantif[key].unit, inQuantif[key].unit,
            `${prefix} ${key} unit`);
        }
      }

      // shapes and dwv extras
      assert.equal(list[0].referencedFrameNumber, 3, 'frame number');
      assertPointClose(list[0].mathShape.getBegin(), new Point2D(10.5, 10),
        'ruler begin');
      assertPointClose(list[0].mathShape.getEnd(), new Point2D(30, 12.25),
        'ruler end');
      assertPointClose(list[0].labelPosition, new Point2D(35, 12),
        'label position');

      assertPointClose(list[1].mathShape.getCenter(), new Point2D(50, 50),
        'circle center');
      assert.equal(list[1].mathShape.getRadius(), 10, 'circle radius');

      assertPointClose(list[2].mathShape, new Point2D(5, 6), 'arrow');
      assert.equal(list[2].referencePoints.length, 1, 'arrow reference');
      assertPointClose(list[2].referencePoints[0], new Point2D(15, 16),
        'arrow reference point');

      assertPointClose(list[3].mathShape.getPoint(2), new Point2D(10, 10),
        'protractor point');

      const outBline = list[4].mathShape;
      assertPointClose(outBline.getBegin(), new Point2D(10, 10),
        'bidimensional begin');
      assertPointClose(outBline.getEnd(), new Point2D(30, 10),
        'bidimensional end');
      assertPointClose(outBline.shortAxisCenter, new Point2D(16, 10),
        'bidimensional short axis center');
      assert.closeTo(outBline.shortAxisL1, 7, 1e-4, 'bidimensional L1');
      assert.closeTo(outBline.shortAxisL2, 5, 1e-4, 'bidimensional L2');

      assertPointClose(list[5].mathShape.getBegin(), new Point2D(1, 2),
        'rectangle begin');
      assertPointClose(list[5].mathShape.getEnd(), new Point2D(11, 22),
        'rectangle end');

      assertPointClose(list[6].mathShape.getCenter(), new Point2D(40, 40),
        'ellipse center');
      assert.equal(list[6].mathShape.getA(), 5, 'ellipse a');
      assert.equal(list[6].mathShape.getB(), 9, 'ellipse b');

      assert.equal(list[7].mathShape.getLength(), 3, 'roi points');
      // the label is not read as meta
      assert.equal(list[0].getMetaConceptIds().length, 0, 'no meta');
    });

  /**
   * Tests for {@link AnnotationGroupFactory} round trip of annotations
   * on a non acquisition plane: written as SCOORD3D, read as patient
   * geometry, set back on the view plane.
   *
   * @function module:tests/annotation~roundTripScoord3D
   */
  test(
    'Round trip non acquisition plane annotations - ' +
    '#DWV-REQ-IO-06-003 Load DICOM SR annotations',
    () => {
      // axial volume, coronal view
      const identity = new Matrix33([1, 0, 0, 0, 1, 0, 0, 0, 1]);
      const imageGeometry = new Geometry(
        [new Point3D(0, 0, 0)],
        new Size([20, 20, 20]),
        new Spacing([0.5, 0.5, 2]),
        identity
      );
      const planeHelper = new PlaneHelper(
        imageGeometry, getViewOrientation(identity, getCoronalMat33()));
      const forUid = '1.2.3.4.300';
      const viewPosition = new Point([3, 4.5, 6]);
      const viewController = {
        getPlaneHelper: () => planeHelper,
        getFrameOfReferenceUID: () => forUid,
        getCurrentPosition: () => viewPosition,
        getImageUidFromPosition: () => REF_UID,
        getSopClassUid: () => CT_SOP_CLASS,
        isAquisitionOrientation: () => false,
        getPlanePoints: (position) => planeHelper.getPlanePoints(position),
        includesImageUid: (uid) => uid === REF_UID,
        getOriginForImageUid: () => new Point3D(0, 0, 0),
        getIndexFromPosition: (position) =>
          imageGeometry.worldToIndex(position)
      };

      /**
       * Get an annotation drawn on the coronal view.
       *
       * @param {object} shape The plane shape.
       * @returns {Annotation} The annotation.
       */
      function getCoronalAnnotation(shape) {
        const annotation = getAnnotation(shape);
        annotation.planePoints = planeHelper.getPlanePoints(viewPosition);
        annotation.setViewController(
          /** @type {object} */ (viewController));
        return annotation;
      }

      const circle = getCoronalAnnotation(new Circle(new Point2D(8, 6), 2));
      circle.textExpr = 'circle';
      circle.labelPosition = new Point2D(12, 3);
      const ruler = getCoronalAnnotation(
        new Line(new Point2D(2, 3), new Point2D(10, 7)));
      ruler.quantification = {length: {value: 4.5, unit: 'unit.mm'}};
      const rectangle = getCoronalAnnotation(
        new Rectangle(new Point2D(1, 2), new Point2D(5, 8)));
      const arrow = getCoronalAnnotation(new Point2D(4, 4));
      arrow.referencePoints = [new Point2D(9, 9)];

      const inputs = [circle, ruler, rectangle, arrow];
      const group = roundTrip(getAnnotationGroup(inputs));
      const list = group.getList();
      assert.equal(list.length, inputs.length, 'annotations');

      for (let i = 0; i < list.length; ++i) {
        const annotation = list[i];
        const prefix = `annotation ${i}`;
        assert.equal(annotation.mathShape, undefined,
          `${prefix} no shape before view`);
        assert.ok(typeof annotation.patientGeometry !== 'undefined',
          `${prefix} patient geometry`);
        assert.equal(annotation.patientGeometry.shape.frameOfReferenceUID,
          forUid, `${prefix} frame of reference`);
        // referenced image and plane available before view
        assert.equal(annotation.referencedSopInstanceUID, REF_UID,
          `${prefix} referenced uid before view`);
        assert.equal(annotation.referencedSopClassUID, CT_SOP_CLASS,
          `${prefix} referenced class uid before view`);
        assert.deepEqual(annotation.planePoints, inputs[i].planePoints,
          `${prefix} plane points before view`);
        assert.equal(annotation.getOrientationName(), 'coronal',
          `${prefix} orientation before view`);
        assert.equal(annotation.getMetaConceptIds().length, 0,
          `${prefix} no meta`);
      }

      // a view with another frame of reference does not set the shape
      list[0].setViewController(/** @type {object} */ ({
        ...viewController,
        getFrameOfReferenceUID: () => '9.9.9'
      }));
      assert.equal(list[0].mathShape, undefined, 'other frame of reference');

      // a view with another orientation does not set the shape,
      // even if the shape points are on one of its planes
      // (horizontal ruler: on a coronal and an axial plane)
      const axialHelper = new PlaneHelper(
        imageGeometry, getViewOrientation(identity, identity));
      const horizontal = getCoronalAnnotation(
        new Line(new Point2D(2, 3), new Point2D(10, 3)));
      const readHorizontal =
        roundTrip(getAnnotationGroup([horizontal])).getList()[0];
      readHorizontal.setViewController(/** @type {object} */ ({
        ...viewController,
        getPlaneHelper: () => axialHelper,
        isAquisitionOrientation: () => true
      }));
      assert.equal(readHorizontal.mathShape, undefined, 'other orientation');
      assert.ok(typeof readHorizontal.patientGeometry !== 'undefined',
        'other orientation keeps patient geometry');

      // the read referenced image is kept: no shape on a view without
      // it (for ex another series with the same frame of reference)...
      const [readRuler, readNoRef] =
        roundTrip(getAnnotationGroup([ruler, ruler])).getList();
      readRuler.setViewController(/** @type {object} */ ({
        ...viewController,
        includesImageUid: () => false
      }));
      assert.equal(readRuler.mathShape, undefined, 'view without image');
      assert.ok(typeof readRuler.patientGeometry !== 'undefined',
        'view without image keeps patient geometry');
      // ... and not replaced by the image at the view time position
      readRuler.setViewController(/** @type {object} */ ({
        ...viewController,
        includesImageUid: () => true,
        getImageUidFromPosition: () => '9.9.9'
      }));
      assert.ok(readRuler.mathShape instanceof Line, 'view with image');
      assert.equal(readRuler.referencedSopInstanceUID, REF_UID,
        'read referenced uid kept');
      // without read referenced image (for ex from another application):
      // the image at the view position
      readNoRef.referencedSopInstanceUID = undefined;
      readNoRef.referencedSopClassUID = undefined;
      readNoRef.setViewController(/** @type {object} */ (viewController));
      assert.ok(readNoRef.mathShape instanceof Line, 'no ref shape');
      assert.equal(readNoRef.referencedSopInstanceUID, REF_UID,
        'no ref referenced uid');
      assert.equal(readNoRef.referencedSopClassUID, CT_SOP_CLASS,
        'no ref referenced class uid');

      // write again without view: patient geometry, referenced image
      // and plane written as is
      const list2 = roundTrip(group).getList();
      assert.equal(list2.length, inputs.length, 'annotations 2');
      assert.deepEqual(list2[1].patientGeometry.shape.points,
        list[1].patientGeometry.shape.points, 'patient points kept');
      assert.equal(list2[1].referencedSopInstanceUID, REF_UID,
        'referenced uid kept');
      assert.deepEqual(list2[1].planePoints, list[1].planePoints,
        'plane points kept');

      // set on the view plane
      for (const annotation of list) {
        annotation.setViewController(/** @type {object} */ (viewController));
      }
      for (let i = 0; i < inputs.length; ++i) {
        const prefix = `annotation ${i}`;
        assert.equal(list[i].patientGeometry, undefined,
          `${prefix} patient geometry converted`);
        assert.deepEqual(list[i].planePoints, inputs[i].planePoints,
          `${prefix} plane points`);
        assert.equal(list[i].referencedSopInstanceUID, REF_UID,
          `${prefix} referenced uid`);
        assert.ok(list[i].canView(), `${prefix} can view`);
      }

      assert.ok(list[0].mathShape instanceof Circle, 'circle type');
      assertPointClose(list[0].mathShape.getCenter(), new Point2D(8, 6),
        'circle center');
      assert.closeTo(list[0].mathShape.getRadius(), 2, 1e-4, 'circle radius');
      assertPointClose(list[0].labelPosition, new Point2D(12, 3),
        'label position');

      assert.ok(list[1].mathShape instanceof Line, 'ruler type');
      assertPointClose(list[1].mathShape.getBegin(), new Point2D(2, 3),
        'ruler begin');
      assertPointClose(list[1].mathShape.getEnd(), new Point2D(10, 7),
        'ruler end');
      assert.closeTo(Number(list[1].quantification.length.value), 4.5, 1e-6,
        'ruler length');

      assert.ok(list[2].mathShape instanceof Rectangle, 'rectangle type');
      assertPointClose(list[2].mathShape.getEnd(), new Point2D(5, 8),
        'rectangle end');

      assertPointClose(list[3].mathShape, new Point2D(4, 4), 'arrow');
      assertPointClose(list[3].referencePoints[0], new Point2D(9, 9),
        'arrow reference point');
    });

  /**
   * Tests for the patient positions of annotations on a non acquisition
   * plane: the center of a shape pixel (SCOORD convention, i + 0.5) is
   * the center of the image voxel (Image Position (Patient) + i * spacing).
   *
   * @function module:tests/annotation~scoord3DPixelCenter
   */
  test('Non acquisition plane annotation pixel center', () => {
    // axial volume, coronal view: plane x is image x (0.5mm),
    // plane y is image z (2mm)
    const identity = new Matrix33([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    const imageGeometry = new Geometry(
      [new Point3D(10, 20, 30)],
      new Size([20, 20, 20]),
      new Spacing([0.5, 0.5, 2]),
      identity
    );
    const planeHelper = new PlaneHelper(
      imageGeometry, getViewOrientation(identity, getCoronalMat33()));
    const forUid = '1.2.3.4.300';
    // coronal plane at image row 5: y = 20 + 5 * 0.5
    const viewPosition = new Point([12, 22.5, 36]);
    const viewController = {
      getPlaneHelper: () => planeHelper,
      getFrameOfReferenceUID: () => forUid,
      getCurrentPosition: () => viewPosition,
      getImageUidFromPosition: () => REF_UID,
      getSopClassUid: () => CT_SOP_CLASS,
      isAquisitionOrientation: () => false,
      getPlanePoints: (position) => planeHelper.getPlanePoints(position),
      includesImageUid: (uid) => uid === REF_UID,
      getOriginForImageUid: () => new Point3D(10, 20, 30),
      getIndexFromPosition: (position) =>
        imageGeometry.worldToIndex(position)
    };

    // ruler from the center of the first pixel to the center
    // of pixel (2, 1)
    const ruler = getAnnotation(
      new Line(new Point2D(0.5, 0.5), new Point2D(2.5, 1.5)));
    ruler.planePoints = planeHelper.getPlanePoints(viewPosition);
    ruler.setViewController(/** @type {object} */ (viewController));

    // plane to patient: voxel centers
    const expected = [new Point3D(10, 22.5, 30), new Point3D(11, 22.5, 32)];
    const positions = ruler.getPlanePositions(
      [ruler.mathShape.getBegin(), ruler.mathShape.getEnd()]);
    for (let i = 0; i < expected.length; ++i) {
      assert.ok(positions[i].isSimilar(expected[i], 1e-6),
        `position ${i}: ${positions[i]}`);
    }

    // written SCOORD3D
    const elements = writeAndParse(getAnnotationGroup([ruler]));
    const groups = getMeasurementGroups(getSRContent(elements));
    const scoord3d = findByConcept(groups[0], '121112')[0];
    assert.equal(scoord3d.valueType, ValueTypes.scoord3d, 'SCOORD3D');
    assert.deepEqual(scoord3d.value.graphicData.map(Number),
      [10, 22.5, 30, 11, 22.5, 32], 'written patient points');

    // patient to plane: back to pixel centers
    const read = new AnnotationGroupFactory().create(elements).getList()[0];
    read.setViewController(/** @type {object} */ (viewController));
    assert.ok(read.mathShape instanceof Line, 'read ruler');
    assertPointClose(read.mathShape.getBegin(), new Point2D(0.5, 0.5),
      'read begin');
    assertPointClose(read.mathShape.getEnd(), new Point2D(2.5, 1.5),
      'read end');
  });


  /**
   * Get an annotation without shape: a finding with a label and
   * a coded meta item.
   *
   * @param {string} trackingId The tracking id.
   * @returns {Annotation} The annotation.
   */
  function getShapelessAnnotation(trackingId) {
    const annotation = getAnnotation(undefined);
    annotation.trackingId = trackingId;
    annotation.textExpr = `pending ${trackingId}`;
    annotation.referencedFrameNumber = 2;
    const lesion = new DicomCode('Lesion');
    lesion.value = '52988006';
    lesion.schemeDesignator = 'SCT';
    annotation.addMetaItem(getDcmDicomCode(DcmCodes.Finding), lesion);
    return annotation;
  }

  /**
   * Tests for {@link AnnotationGroupFactory} toDicom of an annotation
   * without shape: TID 1501 group with a source image and no geometry.
   *
   * @function module:tests/annotation~writeShapelessAnnotation
   */
  test('Write annotation without shape', () => {
    const shapeless = getShapelessAnnotation('lesion-1');
    const point = getAnnotation(new Point2D(5, 6));
    const elements = writeAndParse(getAnnotationGroup([shapeless, point]));
    const root = getSRContent(elements);
    checkConstraints(root, false, 'root');

    const groups = getMeasurementGroups(root);
    assert.equal(groups.length, 2, 'two measurement groups');
    const group = groups[0];
    // no geometry nor measurement
    for (const item of group.contentSequence) {
      assert.notOk(item.valueType === ValueTypes.scoord ||
        item.valueType === ValueTypes.scoord3d ||
        item.valueType === ValueTypes.num,
      `no geometry: ${item.valueType}`);
    }
    // source image (TID 1501 row 10b)
    const images = findByConcept(group, '121112');
    assert.equal(images.length, 1, 'one source image');
    assert.equal(images[0].valueType, ValueTypes.image, 'source IMAGE');
    assert.equal(images[0].relationshipType, RelationshipTypes.contains,
      'source relationship');
    assert.equal(
      images[0].value.referencedSOPSequence.referencedSOPInstanceUID,
      REF_UID, 'source uid');
    // ids, label and meta
    assert.equal(findByConcept(group, '112039')[0].value, 'lesion-1',
      'tracking id');
    assert.equal(findByConcept(group, '125309')[0].value, 'pending lesion-1',
      'label');
    assert.equal(findByConcept(group, '121071')[0].value.value, '52988006',
      'finding');
  });

  /**
   * Tests for {@link AnnotationGroupFactory} toDicom of a group of
   * annotations that all have no shape.
   *
   * @function module:tests/annotation~writeShapelessOnlyGroup
   */
  test('Write group of annotations without shape', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const inputs = [
      getShapelessAnnotation('lesion-1'),
      getShapelessAnnotation('lesion-2')
    ];
    // no referenced image
    inputs[1].referencedSopClassUID = undefined;
    inputs[1].referencedSopInstanceUID = undefined;
    inputs[1].referencedFrameNumber = undefined;
    const elements = writeAndParse(getAnnotationGroup(inputs));
    const groups = getMeasurementGroups(getSRContent(elements));
    assert.equal(groups.length, 2, 'two measurement groups');
    assert.equal(findByConcept(groups[1], '121112').length, 0,
      'no source image');

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  /**
   * Tests for {@link AnnotationGroupFactory} round trip of annotations
   * without shape.
   *
   * @function module:tests/annotation~roundTripShapelessAnnotation
   */
  test('Round trip annotation without shape', () => {
    const shapeless = getShapelessAnnotation('lesion-1');
    const noImage = getShapelessAnnotation('lesion-2');
    noImage.referencedSopClassUID = undefined;
    noImage.referencedSopInstanceUID = undefined;
    noImage.referencedFrameNumber = undefined;
    const point = getAnnotation(new Point2D(5, 6));
    const inputs = [shapeless, noImage, point];

    const list = roundTrip(getAnnotationGroup(inputs)).getList();
    assert.equal(list.length, inputs.length, 'annotations');

    for (let i = 0; i < 2; ++i) {
      const input = inputs[i];
      const output = list[i];
      const prefix = `annotation ${i}`;
      assert.isUndefined(output.mathShape, `${prefix} no shape`);
      assert.equal(output.trackingId, input.trackingId, `${prefix} id`);
      assert.equal(output.trackingUid, input.trackingUid, `${prefix} uid`);
      assert.equal(output.textExpr, input.textExpr, `${prefix} label`);
      assert.equal(output.referencedSopClassUID,
        input.referencedSopClassUID, `${prefix} class`);
      assert.equal(output.referencedSopInstanceUID,
        input.referencedSopInstanceUID, `${prefix} instance`);
      assert.equal(output.referencedFrameNumber,
        input.referencedFrameNumber, `${prefix} frame`);
      assert.deepEqual(output.getMetaConceptIds(), ['121071'],
        `${prefix} meta ids`);
      assert.equal(output.getMetaItem('121071').value.value, '52988006',
        `${prefix} finding`);
    }
    assert.ok(list[2].mathShape instanceof Point2D, 'point shape');
  });

});
