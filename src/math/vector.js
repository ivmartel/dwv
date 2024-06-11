/**
 * Immutable 3D vector.
 */
export class Vector3D {

  /**
   * X coordinate.
   *
   * @type {number}
   */
  #x;

  /**
   * Y coordinate.
   *
   * @type {number}
   */
  #y;

  /**
   * Z coordinate.
   *
   * @type {number}
   */
  #z;

  /**
   * @param {number} x The X component of the vector.
   * @param {number} y The Y component of the vector.
   * @param {number} z The Z component of the vector.
   */
  constructor(x, y, z) {
    this.#x = x;
    this.#y = y;
    this.#z = z;
  }

  /**
   * Get the X component of the vector.
   *
   * @returns {number} The X component of the vector.
   */
  getX() {
    return this.#x;
  }

  /**
   * Get the Y component of the vector.
   *
   * @returns {number} The Y component of the vector.
   */
  getY() {
    return this.#y;
  }

  /**
   * Get the Z component of the vector.
   *
   * @returns {number} The Z component of the vector.
   */
  getZ() {
    return this.#z;
  }

  /**
   * Check for Vector3D equality.
   *
   * @param {Vector3D} rhs The other vector to compare to.
   * @returns {boolean} True if both vectors are equal.
   */
  equals(rhs) {
    return rhs !== null &&
      this.#x === rhs.getX() &&
      this.#y === rhs.getY() &&
      this.#z === rhs.getZ();
  }

  /**
   * Get a string representation of the Vector3D.
   *
   * @returns {string} The vector as a string.
   */
  toString() {
    return '(' + this.#x +
      ', ' + this.#y +
      ', ' + this.#z + ')';
  }

  /**
   * Get the norm of the vector.
   *
   * @returns {number} The norm.
   */
  norm() {
    return Math.sqrt(
      (this.#x * this.#x) +
      (this.#y * this.#y) +
      (this.#z * this.#z)
    );
  }

  /**
   * Get the cross product with another Vector3D, ie the
   * vector that is perpendicular to both a and b.
   * If both vectors are parallel, the cross product is a zero vector.
   *
   * Ref: {@link https://en.wikipedia.org/wiki/Cross_product}.
   *
   * @param {Vector3D} vector3D The input vector.
   * @returns {Vector3D} The result vector.
   */
  crossProduct(vector3D) {
    return new Vector3D(
      (this.#y * vector3D.getZ()) - (vector3D.getY() * this.#z),
      (this.#z * vector3D.getX()) - (vector3D.getZ() * this.#x),
      (this.#x * vector3D.getY()) - (vector3D.getX() * this.#y));
  }

  /**
   * Get the dot product with another Vector3D.
   *
   * Ref: {@link https://en.wikipedia.org/wiki/Dot_product}.
   *
   * @param {Vector3D} vector3D The input vector.
   * @returns {number} The dot product.
   */
  dotProduct(vector3D) {
    return (this.#x * vector3D.getX()) +
      (this.#y * vector3D.getY()) +
      (this.#z * vector3D.getZ());
  }

  /**
   * Is this vector codirectional to an input one.
   *
   * @param {Vector3D} vector3D The vector to test.
   * @returns {boolean} True if codirectional, false is opposite.
   */
  isCodirectional(vector3D) {
    // a.dot(b) = ||a|| * ||b|| * cos(theta)
    // (https://en.wikipedia.org/wiki/Dot_product#Geometric_definition)
    // -> the sign of the dot product depends on the cosinus of
    //    the angle between the vectors
    //   -> >0 => vectors are codirectional
    //   -> <0 => vectors are opposite
    return this.dotProduct(vector3D) > 0;
  }

} // Vector3D class