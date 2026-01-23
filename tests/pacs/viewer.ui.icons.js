// list of icons as emoji
const icons = {
  // plus
  Add: '\u2795',
  // floppy
  Save: '\u{1F4BE}',
  // target
  Goto: '\u{1F3AF}',
  // eye
  View: '\u{1F441}\u{FE0F}',
  // cross
  Delete: '\u{274C}',
  // label
  Label: '\u{1F3F7}\u{FE0F}',
  // lock
  Lock: '\u{1F512}'
};

/**
 * Get an HTML element representing the input concept.
 *
 * @param {string} name The concept.
 * @returns {HTMLElement} The element.
 */
function getIconElement(name) {
  let text = icons[name];
  if (typeof text === 'undefined') {
    text = name;
  }
  return document.createTextNode(text);
}

/**
 * Get a button for a given name.
 *
 * @param {string} name The name of the button.
 * @returns {HTMLButtonElement} The button element.
 */
export function getButton(name) {
  const button = document.createElement('button');
  button.title = name;
  button.appendChild(getIconElement(name));
  return button;
}

/**
 * Set a button as pressed or not.
 *
 * @param {HTMLButtonElement} button The button to set state.
 * @param {boolean} state True to set as pressed.
 */
export function setButtonPressed(button, state) {
  if (state) {
    button.style.borderStyle = 'inset';
  } else {
    button.style.borderStyle = 'outset';
  }
}

/**
 * Get a button pressed state.
 *
 * @param {HTMLButtonElement} button The button to get state.
 * @returns {boolean} True if pressed.
 */
export function isButtonPressed(button) {
  return button.style.borderStyle === 'inset';
}
