import {describe, test, assert, vi, beforeEach, afterEach} from 'vitest';
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
 * Create a controller with two test tools.
 *
 * @returns {object} The controller and its tools.
 */
function makeController() {
  const tool0 = new TestTool();
  const tool1 = new TestTool();
  const controller = new ToolboxController({tool0, tool1});
  return {controller, tool0, tool1};
}

describe('app', () => {

  const controllers = [];

  beforeEach(() => {
    // shortcuts listen to window keydown
    vi.stubGlobal('window', new EventTarget());
  });

  afterEach(() => {
    // remove window listeners added by init
    for (const controller of controllers) {
      controller.enableShortcuts(false);
    }
    controllers.length = 0;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
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
      controllers.push(controller);
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

    test('init enables keydown forwarding to the selected tool', () => {
      const {controller, tool0} = makeController();
      controllers.push(controller);
      controller.init();

      // no selected tool: nothing happens
      window.dispatchEvent(new Event('keydown'));
      controller.setSelectedTool('tool0');
      window.dispatchEvent(new Event('keydown'));
      assert.deepEqual(tool0.events, ['keydown']);
    });

    test('enableShortcuts(false) stops keydown forwarding', () => {
      const {controller, tool0} = makeController();
      controllers.push(controller);
      controller.init();
      controller.setSelectedTool('tool0');

      controller.enableShortcuts(false);
      window.dispatchEvent(new Event('keydown'));
      assert.deepEqual(tool0.events, []);

      controller.enableShortcuts(true);
      // enabling twice does not double the forwarding
      controller.enableShortcuts(true);
      window.dispatchEvent(new Event('keydown'));
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
