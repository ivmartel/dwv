import {
  getUrlFromUri,
  splitUri,
  getUriQuery,
  decodeKeyValueUri,
  decodeManifest
} from '../../src/utils/uri';

/**
 * Tests for the 'utils/uri.js' file.
 */

/* global QUnit */
QUnit.module('utils');

/**
 * Tests for {@link getUrlFromUri}.
 * Test the multiplatform version and the simple one.
 *
 * @function module:tests/utils~geturlfromuri
 */
QUnit.test('getUrlFromUri', function (assert) {
  // test #00: empty
  const uri00 = 'http://domain.org';
  const res00 = getUrlFromUri(uri00);
  // pathname
  assert.equal(res00.pathname, '/', 'pathname 00');
  // search param
  assert.equal(res00.searchParams.get('topic'), null, 'search params 00');

  // test #01: simple
  const uri01 = 'https://domain.org/dir/file';
  const res01 = getUrlFromUri(uri01);
  // pathname
  assert.equal(res01.pathname, '/dir/file', 'pathname 01');
  // search param
  assert.equal(res01.searchParams.get('topic'), null, 'search params 01');

  // test #02: with file
  const uri02 = 'https://domain.org/dir/image.jpg';
  const res02 = getUrlFromUri(uri02);
  // pathname
  assert.equal(res02.pathname, '/dir/image.jpg', 'pathname 02');
  // search param
  assert.equal(res02.searchParams.get('topic'), null, 'search params 02');

  // test #03: relative
  const uri03 = './dir/image.jpg';
  const res03 = getUrlFromUri(uri03);
  // pathname
  assert.equal(res03.pathname, '/dir/image.jpg', 'pathname 03');
  // search param
  assert.equal(res03.searchParams.get('topic'), null, 'search params 03');

  // test #10: wih search params
  const uri10 = 'https://domain.org/dir/image.jpg?accesstoken=abc';
  const res10 = getUrlFromUri(uri10);
  // pathname
  assert.equal(res10.pathname, '/dir/image.jpg', 'pathname 03');
  // search param
  assert.equal(
    res10.searchParams.get('accesstoken'), 'abc', 'search params 03');

  // test #11: wih search params
  const uri11 = 'https://domain.org/dir/image.jpg?accesstoken=abc&topic=secure';
  const res11 = getUrlFromUri(uri11);
  // pathname
  assert.equal(res11.pathname, '/dir/image.jpg', 'pathname 04');
  // search param
  assert.equal(
    res11.searchParams.get('accesstoken'), 'abc', 'search params 04');
  assert.equal(
    res11.searchParams.get('topic'), 'secure', 'search params 04-2');
});

/**
 * Tests for {@link splitUri}.
 *
 * @function module:tests/utils~splituri
 */
QUnit.test(
  'splitUri - #DWV-REQ-IO-02-005 Window location URL scheme',
  function (assert) {
    // using JSON.stringify to compare objects
    const strEmpty = JSON.stringify({});

    // undefined
    const res00 = splitUri();
    assert.equal(JSON.stringify(res00), strEmpty, 'Split null');
    // null
    const res01 = splitUri(null);
    assert.equal(JSON.stringify(res01), strEmpty, 'Split null');
    // empty
    const res02 = splitUri('');
    assert.equal(JSON.stringify(res02), strEmpty, 'Split empty');

    // test10
    const test10 = 'root?key0';
    const res10 = splitUri(test10);
    const ref10 = {base: 'root', query: {}};
    assert.equal(JSON.stringify(res10), JSON.stringify(ref10), 'Split test10');
    // test11
    const test11 = 'root?key0=val00';
    const res11 = splitUri(test11);
    const ref11 = {base: 'root', query: {key0: 'val00'}};
    assert.equal(JSON.stringify(res11), JSON.stringify(ref11), 'Split test11');

    // test20
    const test20 = 'root?key0=val00&key1';
    const res20 = splitUri(test20);
    const ref20 = {base: 'root', query: {key0: 'val00'}};
    assert.equal(JSON.stringify(res20), JSON.stringify(ref20), 'Split test20');
    // test21
    const test21 = 'root?key0=val00&key1=val10';
    const res21 = splitUri(test21);
    const ref21 = {base: 'root', query: {key0: 'val00', key1: 'val10'}};
    assert.equal(JSON.stringify(res21), JSON.stringify(ref21), 'Split test21');

    // test30
    const test30 = 'root?key0=val00&key0&key1=val10';
    const res30 = splitUri(test30);
    const ref30 = {
      base: 'root',
      query: {key0: ['val00', null], key1: 'val10'}
    };
    assert.equal(JSON.stringify(res30), JSON.stringify(ref30), 'Split test30');
    // test31
    const test31 = 'root?key0=val00&key0=val01&key1=val10';
    const res31 = splitUri(test31);
    const ref31 = {
      base: 'root',
      query: {key0: ['val00', 'val01'], key1: 'val10'}
    };
    assert.equal(JSON.stringify(res31), JSON.stringify(ref31), 'Split test31');

    // test40: no root
    const test40 = '?key0=val00&key0&key1=val10';
    const res40 = splitUri(test40);
    const ref40 = {
      base: '',
      query: {key0: ['val00', null], key1: 'val10'}
    };
    assert.equal(JSON.stringify(res40), JSON.stringify(ref40),
      'Split test40: no root');
  }
);

