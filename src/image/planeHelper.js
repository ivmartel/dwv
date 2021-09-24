// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Plane geometry helper.
 *
 * @class
 * @param {object} spacing The spacing.
 * @param {object} orientation The orientation.
 */
dwv.image.PlaneHelper = function (spacing, orientation) {

  /**
   * Get a 3D offset from a plane one.
   *
   * @param {object} offset2D The plane offset as {x,y}.
   * @returns {object} The 3D world offset.
   */
  this.getOffset3DFromPlaneOffset = function (offset2D) {
    // make 3D
    var planeOffset = new dwv.math.Vector3D(
      offset2D.x, offset2D.y, 0);
    // de-orient
    var pixelOffset = this.getDeOrientedVector3D(planeOffset);
    // offset indexToWorld
    return offsetIndexToWorld(pixelOffset);
  };

  /**
   * Get a plane offset from a 3D one.
   *
   * @param {object} offset3D The 3D offset.
   * @returns {object} The plane offset as {x,y}.
   */
  this.getPlaneOffsetFromOffset3D = function (offset3D) {
    // offset worldToIndex
    var pixelOffset = offsetWorldToIndex(offset3D);
    // orient
    var planeOffset = this.getOrientedVector3D(pixelOffset);
    // make 2D
    return {
      x: planeOffset.getX(),
      y: planeOffset.getY()
    };
  };

  /**
   * Apply spacing to an offset.
   *
   * @param {object} off The 3D offset.
   * @returns {object} The world offset.
   */
  function offsetIndexToWorld(off) {
    return new dwv.math.Vector3D(
      off.getX() * spacing.getColumnSpacing(),
      off.getY() * spacing.getRowSpacing(),
      off.getZ() * spacing.getSliceSpacing());
  }

  /**
   * Remove spacing from an offset.
   *
   * @param {object} off The world offset.
   * @returns {object} The 3D offset.
   */
  function offsetWorldToIndex(off) {
    return new dwv.math.Vector3D(
      off.x / spacing.getColumnSpacing(),
      off.y / spacing.getRowSpacing(),
      off.z / spacing.getSliceSpacing());
  }

  /**
   * Orient an input vector.
   *
   * @param {object} vector The input vector.
   * @returns {object} The oriented vector.
   */
  this.getOrientedVector3D = function (vector) {
    var planeVector = vector;
    if (typeof orientation !== 'undefined') {
      // abs? otherwise negative index...
      // vector = orientation * planeVector
      planeVector = orientation.getInverse().getAbs().multiplyVector3D(vector);
    }
    return planeVector;
  };

  /**
   * Orient an input index.
   *
   * @param {object} index The input index.
   * @returns {object} The oriented index.
   */
  this.getOrientedIndex = function (index) {
    var planeIndex = index;
    if (typeof orientation !== 'undefined') {
      // abs? otherwise negative index...
      // vector = orientation * planeVector
      planeIndex = orientation.getInverse().getAbs().multiplyIndex3D(index);
    }
    return planeIndex;
  };

  /**
   * De-orient an input vector.
   *
   * @param {object} planeVector The input vector.
   * @returns {object} The de-orienteded vector.
   */
  this.getDeOrientedVector3D = function (planeVector) {
    var vector = planeVector;
    if (typeof orientation !== 'undefined') {
      // abs? otherwise negative index...
      // vector = orientation * planePoint
      vector = orientation.getAbs().multiplyVector3D(planeVector);
    }
    return vector;
  };

  /**
   * Reorder values to follow orientation.
   *
   * @param {object} values Values as {x,y,z}.
   * @returns {object} Reoriented values as {x,y,z}.
   */
  this.getOrientedXYZ = function (values) {
    var orientedValues = dwv.math.getOrientedArray3D(
      [
        values.x,
        values.y,
        values.z
      ],
      orientation);
    return {
      x: orientedValues[0],
      y: orientedValues[1],
      z: orientedValues[2]
    };
  };

  /**
   * Reorder values to compensate for orientation.
   *
   * @param {object} values Values as {x,y,z}.
   * @returns {object} 'Deoriented' values as {x,y,z}.
   */
  this.getDeOrientedXYZ = function (values) {
    var deOrientedValues = dwv.math.getDeOrientedArray3D(
      [
        values.x,
        values.y,
        values.z
      ],
      orientation
    );
    return {
      x: deOrientedValues[0],
      y: deOrientedValues[1],
      z: deOrientedValues[2]
    };
  };
};
