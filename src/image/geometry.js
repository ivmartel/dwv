// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Immutable Size class.
 * Warning: the input array is NOT cloned, modifying it will
 *  modify the index values.
 *
 * @class
 * @param {Array} values The size values.
 */
dwv.image.Size = function (values) {
  if (!values || typeof values === 'undefined') {
    throw new Error('Cannot create size with no values.');
  }
  if (values.length === 0) {
    throw new Error('Cannot create size with empty values.');
  }
  var valueCheck = function (val) {
    return !isNaN(val) && val !== 0;
  };
  if (!values.every(valueCheck)) {
    throw new Error('Cannot create size with non number or zero values.');
  }

  /**
   * Get the size value at the given array index.
   *
   * @param {number} i The index to get.
   * @returns {number} The value.
   */
  this.get = function (i) {
    return values[i];
  };

  /**
   * Get the length of the index.
   *
   * @returns {number} The length.
   */
  this.length = function () {
    return values.length;
  };

  /**
   * Get a string representation of the size.
   *
   * @returns {string} The Size as a string.
   */
  this.toString = function () {
    return '(' + values.toString() + ')';
  };

  /**
   * Get the values of this index.
   *
   * @returns {Array} The array of values.
   */
  this.getValues = function () {
    return values.slice();
  };

}; // Size class

/**
 * Check if a dimension exists and has more than one element.
 *
 * @param {object} dimension The dimension to check.
 * @returns {boolean} True if the size is more than one.
 */
dwv.image.Size.prototype.moreThanOne = function (dimension) {
  return this.length() >= dimension + 1 && this.get(dimension) !== 1;
};

/**
 * Check if the third direction of an orientation matrix has a size
 * of more than one.
 *
 * @param {object} viewOrientation The orientation matrix.
 * @returns {boolean} True if scrollable.
 */
dwv.image.Size.prototype.canScroll = function (viewOrientation) {
  var dimension = 2;
  if (typeof viewOrientation !== 'undefined') {
    dimension = viewOrientation.getThirdColMajorDirection();
  }
  return this.moreThanOne(dimension);
};

/**
 * Get the size of a given dimension.
 *
 * @param {number} dimension The dimension.
 * @returns {number} The size.
 */
dwv.image.Size.prototype.getDimSize = function (dimension) {
  if (dimension > this.length()) {
    return null;
  }
  var size = 1;
  for (var i = 0; i < dimension; ++i) {
    size *= this.get(i);
  }
  return size;
};

/**
 * Get the total size.
 *
 * @returns {number} The total size.
 */
dwv.image.Size.prototype.getTotalSize = function () {
  return this.getDimSize(this.length());
};

/**
 * Check for equality.
 *
 * @param {dwv.image.Size} rhs The object to compare to.
 * @returns {boolean} True if both objects are equal.
 */
dwv.image.Size.prototype.equals = function (rhs) {
  // check input
  if (!rhs) {
    return false;
  }
  // check length
  var length = this.length();
  if (length !== rhs.length()) {
    return false;
  }
  // check values
  for (var i = 0; i < length; ++i) {
    if (this.get(i) !== rhs.get(i)) {
      return false;
    }
  }
  // seems ok!
  return true;
};

/**
 * Check that an index is within bounds.
 *
 * @param {object} index The index to check.
 * @returns {boolean} True if the given coordinates are within bounds.
 */
dwv.image.Size.prototype.isInBounds = function (index) {
  // check input
  if (!index) {
    return false;
  }
  // check length
  var length = this.length();
  if (length !== index.length()) {
    return false;
  }
  // check values
  for (var i = 0; i < length; ++i) {
    if (index.get(i) < 0 || index.get(i) > this.get(i) - 1) {
      return false;
    }
  }
  // seems ok!
  return true;
};

/**
 * Get the 2D base of this size.
 *
 * @returns {object} The 2D base [0,1] as {x,y}.
 */
dwv.image.Size.prototype.get2D = function () {
  return {
    x: this.get(0),
    y: this.get(1)
  };
};

/**
 * 2D/3D Spacing class.
 *
 * @class
 * @param {number} columnSpacing The column spacing.
 * @param {number} rowSpacing The row spacing.
 * @param {number} sliceSpacing The slice spacing.
 */
dwv.image.Spacing = function (columnSpacing, rowSpacing, sliceSpacing) {
  /**
   * Get the column spacing.
   *
   * @returns {number} The column spacing.
   */
  this.getColumnSpacing = function () {
    return columnSpacing;
  };
  /**
   * Get the row spacing.
   *
   * @returns {number} The row spacing.
   */
  this.getRowSpacing = function () {
    return rowSpacing;
  };
  /**
   * Get the slice spacing.
   *
   * @returns {number} The slice spacing.
   */
  this.getSliceSpacing = function () {
    return (sliceSpacing || 1.0);
  };
};

