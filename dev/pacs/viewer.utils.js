/**
 * Get a HTML id from a prefix and root part.
 *
 * @param {string} prefix The id prefix.
 * @param {string} root The root.
 * @returns {string} The HTML id.
 */
export function getHtmlId(prefix, root) {
  return prefix + root;
};

/**
 * Get the root part from an HTML id.
 *
 * @param {string} prefix The id prefix.
 * @param {string} htmlId The HTML id.
 * @returns {string} The root.
 */
export function getRootFromHtmlId(prefix, htmlId) {
  return htmlId.substring(prefix.length);
};

/**
 * Get a control div: label, range and number field.
 *
 * @param {string} id The control id.
 * @param {string} name The control name.
 * @param {number} min The control minimum value.
 * @param {number} max The control maximum value.
 * @param {number} value The control value.
 * @param {Function} callback The callback on control value change.
 * @param {number} precision Number field float precision.
 * @param {number} step The control step.
 * @returns {HTMLDivElement} The control div.
 */
export function getControlDiv(
  id,
  name,
  min,
  max,
  value,
  callback,
  precision,
  step) {
  const range = document.createElement('input');
  range.id = `${id}-range`;
  range.className = 'ctrl-range';
  range.type = 'range';
  range.min = min.toPrecision(precision);
  range.max = max.toPrecision(precision);
  if (typeof step !== 'undefined') {
    range.step = step;
  } else {
    range.step = ((max - min) * 0.01).toPrecision(precision);
  }
  range.value = value.toString();

  const label = document.createElement('label');
  label.id = `${id}-label`;
  label.className = 'ctrl-label';
  label.htmlFor = range.id;
  label.appendChild(document.createTextNode(name));

  const number = document.createElement('input');
  number.id = `${id}-number`;
  number.className = 'ctrl-number';
  number.type = 'number';
  number.min = range.min;
  number.max = range.max;
  number.step = range.step;
  number.value = value.toPrecision(precision);

  // callback and bind range and number
  number.oninput = function (event) {
    const element = event.target;
    range.value = element.value;
    callback(element.value);
  };
  range.oninput = function (event) {
    const element = event.target;
    number.value = parseFloat(element.value).toPrecision(precision);
    callback(element.value);
  };

  const div = document.createElement('div');
  div.id = `${id}-ctrl`;
  div.className = 'ctrl';
  div.appendChild(label);
  div.appendChild(range);
  div.appendChild(number);

  return div;
};

/**
 * Merge a tool button with an option menu: selecting an option
 * in the menu calls the select callback and presses the tool button.
 *
 * @param {HTMLButtonElement} toolButton The tool button.
 * @param {string[]} options The menu options.
 * @param {Function} onSelect Callback called with the selected option
 *   before the tool button is pressed.
 * @param {string} idPrefix The prefix of the menu item ids.
 * @param {string} toggleTitle The title of the menu toggle button.
 * @returns {HTMLElement} The tool button with its option menu.
 */
export function getSplitButton(
  toolButton, options, onSelect, idPrefix, toggleTitle) {
  const res = document.createElement('span');
  res.className = 'tool-split-button';
  res.appendChild(toolButton);

  const menu = document.createElement('ul');
  menu.className = 'tool-menu';
  menu.hidden = true;

  const toggle = document.createElement('button');
  toggle.className = 'tool-menu-toggle';
  toggle.title = toggleTitle;
  toggle.setAttribute('aria-haspopup', 'true');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.appendChild(document.createTextNode('▾'));

  const showMenu = (flag) => {
    menu.hidden = !flag;
    toggle.setAttribute('aria-expanded', flag ? 'true' : 'false');
  };
  toggle.onclick = () => {
    showMenu(menu.hidden);
  };
  // close menu on outside click
  document.addEventListener('click', (event) => {
    if (!res.contains(event.target)) {
      showMenu(false);
    }
  });

  for (const option of options) {
    const item = document.createElement('li');
    item.id = `${idPrefix}${option}`;
    item.tabIndex = 0;
    item.appendChild(document.createTextNode(option));
    const selectOption = () => {
      showMenu(false);
      onSelect(option);
      toolButton.click();
    };
    item.onclick = selectOption;
    item.onkeydown = (event) => {
      if (event.key === 'Enter') {
        selectOption();
      }
    };
    menu.appendChild(item);
  }

  res.appendChild(toggle);
  res.appendChild(menu);

  return res;
};
