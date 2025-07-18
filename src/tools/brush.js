
import {logger} from '../utils/logger.js';
import {Point2D} from '../math/point.js';
import {Index} from '../math/index.js';
import {getEllipseIndices} from '../math/ellipse.js';
import {Image} from '../image/image.js';
import {Size} from '../image/size.js';
import {Geometry} from '../image/geometry.js';
import {ColourMap} from '../image/luts.js';
import {getDefaultDicomSegJson} from '../image/maskFactory.js';
import {getDwvUIDPrefix} from '../dicom/dicomParser.js';
import {getElementsFromJSONTags} from '../dicom/dicomWriter.js';
import {DicomData} from '../app/dataController.js';
import {ViewConfig} from '../app/application.js';
import {getLayerDetailsFromEvent} from '../gui/layerGroup.js';
import {ScrollWheel} from './scrollWheel.js';

// doc imports
/* eslint-disable no-unused-vars */
import {Point, Point3D} from '../math/point.js';
import {App} from '../app/application.js';
import {LayerGroup} from '../gui/layerGroup.js';
import {ViewLayer} from '../gui/viewLayer.js';
/* eslint-enable no-unused-vars */

const ERROR_MESSAGES = {
  brush: {
    noSourceDataId: 'No source data ID defined',
    noSourceDataIdAdd: 'No source data ID defined when adding mask slices',
    noSourceImage: 'No source image to get origins, ID: {0}',
    noSourceImageCreateMask: 'No source image to create mask',
    noSourceImageGetOffset: 'No source image to get offsets, ID: {0}',
    noBrushOrigins: 'No brush origins',
    noBrushColour: 'No brush colour',
    noMaskDefined: 'No mask defined when adding mask slices',
    noCreatedMaskImage: 'No created mask image',
    noMaskImage: 'No mask image for temporary draw command, ID: {0}',
    noMaskImageGetOffset: 'No mask image to get offsets from',
    noMaskImageDraw: 'No mask image for draw command, ID: {0}',
    noMaskId: 'No mask ID to apply mask index',
    noMaskImageForApply: 'No mask image for apply index, ID: {0}',
    noSegments: 'No segments have been set for a new mask',
    noMaskViewLayers: 'No mask view layers',
    noSelectedSegmentNumber: 'No selected segment number',
    tooManyMaskLayers: 'Too many mask view layers: {0}',
    moreMaskLayers: 'More mask layers than expected',
    cannotCreateMask: 'Cannot create mask with no source ID',
    cannotDisplayMask: 'Cannot display mask with no mask ID',
    cannotDrawNoMaskId: 'Cannot draw with no mask data ID',
    cannotDrawNoOffset: 'Cannot draw with no offsets',
    cannotDrawNoSegment: 'Cannot draw with no selected segment',
    cannotDrawNoColourList: 'Cannot draw with no colour list',
    cannotGetMaskLayers: 'Cannot get mask layers with no mask ID',
    cannotGetMaskVCNoMaskId: 'Cannot get mask view controller: no mask ID',
    cannotGetMaskVCNoMaskLayers:
      'Cannot get mask view controller: no mask layers',
    cannotSaveNoSourceId: 'Cannot save with no source data ID',
    cannotSaveNoMask: 'Cannot save with no mask',
    cannotFindSourceData:
      'Cannot find source data for an existing mask, ID: {0}',
    cannotFindSegment: 'Cannot find a segment for the selected number: {0}',
    unsupportedScrollIndex: 'Unsupported scroll index: {0}'
  }
};

/**
 * Format string.
 *
 * @param {*} template The template where to add values.
 * @param  {...any} values The values to add to the template.
 * @returns {string} The formated string.
 */
function formatString(template, ...values) {
  return template.replace(/{(\d+)}/g, (_match, index) => values[index] || '');
};

/**
 * Retrieves the unique div ids in the current data view configs.
 *
 * @param {object} dataViewConfigs The data view configs.
 * @returns {string[]} Array of unique div ids.
 */
function getUniqueDataViewConfigsDivIds(dataViewConfigs) {
  let allDivIds = [];
  if (!dataViewConfigs) {
    return [];
  }
  for (const key in dataViewConfigs) {
    if (dataViewConfigs[key]) {
      const viewConfigs = dataViewConfigs[key];
      if (Array.isArray(viewConfigs)) {
        const divIds = viewConfigs.map(function (config) {
          return config.divId;
        });
        allDivIds = [...allDivIds, ...divIds];
      }
    }
  }
  return [...new Set(allDivIds)];
};

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

const _MouseEventButtons = {
  left: 0,
  middle: 1,
  right: 2
};

const _BrushMode = {
  Del: 'del',
  Add: 'add'
};

/**
 * Get an array sort callback:
 * - f(a,b) > 0 -> b,a,
 * - f(a,b) < 0 -> a,b,
 * - f(a,b) = 0 -> original order.
 *
 * @param {number} direction The direction to use to compare indices.
 * @returns {object} A function that compares two Index.
 */
function getIndexCompareFunction(direction) {
  return function (a, b) {
    let result = 0;
    const va = a.get(direction);
    const vb = b.get(direction);
    if (typeof va !== 'undefined' && typeof vb !== 'undefined') {
      result = va - vb;
    }
    return result;
  };
}

/**
 * Get a dimension organisation used to index a DICOM seg.
 *
 * @returns {object} The indices and organisations.
 */
