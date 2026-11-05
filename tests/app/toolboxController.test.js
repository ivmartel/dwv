import {describe, test, assert, vi, afterEach} from 'vitest';
import {ToolboxController} from '../../src/app/toolboxController.js';
import {InteractionEventNames} from '../../src/gui/generic.js';

/**
 * Tests for the 'app/toolboxController.js' file.
 */
/** @module tests/app */

/**
 * Test tool that records its calls.
 */
class TestTool {
  initCalls = 0;
  activateCalls = [];
  features = [];
  events = [];

  /**
   * Create a tool with handlers for the interaction events and keydown.
   */
  constructor() {
    for (const name of [...InteractionEventNames, 'keydown']) {
      this[name] = (event) => {
        this.events.push(event.type);
      };
    }
  }

  /**
   * Initialise the tool.
   */
  init() {
    this.initCalls++;
  }

  /**
   * Activate the tool.
   *
   * @param {boolean} flag The activation flag.
   */
  activate(flag) {
    this.activateCalls.push(flag);
  }

  /**
   * Set the tool features.
   *
   * @param {object} list The features.
   */
  setFeatures(list) {
    this.features.push(list);
  }
}

/**
 * Test layer: an event target with interaction bind counters.
 */
class TestLayer extends EventTarget {
  #id;
  bindCalls = 0;
  unbindCalls = 0;

  /**
   * @param {string} id The layer id.
   */
  constructor(id) {
    super();
    this.#id = id;
  }

  /**
   * Get the layer id.
   *
   * @returns {string} The id.
   */
  getId() {
    return this.#id;
  }

  /**
   * Bind interaction.
   */
  bindInteraction() {
    this.bindCalls++;
  }

  /**
   * Unbind interaction.
   */
  unbindInteraction() {
    this.unbindCalls++;
  }
}

/**
 * Test element: an event target with a tag name.
 */
class TestElement extends EventTarget {
  tagName;

  /**
   * @param {string} tagName The tag name.
   */
  constructor(tagName) {
    super();
    this.tagName = tagName;
  }
}

/**
 * Test layer group: an event target with a div id.
 */
class TestLayerGroup extends EventTarget {
  #divId;

  /**
   * @param {string} divId The div id.
   */
  constructor(divId) {
    super();
    this.#divId = divId;
  }

  /**
   * Get the div id.
   *
   * @returns {string} The id.
   */
  getDivId() {
    return this.#divId;
  }

  /**
   * Fire an active layer change event.
   *
   * @param {object} detail The event detail.
   */
  fireActiveLayerChange(detail) {
    this.dispatchEvent(new CustomEvent('activelayerchange', {detail}));
  }
}

/**
 * Create a touch-like event.
 *
 * @param {string} type The event type.
 * @param {number} [nTargetTouches] The number of touches still on
 *   the event target.
 * @returns {Event} The event.
 */
function touchEvent(type, nTargetTouches = 0) {
  const event = new Event(type);
  Object.defineProperty(event, 'targetTouches', {
    value: new Array(nTargetTouches).fill({})
  });
  return event;
}

/**
 * Create a controller with two test tools.
 *
 * @param {EventTarget} [rootDocument] Optional root document.
 * @returns {object} The controller and its tools.
 */
function makeController(rootDocument) {
  const tool0 = new TestTool();
  const tool1 = new TestTool();
  const controller = new ToolboxController({tool0, tool1}, rootDocument);
  return {controller, tool0, tool1};
}

