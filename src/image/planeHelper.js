// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Plane geometry helper.
 *
 * @class
 * @param {dwv.image.Spacing} spacing The spacing.
 * @param {dwv.math.Matrix} orientation The orientation.
 */
dwv.image.PlaneHelper = function (spacing, orientation) {

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
    var pixelOffset = this.getDeOrientedVector3D(planeOffset);
    // offset indexToWorld
    return offsetIndexToWorld(pixelOffset);
  };

  /**
   * Get a plane offset from a 3D one.
   *
   * @param {dwv.math.Point3D} offset3D The 3D offset.
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
   * @param {dwv.math.Point3D} off The 3D offset.
   * @returns {dwv.math.Vector3D} The world offset.
   */
  function offsetIndexToWorld(off) {
    return new dwv.math.Vector3D(
      off.getX() * spacing.get(0),
      off.getY() * spacing.get(1),
      off.getZ() * spacing.get(2));
  }

  /**
   * Remove spacing from an offset.
   *
   * @param {object} off The world offset object as {x,y,z}.
   * @returns {dwv.math.Vector3D} The 3D offset.
   */
  function offsetWorldToIndex(off) {
    return new dwv.math.Vector3D(
      off.x / spacing.get(0),
      off.y / spacing.get(1),
      off.z / spacing.get(2));
  }

  /**
   * Orient an input vector.
   *
   * @param {dwv.math.Vector3D} vector The input vector.
   * @returns {dwv.math.Vector3D} The oriented vector.
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
   * @param {dwv.math.Index} index The input index.
   * @returns {dwv.math.Index} The oriented index.
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
   * Orient an input point.
   *
   * @param {dwv.math.Point3D} point The input point.
   * @returns {dwv.math.Point3D} The oriented point.
   */
  this.getOrientedPoint = function (point) {
    var planePoint = point;
    if (typeof orientation !== 'undefined') {
      // abs? otherwise negative index...
      // vector = orientation * planeVector
      var point3D =
        orientation.getInverse().getAbs().multiplyPoint3D(point.get3D());
      planePoint = point.mergeWith3D(point3D);
    }
    return planePoint;
  };

  /**
   * De-orient an input vector.
   *
   * @param {dwv.math.Vector3D} planeVector The input vector.
   * @returns {dwv.math.Vector3D} The de-orienteded vector.
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
