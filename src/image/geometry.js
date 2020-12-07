// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * 2D/3D Size class.
 *
 * @class
 * @param {number} numberOfColumns The number of columns.
 * @param {number} numberOfRows The number of rows.
 * @param {number} numberOfSlices The number of slices.
 */
dwv.image.Size = function (numberOfColumns, numberOfRows, numberOfSlices) {
  /**
   * Get the number of columns.
   *
   * @returns {number} The number of columns.
   */
  this.getNumberOfColumns = function () {
    return numberOfColumns;
  };
  /**
   * Get the number of rows.
   *
   * @returns {number} The number of rows.
   */
  this.getNumberOfRows = function () {
    return numberOfRows;
  };
  /**
   * Get the number of slices.
   *
   * @returns {number} The number of slices.
   */
  this.getNumberOfSlices = function () {
    return (numberOfSlices || 1.0);
  };
};

/**
 * Get the size of a slice.
 *
 * @returns {number} The size of a slice.
 */
dwv.image.Size.prototype.getSliceSize = function () {
  return this.getNumberOfColumns() * this.getNumberOfRows();
};

/**
 * Get the total size.
 *
 * @returns {number} The total size.
 */
dwv.image.Size.prototype.getTotalSize = function () {
  return this.getSliceSize() * this.getNumberOfSlices();
};

/**
 * Check for equality.
 *
 * @param {dwv.image.Size} rhs The object to compare to.
 * @returns {boolean} True if both objects are equal.
 */
dwv.image.Size.prototype.equals = function (rhs) {
  return rhs !== null &&
        this.getNumberOfColumns() === rhs.getNumberOfColumns() &&
        this.getNumberOfRows() === rhs.getNumberOfRows() &&
        this.getNumberOfSlices() === rhs.getNumberOfSlices();
};

/**
 * Check that coordinates are within bounds.
 *
 * @param {number} i The column coordinate.
 * @param {number} j The row coordinate.
 * @param {number} k The slice coordinate.
 * @returns {boolean} True if the given coordinates are within bounds.
 */
dwv.image.Size.prototype.isInBounds = function (i, j, k) {
  if (i < 0 || i > this.getNumberOfColumns() - 1 ||
        j < 0 || j > this.getNumberOfRows() - 1 ||
        k < 0 || k > this.getNumberOfSlices() - 1) {
    return false;
  }
  return true;
};

/**
 * Get a string representation of the Vector3D.
 *
 * @returns {string} The vector as a string.
 */
dwv.image.Size.prototype.toString = function () {
  return '(' + this.getNumberOfColumns() +
        ', ' + this.getNumberOfRows() +
        ', ' + this.getNumberOfSlices() + ')';
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
   * @returns {object} The object size.
   */
  this.getSize = function () {
    return size;
  };
  /**
   * Get the object spacing.
   *
   * @returns {object} The object spacing.
   */
  this.getSpacing = function () {
    return spacing;
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
    // we have the closest point, are we before or after
    var normal = new dwv.math.Vector3D(
      orientation.get(2, 0), orientation.get(2, 1), orientation.get(2, 2));
    var dotProd = normal.dotProduct(point.minus(origins[closestSliceIndex]));
    var sliceIndex = (dotProd > 0) ? closestSliceIndex + 1 : closestSliceIndex;
    return sliceIndex;
  };

  /**
   * Append an origin to the geometry.
   *
   * @param {object} origin The origin to append.
   * @param {number} index The index at which to append.
   */
  this.appendOrigin = function (origin, index) {
    // add in origin array
    origins.splice(index, 0, origin);
    // increment slice number
    size = new dwv.image.Size(
      size.getNumberOfColumns(),
      size.getNumberOfRows(),
      size.getNumberOfSlices() + 1);
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
 * @returns {number} The offset
 */
dwv.image.Geometry.prototype.indexToOffset = function (index) {
  var size = this.getSize();
  return index.getI() +
       index.getJ() * size.getNumberOfColumns() +
       index.getK() * size.getSliceSize();
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
    origin.getX() + index.getI() * spacing.getColumnSpacing(),
    origin.getY() + index.getJ() * spacing.getRowSpacing(),
    origin.getZ() + index.getK() * spacing.getSliceSpacing());
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