/**
 * Check for equality.
 *
 * @param {dwv.image.Spacing} rhs The object to compare to.
 * @returns {boolean} True if both objects are equal.
 */
dwv.image.Spacing.prototype.equals = function (rhs) {
  return rhs !== null &&
    this.getColumnSpacing() === rhs.getColumnSpacing() &&
    this.getRowSpacing() === rhs.getRowSpacing() &&
    this.getSliceSpacing() === rhs.getSliceSpacing();
};

/**
 * Get a string representation of the Vector3D.
 *
 * @returns {string} The vector as a string.
 */
dwv.image.Spacing.prototype.toString = function () {
  return '(' + this.getColumnSpacing() +
    ', ' + this.getRowSpacing() +
    ', ' + this.getSliceSpacing() + ')';
};


/**
 * 2D/3D Geometry class.
 *
 * @class
 * @param {object} origin The object origin (a 3D point).
 * @param {object} size The object size.
 * @param {object} spacing The object spacing.
 * @param {object} orientation The object orientation (3*3 matrix,
 *   default to 3*3 identity).
 */
dwv.image.Geometry = function (origin, size, spacing, orientation) {
  // check input origin
  if (typeof origin === 'undefined') {
    origin = new dwv.math.Point3D(0, 0, 0);
  }
  var origins = [origin];
  // check input orientation
  if (typeof orientation === 'undefined') {
    orientation = new dwv.math.getIdentityMat33();
  }
  // flag to know if new origins were added
  var newOrigins = false;

  /**
   * Get the object first origin.
   *
   * @returns {object} The object first origin.
   */
  this.getOrigin = function () {
    return origin;
  };
  /**
   * Get the object origins.
   *
   * @returns {Array} The object origins.
   */
  this.getOrigins = function () {
    return origins;
  };
  /**
   * Get the object size.
   *
   * @param {object} viewOrientation The view orientation (optional)
   * @returns {object} The object size.
   */
  this.getSize = function (viewOrientation) {
    var res = size;
    if (viewOrientation && typeof viewOrientation !== 'undefined') {
      var values = dwv.math.getOrientedArray3D(
        [
          size.get(0),
          size.get(1),
          size.get(2)
        ],
        viewOrientation);
      res = new dwv.image.Size(values);
    }
    return res;
  };

  /**
   * Get the slice spacing from the difference in the Z directions
   * of the origins.
   *
   * @returns {number} The spacing.
   */
  this.getSliceGeometrySpacing = function () {
    if (origins.length === 1) {
      return 1;
    }
    var spacing = null;
    // (x, y, z) = orientationMatrix * (i, j, k)
    // -> inv(orientationMatrix) * (x, y, z) = (i, j, k)
    // applied on the patient position, reorders indices
    // so that Z is the slice direction
    var orientation2 = orientation.getInverse().asOneAndZeros();
    var deltas = [];
    for (var i = 0; i < origins.length - 1; ++i) {
      var origin1 = orientation2.multiplyVector3D(origins[i]);
      var origin2 = orientation2.multiplyVector3D(origins[i + 1]);
      var diff = Math.abs(origin1.getZ() - origin2.getZ());
      if (diff === 0) {
        throw new Error('Zero slice spacing.' +
          origin1.toString() + ' ' + origin2.toString());
      }
      if (spacing === null) {
        spacing = diff;
      } else {
        if (!dwv.math.isSimilar(spacing, diff, dwv.math.BIG_EPSILON)) {
          deltas.push(Math.abs(spacing - diff));
        }
      }
    }
    // warn if non constant
    if (deltas.length !== 0) {
      var sumReducer = function (sum, value) {
        return sum + value;
      };
      var mean = deltas.reduce(sumReducer) / deltas.length;
      dwv.logger.warn('Varying slice spacing, mean delta: ' +
        mean.toFixed(3) + ' (' + deltas.length + ' case(s))');
    }
    return spacing;
  };

  /**
   * Get the object spacing.
   *
   * @param {object} viewOrientation The view orientation (optional)
   * @returns {object} The object spacing.
   */
  this.getSpacing = function (viewOrientation) {
    // update slice spacing after appendSlice
    if (newOrigins) {
      spacing = new dwv.image.Spacing(
        spacing.getColumnSpacing(),
        spacing.getRowSpacing(),
        this.getSliceGeometrySpacing()
      );
      newOrigins = false;
    }
    var res = spacing;
    if (viewOrientation && typeof viewOrientation !== 'undefined') {
      var values = dwv.math.getOrientedArray3D(
        [
          spacing.getColumnSpacing(),
          spacing.getRowSpacing(),
          spacing.getSliceSpacing()
        ],
        viewOrientation);
      res = new dwv.image.Spacing(values[0], values[1], values[2]);
    }
    return res;
  };

  /**
   * Get the object orientation.
   *
   * @returns {object} The object orientation.
   */
  this.getOrientation = function () {
    return orientation;
  };

  /**
   * Get the slice position of a point in the current slice layout.
   *
   * @param {object} point The point to evaluate.
   * @returns {number} The slice index.
   */
  this.getSliceIndex = function (point) {
    // cannot use this.worldToIndex(point).getK() since
    // we cannot guaranty consecutive slices...

    // find the closest index
    var closestSliceIndex = 0;
    var minDist = point.getDistance(origins[0]);
    var dist = 0;
    for (var i = 0; i < origins.length; ++i) {
      dist = point.getDistance(origins[i]);
      if (dist < minDist) {
        minDist = dist;
        closestSliceIndex = i;
      }
    }
    var closestOrigin = origins[closestSliceIndex];
    // direction between the input point and the closest origin
    var pointDir = point.minus(closestOrigin);
    // use third orientation matrix column as base plane vector
    var normal = new dwv.math.Vector3D(
      orientation.get(2, 0), orientation.get(2, 1), orientation.get(2, 2));
    // a.dot(b) = ||a|| * ||b|| * cos(theta)
    // (https://en.wikipedia.org/wiki/Dot_product#Geometric_definition)
    // -> the sign of the dot product depends on the cosinus of
    //    the angle between the vectors
    //   -> >0 => vectors are codirectional
    //   -> <0 => vectors are oposite
    var dotProd = normal.dotProduct(pointDir);
    // oposite vectors get higher index
    var sliceIndex = (dotProd < 0) ? closestSliceIndex + 1 : closestSliceIndex;
    return sliceIndex;
  };

  /**
   * Append an origin to the geometry.
   *
   * @param {object} origin The origin to append.
   * @param {number} index The index at which to append.
   */
  this.appendOrigin = function (origin, index) {
    newOrigins = true;
    // add in origin array
    origins.splice(index, 0, origin);
    // increment second dimension
    var values = size.getValues();
    values[2] += 1;
    size = new dwv.image.Size(values);
  };

  /**
   * Append a frame to the geometry.
   *
   */
  this.appendFrame = function () {
    // increment second dimension
    var values = size.getValues();
    values[2] += 1;
    size = new dwv.image.Size(values);
  };

};