function getDimensionOrganization() {
  // 681051091011101: first 15 of charCode('DimensionOrganizationUID')
  const organizationUID = getDwvUIDPrefix() + '681051091011101.1';
  return {
    indices: {
      value: [
        {
          DimensionOrganizationUID: organizationUID,
          DimensionDescriptionLabel: 'ReferencedSegmentNumber',
          DimensionIndexPointer: '(0062,000B)',
          FunctionalGroupPointer: '(0062,000A)'
        },
        {
          DimensionOrganizationUID: organizationUID,
          DimensionDescriptionLabel: 'ImagePositionPatient',
          DimensionIndexPointer: '(0020,0032)',
          FunctionalGroupPointer: '(0020,9113)'
        }
      ]
    },
    organizations: {
      value: [
        {
          DimensionOrganizationUID: organizationUID
        }
      ]
    }
  };
}

/**
 * Get the indices that form a circle.
 * Can be an ellipse to adapt to view.
 *
 * @param {Geometry} geometry The geometry.
 * @param {Point} position The circle center.
 * @param {number[]} radiuses The circle radiuses.
 * @param {number[]} dims The 2 dimensions.
 * @returns {Index[]} The indices of the circle.
 */
function getCircleIndices(
  geometry,
  position,
  radiuses,
  dims
) {
  const centerIndex = geometry.worldToIndex(position);
  return getEllipseIndices(centerIndex, radiuses, dims);
}

/**
 * Get the range of origin indices that correspond to input new
 * mask indices.
 *
 * @param {Geometry} geometry The geometry.
 * @param {Index[]} indices An array of indices.
 * @returns {number[]} Range of indices in the input origins.
 */
function getOriginIndexRangeFromMaskIndices(geometry, indices) {
  // sort indices according to Z
  const sorted = indices.sort(getIndexCompareFunction(2));

  // lowest origin
  const z0 = sorted[0].get(2);
  if (typeof z0 === 'undefined') {
    return [];
  }
  const index0 = new Index([0, 0, z0]);
  const origin0 = geometry.indexToWorld(index0);

  // highest origin
  const z1 = sorted.at(-1).get(2);
  if (typeof z1 === 'undefined') {
    return [];
  }
  const index1 = new Index([0, 0, z1]);
  const origin1 = geometry.indexToWorld(index1);

  const origins = geometry.getOrigins();
  // threshold for distance warning
  const spacing = geometry.getSpacing().get(2);
  const threshold = 0.1 * spacing;

  // index of origin closest to lowest point
  const indexStart = origin0.get3D().getClosest(origins);
  const originStart = origins[indexStart];
  const d0 = origin0.get3D().getDistance(originStart);
  if (d0 > threshold) {
    logger.warn(
      'Large distance between origin and origin for first index: ' + d0);
  }

  // index of origin closest to highest point
  const indexEnd = origin1.get3D().getClosest(origins);
  const originEnd = origins[indexEnd];
  const d1 = origin1.get3D().getDistance(originEnd);
  if (d1 > threshold) {
    logger.warn(
      'Large distance between origin and origin for last index: ' + d1);
  }

  return [indexStart, indexEnd];
}

/**
 * Get the data offsets that correspond to input indices.
 *
 * @param {Geometry} geometry The geometry.
 * @param {Index[]} indices An array of indices.
 * @returns {number[]} An array of offsets.
 */
function getOffsetsFromIndices(geometry, indices) {
  const imageSize = geometry.getSize();
  const offsets = [];
  for (const index of indices) {
    const offset = imageSize.indexToOffset(index);
    if (offset >= 0) {
      offsets.push(offset);
    }
  }
  return offsets.sort(function compareNumbers(a, b) {
    return a - b;
  });
}

class DrawBrushCommandProperties {
  mask;
  dataId;
  offsetsLists;
  mode;
  segmentNumber;
  srclayerid;
  originalValuesLists;
  isSilent;
}
/**
 * Draw brush command.
 */
class DrawBrushCommand {
  #mask;
  #dataId;
  #offsetsLists;
  #mode;
  #segmentNumber;
  #srclayerid;
  #originalValuesLists;
  #isSilent;

  #exeType;
  #undoType;

  /**
   * @param {DrawBrushCommandProperties} properties The command properties.
   */
  constructor(properties) {
    this.#mask = properties.mask;
    this.#dataId = properties.dataId;
    this.#offsetsLists = properties.offsetsLists;
    this.#mode = properties.mode;
    this.#segmentNumber = properties.segmentNumber;
    this.#srclayerid = properties.srclayerid;

    if (typeof properties.originalValuesLists !== 'undefined') {
      this.#originalValuesLists = properties.originalValuesLists;
    }
    this.#isSilent = properties.isSilent ?? false;
    // event types
    this.#exeType = this.#mode === _BrushMode.Del ? 'brushremove' : 'brushdraw';
    this.#undoType =
      this.#exeType === 'brushdraw' ? 'brushremove' : 'brushdraw';
  }

  /**
   * Get the original values before applying brush.
   *
   * @returns {Array|undefined} Lists of original value iterators,
   *   undefined when erasing.
   */
  getOriginalValuesLists() {
    return this.#originalValuesLists;
  }

