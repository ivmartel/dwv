import {describe, test, assert} from 'vitest';
import {
  getContentTemplate,
  DicomSRContent,
  isEqualContentItem,
  getSRContent,
  getDicomSRContentItem,
  getSRContentFromValue,
  getSRReferencedInstanceUIDs,
  RelationshipTypes,
  ValueTypes
} from '../../src/dicom/dicomSRContent.js';
import {DataElement} from '../../src/dicom/dataElement.js';
import {DicomCode} from '../../src/dicom/dicomCode.js';
import {ImageReference} from '../../src/dicom/dicomImageReference.js';
import {
  SopInstanceReference
} from '../../src/dicom/dicomSopInstanceReference.js';

// Tag keys used in tests (must match module TagKeys)
const TagKeys = {
  ContentTemplateSequence: '0040A504',
  MappingResource: '00080105',
  TemplateIdentifier: '0040DB00',
  ValueType: '0040A040',
  TextValue: '0040A160',
  ConceptNameCodeSequence: '0040A043',
  ConceptCodeSequence: '0040A168',
  ContentSequence: '0040A730'
};

describe('dicom', () => {

  /**
   * Tests for {@link getContentTemplate} undefined.
   *
   * @function module:tests/dicom~getcontenttemplate
   */
  test('getContentTemplate', () => {
    const mapping = new DataElement('CS');
    mapping.value = ['DCMR'];
    const tid = new DataElement('SH');
    tid.value = ['T123'];

    const item = {};
    item[TagKeys.MappingResource] = mapping;
    item[TagKeys.TemplateIdentifier] = tid;

    const seq = new DataElement('SQ');
    seq.value = [item];

    const dataElements = {};
    dataElements[TagKeys.ContentTemplateSequence] = seq;

    const template = getContentTemplate(dataElements);
    assert.equal(template, 'DCMR-T123');
  });

  /**
   * Tests for {@link DicomSRContent} toString and hasHeader.
   *
   * @function module:tests/dicom~dicomsrcontentTostringHasheader
   */
  test('DicomSRContent toString hasHeader', () => {
    const content = new DicomSRContent(ValueTypes.text);
    content.relationshipType = RelationshipTypes.contains;
    const code = new DicomCode('Length');
    code.value = '410668003';
    code.schemeDesignator = 'SCT';
    content.conceptNameCode = code;
    content.value = {toString: () => '12 mm'};

    const child = new DicomSRContent(ValueTypes.text);
    child.value = {toString: () => 'child'};
    content.contentSequence.push(child);

    const s = content.toString();
    assert.include(s, '(CONTAINS)');
    assert.include(s, 'TEXT:');
    assert.include(s, 'Length');
    assert.include(s, '12 mm');

    assert.ok(content.hasHeader(
      ValueTypes.text,
      code,
      RelationshipTypes.contains
    ));
    // negative
    const otherCode = new DicomCode('Other');
    otherCode.value = '000';
    otherCode.schemeDesignator = 'DCM';
    assert.notOk(content.hasHeader(
      ValueTypes.text,
      otherCode,
      RelationshipTypes.contains
    ));
  });

  /**
   * Tests for {@link isEqualContentItem}.
   *
   * @function module:tests/dicom~isequalcontentitem
   */
  test('isEqualContentItem', () => {
    const a = {x: 1, y: 2};
    const b = {x: 1, y: 2};
    const c = {x: 1};
    assert.ok(isEqualContentItem(a, b));
    assert.notOk(isEqualContentItem(a, c));
  });

  /**
   * Tests for {@link getSRContent}.
   *
   * @function module:tests/dicom~getsrcontent
   */
  test('getSRContent', () => {
    const vt = new DataElement('CS');
    vt.value = [ValueTypes.text];
    const txt = new DataElement('UT');
    txt.value = ['hello world'];
    const conceptCodeItem = {};
    const ccValue = new DataElement('SH');
    ccValue.value = ['111'];
    const ccScheme = new DataElement('SH');
    ccScheme.value = ['DCM'];
    const ccMeaning = new DataElement('LO');
    ccMeaning.value = ['Length'];
    conceptCodeItem['00080100'] = ccValue;
    conceptCodeItem['00080102'] = ccScheme;
    conceptCodeItem['00080104'] = ccMeaning;
    const ccs = new DataElement('SQ');
    ccs.value = [conceptCodeItem];

    // child content
    const childItem = {};
    const childVT = new DataElement('CS');
    childVT.value = [ValueTypes.text];
    const childTxt = new DataElement('UT');
    childTxt.value = ['child'];
    childItem[TagKeys.ValueType] = childVT;
    childItem[TagKeys.TextValue] = childTxt;

    const csSeq = new DataElement('SQ');
    csSeq.value = [childItem];

    const dataElements = {};
    dataElements[TagKeys.ValueType] = vt;
    dataElements[TagKeys.TextValue] = txt;
    dataElements[TagKeys.ConceptNameCodeSequence] = ccs;
    dataElements[TagKeys.ContentSequence] = csSeq;

    const content = getSRContent(dataElements);
    assert.equal(content.value, 'hello world');
    assert.equal(content.contentSequence.length, 1);
    assert.equal(content.contentSequence[0].value, 'child');
  });

  /**
   * Tests for {@link getDicomSRContentItem}.
   *
   * @function module:tests/dicom~getdicomsrcontentitem
   */
  test('getDicomSRContentItem', () => {
    const content = getSRContentFromValue(
      'length',
      42,
      'unit.mm'
    );
    assert.ok(content);
    const item = getDicomSRContentItem(content);
    // should contain ConceptNameCodeSequence and MeasuredValueSequence
    assert.ok(item.ConceptNameCodeSequence);
    assert.ok(item.MeasuredValueSequence);
    assert.ok(Array.isArray(item.MeasuredValueSequence.value));
  });

  /**
   * Tests for {@link getSRContent} with code value type.
   *
   * @function module:tests/dicom~getsrcontentCode
   */
  test('getSRContent CODE', () => {
    const vt = new DataElement('CS');
    vt.value = [ValueTypes.code];
    // ConceptCodeSequence
    const codeItem = {};
    const codeValue = new DataElement('SH');
    codeValue.value = ['MM'];
    const codeScheme = new DataElement('SH');
    codeScheme.value = ['UCUM'];
    const codeMeaning = new DataElement('LO');
    codeMeaning.value = ['millimeter'];
    codeItem['00080100'] = codeValue;
    codeItem['00080102'] = codeScheme;
    codeItem['00080104'] = codeMeaning;
    const ccseq = new DataElement('SQ');
    ccseq.value = [codeItem];

    const dataElements = {};
    dataElements[TagKeys.ValueType] = vt;
    dataElements[TagKeys.ConceptCodeSequence] = ccseq;

    const content = getSRContent(dataElements);
    assert.ok(content.value);
    assert.equal(content.value.value, 'MM');
    assert.equal(content.value.schemeDesignator, 'UCUM');
  });

});