describe('app', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Tests for {@link ToolboxController} tool selection.
   */
  describe('ToolboxController tools', () => {

    test('tool list', () => {
      const {controller, tool0} = makeController();
      assert.deepEqual(Object.keys(controller.getToolList()),
        ['tool0', 'tool1']);
      assert.equal(controller.getToolList().tool0, tool0);
      assert.isTrue(controller.hasTool('tool0'));
      assert.isFalse(controller.hasTool('unknown'));
    });

    test('init initialises all tools', () => {
      const {controller, tool0, tool1} = makeController();
      controller.init();
      assert.equal(tool0.initCalls, 1);
      assert.equal(tool1.initCalls, 1);
    });

    test('setSelectedTool', () => {
      const {controller, tool0, tool1} = makeController();
      assert.isNull(controller.getSelectedTool());

      controller.setSelectedTool('tool0');
      assert.equal(controller.getSelectedTool(), tool0);
      assert.deepEqual(tool0.activateCalls, [true]);

      // switching de-activates the previous one
      controller.setSelectedTool('tool1');
      assert.equal(controller.getSelectedTool(), tool1);
      assert.deepEqual(tool0.activateCalls, [true, false]);
      assert.deepEqual(tool1.activateCalls, [true]);
    });

    test('setSelectedTool unknown tool', () => {
      const {controller, tool0} = makeController();
      controller.setSelectedTool('tool0');
      assert.throws(() => {
        controller.setSelectedTool('unknown');
      }, /Unknown tool: 'unknown'/);
      // selection is unchanged
      assert.equal(controller.getSelectedTool(), tool0);
      assert.deepEqual(tool0.activateCalls, [true]);
    });

    test('getSelectedToolEventHandler', () => {
      const {controller, tool0} = makeController();
      // no selected tool
      assert.isUndefined(controller.getSelectedToolEventHandler('mousedown'));
      controller.setSelectedTool('tool0');
      assert.equal(
        controller.getSelectedToolEventHandler('mousedown'), tool0.mousedown);
    });

    test('setToolFeatures', () => {
      const {controller, tool0} = makeController();
      // no selected tool: no-op
      assert.doesNotThrow(() => {
        controller.setToolFeatures({a: 1});
      });
      controller.setSelectedTool('tool0');
      controller.setToolFeatures({b: 2});
      assert.deepEqual(tool0.features, [{b: 2}]);
    });

  });

  /**
   * Tests for {@link ToolboxController} keyboard shortcuts.
   */
  describe('ToolboxController shortcuts', () => {

    /**
     * Create a keydown event.
     *
     * @param {EventTarget} [target] Optional event target.
     * @returns {Event} The event.
     */
    function keydown(target) {
      const event = new Event('keydown', {cancelable: true});
      if (typeof target !== 'undefined') {
        Object.defineProperty(event, 'target', {value: target});
      }
      return event;
    }

    test('init enables keydown forwarding to the selected tool', () => {
      const root = new EventTarget();
      const {controller, tool0} = makeController(root);
      controller.init();

      // no selected tool: nothing happens
      root.dispatchEvent(keydown());
      controller.setSelectedTool('tool0');
      root.dispatchEvent(keydown());
      assert.deepEqual(tool0.events, ['keydown']);
    });

    test('no keydown forwarding before init', () => {
      const root = new EventTarget();
      const {controller, tool0} = makeController(root);
      controller.setSelectedTool('tool0');
      root.dispatchEvent(keydown());
      assert.deepEqual(tool0.events, []);
    });

    test('default to document', () => {
      const root = new EventTarget();
      vi.stubGlobal('document', root);
      try {
        const {controller, tool0} = makeController();
        controller.init();
        controller.setSelectedTool('tool0');
        root.dispatchEvent(keydown());
        assert.deepEqual(tool0.events, ['keydown']);
        controller.enableShortcuts(false);
      } finally {
        vi.unstubAllGlobals();
      }
    });

    test('no document: no shortcuts', () => {
      const {controller} = makeController();
      assert.doesNotThrow(() => {
        controller.init();
        controller.enableShortcuts(false);
      });
    });

    test('keydown from editable elements is ignored', () => {
      const root = new EventTarget();
      const {controller, tool0} = makeController(root);
      controller.init();
      controller.setSelectedTool('tool0');
      for (const tagName of ['INPUT', 'SELECT', 'TEXTAREA']) {
        root.dispatchEvent(keydown(new TestElement(tagName)));
      }
      const editable = new TestElement('DIV');
      editable.isContentEditable = true;
      root.dispatchEvent(keydown(editable));
      assert.deepEqual(tool0.events, []);
      // non editable element
      root.dispatchEvent(keydown(new TestElement('DIV')));
      assert.deepEqual(tool0.events, ['keydown']);
    });

    test('default prevented keydown is ignored', () => {
      const root = new EventTarget();
      const {controller, tool0} = makeController(root);
      controller.init();
      controller.setSelectedTool('tool0');
      // a listener on the way prevents the default
      const event = keydown();
      event.preventDefault();
      root.dispatchEvent(event);
      assert.deepEqual(tool0.events, []);
    });

    test('enableShortcuts(false) stops keydown forwarding', () => {
      const root = new EventTarget();
      const {controller, tool0} = makeController(root);
      controller.init();
      controller.setSelectedTool('tool0');

      controller.enableShortcuts(false);
      root.dispatchEvent(keydown());
      assert.deepEqual(tool0.events, []);

      controller.enableShortcuts(true);
      // enabling twice does not double the forwarding
      controller.enableShortcuts(true);
      root.dispatchEvent(keydown());
      assert.deepEqual(tool0.events, ['keydown']);
      // disabling twice is fine
      controller.enableShortcuts(false);
      controller.enableShortcuts(false);
      root.dispatchEvent(keydown());
      assert.deepEqual(tool0.events, ['keydown']);
    });

  });

  /**
   * Tests for {@link ToolboxController} layer binding.
   */
  describe('ToolboxController layers', () => {

    test('bindLayerGroup forwards interaction events', () => {
      const {controller, tool0, tool1} = makeController();
      const layer = new TestLayer('layer0');
      controller.bindLayerGroup(new TestLayerGroup('group0'), layer);
      assert.equal(layer.bindCalls, 1);

      // no selected tool: nothing happens
      layer.dispatchEvent(new Event('mousedown'));

      controller.setSelectedTool('tool0');
      for (const name of InteractionEventNames) {
        layer.dispatchEvent(new Event(name));
      }
      assert.deepEqual(tool0.events, InteractionEventNames);

      // events go to the newly selected tool
      controller.setSelectedTool('tool1');
      layer.dispatchEvent(new Event('mouseup'));
      assert.deepEqual(tool1.events, ['mouseup']);
      assert.equal(tool0.events.length, InteractionEventNames.length);
    });

    test('tool without handler for an event is skipped', () => {
      const tool = {activate: () => {}};
      const controller = new ToolboxController({tool});
      const layer = new TestLayer('layer0');
      controller.bindLayerGroup(new TestLayerGroup('group0'), layer);
      controller.setSelectedTool('tool');
      assert.doesNotThrow(() => {
        layer.dispatchEvent(new Event('mousedown'));
      });
    });

    test('non interaction events are not forwarded', () => {
      const {controller, tool0} = makeController();
      tool0.positionchange = vi.fn();
      const layer = new TestLayer('layer0');
      controller.bindLayerGroup(new TestLayerGroup('group0'), layer);
      controller.setSelectedTool('tool0');
      layer.dispatchEvent(new Event('positionchange'));
      assert.equal(tool0.positionchange.mock.calls.length, 0);
    });

    test('active layer change rebinds the layer group', () => {
      const {controller, tool0} = makeController();
      controller.setSelectedTool('tool0');
      const group = new TestLayerGroup('group0');
      const layer0 = new TestLayer('layer0');
      const layer1 = new TestLayer('layer1');
      controller.bindLayerGroup(group, layer0);

      group.fireActiveLayerChange({value: [layer1]});
      assert.equal(layer0.unbindCalls, 1);
      assert.equal(layer1.bindCalls, 1);

      // old layer is not listened to anymore
      layer0.dispatchEvent(new Event('mousedown'));
      assert.deepEqual(tool0.events, []);
      layer1.dispatchEvent(new Event('mousedown'));
      assert.deepEqual(tool0.events, ['mousedown']);
    });

    test('active layer change during a touch keeps the previous layer ' +
      'bound until the touch ends', () => {
      const {controller, tool0} = makeController();
      controller.setSelectedTool('tool0');
      const group = new TestLayerGroup('group0');
      const layer0 = new TestLayer('layer0');
      const layer1 = new TestLayer('layer1');
      controller.bindLayerGroup(group, layer0);

      // for ex the draw tool creates a draw layer on touchstart
      layer0.dispatchEvent(touchEvent('touchstart'));
      group.fireActiveLayerChange({value: [layer1]});
      assert.equal(layer0.unbindCalls, 0);
      assert.equal(layer1.bindCalls, 1);

      // the touch events still go to the previous layer
      layer0.dispatchEvent(touchEvent('touchmove'));
      layer0.dispatchEvent(touchEvent('touchend'));
      assert.deepEqual(tool0.events, ['touchstart', 'touchmove', 'touchend']);
      assert.equal(layer0.unbindCalls, 1);

      // previous layer is not listened to anymore
      layer0.dispatchEvent(touchEvent('touchstart'));
      layer1.dispatchEvent(touchEvent('touchstart'));
      assert.deepEqual(tool0.events,
        ['touchstart', 'touchmove', 'touchend', 'touchstart']);
    });

    test('active layer change from the tool touchstart keeps the ' +
      'previous layer bound', () => {
      const {controller, tool0} = makeController();
      controller.setSelectedTool('tool0');
      const group = new TestLayerGroup('group0');
      const layer0 = new TestLayer('layer0');
      const layer1 = new TestLayer('layer1');
      controller.bindLayerGroup(group, layer0);

      // for ex the draw tool creates a draw layer on touchstart
      const touchstart = tool0.touchstart;
      tool0.touchstart = (event) => {
        touchstart(event);
        group.fireActiveLayerChange({value: [layer1]});
      };
      layer0.dispatchEvent(touchEvent('touchstart'));
      assert.equal(layer0.unbindCalls, 0);

      layer0.dispatchEvent(touchEvent('touchmove'));
      layer0.dispatchEvent(touchEvent('touchend'));
      assert.deepEqual(tool0.events, ['touchstart', 'touchmove', 'touchend']);
      assert.equal(layer0.unbindCalls, 1);
    });

    test('previous layer stays bound while fingers remain', () => {
      const {controller} = makeController();
      const group = new TestLayerGroup('group0');
      const layer0 = new TestLayer('layer0');
      const layer1 = new TestLayer('layer1');
      controller.bindLayerGroup(group, layer0);

      layer0.dispatchEvent(touchEvent('touchstart'));
      group.fireActiveLayerChange({value: [layer1]});
      // second finger on the same layer
      layer0.dispatchEvent(touchEvent('touchstart', 2));
      // one finger up, one still down
      layer0.dispatchEvent(touchEvent('touchend', 1));
      assert.equal(layer0.unbindCalls, 0);
      // touch cancel also ends the touch
      layer0.dispatchEvent(touchEvent('touchcancel'));
      assert.equal(layer0.unbindCalls, 1);
    });

    test('previous layer is unbound when its own touches end', () => {
      const {controller} = makeController();
      const group = new TestLayerGroup('group0');
      const layer0 = new TestLayer('layer0');
      const layer1 = new TestLayer('layer1');
      controller.bindLayerGroup(group, layer0);

      layer0.dispatchEvent(touchEvent('touchstart', 1));
      group.fireActiveLayerChange({value: [layer1]});
      // second finger lands on the new layer
      layer1.dispatchEvent(touchEvent('touchstart', 1));
      // first finger up: previous layer has no more touches
      layer0.dispatchEvent(touchEvent('touchend'));
      assert.equal(layer0.unbindCalls, 1);
      layer1.dispatchEvent(touchEvent('touchend'));
      assert.equal(layer1.unbindCalls, 0);
    });

    test('reactivating the touched layer during the touch keeps it bound',
      () => {
        const {controller, tool0} = makeController();
        controller.setSelectedTool('tool0');
        const group = new TestLayerGroup('group0');
        const layer0 = new TestLayer('layer0');
        const layer1 = new TestLayer('layer1');
        controller.bindLayerGroup(group, layer0);

        layer0.dispatchEvent(touchEvent('touchstart'));
        group.fireActiveLayerChange({value: [layer1]});
        group.fireActiveLayerChange({value: [layer0]});
        assert.equal(layer0.bindCalls, 1);
        assert.equal(layer1.unbindCalls, 1);

        layer0.dispatchEvent(touchEvent('touchend'));
        assert.equal(layer0.unbindCalls, 0);
        layer0.dispatchEvent(new Event('mousedown'));
        assert.deepEqual(tool0.events,
          ['touchstart', 'touchend', 'mousedown']);
      });

    test('active layer change without layer is ignored', () => {
      const {controller} = makeController();
      const group = new TestLayerGroup('group0');
      const layer0 = new TestLayer('layer0');
      controller.bindLayerGroup(group, layer0);

      group.fireActiveLayerChange(undefined);
      group.fireActiveLayerChange({});
      group.fireActiveLayerChange({value: []});
      assert.equal(layer0.unbindCalls, 0);
      assert.equal(layer0.bindCalls, 1);
    });

    test('layer groups are bound independently', () => {
      const {controller, tool0} = makeController();
      controller.setSelectedTool('tool0');
      const group0 = new TestLayerGroup('group0');
      const group1 = new TestLayerGroup('group1');
      const layer0 = new TestLayer('layer0');
      const layer1 = new TestLayer('layer1');
      const layer2 = new TestLayer('layer2');
      controller.bindLayerGroup(group0, layer0);
      controller.bindLayerGroup(group1, layer1);

      // changing group1 active layer does not touch group0
      group1.fireActiveLayerChange({value: [layer2]});
      assert.equal(layer0.unbindCalls, 0);
      assert.equal(layer1.unbindCalls, 1);

      layer0.dispatchEvent(new Event('mousedown'));
      layer1.dispatchEvent(new Event('mouseup'));
      layer2.dispatchEvent(new Event('mousemove'));
      assert.deepEqual(tool0.events, ['mousedown', 'mousemove']);
    });

  });

});