  /**
   * Get the execute event.
   *
   * @returns {CustomEvent} The event.
   */
  getExecuteEvent() {
    const segNumber =
      this.#exeType === 'brushdraw' ? this.#segmentNumber : undefined;
    return new CustomEvent(this.#exeType, {
      detail: {
        segmentnumber: segNumber,
        dataid: this.#dataId,
        srclayerid: this.#srclayerid
      }
    });
  }

  /**
   * Get the command name.
   *
   * @returns {string} The command name.
   */
  getName() {
    return 'Draw-brush';
  }

  /**
   * Execute the command.
   *
   * @fires DrawBrushCommand#brushdraw
   */
  execute() {
    if (typeof this.#segmentNumber === 'undefined') {
      return;
    }

    let segNumber = this.#segmentNumber;
    if (this.#exeType === 'brushremove') {
      segNumber = 0;
    }

    // draw
    if (typeof this.#originalValuesLists === 'undefined') {
      this.#originalValuesLists = this.#mask.setAtOffsetsAndGetOriginals(
        this.#offsetsLists,
        segNumber
      );
    } else {
      this.#mask.setAtOffsetsWithIterator(this.#offsetsLists, segNumber);
    }

    // callback
    if (!this.#isSilent) {
      /**
       * Draw create event.
       *
       * @event DrawBrushCommand#brushdraw
       * @type {object}
       * @property {number} id The id of the created brush.
       */
      this.onExecute(this.getExecuteEvent());
    }
  }

  /**
   * Undo the command.
   *
   * @fires DrawBrushCommand#brushremove
   */
  undo() {
    if (typeof this.#originalValuesLists === 'undefined') {
      this.#originalValuesLists = this.#mask.setAtOffsetsAndGetOriginals(
        this.#offsetsLists,
        0
      );
    } else {
      this.#mask.setAtOffsetsWithIterator(
        this.#offsetsLists, this.#originalValuesLists);
    }

    // callback
    const number =
      this.#undoType === 'brushdraw' ? this.#segmentNumber : undefined;
    const undoEvent = new CustomEvent(this.#undoType, {
      detail: {
        segmentnumber: number,
        dataid: this.#dataId,
        srclayerid: this.#srclayerid
      }
    });
    this.onUndo(undoEvent);
  }

  /**
   * Handle an execute event.
   *
   * @param {CustomEvent} _event The execute event with type and id.
   */
  onExecute(_event) {
    // default does nothing.
  }

  /**
   * Handle an undo event.
   *
   * @param {CustomEvent} _event The undo event with type and id.
   */
  onUndo(_event) {
    // default does nothing.
  }
} // DrawBrushCommand class

/**
 * Brush class.
 */
export class Brush extends EventTarget {
  #app;

