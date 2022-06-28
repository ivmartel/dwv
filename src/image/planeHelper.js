// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Plane geometry helper.
 *
 * @class
 * @param {dwv.image.Spacing} spacing The spacing.
 * @param {dwv.math.Matrix} imageOrientation The image oientation.
 * @param {dwv.math.Matrix} viewOrientation The view orientation.
 */
dwv.image.PlaneHelper = function (spacing, imageOrientation, viewOrientation) {

  var targetOrientation = dwv.gui.getTargetOrientation(
    imageOrientation, viewOrientation);

  /**
   * Get a 3D offset from a plane one.
   *
   * @param {object} offset2D The plane offset as {x,y}.
   * @returns {dwv.math.Vector3D} The 3D world offset.
   */
  this.getOffset3DFromPlaneOffset = function (offset2D) {
    // make 3D
    var planeOffset = new dwv.math.Vector3D(
      offset2D.x, offset2D.y, 0);
    // de-orient
    var pixelOffset = this.getTargetDeOrientedVector3D(planeOffset);
    // ~indexToWorld
    return new dwv.math.Vector3D(
      pixelOffset.getX() * spacing.get(0),
      pixelOffset.getY() * spacing.get(1),
      pixelOffset.getZ() * spacing.get(2));
  };

  /**
   * Get a plane offset from a 3D one.
   *
   * @param {object} offset3D The 3D offset as {x,y,z}.
   * @returns {object} The plane offset as {x,y}.
   */
  this.getPlaneOffsetFromOffset3D = function (offset3D) {
    // ~worldToIndex
    var pixelOffset = new dwv.math.Vector3D(
      offset3D.x / spacing.get(0),
      offset3D.y / spacing.get(1),
      offset3D.z / spacing.get(2));
    // orient
    var planeOffset = this.getTargetOrientedVector3D(pixelOffset);
    // make 2D
    return {
      x: planeOffset.getX(),
      y: planeOffset.getY()
    };
  };

  /**
   * Orient an input vector from real to target space.
   *
   * @param {dwv.math.Vector3D} vector The input vector.
   * @returns {dwv.math.Vector3D} The oriented vector.
   */
  this.getTargetOrientedVector3D = function (vector) {
    var planeVector = vector;
    if (typeof targetOrientation !== 'undefined') {
      planeVector = targetOrientation.getInverse().multiplyVector3D(vector);
    }
    return planeVector;
  };

  /**
   * De-orient an input vector from target to real space.
   *
   * @param {dwv.math.Vector3D} planeVector The input vector.
   * @returns {dwv.math.Vector3D} The de-orienteded vector.
   */
  this.getTargetDeOrientedVector3D = function (planeVector) {
    var vector = planeVector;
    if (typeof targetOrientation !== 'undefined') {
      vector = targetOrientation.multiplyVector3D(planeVector);
    }
    return vector;
  };

  /**
   * Orient an input vector from target to image space.
   *
   * @param {dwv.math.Vector3D} planeVector The input vector.
   * @returns {dwv.math.Vector3D} The orienteded vector.
   */
  this.getImageOrientedVector3D = function (planeVector) {
    var vector = planeVector;
    if (typeof viewOrientation !== 'undefined') {
      // abs? otherwise negative index...
      // vector = viewOrientation * planePoint
      vector = viewOrientation.getAbs().multiplyVector3D(planeVector);
    }
    return vector;
  };

  /**
   * Reorder values to follow target orientation.
   *
   * @param {object} values Values as {x,y,z}.
   * @returns {object} Reoriented values as {x,y,z}.
   */
  this.getTargetOrientedXYZ = function (values) {
    var orientedValues = dwv.math.getOrientedArray3D(
      [
        values.x,
        values.y,
        values.z
      ],
      targetOrientation);
    return {
      x: orientedValues[0],
      y: orientedValues[1],
      z: orientedValues[2]
    };
  };

  /**
   * Get the (view) scroll dimension index.
   *
   * @returns {number} The index.
   */
  this.getScrollIndex = function () {
    var index = null;
    if (typeof viewOrientation !== 'undefined') {
      index = viewOrientation.getThirdColMajorDirection();
    } else {
      index = 2;
    }
    return index;
  };

  /**
   * Get the native (image) scroll dimension index.
   *
   * @returns {number} The index.
   */
  this.getNativeScrollIndex = function () {
    var index = null;
    if (typeof imageOrientation !== 'undefined') {
      index = imageOrientation.getThirdColMajorDirection();
    } else {
      index = 2;
    }
    return index;
  };

};
