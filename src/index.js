import {
  getDwvVersion,
  DicomParser
} from './dicom/dicomParser.js';
import {DicomWriter} from './dicom/dicomWriter';
import {App} from './app/application';
import {loadFromUri} from './utils/uri';
import {precisionRound} from './utils/string';
import {Point} from './math/point';
import {decoderScripts} from './image/decoder';
import {buildMultipart} from './utils/array';
import {logger} from './utils/logger';

const dicom = {
  DicomParser,
  DicomWriter
};
const image = {
  decoderScripts
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
  image,
  math,
  utils
};
