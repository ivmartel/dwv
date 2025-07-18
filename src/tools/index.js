import {WindowLevel} from './windowLevel.js';
import {Scroll} from './scroll.js';
import {ZoomAndPan} from './zoomPan.js';
import {Opacity} from './opacity.js';
import {Draw} from './draw.js';
import {Brush} from './brush.js';
import {Floodfill} from './floodfill.js';
import {Livewire} from './livewire.js';

import {ArrowFactory} from './arrow.js';
import {CircleFactory} from './circle.js';
import {EllipseFactory} from './ellipse.js';
import {ProtractorFactory} from './protractor.js';
import {RectangleFactory} from './rectangle.js';
import {RoiFactory} from './roi.js';
import {RulerFactory} from './ruler.js';

import {Filter, Threshold, Sobel, Sharpen} from './filter.js';

/**
 * List of client provided tools to be added to
 * the default ones.
 *
 * @example
 * import {App, AppOptions, ViewConfig, toolList} from '//esm.sh/dwv';
 * // custom tool
 * class AlertTool {
 *   mousedown() {alert('AlertTool mousedown');}
 *   init() {}
 *   activate() {}
 * }
 * // pass it to dwv tool list
 * toolList['Alert'] = AlertTool;
 * // create the dwv app
 * const app = new App();
 * // initialise
 * const viewConfig0 = new ViewConfig('layerGroup0');
 * const viewConfigs = {'*': [viewConfig0]};
 * const options = new AppOptions(viewConfigs);
 * options.tools = {Alert: {}};
 * app.init(options);
 * // activate tool
 * app.addEventListener('load', function () {
 *   app.setTool('Alert');
 * });
 * // load dicom data
 * app.loadURLs([
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm'
 * ]);
 *
 * @type {Object<string, any>}
 */
export const toolList = {};

/**
 * List of client provided tool options to be added to
 * the default ones.
 *
 * @example
 * import {App, AppOptions, ViewConfig, toolOptions, ROI, Point2D}
 *   from '//esm.sh/dwv';
 * // custom factory
 * class LoveFactory {
 *   getName() {return 'love';}
 *   static supports(mathShape) {return mathShape instanceof ROI;}
 *   getNPoints() {return 1;}
 *   getTimeout() {return 0;}
 *   setAnnotationMathShape(annotation, points) {
 *     const px = points[0].getX();
 *     const py = points[0].getY();
 *     annotation.mathShape = new ROI([
 *       new Point2D(px+15,py), new Point2D(px+10,py-10),
 *       new Point2D(px,py), new Point2D(px-10,py-10),
 *       new Point2D(px-15,py), new Point2D(px,py+20)
 *     ]);
 *     annotation.getFactory = function () {return new LoveFactory();}
 *   }
 *   createShapeGroup(annotation, style) {
 *     const roi = annotation.mathShape;
 *     // konva line
 *     const arr = [];
 *     for (let i = 0; i < roi.getLength(); ++i) {
 *       arr.push(roi.getPoint(i).getX());
 *       arr.push(roi.getPoint(i).getY());
 *     }
 *     const shape = new Konva.Line({
 *       name: 'shape', points: arr,
 *       stroke: 'red', strokeWidth: 2,
 *       closed: true
 *     });
 *     // konva group
 *     const group = new Konva.Group();
 *     group.name('love-group');
 *     group.visible(true);
 *     group.id(annotation.trackingUid);
 *     group.add(shape);
 *     return group;
 *   }
 * }
 * // pass it to dwv option list
 * toolOptions['draw'] = {LoveFactory};
 * // create the dwv app
 * const app = new App();
 * // initialise
 * const viewConfig0 = new ViewConfig('layerGroup0');
 * const viewConfigs = {'*': [viewConfig0]};
 * const options = new AppOptions(viewConfigs);
 * options.tools = {Draw: {options: ['Love']}};
 * app.init(options);
 * // activate tool
 * app.addEventListener('load', function () {
 *   app.setTool('Draw');
 *   app.setToolFeatures({shapeName: 'Love'});
 * });
 * // load dicom data
 * app.loadURLs([
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm'
 * ]);
 *
 * @type {Object<string, Object<string, any>>}
 */
export const toolOptions = {};

/**
 * Default tool list.
 *
 * @type {Object<string, any>}
 */
export const defaultToolList = {
  WindowLevel,
  Scroll,
  ZoomAndPan,
  Opacity,
  Draw,
  Brush,
  Filter,
  Floodfill,
  Livewire
};

/**
 * Default tool options.
 *
 * @type {Object<string, Object<string, any>>}
 */
export const defaultToolOptions = {
  draw: {
    ArrowFactory,
    CircleFactory,
    EllipseFactory,
    ProtractorFactory,
    RectangleFactory,
    RoiFactory,
    RulerFactory
  },
  filter: {
    Threshold,
    Sobel,
    Sharpen
  }
};