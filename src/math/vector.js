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
   * @param {object} rhs The other vector to compare to.
   * @returns {boolean} True if both vectors are equal.
   */
  equals(rhs) {
    return rhs !== null &&
      this.getX() === rhs.getX() &&
      this.getY() === rhs.getY() &&
      this.getZ() === rhs.getZ();
  }

  /**
   * Get a string representation of the Vector3D.
   *
   * @returns {string} The vector as a string.
   */
  toString() {
    return '(' + this.getX() +
      ', ' + this.getY() +
      ', ' + this.getZ() + ')';
  }

  /**
   * Get the norm of the vector.
   *
   * @returns {number} The norm.
   */
  norm() {
    return Math.sqrt(
      (this.getX() * this.getX()) +
      (this.getY() * this.getY()) +
      (this.getZ() * this.getZ())
    );
  }

  /**
   * Get the cross product with another Vector3D, ie the
   * vector that is perpendicular to both a and b.
   * If both vectors are parallel, the cross product is a zero vector.
   *
   * @see https://en.wikipedia.org/wiki/Cross_product
   * @param {Vector3D} vector3D The input vector.
   * @returns {Vector3D} The result vector.
   */
  crossProduct(vector3D) {
    return new Vector3D(
      (this.getY() * vector3D.getZ()) - (vector3D.getY() * this.getZ()),
      (this.getZ() * vector3D.getX()) - (vector3D.getZ() * this.getX()),
      (this.getX() * vector3D.getY()) - (vector3D.getX() * this.getY()));
  }

  /**
   * Get the dot product with another Vector3D.
   *
   * @see https://en.wikipedia.org/wiki/Dot_product
   * @param {Vector3D} vector3D The input vector.
   * @returns {number} The dot product.
   */
  dotProduct(vector3D) {
    return (this.getX() * vector3D.getX()) +
      (this.getY() * vector3D.getY()) +
      (this.getZ() * vector3D.getZ());
  }

} // Vector3D class