// namespaces
// import * as DicomWebViewer from 'dwv';
// export const dwv = DicomWebViewer || {};

// namespaces
// var dwv = dwv || {};
dwv.tool = dwv.tool || {};

/**
 * Get the indices that form a circle.
 * Can be an ellipse to adapt to view.
 *
 * @param {dwv.image.Geometry} geometry The geometry.
 * @param {dwv.math.Point3D} position The circle center.
 * @param {Array} radiuses The circle radiuses.
 * @param {Array} dims The 2 dimensions.
 * @returns {Array} The indices of the circle.
 */
dwv.tool.getCircleIndices = function (geometry, position, radiuses, dims) {
  const centerIndex = geometry.worldToIndex(position);
  return dwv.math.getEllipseIndices(centerIndex, radiuses, dims);
};

/**
 * Get the data origins that correspond to input indices.
 *
 * @param {dwv.image.Geometry} geometry The geometry.
 * @param {Array} allOrigins All orign array.
 * @param {Array} indices An array of dwv.math.Index.
 * @returns {Array} An array of origins (dwv.math.Point3D).
 */
dwv.tool.getOriginsFromIndices = function (geometry, allOrigins, indices) {
  const sorted = indices.sort(dwv.math.getIndexCompareFunction(2)); //NOSONAR

  const origin0 = geometry.indexToWorld(sorted[0]);
  const origin1 = geometry.indexToWorld(sorted[sorted.length - 1]);

  const getEqualZ = function (point) {
    return function equalZ(x) {
      return x.getZ() === point.get(2);
    };
  };

  let iStart = allOrigins.findIndex(getEqualZ(origin0));
  if (iStart === -1) {
    iStart = 0;
  }
  let iEnd = allOrigins.findIndex(getEqualZ(origin1));
  if (iEnd === -1) {
    iEnd = allOrigins.length - 1;
  }

  return allOrigins.slice(iStart, iEnd + 1);
};

/**
 * Get the data offsets that correspond to input indices.
 *
 * @param {dwv.image.Geometry} geometry The geometry.
 * @param {Array} indices An array of dwv.math.Index.
 * @returns {Array} An array of offsets.
 */
dwv.tool.getOffsetsFromIndices = function (geometry, indices) {
  const imageSize = geometry.getSize();
  const offsets = [];
  for (let i = 0; i < indices.length; ++i) {
    offsets.push(imageSize.indexToOffset(indices[i]));
  }
  return offsets;
};

/**
 * Brush class.
 *
 * @class
 * @param {dwv.App} app The associated application.
 */
