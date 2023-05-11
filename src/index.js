import {
  getDwvVersion,
  getTypedArray,
  getOrientationName,
  DicomParser
} from './dicom/dicomParser';
import {
  getUID,
  getElementsFromJSONTags,
  DicomWriter
} from './dicom/dicomWriter';
import {TagValueExtractor} from './dicom/dicomElementsWrapper';
import {dictionary} from './dicom/dictionary';
import {getPixelDataTag} from './dicom/dicomTag';
import {App} from './app/application';
import {loadFromUri} from './utils/uri';
import {precisionRound} from './utils/string';
import {Point} from './math/point';
import {decoderScripts} from './image/decoder';
import {lut} from './image/luts';
import {buildMultipart} from './utils/array';
import {logger} from './utils/logger';
import {customUI} from './gui/generic';
import {defaultPresets} from './image/windowLevel';

const dicom = {
  getUID,
  getElementsFromJSONTags,
  getTypedArray,
  getPixelDataTag,
  getOrientationName,
  dictionary,
  TagValueExtractor,
  DicomParser,
  DicomWriter
};
const gui = {
  customUI
};
const image = {
  decoderScripts,
  lut
};
const math = {
  Point
};
const tools = {
  defaultPresets
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
  tools,
  utils
};
