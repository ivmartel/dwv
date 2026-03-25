import {BooleanResult} from './result.js';
import {
  RGB,
  rgbToHex,
  hexToRgb,
  isEqualRgb,
  labToUintLab,
  srgbToCielab
} from './colour.js';
import {i18n} from './i18n.js';
import {logger} from './logger.js';
import {buildMultipart} from './array.js';
import {
  getURLsFromKeyValueUri,
  handleURLsFromWeasisXMLManifest
} from './uri.js';
import {precisionRound} from './string.js';

export {
  BooleanResult,
  RGB,
  i18n,
  logger,
  buildMultipart,
  hexToRgb,
  isEqualRgb,
  labToUintLab,
  getURLsFromKeyValueUri,
  handleURLsFromWeasisXMLManifest,
  precisionRound,
  rgbToHex,
  srgbToCielab
};