/**
 * Get a string representation of the Vector3D.
 *
 * @returns {string} The vector as a string.
 */
dwv.image.Geometry.prototype.toString = function () {
  return 'Origin: ' + this.getOrigin() +
    ', Size: ' + this.getSize() +
    ', Spacing: ' + this.getSpacing();
};

/**
 * Check for equality.
 *
 * @param {dwv.image.Geometry} rhs The object to compare to.
 * @returns {boolean} True if both objects are equal.
 */
dwv.image.Geometry.prototype.equals = function (rhs) {
  return rhs !== null &&
    this.getOrigin().equals(rhs.getOrigin()) &&
    this.getSize().equals(rhs.getSize()) &&
    this.getSpacing().equals(rhs.getSpacing());
};

/**
 * Convert an index to an offset in memory.
 *
 * @param {object} index The index to convert.
 * @returns {number} The offset.
 */
dwv.image.Geometry.prototype.indexToOffset = function (index) {
  var size = this.getSize();
  var offset = 0;
  for (var i = 0; i < index.length(); ++i) {
    offset += index.get(i) * size.getDimSize(i);
  }
  return offset;
};

/**
 * Convert an offset in memory to an index.
 *
 * @param {number} offset The offset to convert.
 * @returns {object} The index.
 */
dwv.image.Geometry.prototype.offsetToIndex = function (offset) {
  var size = this.getSize();
  var values = new Array(size.length());
  var off = offset;
  var dimSize = 0;
  for (var i = size.length() - 1; i > 0; --i) {
    dimSize = size.getDimSize(i);
    values[i] = Math.floor(off / dimSize);
    off = off - values[i] * dimSize;
  }
  values[0] = off;
  return new dwv.math.Index(values);
};

/**
 * Convert an index into world coordinates.
 *
 * @param {object} index The index to convert.
 * @returns {dwv.image.Point3D} The corresponding point.
 */
dwv.image.Geometry.prototype.indexToWorld = function (index) {
  var origin = this.getOrigin();
  var spacing = this.getSpacing();
  return new dwv.math.Point3D(
    origin.getX() + index.get(0) * spacing.getColumnSpacing(),
    origin.getY() + index.get(1) * spacing.getRowSpacing(),
    origin.getZ() + index.get(2) * spacing.getSliceSpacing());
};

/**
 * Convert world coordinates into an index.
 *
 * @param {object} point The point to convert.
 * @returns {dwv.image.Index} The corresponding index.
 */
dwv.image.Geometry.prototype.worldToIndex = function (point) {
  var origin = this.getOrigin();
  var spacing = this.getSpacing();
  return new dwv.math.Point3D(
    point.getX() / spacing.getColumnSpacing() - origin.getX(),
    point.getY() / spacing.getRowSpacing() - origin.getY(),
    point.getZ() / spacing.getSliceSpacing() - origin.getZ());
};
