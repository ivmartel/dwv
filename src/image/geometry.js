// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

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
   * Get the object origin.
   * This should be the lowest origin to ease calculations (?).
   *
   * @returns {object} The object origin.
   */
  this.getOrigin = function () {
    return origins[origins.length - 1];
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
      if (mean > 1e-4) {
        dwv.logger.warn('Varying slice spacing, mean delta: ' +
          mean.toFixed(3) + ' (' + deltas.length + ' case(s))');
      }
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
   * Slice indices increase with decreasing origins (high index -> low origin),
   * this simplified the handling of reconstruction since it means
   * the displayed data is in the same 'direction' as the extracted data.
   * As seen in the getOrigin method, the main origin is the lowest one.
   * This implies that the index to world and reverse method do some flipping
   * magic...
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
 * Get the real size (spacing * size).
 *
 * @returns {Array} The real size.
 */
dwv.image.Geometry.prototype.getRealSize = function () {
  var size = this.getSize();
  var spacing = this.getSpacing();
  return [
    size.get(0) * spacing.getColumnSpacing(),
    size.get(1) * spacing.getRowSpacing(),
    size.get(2) * spacing.getSliceSpacing(),
  ];
};

/**
 * Check that a point is within bounds.
 *
 * @param {object} point3D The point to check.
 * @returns {boolean} True if the given coordinates are within bounds.
 */
dwv.image.Geometry.prototype.isInBounds = function (point3D) {
  // since the origin is the lowest point, we can use it as min
  var min = this.getOrigin();
  var realSize = this.getRealSize();
  var max = new dwv.math.Point3D(
    min.getX() + realSize[0],
    min.getY() + realSize[1],
    min.getZ() + realSize[2]
  );

  return point3D !== null &&
    point3D.getX() >= min.getX() &&
    point3D.getY() >= min.getY() &&
    point3D.getZ() >= min.getZ() &&
    point3D.getX() < max.getX() &&
    point3D.getY() < max.getY() &&
    point3D.getZ() < max.getZ();
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
 * Flip the K index.
 *
 * @param {object} size The image size.
 * @param {number} k The index.
 * @returns {number} The iflipped index.
 */
function flipK(size, k) {
  return (size.get(2) - 1) - k;
}

/**
 * Convert an index into world coordinates.
 *
 * @param {object} index The index to convert.
 * @returns {dwv.image.Point3D} The corresponding point.
 */
dwv.image.Geometry.prototype.indexToWorld = function (index) {
  var origin = this.getOrigin();
  var spacing = this.getSpacing();

  // flip K index (because of the slice order given by getSliceIndex)
  var k = flipK(this.getSize(), index.get(2));

  return new dwv.math.Point3D(
    origin.getX() + index.get(0) * spacing.getColumnSpacing(),
    origin.getY() + index.get(1) * spacing.getRowSpacing(),
    origin.getZ() + k * spacing.getSliceSpacing());
};

/**
 * Convert a point into world coordinates.
 *
 * @param {object} point The point to convert.
 * @returns {dwv.image.Point3D} The corresponding world point.
 */
dwv.image.Geometry.prototype.pointToWorld = function (point) {
  var origin = this.getOrigin();
  var spacing = this.getSpacing();

  // flip K index (because of the slice order given by getSliceIndex)
  var k = flipK(this.getSize(), point.getZ());

  return new dwv.math.Point3D(
    origin.getX() + point.getX() * spacing.getColumnSpacing(),
    origin.getY() + point.getY() * spacing.getRowSpacing(),
    origin.getZ() + k * spacing.getSliceSpacing());
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

  return new dwv.math.Index([
    Math.round((point.getX() - origin.getX()) / spacing.getColumnSpacing()),
    Math.round((point.getY() - origin.getY()) / spacing.getRowSpacing()),
    // flip K index (because of the slice order given by getSliceIndex)
    flipK(this.getSize(),
      Math.round((point.getZ() - origin.getZ()) / spacing.getSliceSpacing())
    )
  ]);
};
