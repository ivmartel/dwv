/**
 * Error strings and helpers shared by mask painting
 * ({@link BrushMaskPaint}, {@link BrushDragBehavior}).
 */

export const ERROR_MESSAGES = {
  brush: {
    noSourceDataId: 'No source data ID defined',
    noSourceDataIdAdd: 'No source data ID defined when adding mask slices',
    noSourceImage: 'No source image to get origins, ID: {0}',
    noSourceImageCreateMask: 'No source image to create mask',
    noSourceImageGetOffset: 'No source image to get offsets, ID: {0}',
    noBrushOrigins: 'No brush origins',
    noBrushColour: 'No brush colour',
    noMaskDefined: 'No mask defined when adding mask slices',
    noCreatedMaskImage: 'No created mask image',
    noMaskImage: 'No mask image for temporary draw command, ID: {0}',
    noMaskImageGetOffset: 'No mask image to get offsets from',
    noMaskImageDraw: 'No mask image for draw command, ID: {0}',
    noMaskId: 'No mask ID to apply mask index',
    noMaskImageForApply: 'No mask image for apply index, ID: {0}',
    noSegments: 'No segments have been set for a new mask',
    noMaskViewLayers: 'No mask view layers',
    noSelectedSegmentNumber: 'No selected segment number',
    tooManyMaskLayers: 'Too many mask view layers: {0}',
    moreMaskLayers: 'More mask layers than expected',
    cannotCreateMask: 'Cannot create mask with no source ID',
    cannotDisplayMask: 'Cannot display mask with no mask ID',
    cannotDrawNoMaskId: 'Cannot draw with no mask data ID',
    cannotDrawNoOffset: 'Cannot draw with no offsets',
    cannotDrawNoSegment: 'Cannot draw with no selected segment',
    cannotDrawNoColourList: 'Cannot draw with no colour list',
    cannotGetMaskLayers: 'Cannot get mask layers with no mask ID',
    cannotGetMaskVCNoMaskId: 'Cannot get mask view controller: no mask ID',
    cannotGetMaskVCNoMaskLayers:
      'Cannot get mask view controller: no mask layers',
    cannotSaveNoSourceId: 'Cannot save with no source data ID',
    cannotSaveNoMask: 'Cannot save with no mask',
    cannotFindSourceData:
      'Cannot find source data for an existing mask, ID: {0}',
    cannotFindSegment: 'Cannot find a segment for the selected number: {0}',
    unsupportedScrollIndex: 'Unsupported scroll index: {0}'
  }
};

/**
 * @param {*} template The template where to add values.
 * @param  {...any} values The values to add to the template.
 * @returns {string} The formated string.
 */
export function formatString(template, ...values) {
  return template.replace(/{(\d+)}/g, (_match, index) => values[index] || '');
}