/**
 * Create a SR content item.
 *
 * @param {string} valueType The value type.
 * @param {object} [code] The concept name code values.
 * @param {string} [code.value] The code value.
 * @param {string} [code.longValue] The long code value.
 * @param {string} [code.schemeDesignator] The coding scheme designator.
 * @param {object} [value] The item value.
 * @param {DicomSRContent[]} [children] The child items.
 * @returns {DicomSRContent} The content item.
 */
function createSearchItem(valueType, code, value, children) {
  const item = new DicomSRContent(valueType);
  if (typeof code !== 'undefined') {
    item.conceptNameCode = new DicomCode('meaning');
    item.conceptNameCode.value = code.value;
    item.conceptNameCode.longValue = code.longValue;
    item.conceptNameCode.schemeDesignator = code.schemeDesignator;
  }
  item.value = value;
  item.contentSequence = children ?? [];
  return item;
}

/**
 * Create an IMAGE content item.
 *
 * @param {string} uid The referenced SOP Instance UID.
 * @returns {DicomSRContent} The content item.
 */
function createImageItem(uid) {
  const reference = new SopInstanceReference();
  reference.referencedSOPClassUID = '1.2.840.10008.5.1.4.1.1.4';
  reference.referencedSOPInstanceUID = uid;
  const image = new ImageReference();
  image.referencedSOPSequence = reference;
  return createSearchItem(ValueTypes.image, {value: '121138'}, image);
}

