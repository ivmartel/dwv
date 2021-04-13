// namespaces
var dwv = dwv || {};
dwv.dicom = dwv.dicom || {};

/**
 * Immutable tag.
 *
 * @class
 * @param {string} group The tag group.
 * @param {string} element The tag element.
 */
dwv.dicom.Tag = function (group, element) {
  /**
   * Get the tag group.
   *
   * @returns {string} The tag group.
   */
  this.getGroup = function () {
    return group;
  };
  /**
   * Get the tag element.
   *
   * @returns {string} The tag element.
   */
  this.getElement = function () {
    return element;
  };
}; // Tag class

/**
 * Check for Tag equality.
 *
 * @param {object} rhs The other tag to compare to.
 * @returns {boolean} True if both tags are equal.
 */
dwv.dicom.Tag.prototype.equals = function (rhs) {
  return rhs !== null &&
    this.getGroup() === rhs.getGroup() &&
    this.getElement() === rhs.getElement();
};

/**
 * Check for Tag equality.
 *
 * @param {object} rhs The other tag to compare to provided as a simple object.
 * @returns {boolean} True if both tags are equal.
 */
dwv.dicom.Tag.prototype.equals2 = function (rhs) {
  if (rhs === null ||
    typeof rhs.group === 'undefined' ||
    typeof rhs.element === 'undefined') {
    return false;
  }
  return this.equals(new dwv.dicom.Tag(rhs.group, rhs.element));
};

// Get the FileMetaInformationGroupLength Tag.
dwv.dicom.getFileMetaInformationGroupLengthTag = function () {
  return new dwv.dicom.Tag('0x0002', '0x0000');
};
// Get the Item Tag.
dwv.dicom.getItemTag = function () {
  return new dwv.dicom.Tag('0xFFFE', '0xE000');
};
// Get the ItemDelimitationItem Tag.
dwv.dicom.getItemDelimitationItemTag = function () {
  return new dwv.dicom.Tag('0xFFFE', '0xE00D');
};
// Get the SequenceDelimitationItem Tag.
dwv.dicom.getSequenceDelimitationItemTag = function () {
  return new dwv.dicom.Tag('0xFFFE', '0xE0DD');
};
// Get the PixelData Tag.
dwv.dicom.getPixelDataTag = function () {
  return new dwv.dicom.Tag('0x7FE0', '0x0010');
};

/**
 * Get the group-element key used to store DICOM elements.
 *
 * @param {number} group The DICOM group.
 * @param {number} element The DICOM element.
 * @returns {string} The key.
 */
dwv.dicom.getGroupElementKey = function (group, element) {
  return 'x' + group.substr(2, 6) + element.substr(2, 6);
};

/**
 * Split a group-element key used to store DICOM elements.
 *
 * @param {string} key The key in form "x00280102.
 * @returns {object} The DICOM group and element.
 */
dwv.dicom.splitGroupElementKey = function (key) {
  return {group: key.substr(1, 4), element: key.substr(5, 8)};
};

/**
 * Does this tag have a VR.
 * Basically the Item, ItemDelimitationItem and SequenceDelimitationItem tags.
 *
 * @param {string} group The tag group.
 * @param {string} element The tag element.
 * @returns {boolean} True if this tar has a VR.
 */
dwv.dicom.isTagWithVR = function (group, element) {
  return !(group === '0xFFFE' &&
    (element === '0xE000' || element === '0xE00D' || element === '0xE0DD')
  );
};
