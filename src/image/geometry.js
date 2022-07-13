// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * 2D/3D Geometry class.
 *
 * @class
 * @param {dwv.math.Point3D} origin The object origin (a 3D point).
 * @param {dwv.image.Size} size The object size.
 * @param {dwv.image.Spacing} spacing The object spacing.
 * @param {dwv.math.Matrix33} orientation The object orientation (3*3 matrix,
 *   default to 3*3 identity).
 * @param {number} time Optional time index.
 */
dwv.image.Geometry = function (origin, size, spacing, orientation, time) {
  var origins = [origin];
  // local helper object for time points
  var timeOrigins = {};
  var initialTime;
  if (typeof time !== 'undefined') {
    initialTime = time;
    timeOrigins[time] = [origin];
  }
  // check input orientation
  if (typeof orientation === 'undefined') {
    orientation = new dwv.math.getIdentityMat33();
  }
  // flag to know if new origins were added
  var newOrigins = false;

  /**
   * Get the time value that was passed at construction.
   *
   * @returns {number} The time value.
   */
  this.getInitialTime = function () {
    return initialTime;
  };

  /**
   * Get the total number of slices.
   * Can be different from what is stored in the size object
   *  during a volume with time points creation process.
   *
   * @returns {number} The total count.
   */
  this.getCurrentTotalNumberOfSlices = function () {
    var keys = Object.keys(timeOrigins);
    if (keys.length === 0) {
      return origins.length;
    }
    var count = 0;
    for (var i = 0; i < keys.length; ++i) {
      count += timeOrigins[keys[i]].length;
    }
    return count;
  };

  /**
   * Check if a time point has associated slices.
   *
   * @param {number} time The time point to check.
   * @returns {boolean} True if slices are present.
   */
  this.hasSlicesAtTime = function (time) {
    return typeof timeOrigins[time] !== 'undefined';
  };

  /**
   * Get the number of slices stored for time points preceding
   * the input one.
   *
   * @param {number} time The time point to check.
   * @returns {number} The count.
   */
  this.getCurrentNumberOfSlicesBeforeTime = function (time) {
    var keys = Object.keys(timeOrigins);
    if (keys.length === 0) {
      return;
    }
    var count = 0;
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i];
      if (parseInt(key, 10) === time) {
        break;
      }
      count += timeOrigins[key].length;
    }
    return count;
  };

  /**
   * Get the object origin.
   * This should be the lowest origin to ease calculations (?).
   *
   * @returns {dwv.math.Point3D} The object origin.
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
   * Check if a point is in the origin list.
   *
   * @param {dwv.math.Point3D} point3D The point to check.
   * @returns {boolean} True if in list.
   */
  this.includesOrigin = function (point3D) {
    for (var i = 0; i < origins.length; ++i) {
      if (origins[i].isSimilar(point3D, dwv.math.BIG_EPSILON)) {
        return true;
      }
    }
    return false;
  };

  /**
   * Get the object size.
   * Warning: the size comes as stored in DICOM, meaning that it could
   * be oriented.
   *
   * @param {dwv.math.Matrix33} viewOrientation The view orientation (optional)
   * @returns {dwv.image.Size} The object size.
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
      res = new dwv.image.Size(values.concat(size.getValues().slice(3)));
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
    var sliceSpacing = null;
    // (x, y, z) = orientationMatrix * (i, j, k)
    // -> inv(orientationMatrix) * (x, y, z) = (i, j, k)
    // applied on the patient position, reorders indices
    // so that Z is the slice direction
    var invOrientation = orientation.getInverse();
    var deltas = [];
    for (var i = 0; i < origins.length - 1; ++i) {
      var origin1 = invOrientation.multiplyVector3D(origins[i]);
      var origin2 = invOrientation.multiplyVector3D(origins[i + 1]);
      var diff = Math.abs(origin1.getZ() - origin2.getZ());
      if (diff === 0) {
        throw new Error('Zero slice spacing.' +
          origin1.toString() + ' ' + origin2.toString());
      }
      if (sliceSpacing === null) {
        sliceSpacing = diff;
      } else {
        if (!dwv.math.isSimilar(sliceSpacing, diff, dwv.math.BIG_EPSILON)) {
          deltas.push(Math.abs(sliceSpacing - diff));
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

    return sliceSpacing;
  };

  /**
   * Get the object spacing.
   * Warning: the spacing comes as stored in DICOM, meaning that it could
   * be oriented.
   *
   * @param {dwv.math.Matrix33} viewOrientation The view orientation (optional)
   * @returns {dwv.image.Spacing} The object spacing.
   */
  this.getSpacing = function (viewOrientation) {
    // update slice spacing after appendSlice
    if (newOrigins) {
      var values = spacing.getValues();
      values[2] = this.getSliceGeometrySpacing();
      spacing = new dwv.image.Spacing(values);
      newOrigins = false;
    }
    var res = spacing;
    if (viewOrientation && typeof viewOrientation !== 'undefined') {
      var orientedValues = dwv.math.getOrientedArray3D(
        [
          spacing.get(0),
          spacing.get(1),
          spacing.get(2)
        ],
        viewOrientation);
      res = new dwv.image.Spacing(orientedValues);
    }
    return res;
  };

  /**
   * Get the image spacing in real world.
   *
   * @returns {dwv.image.Spacing} The object spacing.
   */
  this.getRealSpacing = function () {
    // asOneAndZeros to not change spacing values...
    return this.getSpacing(orientation.getInverse().asOneAndZeros());
  };

  /**
   * Get the object orientation.
   *
   * @returns {dwv.math.Matrix33} The object orientation.
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
   * @param {dwv.math.Point3D} point The point to evaluate.
   * @param {number} time Optional time index.
   * @returns {number} The slice index.
   */
  this.getSliceIndex = function (point, time) {
    // cannot use this.worldToIndex(point).getK() since
    // we cannot guaranty consecutive slices...

    var localOrigins = origins;
    if (typeof time !== 'undefined') {
      localOrigins = timeOrigins[time];
    }

    // find the closest index
    var closestSliceIndex = 0;
    var minDist = point.getDistance(localOrigins[0]);
    var dist = 0;
    for (var i = 0; i < localOrigins.length; ++i) {
      dist = point.getDistance(localOrigins[i]);
      if (dist < minDist) {
        minDist = dist;
        closestSliceIndex = i;
      }
    }
    var closestOrigin = localOrigins[closestSliceIndex];
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
    var test = dotProd < 0;
    // TODO: check why coronal behaves differently...
    if (orientation.getThirdColMajorDirection() === 1) {
      test = dotProd > 0;
    }
    // oposite vectors get higher index
    var sliceIndex = test ? closestSliceIndex + 1 : closestSliceIndex;
    return sliceIndex;
  };

  /**
   * Append an origin to the geometry.
   *
   * @param {dwv.math.Point3D} origin The origin to append.
   * @param {number} index The index at which to append.
   * @param {number} time Optional time index.
   */
  this.appendOrigin = function (origin, index, time) {
    if (typeof time !== 'undefined') {
      timeOrigins[time].splice(index, 0, origin);
    }
    if (typeof time === 'undefined' || time === initialTime) {
      newOrigins = true;
      // add in origin array
      origins.splice(index, 0, origin);
      // increment second dimension
      var values = size.getValues();
      values[2] += 1;
      size = new dwv.image.Size(values);
    }
  };

  /**
   * Append a frame to the geometry.
   *
   * @param {dwv.math.Point3D} origin The origin to append.
   * @param {number} time Optional time index.
   */
  this.appendFrame = function (origin, time) {
    // add origin to list
    timeOrigins[time] = [origin];
    // increment third dimension
    var sizeValues = size.getValues();
    var spacingValues = spacing.getValues();
    if (sizeValues.length === 4) {
      sizeValues[3] += 1;
    } else {
      sizeValues.push(2);
      spacingValues.push(1);
    }
    size = new dwv.image.Size(sizeValues);
    spacing = new dwv.image.Spacing(spacingValues);
  };

};

