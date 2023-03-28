import {
  getDwvVersion,
  getTypedArray,
  DicomParser
} from './dicom/dicomParser.js';
import {
  getUID,
  getElementsFromJSONTags,
  DicomWriter
} from './dicom/dicomWriter';
import {DicomDictionary} from './dicom/dictionary';
import {getPixelDataTag} from './dicom/dicomTag';
import {App} from './app/application';
import {loadFromUri} from './utils/uri';
import {precisionRound} from './utils/string';
import {Point} from './math/point';
import {decoderScripts} from './image/decoder';
import {ColourMaps} from './image/luts';
import {buildMultipart} from './utils/array';
import {logger} from './utils/logger';
import {CustomUI} from './gui/generic';

const dicom = {
  getUID,
  getElementsFromJSONTags,
  getTypedArray,
  getPixelDataTag,
  DicomDictionary,
  DicomParser,
  DicomWriter
};
const gui = {
  CustomUI
};
const image = {
  decoderScripts,
  ColourMaps
};
const math = {
  Point
};
const utils = {
  loadFromUri,
  precisionRound,
  buildMultipart
};

export {
  getDwvVersion,
  logger,
  App,
  dicom,
  gui,
  image,
  math,
  utils
};
