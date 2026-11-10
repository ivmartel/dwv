import {logger} from '../../../src/utils/logger.js';
import {mergeMaskImages} from '../../../src/image/maskFactory.js';
import {MaskSegmentHelper} from '../../../src/image/maskSegmentHelper.js';

import {getButton} from './icons.js';

/**
 * @import {DwvAppService} from '../services/dwvApp.service.js';
 * @import {MaskImage} from '../../../src/image/maskImage.js';
 */

// overlap checker select ids
const selectIds = [
  'overlap-checker-select-list-0',
  'overlap-checker-select-list-1'
];

/**
 * Segmentation extra UI: overlap check and merge of two segmentations.
 * Listens to data add/remove events to list the mask data,
 *   referenced by their data id.
 */
export class SegmentationExtraUI {

  /**
   * The associated viewer dwvAppService.
   *
   * @type {DwvAppService}
   */
  #dwvAppService;

  /**
   * The root document.
   *
   * @type {Document}
   */
  #rootDoc = document;

  /**
   * With RTSS flag.
   *
   * @type {boolean}
   */
  #withRtss = true;

  /**
   * @param {DwvAppService} dwvAppService The associated viewer dwvAppService.
   * @param {Document} [rootDoc] Optional root document,
   *   defaults to `window.document`.
   */
  constructor(dwvAppService, rootDoc) {
    this.#dwvAppService = dwvAppService;
    if (typeof rootDoc !== 'undefined') {
      this.#rootDoc = rootDoc;
    }
  }

  /**
   * Setup the html and bind app to ui.
   */
  registerListeners() {
    this.#setupHtml();
    this.#dwvAppService.addEventListener('dataadd', this.#onDataAdd);
    this.#dwvAppService.addEventListener('dataremove', this.#onDataRemove);
  }