dwv.tool.Brush = function (app) {
  /**
   * Closure to self: to be used by event handlers.
   *
   * @private
   * @type {dwv.tool.Brush}
   */
  const self = this;

  /**
   * Interaction start flag.
   *
   * @type {boolean}
   */
  this.started = false;

  let mask = null;
  let maskId = null;

  let brushSize = 2;
  let brushColor = {r: 255, g: 0, b: 0};
  let brushMode = 'add';

  let uid = 0;

  /**
   * Get a mask slice.
   *
   * @param {object} geometry The mask geometry.
   * @param {dwv.math.Point3D} origin The slice origin.
   * @returns {dwv.image.Image} The slice.
   */
  function createMaskImage(geometry, origin, meta) {
    // create data
    const sizeValues = geometry.getSize().getValues();
    sizeValues[2] = 1;
    const maskSize = new dwv.image.Size(sizeValues);
    const maskGeometry = new dwv.image.Geometry(
      origin,
      maskSize,
      geometry.getSpacing(),
      geometry.getOrientation());
    const values = new Uint8Array(maskSize.getDimSize(2) * 3);
    values.fill(0);
    ++uid;
    const uids = [uid];
    const maskSlice = new dwv.image.Image(maskGeometry, values, uids);
    maskSlice.setMeta(meta);
    maskSlice.setPhotometricInterpretation('RGB');

    return maskSlice;
  }

  /**
   * Add slices to mask if needed.
   *
   * @param {dww.image.Geometry} baseGeometry The base geometry.
   * @param {Array} allOrigins All orign array.
   * @param {dww.image.Geometry} maskGeometry The mask geometry.
   * @param {dwv.math.Point3D} position The circle center.
   * @param {Array} circleDims The circle dimensions.
   * @param {Array} radiuses The circle radiuses.
   * @returns {boolean} True if slices were added.
   */
  function addMaskSlices(
    baseGeometry, allOrigins,
    maskGeometry, position, circleDims, radiuses, sliceMeta) {
    // circle indices in the image geometry
    const circleIndices =
      dwv.tool.getCircleIndices(baseGeometry, position, radiuses, circleDims);
    const origins =
      dwv.tool.getOriginsFromIndices(baseGeometry, allOrigins, circleIndices);
    if (origins.length === 0) {
      throw new Error('No brush origins...');
    }

    // get origins that need to be added
    const origins0 = [];
    const originsBelow = [];
    let isAbove = true;
    let hasCommon = false;
    // origins start from the top of the circle, first ones (if any)
    // are above mask origins
    for (let i = 0; i < origins.length; ++i) {
      if (!maskGeometry.includesOrigin(origins[i])) {
        if (isAbove) {
          origins0.push(origins[i]);
        } else {
          originsBelow.push(origins[i]);
        }
      } else {
        isAbove = false;
        hasCommon = true;
      }
    }

    // append slices if needed
    let originsToAdd = [];

    if (hasCommon) {
      // common slice case
      // reverse origins0 to go from existing mask to new one
      originsToAdd = origins0.reverse().concat(originsBelow);
    } else {
      // non common slice case: add in between slices
      const maskOrigins = maskGeometry.getOrigins();
      const firstMask = maskOrigins[0];
      const lastMask = maskOrigins[maskOrigins.length - 1];
      const firstOrigin = origins0[0];
      const lastOrigin = origins0[origins0.length - 1];
      const distanceAbove = firstMask.getDistance(lastOrigin);
      const distanceBelow = lastMask.getDistance(firstOrigin);

      const imageOrigins = app.getImage(0).getGeometry().getOrigins();
      if (distanceAbove < distanceBelow) {
        // in between above
        const i00 = imageOrigins.findIndex(
          dwv.math.getEqualPoint3DFunction(lastOrigin));
        const i01 = imageOrigins.findIndex(
          dwv.math.getEqualPoint3DFunction(firstMask));

        // reverse to go from existing mask to new one
        originsToAdd = imageOrigins.slice(i00 + 1, i01).reverse().concat(
          origins0.reverse()); //NOSONAR
      } else {
        // in between bellow
        const i10 = imageOrigins.findIndex(
          dwv.math.getEqualPoint3DFunction(lastMask));
        const i11 = imageOrigins.findIndex(
          dwv.math.getEqualPoint3DFunction(firstOrigin));

        originsToAdd = imageOrigins.slice(i10 + 1, i11).concat(origins0);
      }
    }

    // append slices
    // TODO: add image multi slice append?
    for (let l = 0; l < originsToAdd.length; ++l) {
      mask.getMeta().numberOfFiles += 1;
      mask.appendSlice(
        createMaskImage(maskGeometry, originsToAdd[l], sliceMeta));
    }

    return originsToAdd.length !== 0;
  }

  /**
   * Paint the mask at the given offsets.
   *
   * @param {Array} offsets The mask offsets.
   */
  function paintMaskAtOffsets(offsets) {
    const buff = mask.getBuffer();
    for (let i = 0; i < offsets.length; ++i) {
      const offset = offsets[i] * 3;
      buff[offset] = brushMode === 'add' ? brushColor.r : 0;
      buff[offset + 1] = brushMode === 'add' ? brushColor.g : 0;
      buff[offset + 2] = brushMode === 'add' ? brushColor.b : 0;
    }
    // update app image
    app.setImage(maskId, mask);
    // render
    app.render(maskId);
  }

  /**
   * Get the mask offset for an event.
   *
   * @param {object} event The event containing the mask position.
   * @returns {Array} The array of offset to paint.
   */
  function getMaskOffsets(event) {
    const layerDetails = dwv.gui.getLayerDetailsFromEvent(event);
    const layerGroup = app.getLayerGroupById(layerDetails.groupId);

    // reference image related vars
    const viewLayer = layerGroup.getActiveViewLayer();
    const planePos = viewLayer.displayToPlanePos(event._x, event._y);
    const viewController = viewLayer.getViewController();
    const position = viewController.getPositionFromPlanePoint(planePos);

    const sliceMeta = {
      Modality: 'SEG',
      IsSigned: false,
      numberOfFiles: 1,
      BitsStored: 8
    };

    const searchMaskMeta = {
      Modality: 'SEG'
    };
    const isMaskVc = viewController.equalImageMeta(searchMaskMeta);

    // base image geometry
    const baseImage = app.getImage(0);
    let baseGeometry = baseImage.getGeometry();

    if (isMaskVc) {
      // udpate an existing mask
      mask = app.getImage(event.dataindex);
      maskId = event.dataindex;
      baseGeometry = mask.getGeometry();
    }

    // create mask if not done yet
    let maskVl = viewLayer;
    let maskVc = viewController;
    if (!mask) {
      const imgK = baseGeometry.worldToIndex(position).get(2);

      const firstSliceMeta = sliceMeta;
      firstSliceMeta.SeriesInstanceUID =
        baseImage.getMeta().SeriesInstanceUID;
      firstSliceMeta.ImageOrientationPatient =
        baseImage.getMeta().ImageOrientationPatient;

      mask = createMaskImage(
        baseGeometry, baseGeometry.getOrigins()[imgK], firstSliceMeta);
      // fires load events and renders data
      maskId = app.addNewImage(mask, {});

      // newly create mask case: find the SEG view layer
      const maskViewLayers = layerGroup.searchViewLayers(searchMaskMeta);
      if (maskViewLayers.length === 0) {
        console.warn('No mask view layers');
      } else if (maskViewLayers.length !== 1) {
        console.warn('Too many mask view layers', maskViewLayers.length);
      }
      maskVl = maskViewLayers[0];
      maskVc = maskVl.getViewController();
    }

    sliceMeta.SeriesInstanceUID = mask.getMeta().SeriesInstanceUID;
    sliceMeta.ImageOrientationPatient =
      mask.getMeta().ImageOrientationPatient;

    const maskGeometry = mask.getGeometry();

    const scrollIndex = viewController.getScrollIndex();
    let circleDims;
    let radiuses;
    const spacing = baseGeometry.getSpacing(baseGeometry.getOrientation());
    const r0 = Math.round(brushSize / spacing.get(0));
    const r1 = Math.round(brushSize / spacing.get(1));
    const r2 = Math.round(brushSize / spacing.get(2));
    if (scrollIndex === 0) {
      circleDims = [1, 2];
      radiuses = [r1, r2];
    } else if (scrollIndex === 1) {
      circleDims = [0, 2];
      radiuses = [r0, r2];
    } else if (scrollIndex === 2) {
      circleDims = [0, 1];
      radiuses = [r0, r1];
    }

    const addedSlices = addMaskSlices(
      baseGeometry, baseImage.getGeometry().getOrigins(),
      maskGeometry, position, circleDims, radiuses, sliceMeta);

    if (addedSlices) {
      // update mask position if new slices
      maskVc.setCurrentPosition(position);
    }

    // circle indices in the mask geometry
    const maskPlanePos = maskVl.displayToPlanePos(event._x, event._y);
    const maskPosition = maskVc.getPositionFromPlanePoint(maskPlanePos);
    const maskCircleIndices = dwv.tool.getCircleIndices(
      maskGeometry, maskPosition, radiuses, circleDims);

    return dwv.tool.getOffsetsFromIndices(maskGeometry, maskCircleIndices);
  }

  function saveSeg() {
    const fac = new dwv.image.MaskFactory();
    const dicomElements = fac.toDicom(mask);

    // create writer with default rules
    const writer = new dwv.dicom.DicomWriter();
    let dicomBuffer = null;
    try {
      dicomBuffer = writer.getBuffer(dicomElements);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
    // view as Blob to allow download
    const blob = new Blob([dicomBuffer], {type: 'application/dicom'});
    // update generate button
    const element = document.createElement('a');
    element.href = window.URL.createObjectURL(blob);
    element.download = 'seg-save.dcm';
    // trigger download
    element.click();
    URL.revokeObjectURL(element.href);

    // var element = document.getElementById('save');
    // element.href = URL.createObjectURL(blob);
    // element.download = 'brush-' + _dicomFile.name;

  }

  /**
   * Handle mouse down event.
   *
   * @param {object} event The mouse down event.
   */
  this.mousedown = function (event) {
    // start flag
    self.started = true;
    // first position
    self.x0 = event._x;
    self.y0 = event._y;

    paintMaskAtOffsets(getMaskOffsets(event));
  };

  /**
   * Handle mouse move event.
   *
   * @param {object} event The mouse move event.
   */
  this.mousemove = function (event) {
    if (!self.started) {
      return;
    }
    const diffX = Math.abs(event._x - self.x0);
    const diffY = Math.abs(event._y - self.y0);
    if (diffX > brushSize / 2 || diffY > brushSize / 2) {
      paintMaskAtOffsets(getMaskOffsets(event));
      self.x0 = event._x;
      self.y0 = event._y;
    }
  };

  /**
   * Handle mouse up event.
   *
   * @param {object} _event The mouse up event.
   */
  this.mouseup = function (_event) {
    if (self.started) {
      self.started = false;
    }
  };

  /**
   * Handle mouse out event.
   *
   * @param {object} event The mouse out event.
   */
  this.mouseout = function (event) {
    self.mouseup(event);
  };

  /**
   * Handle touch start event.
   *
   * @param {object} event The touch start event.
   */
  this.touchstart = function (event) {
    // call mouse equivalent
    self.mousedown(event);
  };

  /**
   * Handle touch move event.
   *
   * @param {object} event The touch move event.
   */
  this.touchmove = function (event) {
    // call mouse equivalent
    self.mousemove(event);
  };

  /**
   * Handle touch end event.
   *
   * @param {object} event The touch end event.
   */
  this.touchend = function (event) {
    // call mouse equivalent
    self.mouseup(event);
  };

  /**
   * Handle key down event.
   *
   * @param {object} event The key down event.
   */
  this.keydown = function (event) {
    event.context = 'dwv.tool.Brush';
    app.onKeydown(event);

    if (event.key === '+') {
      brushSize += 1;
      console.log('Brush size:', brushSize);
    } else if (event.key === '-') {
      brushSize -= 1;
      console.log('Brush size:', brushSize);
    } else if (event.key === 'r') {
      brushColor = {r: 255, g: 0, b: 0};
      console.log('Brush color:', brushColor);
    } else if (event.key === 'g') {
      brushColor = {r: 0, g: 255, b: 0};
      console.log('Brush color', brushColor);
    } else if (event.key === 'b') {
      brushColor = {r: 0, g: 0, b: 255};
      console.log('Brush color', brushColor);
    } else if (event.key === 'a') {
      brushMode = 'add';
      console.log('Brush mode', brushMode);
    } else if (event.key === 'd') {
      brushMode = 'del';
      console.log('Brush mode', brushMode);
    } else if (event.key === 's') {
      console.log('Saving...');
      saveSeg();
    }

  };

  /**
   * Activate the tool.
   *
   * @param {boolean} _bool The flag to activate or not.
   */
  this.activate = function (_bool) {
    // does nothing
  };

  /**
   * Set the tool live features.
   *
   * @param {object} features The list of features.
   */
  this.setFeatures = function (features) {
    if (typeof features.brushSize !== 'undefined') {
      brushSize = features.brushSize;
    }
    if (typeof features.brushColor !== 'undefined') {
      brushColor = features.brushColor;
    }
    if (typeof features.brushMode !== 'undefined') {
      brushMode = features.brushMode;
    }
  };

  /**
   * Initialise the tool.
   */
  this.init = function () {
    // does nothing
  };

}; // Brush class

/**
 * Help for this tool.
 *
 * @returns {object} The help content.
 */
dwv.tool.Brush.prototype.getHelpKeys = function () {
  return {
    title: 'tool.Brush.name',
    brief: 'tool.Brush.brief',
    mouse: {
      mouse_click: 'tool.Brush.mouse_click',
    },
    touch: {
      touch_click: 'tool.Brush.touch_click'
    }
  };
};