/**
 * Get a string representation of the geometry.
 *
 * @returns {string} The geometry as a string.
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
 * Check that a point is within bounds.
 *
 * @param {dwv.math.Point} point The point to check.
 * @returns {boolean} True if the given coordinates are within bounds.
 */
dwv.image.Geometry.prototype.isInBounds = function (point) {
  return this.isIndexInBounds(this.worldToIndex(point));
};

/**
 * Check that a index is within bounds.
 *
 * @param {dwv.math.Index} index The index to check.
 * @param {Array} dirs Optional list of directions to check.
 * @returns {boolean} True if the given coordinates are within bounds.
 */
dwv.image.Geometry.prototype.isIndexInBounds = function (index, dirs) {
  return this.getSize().isInBounds(index, dirs);
};

/**
 * Flip the K index.
 *
 * @param {dwv.image.Size} size The image size.
 * @param {number} k The index.
 * @returns {number} The flipped index.
 */
function flipK(size, k) {
  return (size.get(2) - 1) - k;
}

/**
 * Convert an index into world coordinates.
 *
 * @param {dwv.math.Index} index The index to convert.
 * @returns {dwv.math.Point} The corresponding point.
 */
dwv.image.Geometry.prototype.indexToWorld = function (index) {
  // flip K index (because of the slice order given by getSliceIndex)
  var k = flipK(this.getSize(), index.get(2));
  // apply spacing
  // (spacing is oriented, apply before orientation)
  var spacing = this.getSpacing();
  var orientedPoint3D = new dwv.math.Point3D(
    index.get(0) * spacing.get(0),
    index.get(1) * spacing.get(1),
    k * spacing.get(2)
  );
  // de-orient
  var point3D = this.getOrientation().multiplyPoint3D(orientedPoint3D);
  // keep >3d values
  var values = index.getValues();
  var origin = this.getOrigin();
  values[0] = origin.getX() + point3D.getX();
  values[1] = origin.getY() + point3D.getY();
  values[2] = origin.getZ() + point3D.getZ();
  // return point
  return new dwv.math.Point(values);
};

