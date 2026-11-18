// list of icons as emoji
const icons = {
  // plus
  add: '\u2795',
  // floppy
  save: '\u{1F4BE}',
  // eye
  view: '\u{1F441}\u{FE0F}',
  // cross
  delete: '\u{274C}',
  // label
  label: '\u{1F3F7}\u{FE0F}',
  // lock
  lock: '\u{1F512}',
  // information
  info: '\u{2139}',

  // north east arrow
  arrow: '\u{2197}',
  // straight ruler
  ruler: '\u{1F4CF}',
  // black large square
  rectangle: '\u{2B1B}',
  // medium black circle
  circle: '\u{26AB}',
  // rugby footbal
  ellipse: '\u{1F3C9}',
  // triangular ruler
  protractor: '\u{1F4D0}',
  // wavy dash
  roi: '\u{3030}',
  //FALLING DIAGONAL CROSSING NORTH EAST ARROW
  bidimensional: '\u{292F}',
};

/**
 * Get an HTML element representing the input concept.
 *
 * @param {string} name The concept.
 * @returns {HTMLElement} The element.
 */
export function getIconElement(name) {
  let text = icons[name.toLowerCase()];
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
  button.name = name;
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
    button.value = '1';
    button.style.borderStyle = 'inset';
  } else {
    button.value = '0';
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
  return button.value === '1';
}