/**
 * Tests for {@link getUriQuery}.
 *
 * @function module:tests/utils~geturiquery
 */
QUnit.test('getURIQuery - #DWV-REQ-IO-02-005 Window location URL scheme',
  function (assert) {
    let params;

    // test 00
    const root00 = 'http://test.com?input=';
    const uri00 = 'result';
    const full00 = root00 + encodeURIComponent(uri00);
    params = getUriQuery(full00);
    const res00 = decodeKeyValueUri(params.input, params.dwvReplaceMode);
    const theo00 = [uri00];
    assert.equal(res00.toString(), theo00.toString(), 'Http uri');
    // test 01
    const root01 = 'file:///test.html?input=';
    const uri01 = 'result';
    const full01 = root01 + encodeURIComponent(uri01);
    params = getUriQuery(full01);
    const res01 = decodeKeyValueUri(params.input, params.dwvReplaceMode);
    const theo01 = [uri01];
    assert.equal(res01.toString(), theo01.toString(), 'File uri');
    // test 02
    const root02 = 'file:///test.html?input=';
    const uri02 = 'result?a=0&b=1';
    const full02 = root02 + encodeURIComponent(uri02);
    params = getUriQuery(full02);
    const res02 = decodeKeyValueUri(params.input, params.dwvReplaceMode);
    const theo02 = [uri02];
    assert.equal(res02.toString(), theo02.toString(), 'File uri with args');

    // test 03
    const root03 = 'file:///test.html';
    const full03 = root03 + encodeURIComponent(root03);
    const res03 = getUriQuery(full03);
    assert.equal(res03, null, 'File uri with no args');

    // real world URI

    // wado (called 'anonymised')
    const root10 = 'http://ivmartel.github.io/dwv/demo/static/index.html?input=';
    const uri10 = 'http://dicom.vital-it.ch:8089/wado?requestType=WADO&contentType=application/dicom&studyUID=1.3.6.1.4.1.19291.2.1.1.2675258517533100002&seriesUID=1.2.392.200036.9116.2.6.1.48.1215564802.1245749034.88493&objectUID=1.2.392.200036.9116.2.6.1.48.1215564802.1245749034.96207';
    const full10 = root10 + encodeURIComponent(uri10);
    params = getUriQuery(full10);
    const res10 = decodeKeyValueUri(params.input, params.dwvReplaceMode);
    const theo10 = [uri10];
    assert.equal(res10.toString(), theo10.toString(), 'Wado url');

    // babymri
    const root11 = 'http://ivmartel.github.io/dwv/demo/static/index.html?input=';
    const uri11 = 'http://x.babymri.org/?53320924&.dcm';
    const full11 = root11 + encodeURIComponent(uri11);
    params = getUriQuery(full11);
    const res11 = decodeKeyValueUri(params.input, params.dwvReplaceMode);
    const theo11 = [uri11];
    assert.equal(res11.toString(), theo11.toString(), 'Babymri uri');

    // github
    const root12 = 'http://ivmartel.github.io/dwv/demo/static/index.html?input=';
    const uri12 = 'https://github.com/ivmartel/dwv/blob/master/data/cta0.dcm?raw=true';
    const full12 = root12 + encodeURIComponent(uri12);
    params = getUriQuery(full12);
    const res12 = decodeKeyValueUri(params.input, params.dwvReplaceMode);
    const theo12 = [uri12];
    assert.equal(res12.toString(), theo12.toString(), 'Github uri');

    // multiple URI

    // simple test: one argument
    const root20 = 'file:///test.html?input=';
    const uri20 = 'result?a=0';
    const full20 = root20 + encodeURIComponent(uri20);
    params = getUriQuery(full20);
    const res20 = decodeKeyValueUri(params.input, params.dwvReplaceMode);
    const theo20 = ['result?a=0'];
    assert.equal(
      res20.toString(), theo20.toString(), 'Multiple key uri with one arg');

    // simple test: two arguments
    const root21 = 'file:///test.html?input=';
    const uri21 = 'result?a=0&a=1';
    const full21 = root21 + encodeURIComponent(uri21);
    params = getUriQuery(full21);
    const res21 = decodeKeyValueUri(params.input, params.dwvReplaceMode);
    const theo21 = ['result?a=0', 'result?a=1'];
    assert.equal(
      res21.toString(), theo21.toString(), 'Multiple key uri with two args');

    // simple test: three arguments
    const root22 = 'file:///test.html?input=';
    const uri22 = 'result?a=0&a=1&a=2';
    const full22 = root22 + encodeURIComponent(uri22);
    params = getUriQuery(full22);
    const res22 = decodeKeyValueUri(params.input, params.dwvReplaceMode);
    const theo22 = ['result?a=0', 'result?a=1', 'result?a=2'];
    assert.equal(
      res22.toString(), theo22.toString(), 'Multiple key uri with three args');

    // simple test: plenty arguments
    const root23 = 'file:///test.html?input=';
    const uri23 = 'result?a=0&a=1&a=2&b=3&c=4';
    const full23 = root23 + encodeURIComponent(uri23);
    params = getUriQuery(full23);
    const res23 = decodeKeyValueUri(params.input, params.dwvReplaceMode);
    const theo23 = [
      'result?b=3&c=4&a=0',
      'result?b=3&c=4&a=1',
      'result?b=3&c=4&a=2'
    ];
    assert.equal(
      res23.toString(), theo23.toString(), 'Multiple key uri with plenty args');

    // simple test: no root
    const root24 = 'file:///test.html?input=';
    const uri24 = '?a=0&a=1&a=2';
    const full24 = root24 + encodeURIComponent(uri24) + '&dwvReplaceMode=void';
    params = getUriQuery(full24);
    const res24 = decodeKeyValueUri(params.input, params.dwvReplaceMode);
    const theo24 = ['0', '1', '2'];
    assert.equal(
      res24.toString(), theo24.toString(),
      'Multiple key uri and no root');

    // real world multiple URI

    // wado (called 'anonymised')
    const root30 = 'http://ivmartel.github.io/dwv/demo/static/index.html?input=';
    const uri30 = 'http://dicom.vital-it.ch:8089/wado?requestType=WADO&contentType=application/dicom&studyUID=1.3.6.1.4.1.19291.2.1.1.2675258517533100002&seriesUID=1.2.392.200036.9116.2.6.1.48.1215564802.1245749034.88493&objectUID=1.2.392.200036.9116.2.6.1.48.1215564802.1245749034.96207&objectUID=1.2.392.200036.9116.2.6.1.48.1215564802.1245749216.165708';
    const full30 = root30 + encodeURIComponent(uri30);
    params = getUriQuery(full30);
    const res30 = decodeKeyValueUri(params.input, params.dwvReplaceMode);
    const theo30 = [
      'http://dicom.vital-it.ch:8089/wado?requestType=WADO&contentType=application/dicom&studyUID=1.3.6.1.4.1.19291.2.1.1.2675258517533100002&seriesUID=1.2.392.200036.9116.2.6.1.48.1215564802.1245749034.88493&objectUID=1.2.392.200036.9116.2.6.1.48.1215564802.1245749034.96207',
      'http://dicom.vital-it.ch:8089/wado?requestType=WADO&contentType=application/dicom&studyUID=1.3.6.1.4.1.19291.2.1.1.2675258517533100002&seriesUID=1.2.392.200036.9116.2.6.1.48.1215564802.1245749034.88493&objectUID=1.2.392.200036.9116.2.6.1.48.1215564802.1245749216.165708'
    ];
    assert.equal(res30.toString(), theo30.toString(), 'Multiple Wado url');

    // babymri: test for replaceMode
    const root31 = 'http://ivmartel.github.io/dwv/demo/static/index.html?input=';
    const uri31 = 'http://x.babymri.org/?key=53320924&key=53320925&key=53320926';
    const full31 = root31 + encodeURIComponent(uri31) + '&dwvReplaceMode=void';
    params = getUriQuery(full31);
    const res31 = decodeKeyValueUri(params.input, params.dwvReplaceMode);
    const theo31 = [
      'http://x.babymri.org/?53320924',
      'http://x.babymri.org/?53320925',
      'http://x.babymri.org/?53320926'
    ];
    assert.equal(
      res31.toString(), theo31.toString(), 'Multiple baby mri (replaceMode)');

    // babymri: test for replaceMode and no root
    const root32 = 'http://ivmartel.github.io/dwv/demo/static/index.html?input=';
    const uri32 = '?key=http://x.babymri.org/?53320924&key=http://x.babymri.org/?53320925&key=http://x.babymri.org/?53320926';
    const full32 = root32 + encodeURIComponent(uri32) + '&dwvReplaceMode=void';
    params = getUriQuery(full32);
    const res32 = decodeKeyValueUri(params.input, params.dwvReplaceMode);
    const theo32 = [
      'http://x.babymri.org/?53320924',
      'http://x.babymri.org/?53320925',
      'http://x.babymri.org/?53320926'
    ];
    assert.equal(
      res32.toString(), theo32.toString(),
      'Multiple baby mri with no root (replaceMode)');

    // github: not supported

    // simple links (no query)

    // simple test: plenty arguments
    const root40 = 'file:///test.html?input=';
    const uri40 = 'web/path/to/file/?file=0.dcm&file=1.dcm&file=2.dcm';
    const full40 = root40 + encodeURIComponent(uri40) + '&dwvReplaceMode=void';
    params = getUriQuery(full40);
    const res40 = decodeKeyValueUri(params.input, params.dwvReplaceMode);
    const theo40 = [
      'web/path/to/file/0.dcm',
      'web/path/to/file/1.dcm',
      'web/path/to/file/2.dcm'
    ];
    assert.equal(res40.toString(), theo40.toString(), 'Multiple file-like uri');
  }
);