describe('getSRReferencedInstanceUIDs', () => {
  const container = createSearchItem(
    ValueTypes.container, {longValue: 'LongCodeContainer'}, undefined, [
      createImageItem('1.2.3.1'),
      createSearchItem(ValueTypes.text, {value: '112002'}, '1.2.3.100'),
      createImageItem('1.2.3.2')
    ]);
  const root = createSearchItem(ValueTypes.container, {value: 'root'},
    undefined, [
      createImageItem('1.2.3.9'),
      createSearchItem(ValueTypes.container, {value: 'other'}, undefined, [
        createSearchItem(ValueTypes.container, {value: 'code'}, undefined, [
          createImageItem('1.2.3.3')
        ])
      ]),
      container
    ]);

  test('long code value container', () => {
    assert.deepEqual(getSRReferencedInstanceUIDs(root, 'LongCodeContainer'),
      ['1.2.3.1', '1.2.3.2']);
  });

  test('code value container at any depth', () => {
    assert.deepEqual(getSRReferencedInstanceUIDs(root, 'code'),
      ['1.2.3.3']);
  });

  test('root container, direct IMAGE children only', () => {
    assert.deepEqual(getSRReferencedInstanceUIDs(root, 'root'),
      ['1.2.3.9']);
  });

  test('not found', () => {
    assert.deepEqual(getSRReferencedInstanceUIDs(root, 'unknown'), []);
    assert.deepEqual(getSRReferencedInstanceUIDs(container, 'root'), []);
  });

  test('skip IMAGE items without reference', () => {
    const noReference = createSearchItem(
      ValueTypes.container, {value: 'code'}, undefined, [
        createSearchItem(ValueTypes.image, {value: '121138'}, undefined),
        createImageItem('1.2.3.4')
      ]);
    assert.deepEqual(getSRReferencedInstanceUIDs(noReference, 'code'),
      ['1.2.3.4']);
  });

  test('code with coding scheme', () => {
    const schemes = createSearchItem(ValueTypes.container, {value: 'root'},
      undefined, [
        createSearchItem(ValueTypes.container,
          {value: 'code', schemeDesignator: 'DCM'}, undefined,
          [createImageItem('1.2.3.1')]),
        createSearchItem(ValueTypes.container,
          {value: 'code', schemeDesignator: 'TEST'}, undefined,
          [createImageItem('1.2.3.2')])
      ]);
    // code value: any scheme
    assert.deepEqual(getSRReferencedInstanceUIDs(schemes, 'code'),
      ['1.2.3.1', '1.2.3.2']);
    // code: same scheme
    const code = new DicomCode('meaning');
    code.value = 'code';
    code.schemeDesignator = 'DCM';
    assert.deepEqual(getSRReferencedInstanceUIDs(schemes, code), ['1.2.3.1']);
    code.schemeDesignator = 'SCT';
    assert.deepEqual(getSRReferencedInstanceUIDs(schemes, code), []);
    // code: same long and URN values
    code.schemeDesignator = 'DCM';
    code.longValue = 'long';
    assert.deepEqual(getSRReferencedInstanceUIDs(schemes, code), []);
    code.longValue = undefined;
    code.urnValue = 'urn';
    assert.deepEqual(getSRReferencedInstanceUIDs(schemes, code), []);
  });

  test('IMAGE item with the code and duplicates', () => {
    const imageWithCode = createImageItem('1.2.3.5');
    imageWithCode.conceptNameCode.value = 'code';
    const items = createSearchItem(ValueTypes.container, {value: 'root'},
      undefined, [
        createSearchItem(ValueTypes.container, {value: 'code'}, undefined, [
          createImageItem('1.2.3.4'),
          createImageItem('1.2.3.4')
        ]),
        imageWithCode
      ]);
    assert.deepEqual(getSRReferencedInstanceUIDs(items, 'code'),
      ['1.2.3.4', '1.2.3.5']);
    // items without concept name code
    const noCode = createSearchItem(ValueTypes.container, undefined,
      undefined, [createImageItem('1.2.3.6')]);
    assert.deepEqual(getSRReferencedInstanceUIDs(noCode, 'code'), []);
  });
});