  /**
   * Scroll wheel handler.
   *
   * @type {ScrollWheel}
   */
  #scrollWhell;

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    super();
    this.#app = app;
    this.#scrollWhell = new ScrollWheel(app);
  }

  /**
   * Interaction start flag.
   *
   * @type {boolean}
   */
  #started = false;

  /**
   * Mask image.
   *
   * @type {Image}
   */
  #mask;

  /**
   * Mask data index.
   *
   * @type {string}
   */
  #maskDataId;

  /**
   * The brush size.
   *
   * @type {number}
   */
  #brushSize = 10;

  /**
   * The brush size range.
   *
   * @type {object}
   */
  #brushSizeRange = {min: 1, max: 20};

  /**
   * The brush mode: 'add' or 'del'.
   *
   * @type {string}
   */
  #brushMode = _BrushMode.Del;

  /**
   * The selected segment number.
   *
   * @type {number}
   */
  #selectedSegmentNumber;

  /**
   * UID counter.
   *
   * @type {number}
   */
  #uid = 0;

  /**
   * Current layer group.
   *
   * @type {LayerGroup}
   */
  #currentLayerGroup;

  /**
   * Interaction start point.
   *
   * @type {Point2D}
   */
  #startPoint;

  // temporary variables
  #tmpOffsetsLists;
  #tmpOriginalValuesLists;

  /**
   * Black list: series instance uid list
   * for which brush segmentation creation
   * is forbidden.
   *
   * @type {string[]}
   */
  #blacklist = [];

  /**
   * Get a mask slice.
   *
   * @param {Geometry} geometry The mask geometry.
   * @param {Point3D} origin The slice origin.
   * @param {object} meta The mask meta.
   * @returns {Image} The slice.
   */
  #createMaskImage(geometry, origin, meta) {
    // create data
    const sizeValues = geometry.getSize().getValues();
    sizeValues[2] = 1;
    const maskSize = new Size(sizeValues);
    const maskGeometry = new Geometry(
      [origin],
      maskSize,
      geometry.getSpacing(),
      geometry.getOrientation()
    );
    const values = new Uint8Array(maskSize.getDimSize(2));
    values.fill(0);
    ++this.#uid;
    const uids = [this.#uid.toString()];
    const maskSlice = new Image(maskGeometry, values, uids);
    maskSlice.setMeta(meta);
    maskSlice.setPhotometricInterpretation('PALETTE COLOR');
    maskSlice.setPaletteColourMap(new ColourMap([0], [0], [0]));

    return maskSlice;
  }

  /**
   * Add slices to mask if needed.
   *
   * @param {Geometry} sourceGeometry The source geometry.
   * @param {Geometry} maskGeometry The mask geometry.
   * @param {Point} position The circle center.
   * @param {number[]} circleDims The circle dimensions.
   * @param {number[]} radiuses The circle radiuses.
   * @param {object} sliceMeta The slice meta.
   */
  #addMaskSlices(
    sourceGeometry,
    maskGeometry,
    position,
    circleDims,
    radiuses,
    sliceMeta
  ) {
    // circle indices in the image geometry
    const circleIndices = getCircleIndices(
      sourceGeometry,
      position,
      radiuses,
      circleDims
    );
    // origin index range represented by the circle indicies
    const newOrigIndexRange = getOriginIndexRangeFromMaskIndices(
      sourceGeometry,
      circleIndices
    );
    if (typeof newOrigIndexRange === 'undefined' ||
      newOrigIndexRange.length === 0) {
      throw new Error(ERROR_MESSAGES.brush.noBrushOrigins);
    }

    const sourceOrigins = sourceGeometry.getOrigins();
    const maskOrigins = maskGeometry.getOrigins();

    // min and max mask origin closest source origin indices
    const maskOrigIndexStart = maskOrigins[0].getClosest(sourceOrigins);
    const maskOrigIndexEnd = maskOrigins.at(-1).getClosest(sourceOrigins);

    // index in source origin array of slices to add
    const indicesToAdd = [];

    // first index compare
    // (go from closest to mask to avoid variable spacing warning
    //  when appending image slices)
    if (newOrigIndexRange[0] < maskOrigIndexStart) {
      for (
        let index = maskOrigIndexStart - 1;
        index >= newOrigIndexRange[0];
        --index
      ) {
        indicesToAdd.push(index);
      }
    }
    // last index compare
    if (newOrigIndexRange[1] > maskOrigIndexEnd) {
      for (
        let index = maskOrigIndexEnd + 1;
        index <= newOrigIndexRange[1];
        ++index
      ) {
        indicesToAdd.push(index);
      }
    }

    // convert index to origin
    const originsToAdd = [];
    for (const index of indicesToAdd) {
      originsToAdd.push(sourceOrigins[index]);
    }

    // append slices
    if (typeof this.#mask === 'undefined') {
      throw new Error(ERROR_MESSAGES.brush.noMaskDefined);
    }
    const tags = this.#mask.getMeta();
    for (const element of originsToAdd) {
      tags.numberOfFiles += 1;
      this.#mask.appendSlice(
        this.#createMaskImage(maskGeometry, element, sliceMeta));
    }
  }

  /**
   * Paint the mask at the given offsets.
   *
   * @param {Array} offsets The mask offsets.
   */
  #paintMaskAtOffsets(offsets) {
    const maskVl = this.#getMaskViewLayer();
    const srclayerid = maskVl.getId();

    // get mask image
    if (typeof this.#maskDataId === 'undefined') {
      throw new Error(ERROR_MESSAGES.brush.noMaskId);
    }
    const maskData = this.#app.getData(this.#maskDataId);
    if (!maskData) {
      throw new Error(
        formatString(ERROR_MESSAGES.brush.noMaskImage, this.#maskDataId));
    }

    // temporary command
    const props = new DrawBrushCommandProperties();
    props.mask = maskData.image;
    props.dataId = this.#maskDataId;
    props.offsetsLists = [offsets];
    props.mode = this.#brushMode;
    props.segmentNumber = this.#selectedSegmentNumber;
    props.srclayerid = srclayerid;
    const command = new DrawBrushCommand(props);
    command.execute();

    // store offsets and colours for final command
    this.#tmpOffsetsLists.push(offsets);
    // only one element in original colours
    const originalValues = command.getOriginalValuesLists();
    if (typeof originalValues !== 'undefined') {
      this.#tmpOriginalValuesLists.push(originalValues[0]);
    }
  }

  /**
   * Create the mask.
   *
   * @param {Point} position The first slice position.
   * @param {Image} sourceImage The source image.
   * @returns {string} The mask data id.
   */
  #createMask(position, sourceImage) {
    // check souce image
    if (!sourceImage) {
      throw new Error(
        formatString(ERROR_MESSAGES.brush.noSourceImageCreateMask));
    }
    const sourceGeometry = sourceImage.getGeometry();

    const imgK = sourceGeometry.worldToIndex(position).get(2);
    if (typeof imgK === 'undefined') {
      throw new Error('Z position is undefined');
    }
    const index = new Index([0, 0, imgK]);

    // default tags
    const firstSliceMeta = getDefaultDicomSegJson();
    // dicom seg dimension
    const dimension = getDimensionOrganization();
    firstSliceMeta.DimensionOrganizationSequence = dimension.organizations;
    firstSliceMeta.DimensionIndexSequence = dimension.indices;
    // local
    firstSliceMeta.PixelRepresentation = 0;
    firstSliceMeta.numberOfFiles = 1;

    const tags = sourceImage.getMeta();

    firstSliceMeta.PatientID = tags.PatientID;
    firstSliceMeta.StudyInstanceUID = tags.StudyInstanceUID;
    firstSliceMeta.SeriesInstanceUID = tags.SeriesInstanceUID;
    const referencedSOPs = [
      {
        referencedSOPClassUID: tags.SOPClassUID,
        referencedSOPInstanceUID: sourceImage.getImageUid(index)
      }
    ];
    const referenceSeriesTag = [];
    referenceSeriesTag.push({
      ReferencedInstanceSequence: {
        value: referencedSOPs
      },
      SeriesInstanceUID: tags.SeriesInstanceUID
    });
    firstSliceMeta.ReferencedSeriesSequence = {
      value: referenceSeriesTag
    };
    firstSliceMeta.custom = {
      frameInfos: [
        {
          dimIndex: [1, 1],
          refSegmentNumber: 1,
          imagePosPat: tags.ImageOrientationPatient,
          derivationImages: [
            {
              sourceImages: referencedSOPs
            }
          ]
        }
      ]
    };

    // get length unit from ref image
    firstSliceMeta.lengthUnit = sourceImage.getMeta().lengthUnit;

    this.#mask = this.#createMaskImage(
      sourceGeometry,
      sourceGeometry.getOrigins()[imgK],
      firstSliceMeta
    );

    // fires load events and renders data
    // (will create viewLayer for it)
    const elements = getElementsFromJSONTags(firstSliceMeta);
    const data = new DicomData(elements);
    data.image = this.#mask;
    return this.#app.addData(data);
  }

  /**
   * Get the orientation of the first data view config of the input
   * divId.
   *
   * @param {string} divId The divId.
   * @returns {string} The orientation.
   */
  #getDataViewConfigOrientation(divId) {
    const dataConfigs = this.#app.getDataViewConfigs();
    let orient;
    for (const key in dataConfigs) {
      const config = dataConfigs[key].find(function (item) {
        return item.divId === divId;
      });
      if (typeof config !== 'undefined') {
        orient = config.orientation;
        break;
      }
    }
    return orient;
  }

  /**
   * Display a newly created mask.
   *
   * @param {string} divId The div id where to display the mask.
   */
  #displayMask(divId) {
    // check mask data id
    if (typeof this.#maskDataId === 'undefined') {
      throw new Error(ERROR_MESSAGES.brush.cannotDisplayMask);
    }
    const viewConfig = new ViewConfig(divId);
    viewConfig.orientation = this.#getDataViewConfigOrientation(divId);
    this.#app.addDataViewConfig(this.#maskDataId, viewConfig);
    this.#app.render(this.#maskDataId);
  }

  /**
   * Get the first referenced UID of a mask image.
   *
   * @param {object} meta The mask image meta.
   * @returns {string|undefined} The UID.
   */
  #getReferenceDataUID(meta) {
    let dataUid;
    const customMeta = meta.custom;
    const frameInfos = customMeta.frameInfos;
    if (frameInfos.length === 0) {
      return dataUid;
    }
    // DerivationImageSequence (0008,9124)
    const derivationImages = frameInfos[0].derivationImages;
    if (typeof derivationImages === 'undefined') {
      return dataUid;
    }
    if (derivationImages.length === 0) {
      return dataUid;
    }
    // SourceImageSequence (0008,2112)
    const sourceImages = derivationImages[0].sourceImages;
    if (typeof sourceImages === 'undefined') {
      return dataUid;
    }
    if (sourceImages.length === 0) {
      return;
    }
    // ReferencedSOPInstanceUID (0008,1155)
    return sourceImages[0].referencedSOPInstanceUID;
  }

  /**
   * Get the source data id from the mask image meta.
   *
   * @param {Image} mask The mask image.
   * @returns {string} The source data id.
   */
  #getSourceDataIdFromMask(mask) {
    // get source id from mask meta
    const meta = mask.getMeta();
    const sourceDataUID = this.#getReferenceDataUID(meta);
    // search app for the data ID of this SOPInstanceUID...
    let ids = [];
    if (sourceDataUID !== 'undefined') {
      ids = this.#app.getDataIdsFromSopUids([sourceDataUID]);
    }
    let sourceDataId = '0';
    if (ids.length > 0) {
      sourceDataId = ids[0];
    } else {
      // mask with no source data...
      logger.warn(
        formatString(ERROR_MESSAGES.brush.cannotFindSourceData, sourceDataUID));
    }
    return sourceDataId;
  }

  /**
   * Get the mask view layer.
   *
   * @param {LayerGroup} layerGroup The layer group to search.
   * @returns {ViewLayer} The view layer.
   */
  #getLayerGroupMaskViewLayer(layerGroup) {
    // check mask data id
    if (typeof this.#maskDataId === 'undefined') {
      throw new Error(ERROR_MESSAGES.brush.cannotGetMaskLayers);
    }

    const maskViewLayers = layerGroup.getViewLayersByDataId(
      this.#maskDataId
    );
    if (maskViewLayers.length === 0) {
      throw new Error(ERROR_MESSAGES.brush.noMaskViewLayers);
    }
    if (maskViewLayers.length !== 1) {
      logger.warn(
        formatString(
          ERROR_MESSAGES.brush.tooManyMaskLayers, maskViewLayers.length)
      );
    }
    return maskViewLayers[0];
  }

  /**
   * Get the mask image.
   *
   * @param {string} maskDataId The mask data id.
   * @returns {Image} The image.
   */
  #getMaskImage(maskDataId) {
    if (typeof maskDataId === 'undefined') {
      throw new Error(ERROR_MESSAGES.brush.noMaskId);
    }
    const maskData = this.#app.getData(maskDataId);
    if (typeof maskData === 'undefined') {
      throw new Error(ERROR_MESSAGES.brush.noMaskImageGetOffset);
    }
    return maskData.image;
  }

  /**
   * Get the mask offset for an event.
   *
   * @param {object} event The event containing the mask position.
   * @returns {Array} The array of offset to paint.
   */
  #getMaskOffsets(event) {
    const layerDetails = getLayerDetailsFromEvent(event);
    const mousePoint = new Point2D(event.offsetX, event.offsetY);
    const layerGroup = this.#app.getLayerGroupByDivId(
      layerDetails.groupDivId
    );
    if (typeof layerGroup === 'undefined') {
      throw new Error('No layergroup to get mask offsets');
    }
    this.#currentLayerGroup = layerGroup;

    let viewLayer;
    if (typeof this.#maskDataId === 'undefined') {
      viewLayer = layerGroup.getBaseViewLayer();
    } else {
      viewLayer = layerGroup.getViewLayersByDataId(this.#maskDataId)[0];
    }
    if (typeof viewLayer === 'undefined') {
      return [];
    }
    const viewController = viewLayer.getViewController();
    const savedPosition = viewController.getCurrentPosition();

    const searchMaskMeta = {
      Modality: 'SEG'
    };

    // update existing mask from current vl or create a new one
    let maskVl;
    let maskVc;
    let sourcePosition;
    let sourceImage;
    if (viewController.equalImageMeta(searchMaskMeta)) {
      this.#mask = this.#getMaskImage(this.#maskDataId);
      // get source image
      const sourceDataId = this.#getSourceDataIdFromMask(this.#mask);
      const sourceData = this.#app.getData(sourceDataId);
      if (!sourceData) {
        throw new Error(formatString(
          ERROR_MESSAGES.brush.noSourceImageGetOffset, sourceDataId
        ));
      }
      sourceImage = sourceData.image;
      //
      const sourceVl = layerGroup.getViewLayersByDataId(sourceDataId)[0];
      const sourceViewController = sourceVl.getViewController();
      const planePos = sourceVl.displayToPlanePos(mousePoint);
      sourcePosition = sourceViewController.getPositionFromPlanePoint(planePos);
      // update locals
      maskVl = viewLayer;
      maskVc = viewController;
    } else {
      // view layer is source
      const sourceDataId = viewLayer.getDataId();
      const sourceData = this.#app.getData(sourceDataId);
      if (!sourceData) {
        throw new Error(formatString(
          ERROR_MESSAGES.brush.noSourceImageGetOffset, sourceDataId
        ));
      }
      sourceImage = sourceData.image;

      const planePos = viewLayer.displayToPlanePos(mousePoint);
      sourcePosition = viewController.getPositionFromPlanePoint(planePos);
      // create mask (sets this.#mask)
      this.#maskDataId = this.#createMask(savedPosition, sourceImage);
      // check
      if (typeof this.#mask === 'undefined') {
        throw new Error(ERROR_MESSAGES.brush.noCreatedMaskImage);
      }
      // display mask
      const divId = layerGroup.getDivId();
      const layerGroupHasDiv = typeof divId !== 'undefined';
      if (layerGroupHasDiv) {
        this.#displayMask(divId);
      }
      // newly create mask case: find the SEG view layer
      maskVl = this.#getLayerGroupMaskViewLayer(layerGroup);
      maskVc = maskVl.getViewController();

      if (layerGroupHasDiv) {
        // this.#displayMask causes the position to get reset,
        // so we have to restore it or we may not be drawing on
        // the correct slice.
        maskVc.setCurrentPosition(savedPosition);
      }
    }

    const sourceGeometry = sourceImage.getGeometry();
    const sliceMeta = this.#mask.getMeta();
    const maskGeometry = this.#mask.getGeometry();

    const spacing2D = viewController.get2DSpacing();
    const rx = Math.round(this.#brushSize / spacing2D.x);
    const ry = Math.round(this.#brushSize / spacing2D.y);
    const radiuses = [rx, ry];

    let circleDims;
    const scrollIndex = viewController.getScrollDimIndex();
    switch (scrollIndex) {
      case 0: {
        circleDims = [1, 2];
        break;
      }
      case 1: {
        circleDims = [0, 2];
        break;
      }
      case 2: {
        circleDims = [0, 1];
        break;
      }
      default: {
        throw new Error(
          formatString(ERROR_MESSAGES.brush.unsupportedScrollIndex, scrollIndex)
        );
      }
    }

    this.#addMaskSlices(
      sourceGeometry,
      maskGeometry,
      sourcePosition,
      circleDims,
      radiuses,
      sliceMeta
    );

    // circle indices in the mask geometry
    const maskPlanePos = maskVl.displayToPlanePos(mousePoint);
    const maskPosition = maskVc.getPositionFromPlanePoint(maskPlanePos);
    const maskCircleIndices = getCircleIndices(
      maskGeometry,
      maskPosition,
      radiuses,
      circleDims
    );

    return getOffsetsFromIndices(maskGeometry, maskCircleIndices);
  }

  /**
   * Determines if the event is over a series inside the blacklist.
   *
   * @param {MouseEvent} event The mouse down event.
   * @returns {boolean} True if in black list.
   */
  #isInBlackList(event) {
    const layerDetails = getLayerDetailsFromEvent(event);
    const layerGroup = this.#app.getLayerGroupByDivId(
      layerDetails.groupDivId
    );
    if (typeof layerGroup === 'undefined') {
      throw new Error('No layergroup to check black list');
    }
    const drawLayer = layerGroup.getActiveDrawLayer();

    if (typeof drawLayer === 'undefined') {
      const viewLayer = layerGroup.getActiveViewLayer();
      const referenceDataId = viewLayer.getDataId();
      const referenceData = this.#app.getData(referenceDataId);
      const referenceMeta = referenceData.image.getMeta();
      const seriesInstanceUID = referenceMeta.SeriesInstanceUID;
      // check black list
      if (this.#blacklist.includes(seriesInstanceUID)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Chack if the base image is resampled.
   *
   * @param {MouseEvent} event The mouse down event.
   * @returns {boolean} True if the image is resampled.
   */
  #isResampled(event) {
    const layerDetails = getLayerDetailsFromEvent(event);
    const layerGroup = this.#app.getLayerGroupByDivId(
      layerDetails.groupDivId
    );
    const viewLayer = layerGroup.getBaseViewLayer();
    const referenceDataId = viewLayer.getDataId();
    const referenceData = this.#app.getData(referenceDataId);
    const image = referenceData.image;

    return image.isResampled();
  }

  /**
   * Handle mouse down event.
   *
   * @param {MouseEvent} event The mouse down event.
   */
  mousedown = (event) => {
    if (this.#isInBlackList(event) || this.#isResampled(event)) {
      return;
    }
    if (typeof this.#selectedSegmentNumber === 'undefined') {
      logger.warn(ERROR_MESSAGES.brush.noSelectedSegmentNumber);
      return;
    }

    // start flag
    this.#started = true;
    // first position
    this.#startPoint = new Point2D(event.offsetX, event.offsetY);

    // reset tmp vars
    this.#tmpOffsetsLists = [];
    this.#tmpOriginalValuesLists = [];

    // check right button
    this.#setEraserOnRightMousedown(event);
    // paint
    const offsets = this.#getMaskOffsets(event);
    if (offsets.length > 0) {
      this.#paintMaskAtOffsets(offsets);
    } else {
      // reset flag
      this.#started = false;
      this.#removeEraserOnRightMousedown(event);
    }
  };

  /**
   * Checks if the mouse down event has been done with right click
   * and if true, set erasing mode to the brush color.
   *
   * @param {MouseEvent} event The mouse event.
   */
  #setEraserOnRightMousedown(event) {
    if (event.button === _MouseEventButtons.right) {
      this.#brushMode = _BrushMode.Del;
      const activateErasingEvent = new CustomEvent('erasingactivated');
      this.dispatchEvent(activateErasingEvent);
    }
  }

  /**
   * Checks if the mouse down event has been done with right click
   * and if true, removes erasing mode from the brush color.
   *
   * @param {MouseEvent} event The mouse event.
   */
  #removeEraserOnRightMousedown(event) {
    if (event.button === _MouseEventButtons.right) {
      this.#brushMode = _BrushMode.Add;
      const deactivateErasingEvent = new CustomEvent('erasingdeactivated');
      this.dispatchEvent(deactivateErasingEvent);
    }
  }

  /**
   * Handle mouse move event.
   *
   * @param {object} event The mouse move event.
   */
  mousemove = (event) => {
    if (!this.#started) {
      return;
    }
    if (typeof this.#startPoint === 'undefined') {
      return;
    }
    const mousePoint = new Point2D(event.offsetX, event.offsetY);
    const diffX = Math.abs(mousePoint.getX() - this.#startPoint.getX());
    const diffY = Math.abs(mousePoint.getY() - this.#startPoint.getY());
    if (diffX > this.#brushSize / 2 || diffY > this.#brushSize / 2) {
      const offsets = this.#getMaskOffsets(event);
      if (offsets.length > 0) {
        this.#paintMaskAtOffsets(offsets);
      }
      this.#startPoint = mousePoint;
    }
  };

  /**
   * Handle mouse up event.
   *
   * @param {MouseEvent} _event The mouse up event.
   */
  mouseup = (_event) => {
    if (this.#started) {
      this.#started = false;
      this.#removeEraserOnRightMousedown(_event);

      if (typeof this.#maskDataId === 'undefined') {
        throw new Error(ERROR_MESSAGES.brush.cannotDrawNoMaskId);
      }
      if (typeof this.#tmpOffsetsLists === 'undefined') {
        throw new Error(ERROR_MESSAGES.brush.cannotDrawNoOffset);
      }
      if (typeof this.#tmpOriginalValuesLists === 'undefined') {
        throw new Error(ERROR_MESSAGES.brush.cannotDrawNoColourList);
      }

      // reverse lists for command to respect original colours
      this.#tmpOffsetsLists.reverse();
      this.#tmpOriginalValuesLists.reverse();
      const maskVl = this.#getMaskViewLayer();
      const srclayerid = maskVl.getId();

      // full draw from mouse down to up
      const maskData = this.#app.getData(this.#maskDataId);
      if (!maskData) {
        throw new Error(
          formatString(ERROR_MESSAGES.brush.noMaskImageDraw, this.#maskDataId)
        );
      }
      const props = new DrawBrushCommandProperties();
      props.mask = maskData.image;
      props.dataId = this.#maskDataId;
      props.offsetsLists = this.#tmpOffsetsLists;
      props.mode = this.#brushMode;
      props.segmentNumber = this.#selectedSegmentNumber;
      props.srclayerid = srclayerid;
      props.originalValuesLists = this.#tmpOriginalValuesLists;
      const command = new DrawBrushCommand(props);
      command.onExecute = (event) => {
        this.dispatchEvent(event);
      };
      command.onUndo = (event) => {
        this.dispatchEvent(event);
        this.#mask.recalculateLabels();
      };

      // save command in undo stack
      this.#app.addToUndoStack(command);
      // fire event
      this.dispatchEvent(command.getExecuteEvent());
      this.#mask.recalculateLabels();
    }
  };

  /**
   * Handle mouse out event.
   *
   * @param {object} event The mouse out event.
   */
  mouseout = (event) => {
    this.mouseup(event);
  };

  /**
   * Handle touch start event.
   *
   * @param {object} event The touch start event.
   */
  touchstart = (event) => {
    // call mouse equivalent
    this.mousedown(event);
  };

  /**
   * Handle touch move event.
   *
   * @param {object} event The touch move event.
   */
  touchmove = (event) => {
    // call mouse equivalent
    this.mousemove(event);
  };

  /**
   * Handle touch end event.
   *
   * @param {object} event The touch end event.
   */
  touchend = (event) => {
    // call mouse equivalent
    this.mouseup(event);
  };

  /**
   * Handle mouse wheel event.
   *
   * @param {WheelEvent} event The mouse wheel event.
   */
  wheel = (event) => {
    this.#scrollWhell.wheel(event);
  };

  /**
   * Get the mask view layer.
   *
   * @returns {ViewLayer} The mask view layer.
   */
  #getMaskViewLayer() {
    if (typeof this.#maskDataId === 'undefined') {
      throw new Error(ERROR_MESSAGES.brush.cannotGetMaskVCNoMaskId);
    }
    if (typeof this.#currentLayerGroup === 'undefined') {
      throw new Error('No current layer group');
    }

    const maskLayers = this.#currentLayerGroup.getViewLayersByDataId(
      this.#maskDataId
    );
    if (maskLayers.length === 0) {
      throw new Error(ERROR_MESSAGES.brush.cannotGetMaskVCNoMaskLayers);
    }
    if (maskLayers.length !== 1) {
      logger.warn(ERROR_MESSAGES.brush.moreMaskLayers);
    }
    return maskLayers[0];
  }

  /**
   * Handle key down event.
   *
   * @param {object} event The key down event.
   */
  keydown = (event) => {
    event.context = 'Brush';
    this.#app.onKeydown(event);

    const ctrlOrAlt = event.ctrlKey || event.altKey;

    if (
      !ctrlOrAlt &&
      event.key === '+' &&
      this.#brushSize + 1 < this.#brushSizeRange.max
    ) {
      this.#brushSize += 1;
      logger.debug('Brush size: ' + this.#brushSize);
    } else if (
      !ctrlOrAlt &&
      event.key === '-' &&
      this.#brushSize - 1 >= this.#brushSizeRange.min
    ) {
      this.#brushSize -= 1;
      logger.debug('Brush size: ' + this.#brushSize);
    } else if (!ctrlOrAlt && !Number.isNaN(Number.parseInt(event.key, 10))) {
      this.#brushMode = _BrushMode.Add;
      //const number = Number.parseInt(event.key, 10);
      //this.#setSelectedSegment2(number);
    } else if (!ctrlOrAlt && event.key === 'a') {
      this.#brushMode = _BrushMode.Add;
      logger.debug('Brush mode: ' + this.#brushMode);
    } else if (!ctrlOrAlt && event.key === 'd') {
      this.#brushMode = _BrushMode.Del;
      logger.debug('Brush mode: ' + this.#brushMode);
    }
  };

  /**
   * Activate the tool and activates/deactivates
   * the context menu of all dwv div ids.
   *
   * @param {boolean} bool The flag to activate or not.
   */
  activate(bool) {
    const viewConfigs = this.#app.getDataViewConfigs();
    const allDivIds = getUniqueDataViewConfigsDivIds(viewConfigs);
    if (bool) {
      this.#deactivateDivIdsContextMenu(allDivIds);
      return;
    }
    this.#reactivateDivIdsContextMenu(allDivIds);
  }

  /**
   * Deactivates the context menu on all dwv div ids.
   *
   * @param {string[]} divIds The div ids whose context menu
   *   should be deactivated.
   */
  #deactivateDivIdsContextMenu(divIds) {
    for (const divId of divIds) {
      const element = document.querySelector('#' + divId);
      if (!element) {
        return;
      }
      element.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        event.stopPropagation();
      });
    }
  }

  /**
   * Reactivates the context menu on all dwv div ids.
   *
   * @param {string[]} divIds The div ids whose context menu
   *   should be reactivated.
   */
  #reactivateDivIdsContextMenu(divIds) {
    for (const divId of divIds) {
      const element = document.querySelector('#' + divId);
      if (!element) {
        return;
      }
      element.addEventListener('contextmenu', (_event) => {
        // Intentionally empty
      });
    }
  }

  /**
   * Set the tool live features.
   * See the documentation of the class members for details.
   *
   * @param {object} features The list of features.
   */
  setFeatures(features) {
    if (typeof features.brushSizeRange !== 'undefined') {
      this.#brushSizeRange = features.brushSizeRange;
    }
    if (
      typeof features.brushSize !== 'undefined' &&
      features.brushSize >= this.#brushSizeRange.min &&
      features.brushSize < this.#brushSizeRange.max
    ) {
      this.#brushSize = features.brushSize;
    }

    if (typeof features.brushMode !== 'undefined') {
      this.#brushMode = features.brushMode;
    }

    // createMask is needed since not all properties are always needed,
    // maskDataId could be undefined for example when
    // just changing the brushSize
    if (features.createMask) {
      this.#maskDataId = undefined;
    } else if (typeof features.maskDataId !== 'undefined') {
      this.#maskDataId = features.maskDataId;
    }

    // used in draw events
    if (typeof features.selectedSegmentNumber !== 'undefined') {
      this.#selectedSegmentNumber = features.selectedSegmentNumber;
    }

    if (typeof features.blacklist !== 'undefined') {
      this.#blacklist = features.blacklist;
    }
  }

  /**
   * Initialise the tool.
   */
  init() {
    // does nothing
  }

  /**
   * Get the list of event names that this tool can fire.
   *
   * @returns {Array} The list of event names.
   */
  getEventNames() {
    return [
      'brushdraw',
      'brushremove',
      'erasingactivated',
      'erasingdeactivated'
    ];
  }

  /**
   * Help for this tool.
   *
   * @returns {object} The help content.
   */
  getHelpKeys() {
    return {
      title: 'tool.Brush.name',
      brief: 'tool.Brush.brief',
      mouse: {
        mouse_click: 'tool.Brush.mouse_click'
      },
      touch: {
        touch_click: 'tool.Brush.touch_click'
      }
    };
  }
} // Brush class