/**
 * Tests for {@link decodeManifest}.
 *
 * @function module:tests/utils~decode-manifest
 */
QUnit.test('Decode Manifest - #DWV-REQ-IO-02-006 Load Data Manifest URL',
  function (assert) {
    // test values
    const wadoUrl = 'http://my.pacs.org:8089/wado';
    const studyInstanceUID =
      '1.2.840.113619.2.134.1762680288.2032.1122564926.252';
    const seriesInstanceUID0 =
      '1.2.840.113619.2.134.1762680288.2032.1122564926.253';
    const sOPInstanceUID00 =
      '1.2.840.113619.2.134.1762680288.2032.1122564926.254';
    const sOPInstanceUID01 =
      '1.2.840.113619.2.134.1762680288.2032.1122564926.255';
    const seriesInstanceUID1 =
      '1.2.840.113619.2.134.1762680288.2032.1122564926.275';
    const sOPInstanceUID10 =
      '1.2.840.113619.2.134.1762680288.2032.1122564926.276';
    const sOPInstanceUID11 =
      '1.2.840.113619.2.134.1762680288.2032.1122564926.277';
    const sOPInstanceUID12 =
      '1.2.840.113619.2.134.1762680288.2032.1122564926.275';

    // create a test manifest
    const doc = document.implementation.createDocument(
      null, 'wado_query', null);
    doc.documentElement.setAttribute('wadoURL', wadoUrl);
    // series 0
    const instance00 = doc.createElement('Instance');
    instance00.setAttribute('SOPInstanceUID', sOPInstanceUID00);
    const instance01 = doc.createElement('Instance');
    instance01.setAttribute('SOPInstanceUID', sOPInstanceUID01);
    const series0 = doc.createElement('Series');
    series0.setAttribute('SeriesInstanceUID', seriesInstanceUID0);
    series0.appendChild(instance00);
    series0.appendChild(instance01);
    // series 1
    const instance10 = doc.createElement('Instance');
    instance10.setAttribute('SOPInstanceUID', sOPInstanceUID10);
    const instance11 = doc.createElement('Instance');
    instance11.setAttribute('SOPInstanceUID', sOPInstanceUID11);
    const instance12 = doc.createElement('Instance');
    instance12.setAttribute('SOPInstanceUID', sOPInstanceUID12);
    const series1 = doc.createElement('Series');
    series1.setAttribute('SeriesInstanceUID', seriesInstanceUID1);
    series1.appendChild(instance10);
    series1.appendChild(instance11);
    series1.appendChild(instance12);
    // study
    const study = doc.createElement('Study');
    study.setAttribute('StudyInstanceUID', studyInstanceUID);
    study.appendChild(series0);
    study.appendChild(series1);
    // patient
    const patient = doc.createElement('Patient');
    patient.appendChild(study);
    // main
    doc.documentElement.appendChild(patient);

    // decode (only reads first series)
    const res = decodeManifest(doc, 2);
    // theoretical test decode result
    const middle = '?requestType=WADO&contentType=application/dicom&';
    const theoLinkRoot = wadoUrl + middle + '&studyUID=' + studyInstanceUID +
          '&seriesUID=' + seriesInstanceUID0;
    const theoLink = [theoLinkRoot + '&objectUID=' + sOPInstanceUID00,
      theoLinkRoot + '&objectUID=' + sOPInstanceUID01];

    assert.equal(res[0], theoLink[0], 'Read regular manifest link0');
    assert.equal(res[1], theoLink[1], 'Read regular manifest link1');
  }
);
