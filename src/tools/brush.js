// namespaces
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

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
  var self = this;

  /**
   * Interaction start flag.
   *
   * @type {boolean}
   */
  this.started = false;

  var mask = null;
  var maskId = null;

  var brushSize = 10;
  var brushColor = {r: 255, g: 0, b: 0};
  var brushMode = 'add';

  var uid = 0;

  /**
   * Get a mask slice.
   *
   * @param {object} geometry The mask geometry.
   * @param {dwv.math.Point3D} origin The slice origin.
   * @returns {dwv.image.Image} The slice.
   */
  function createMaskImage(geometry, origin) {
    // create data
    var sizeValues = geometry.getSize().getValues();
    sizeValues[2] = 1;
    var maskSize = new dwv.image.Size(sizeValues);
    var maskGeometry = new dwv.image.Geometry(
      origin,
      maskSize,
      geometry.getSpacing(),
      geometry.getOrientation());
    var values = new Uint8Array(maskSize.getDimSize(2) * 3);
    values.fill(0);
    ++uid;
    var uids = [uid];
    var maskSlice = new dwv.image.Image(maskGeometry, values, uids);
    maskSlice.setMeta({
      Modality: 'SEG',
      IsSigned: false,
      numberOfFiles: 1
    });
    maskSlice.setPhotometricInterpretation('RGB');

    return maskSlice;
  }

  /**
   * Paint the mask at the given offsets.
   *
   * @param {Array} offsets The mask offsets.
   */
  function paintMaskAtOffsets(offsets) {
    var buff = mask.getBuffer();
    for (var i = 0; i < offsets.length; ++i) {
      var offset = offsets[i] * 3;
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
    var layerDetails = dwv.gui.getLayerDetailsFromEvent(event);
    var layerGroup = app.getLayerGroupById(layerDetails.groupId);

    // reference image related vars
    var viewLayer = layerGroup.getActiveViewLayer();
    var planePos = viewLayer.displayToPlanePos(event._x, event._y);
    var viewController = viewLayer.getViewController();
    var position = viewController.getPositionFromPlanePoint(planePos);

    var scrollIndex = viewController.getScrollIndex();
    var circleDims;
    if (scrollIndex === 0) {
      circleDims = [1, 2];
    } else if (scrollIndex === 1) {
      circleDims = [0, 2];
    } else if (scrollIndex === 2) {
      circleDims = [0, 1];
    }

    // create mask if not done yet
    if (!mask) {
      var imageGeometry = app.getImage(0).getGeometry();
      var imgK = imageGeometry.worldToIndex(position).get(2);
      mask = createMaskImage(imageGeometry, imageGeometry.getOrigins()[imgK]);
      // fires load events and renders data
      maskId = app.addNewData(mask, {});
    }

    // circle indices in the image geometry
    var circleIndices =
      viewController.getCircleIndices(planePos, brushSize, circleDims);
    var origins = viewController.getOriginsFromIndices(circleIndices);
    if (origins.length === 0) {
      throw new Error('No brush origins...');
    }
    // get origins that need to be added
    var maskGeometry = mask.getGeometry();
    var origins0 = [];
    var originsBelow = [];
    var isAbove = true;
    var hasCommon = false;
    // origins start from the top of the circle, first ones (if any)
    // are above mask origins
    for (var i = 0; i < origins.length; ++i) {
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
    var originsToAdd = [];

    if (hasCommon) {
      // common slice case
      // reverse origins0 to go from existing mask to new one
      originsToAdd = origins0.reverse().concat(originsBelow);
    } else {
      // non common slice case: add in between slices
      var maskOrigins = maskGeometry.getOrigins();
      var firstMask = maskOrigins[0];
      var lastMask = maskOrigins[maskOrigins.length - 1];
      var firstOrigin = origins0[0];
      var lastOrigin = origins0[origins0.length - 1];
      var distanceAbove = firstMask.getDistance(lastOrigin);
      var distanceBelow = lastMask.getDistance(firstOrigin);

      var imageOrigins = app.getImage(0).getGeometry().getOrigins();
      if (distanceAbove < distanceBelow) {
        // in between above
        var i00 = imageOrigins.findIndex(
          dwv.math.getEqualPoint3DFunction(lastOrigin));
        var i01 = imageOrigins.findIndex(
          dwv.math.getEqualPoint3DFunction(firstMask));

        // reverse to go from existing mask to new one
        originsToAdd = imageOrigins.slice(i00 + 1, i01).reverse().concat(
          origins0.reverse());
      } else {
        // in between bellow
        var i10 = imageOrigins.findIndex(
          dwv.math.getEqualPoint3DFunction(lastMask));
        var i11 = imageOrigins.findIndex(
          dwv.math.getEqualPoint3DFunction(firstOrigin));

        originsToAdd = imageOrigins.slice(i10 + 1, i11).concat(origins0);
      }
    }

    // append slices
    // TODO: add image multi slice append?
    for (var l = 0; l < originsToAdd.length; ++l) {
      mask.getMeta().numberOfFiles += 1;
      mask.appendSlice(
        createMaskImage(maskGeometry, originsToAdd[l]));
    }

    // mask related vars
    var maskViewLayers = layerGroup.searchViewLayers({
      Modality: 'SEG'
    });
    if (maskViewLayers.length !== 1) {
      console.warn('Too many mask view layers', maskViewLayers.length);
    }
    var maskVl = maskViewLayers[0];
    var maskVc = maskVl.getViewController();

    // update mask position if new slices
    if (originsToAdd.length !== 0) {
      maskVc.setCurrentPosition(position);
    }

    // circle indices in the mask geometry
    var maskPlanePos = maskVl.displayToPlanePos(event._x, event._y);
    var maskCircleIndices = maskVc.getCircleIndices(
      maskPlanePos, brushSize, circleDims);

    return maskVc.getOffsetsFromIndices(maskCircleIndices);
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
    var diffX = Math.abs(event._x - self.x0);
    var diffY = Math.abs(event._y - self.y0);
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