/**
 * Convert a 3D point into world coordinates.
 *
 * @param {dwv.math.Point3D} point The 3D point to convert.
 * @returns {dwv.math.Point3D} The corresponding world 3D point.
 */
dwv.image.Geometry.prototype.pointToWorld = function (point) {
  // flip K index (because of the slice order given by getSliceIndex)
  var k = flipK(this.getSize(), point.getZ());
  // apply spacing
  // (spacing is oriented, apply before orientation)
  var spacing = this.getSpacing();
  var orientedPoint3D = new dwv.math.Point3D(
    point.getX() * spacing.get(0),
    point.getY() * spacing.get(1),
    k * spacing.get(2)
  );
  // de-orient
  var point3D = this.getOrientation().multiplyPoint3D(orientedPoint3D);
  // return point3D
  var origin = this.getOrigin();
  return new dwv.math.Point3D(
    origin.getX() + point3D.getX(),
    origin.getY() + point3D.getY(),
    origin.getZ() + point3D.getZ()
  );
};

/**
 * Convert world coordinates into an index.
 *
 * @param {dwv.math.Point} point The point to convert.
 * @returns {dwv.math.Index} The corresponding index.
 */
dwv.image.Geometry.prototype.worldToIndex = function (point) {
  // compensate for origin
  // (origin is not oriented, compensate before orientation)
  // TODO: use slice origin...
  var origin = this.getOrigin();
  var point3D = new dwv.math.Point3D(
    point.get(0) - origin.getX(),
    point.get(1) - origin.getY(),
    point.get(2) - origin.getZ()
  );
  // orient
  var orientedPoint3D =
    this.getOrientation().getInverse().multiplyPoint3D(point3D);
  // keep >3d values
  var values = point.getValues();
  // apply spacing and round
  var spacing = this.getSpacing();
  values[0] = Math.round(orientedPoint3D.getX() / spacing.get(0));
  values[1] = Math.round(orientedPoint3D.getY() / spacing.get(1));
  // flip K index (because of the slice order given by getSliceIndex)
  var k = Math.round(orientedPoint3D.getZ() / spacing.get(2));
  // abs to fix #1163
  // TODO: find out why k can sometimes be negative...
  values[2] = flipK(this.getSize(), k);

  // return index
  return new dwv.math.Index(values);
};