  /**
   * Handle a dataadd event: add mask data to the selects.
   *
   * @param {CustomEvent} event The dataadd event.
   */
  #onDataAdd = (event) => {
    const dataId = event.detail.dataid;
    const image = this.#dwvAppService.getDataController().get(dataId)?.image;
    if (typeof image !== 'undefined' && image.isMask()) {
      this.#addSegmentation(dataId);
    }
  };

  /**
   * Handle a dataremove event: remove the data from the selects.
   *
   * @param {CustomEvent} event The dataremove event.
   */
  #onDataRemove = (event) => {
    this.#removeSegmentation(event.detail.dataid);
  };

  /**
   * Setup the html, disabled until two segmentations are added.
   */
  #setupHtml() {
    // insert in the extra section, before the tests
    const testsEl = this.#rootDoc.getElementById('tests');
    if (!testsEl) {
      logger.warn('Cannot find tests element');
      return;
    }
    const overlapChecker = this.#getHtml();
    testsEl.parentElement.insertBefore(overlapChecker, testsEl);
    this.#updateDisabled();
  }

  /**
   * Add a segmentation to the selects.
   *
   * @param {string} dataId The segmentation data id.
   */
  #addSegmentation(dataId) {
    const selects = this.#getSelects();
    if (typeof selects === 'undefined') {
      logger.warn('Cannot find overlap checker select elements');
      return;
    }
    for (const select of selects) {
      const option = document.createElement('option');
      option.textContent = `data ${dataId}`;
      option.value = dataId;
      select.appendChild(option);
    }
    this.#updateDisabled();
  }

  /**
   * Remove a segmentation from the selects.
   *
   * @param {string} dataId The segmentation data id.
   */
  #removeSegmentation(dataId) {
    const selects = this.#getSelects();
    if (typeof selects === 'undefined') {
      return;
    }
    for (const select of selects) {
      const option = Array.from(select.options).find(
        (opt) => opt.value === dataId);
      if (option) {
        option.remove();
      }
    }
    this.#updateDisabled();
  }

  /**
   * Get the two select elements.
   *
   * @returns {HTMLSelectElement[]|undefined} The selects or undefined
   *   if not found.
   */
  #getSelects() {
    const selects = selectIds.map(
      (id) => this.#rootDoc.getElementById(id));
    if (selects.some((select) => !select)) {
      return;
    }
    return /** @type {HTMLSelectElement[]} */ (selects);
  }

  /**
   * Enable the controls if there are at least
   *   two segmentations to compare, disable them otherwise.
   */
  #updateDisabled() {
    const overlapChecker = this.#rootDoc.getElementById('overlap-checker');
    if (!overlapChecker) {
      return;
    }
    const selects = this.#getSelects();
    const disabled = typeof selects === 'undefined' ||
      selects[0].options.length < 2;
    // when activating, select the second segmentation in the second list
    if (!disabled && selects[1].disabled) {
      selects[1].selectedIndex = 1;
    }
    for (const element of overlapChecker.querySelectorAll('select, button')) {
      element.disabled = disabled;
    }
  }

  /**
   * Merge two mask images and save the result.
   *
   * @param {MaskImage} maskImage0 The first mask image.
   * @param {MaskImage} maskImage1 The second mask image.
   * @param {boolean} asRtss Whether to save as RTSS.
   */
  #mergeSave(maskImage0, maskImage1, asRtss) {
    const mergedImage = mergeMaskImages(maskImage0, maskImage1);
    let fileName;
    if (asRtss) {
      fileName = 'merged-segmentation-rtss';
    } else {
      fileName = 'merged-segmentation-seg';
    }
    this.#dwvAppService.saveMaskImage(mergedImage, fileName, asRtss);
  }

  /**
   * Get the HTML (overlap check and merge).
   *
   * @returns {HTMLDivElement} The HTML element.
   */
  #getHtml() {
    // create overlap checker
    const overlapChecker = document.createElement('div');
    overlapChecker.id = 'overlap-checker';
    overlapChecker.className = 'line';

    // dropdowns
    const overlapSelect0 = document.createElement('select');
    const overlapSelect1 = document.createElement('select');
    overlapSelect0.id = selectIds[0];
    overlapSelect1.id = selectIds[1];

    // label
    const overlapLabel = document.createElement('label');
    overlapLabel.htmlFor = overlapSelect0.id;
    overlapLabel.textContent = 'Segmentations:';
    overlapChecker.appendChild(overlapLabel);

    overlapChecker.appendChild(overlapSelect0);
    overlapChecker.appendChild(overlapSelect1);

    // button
    const overlapButton = document.createElement('button');
    overlapButton.innerHTML = 'Check Overlap';
    overlapChecker.appendChild(overlapButton);

    // result holder
    const overlapResult = document.createElement('div');

    /**
     * Get the mask images of the selected segmentations.
     *
     * @param {string} action The action name, for the error message.
     * @returns {MaskImage[]|undefined} The two mask images or undefined
     *   if one is missing.
     */
    const getSelectedMaskImages = (action) => {
      const dataCtrl = this.#dwvAppService.getDataController();
      const maskData0 = dataCtrl.get(overlapSelect0.value);
      const maskData1 = dataCtrl.get(overlapSelect1.value);
      if (typeof maskData0 === 'undefined' ||
        typeof maskData1 === 'undefined') {
        overlapResult.textContent = `Cannot ${action}: missing mask data.`;
        return;
      }
      return [maskData0.image, maskData1.image];
    };

    const saveSegButton = getButton('Save');
    saveSegButton.title = 'Merge and Save SEG';
    saveSegButton.onclick = () => {
      const maskImages = getSelectedMaskImages('merge');
      if (typeof maskImages !== 'undefined') {
        this.#mergeSave(maskImages[0], maskImages[1], false);
      }
    };
    overlapChecker.appendChild(saveSegButton);

    if (this.#withRtss) {
      const saveRtssButton = getButton('Save');
      saveRtssButton.title = 'Merge and Save RTSS';
      saveRtssButton.onclick = () => {
        const maskImages = getSelectedMaskImages('merge');
        if (typeof maskImages !== 'undefined') {
          this.#mergeSave(maskImages[0], maskImages[1], true);
        }
      };
      overlapChecker.appendChild(saveRtssButton);
    }

    overlapChecker.appendChild(overlapResult);

    overlapButton.onclick = (/*event*/) => {
      const maskImages = getSelectedMaskImages('check overlap');
      if (typeof maskImages === 'undefined') {
        return;
      }
      const [maskImage0, maskImage1] = maskImages;
      const segHelper0 = new MaskSegmentHelper(maskImage0);
      const segHelper1 = new MaskSegmentHelper(maskImage1);
      const overlap = segHelper0.findOverlap(segHelper1);

      overlapResult.replaceChildren(); // clear old results
      const overlapList = document.createElement('ul');
      for (
        const [/*segmentNumber0*/, segmentOverlap] of
        Object.entries(overlap)
      ) {
        // title (segment that these overlaps are for)
        // (use textContent: labels come from loaded data)
        const segmentLi = document.createElement('li');
        const overlapStrings = Object.values(segmentOverlap.overlap).map(
          (count) => `${count.label} (${
            count.count } voxels, ${
            (count.percentage).toPrecision(4) }%)`
        );
        segmentLi.textContent = `${ segmentOverlap.label
        } (${segmentOverlap.count} voxels): ${overlapStrings.join(', ')}`;

        overlapList.appendChild(segmentLi);
      }
      overlapResult.appendChild(overlapList);
    };

    return overlapChecker;
  }

} // SegmentationExtraUI
