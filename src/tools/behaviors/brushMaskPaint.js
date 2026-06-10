import {logger} from '../../utils/logger.js';
import {Index} from '../../math/index.js';
import {getEllipseIndices} from '../../math/ellipse.js';
import {Image} from '../../image/image.js';
import {Size} from '../../image/size.js';
import {Geometry} from '../../image/geometry.js';
import {ColourMap} from '../../image/luts.js';
import {getDefaultDicomSegJson} from '../../image/maskFactory.js';
import {getDwvUIDPrefix} from '../../dicom/dicomParser.js';
import {getElementsFromJSONTags} from '../../dicom/dicomWriter.js';
import {DicomData} from '../../app/dataController.js';
import {ViewConfig} from '../../app/application.js';
import {
  DrawBrushCommandProperties,
  DrawBrushCommand
} from '../../command/drawBrushCommand.js';
import {ERROR_MESSAGES, formatString} from './brushPaintMessages.js';

/**
 * @import {App} from '../../app/application.js';
 * @import {LayerGroup} from '../../gui/layerGroup.js';
 * @import {Point, Point3D, Point2D} from '../../math/point.js';
 * @import {ViewLayer} from '../../gui/viewLayer.js';
 */

export const BrushMode = {
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
  const organizationUID = `${getDwvUIDPrefix()}681051091011101.1`;
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
      `Large distance between origin and origin for first index: ${d0}`);
  }

  // index of origin closest to highest point
  const indexEnd = origin1.get3D().getClosest(origins);
  const originEnd = origins[indexEnd];
  const d1 = origin1.get3D().getDistance(originEnd);
  if (d1 > threshold) {
    logger.warn(
      `Large distance between origin and origin for last index: ${d1}`);
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

/**
 * Mask offset computation and dab painting (moved from {@link Brush}).
 */
export class BrushMaskPaint extends EventTarget {

  /**
   * @type {App}
   */
  #app;

  /**
   * Brush size in display pixels (set via {@link BrushMaskPaint#setFeatures}).
   *
   * @type {number}
   */
  #brushSize = 10;

  /**
   * Allowed brush sizes satisfy `min <= size < max` (legacy UI convention).
   *
   * @type {{ min: number, max: number }}
   */
  #brushSizeRange = {min: 1, max: 20};

  /**
   * Add vs delete painting mode (set via {@link BrushMaskPaint#setFeatures}).
   *
   * @type {string}
   */
  #brushMode = 'del';

  /**
   * Active DICOM segment index (set via {@link BrushMaskPaint#setFeatures}).
   *
   * @type {number|undefined}
   */
  #selectedSegmentNumber;

  /**
   * @type {Image|undefined}
   */
  #mask;

  /**
   * @type {string|undefined}
   */
  #maskDataId;

  /**
   * @type {LayerGroup|undefined}
   */
  #currentLayerGroup;

  /**
   * @type {number}
   */
  #uid = 0;

  /**
   * @type {number[][]|undefined}
   */
  #tmpOffsetsLists;

  /**
   * @type {unknown[]|undefined}
   */
  #tmpOriginalValuesLists;

  /**
   * @param {object} options Options.
   * @param {App} options.app Application.
   */
  constructor(options) {
    super();
    this.#app = options.app;
  }

  /**
   * Clamp brush size to the current `min` / `max` (exclusive) range.
   *
   * @param {number} size Proposed size.
   * @returns {number} Size in `[min, max - 1]`.
   */
  #clampBrushSize(size) {
    const min = this.#brushSizeRange.min;
    const maxExclusive = this.#brushSizeRange.max;
    return Math.min(Math.max(size, min), maxExclusive - 1);
  }

  /**
   * @returns {number} Current brush size in display pixels.
   */
  getBrushSize() {
    return this.#brushSize;
  }

  /**
   * @returns {string} Current add vs delete painting mode.
   */
  getBrushMode() {
    return this.#brushMode;
  }

  /**
   * @returns {number|undefined} Active DICOM segment index.
   */
  getSelectedSegmentNumber() {
    return this.#selectedSegmentNumber;
  }

  /**
   * @param {string} mode Add vs delete painting mode (`'add'` | `'del'`).
   */
  setBrushMode(mode) {
    this.setFeatures({brushMode: mode});
  }

  /**
   * @param {object} features Fields from {@link Brush#setFeatures}: mask
   *   (`createMask`, `maskDataId`) and live brush (`brushSize`, `brushMode`,
   *   `selectedSegmentNumber`, `brushSizeRange`).
   */
  setFeatures(features) {
    if (typeof features.brushSizeRange !== 'undefined') {
      this.#brushSizeRange = features.brushSizeRange;
      this.#brushSize = this.#clampBrushSize(this.#brushSize);
    }
    if (typeof features.brushSize !== 'undefined') {
      this.#brushSize = this.#clampBrushSize(features.brushSize);
    }
    if (typeof features.brushSizeAdd !== 'undefined') {
      const newSize = this.#clampBrushSize(
        this.#brushSize + features.brushSizeAdd
      );
      if (newSize !== this.#brushSize) {
        this.#brushSize = newSize;
        const sizeEvent = new CustomEvent('brushsizechange', {
          detail: {
            value: this.#brushSize
          }
        });
        this.dispatchEvent(sizeEvent);
      }
    }
    if (typeof features.brushMode !== 'undefined') {
      this.#brushMode = features.brushMode;
    }
    if (typeof features.selectedSegmentNumber !== 'undefined') {
      this.#selectedSegmentNumber = features.selectedSegmentNumber;
    }
    if (features.createMask) {
      this.#maskDataId = undefined;
    } else if (typeof features.maskDataId !== 'undefined') {
      this.#maskDataId = features.maskDataId;
    }
  }

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
    const imagePosPat = sourceGeometry.getOrigins()[imgK];

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
      referencedSeriesUID: tags.SeriesInstanceUID,
      frameInfos: [
        {
          dimIndex: [1, 1],
          refSegmentNumber: 1,
          imagePosPat: imagePosPat.getValues(),
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
      imagePosPat,
      firstSliceMeta
    );

    this.#mask.setupSegmentCollection();

    // fires load events and renders data
    // (will create viewLayer for it)
    const elements = getElementsFromJSONTags(firstSliceMeta);
    const data = new DicomData(elements);
    data.image = this.#mask;
    const dataCtrl = this.#app.getDataController();
    const dataId = dataCtrl.getNextDataId();
    const added = dataCtrl.add(dataId, data);
    if (!added) {
      throw new Error('Cannot add mask data');
    }
    return dataId;
  }

  /**
   * Get the orientation of the first data view config of the input
   * divId.
   *
   * @param {string} divId The divId.
   * @returns {string} The orientation.
   */
  #getDataViewConfigOrientation(divId) {
    const stgCtrl = this.#app.getStageController();
    const dataConfigs = stgCtrl.getDataViewConfigs();
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
    const stgCtrl = this.#app.getStageController();
    stgCtrl.addDataViewConfig(this.#maskDataId, viewConfig);
    stgCtrl.render(this.#maskDataId);
  }

  /**
   * Get the source data id from the mask image.
   *
   * @param {Image} mask The mask image.
   * @returns {string} The source data id.
   */
  #getSourceDataIdFromMask(mask) {
    // reference UID
    const refSeriesUID = mask.getMaskReferencedSeriesUID();
    // search app for the data ID of this SeriesUID...
    let ids = [];
    if (refSeriesUID !== 'undefined') {
      const dataCtrl = this.#app.getDataController();
      ids = dataCtrl.getDataIdFromSeriesUid(refSeriesUID);
    }
    let dataId = '0';
    if (ids.length > 0) {
      dataId = ids[0];
    } else {
      // mask with no reference data...
      logger.warn(
        formatString(ERROR_MESSAGES.brush.cannotFindSourceData, refSeriesUID));
    }
    return dataId;
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
    const dataCtrl = this.#app.getDataController();
    const maskData = dataCtrl.get(maskDataId);
    if (typeof maskData === 'undefined') {
      throw new Error(ERROR_MESSAGES.brush.noMaskImageGetOffset);
    }
    return maskData.image;
  }

  /**
   * Get mask voxel offsets for a pointer position in a layer group.
   *
   * @param {Point2D} mousePoint Position in display coordinates.
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   * @returns {number[]} The array of offsets to paint.
   */
  #getMaskOffsets(mousePoint, layerGroup) {
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

    const segMeta = {Modality: 'SEG'};
    const rtssMeta = {Modality: 'RTSTRUCT'};

    // update existing mask from current vl or create a new one
    let maskVl;
    let maskVc;
    let sourcePosition;
    let sourceImage;
    if (viewController.equalImageMeta(segMeta) ||
      viewController.equalImageMeta(rtssMeta)) {
      this.#mask = this.#getMaskImage(this.#maskDataId);
      // get source image
      const sourceDataId = this.#getSourceDataIdFromMask(this.#mask);
      const dataCtrl = this.#app.getDataController();
      const sourceData = dataCtrl.get(sourceDataId);
      if (!sourceData) {
        throw new Error(formatString(
          ERROR_MESSAGES.brush.noSourceImageGetOffset, sourceDataId
        ));
      }
      sourceImage = sourceData.image;
      // exit if reference image is resampled
      if (sourceImage.isResampled()) {
        logger.warn('Cannot update mask with resampled reference image.');
        return [];
      }
      // get source position
      // any layer from the app (could be other layer group)
      const stgCtrl = this.#app.getStageController();
      const sourceVl = stgCtrl.getViewLayersByDataId(sourceDataId)[0];
      const sourceViewController = sourceVl.getViewController();
      const planePos = sourceVl.displayToPlanePos(mousePoint);
      sourcePosition = sourceViewController.getPositionFromPlanePoint(planePos);
      // update locals
      maskVl = viewLayer;
      maskVc = viewController;
    } else {
      // view layer is source
      const sourceDataId = viewLayer.getDataId();
      const dataCtrl = this.#app.getDataController();
      const sourceData = dataCtrl.get(sourceDataId);
      if (!sourceData) {
        throw new Error(formatString(
          ERROR_MESSAGES.brush.noSourceImageGetOffset, sourceDataId
        ));
      }
      sourceImage = sourceData.image;
      // exit if reference image is resampled
      if (sourceImage.isResampled()) {
        logger.warn('Cannot create mask on resampled image.');
        return [];
      }
      // get source position
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
   * @param {number[]} offsets Mask offsets.
   * @returns {unknown|undefined} Original values chunk for undo.
   */
  #applyTemporaryPaint(offsets) {
    const maskVl = this.#getMaskViewLayer();
    const srclayerid = maskVl.getId();

    if (typeof this.#maskDataId === 'undefined') {
      throw new Error(ERROR_MESSAGES.brush.noMaskId);
    }
    const dataCtrl = this.#app.getDataController();
    const maskData = dataCtrl.get(this.#maskDataId);
    if (!maskData) {
      throw new Error(
        formatString(ERROR_MESSAGES.brush.noMaskImage, this.#maskDataId));
    }

    const props = new DrawBrushCommandProperties();
    props.mask = maskData.image;
    props.dataId = this.#maskDataId;
    props.offsetsLists = [offsets];
    props.mode = this.#brushMode;
    props.segmentNumber = this.#selectedSegmentNumber;
    props.srclayerid = srclayerid;
    const command = new DrawBrushCommand(props);
    command.execute();

    const originalValues = command.getOriginalValuesLists();
    if (typeof originalValues !== 'undefined') {
      return originalValues[0];
    }
    return undefined;
  }

  /**
   * @param {Point2D} point Pointer position at stroke start.
   * @param {LayerGroup} layerGroup The layer group.
   * @returns {boolean} False when first dab produced no offsets (drag
   *   aborted).
   */
  beginStroke(point, layerGroup) {
    this.#tmpOffsetsLists = [];
    this.#tmpOriginalValuesLists = [];
    const offsets = this.#getMaskOffsets(point, layerGroup);
    if (offsets.length > 0) {
      this.#tmpOffsetsLists.push(offsets);
      const originalChunk = this.#applyTemporaryPaint(offsets);
      if (typeof originalChunk !== 'undefined') {
        this.#tmpOriginalValuesLists.push(originalChunk);
      }
      return true;
    }

    return false;
  }

  /**
   * @param {Point2D} point Current pointer position.
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   */
  paintStep(point, layerGroup) {
    const offsets = this.#getMaskOffsets(point, layerGroup);
    if (offsets.length > 0) {
      this.#tmpOffsetsLists.push(offsets);
      const originalChunk = this.#applyTemporaryPaint(offsets);
      if (typeof originalChunk !== 'undefined') {
        this.#tmpOriginalValuesLists.push(originalChunk);
      }
    }
  }

  /**
   * Commit the stroke: undo command, labels, and brush events.
   */
  finalizeStroke() {
    if (typeof this.#maskDataId === 'undefined') {
      throw new Error(ERROR_MESSAGES.brush.cannotDrawNoMaskId);
    }
    if (typeof this.#tmpOffsetsLists === 'undefined') {
      throw new Error(ERROR_MESSAGES.brush.cannotDrawNoOffset);
    }
    if (typeof this.#tmpOriginalValuesLists === 'undefined') {
      throw new Error(ERROR_MESSAGES.brush.cannotDrawNoColourList);
    }

    this.#tmpOffsetsLists.reverse();
    this.#tmpOriginalValuesLists.reverse();

    const maskVl = this.#getMaskViewLayer();
    const srclayerid = maskVl.getId();

    const dataCtrl = this.#app.getDataController();
    const maskData = dataCtrl.get(this.#maskDataId);
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

    const undoCtrl = this.#app.getUndoController();
    undoCtrl.addToUndoStack(command);
    this.dispatchEvent(command.getExecuteEvent());

    this.#mask.recalculateLabels();
  }

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
}
