import {WindowLevel} from './windowLevel';
import {Scroll} from './scroll';
import {ZoomAndPan} from './zoomPan';
import {Opacity} from './opacity';
import {Draw} from './draw';
import {Floodfill} from './floodfill';
import {Livewire} from './livewire';

import {ArrowFactory} from './arrow';
import {CircleFactory} from './circle';
import {EllipseFactory} from './ellipse';
import {ProtractorFactory} from './protractor';
import {RectangleFactory} from './rectangle';
import {RoiFactory} from './roi';
import {RulerFactory} from './ruler';

import {Filter, Threshold, Sobel, Sharpen} from './filter';

/**
 * List of client provided tools to be added to
 * the default ones.
 *
 * @example
 * // custom tool
 * class AlertTool {
 *   mousedown() {alert('AlertTool mousedown');}
 *   init() {}
 *   activate() {}
 * }
 * // pass it to dwv tool list
 * dwv.toolList['Alert'] = AlertTool;
 * // create the dwv app
 * const app = new dwv.App();
 * // initialise
 * const viewConfig0 = new dwv.ViewConfig('layerGroup0');
 * const viewConfigs = {'*': [viewConfig0]};
 * const options = new dwv.AppOptions(viewConfigs);
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
 * // custom factory
 * class LoveFactory {
 *   getName() {return 'love';}
 *   static supports(mathShape) {return mathShape instanceof ROI;}
 *   getNPoints() {return 1;}
 *   getTimeout() {return 0;}
 *   setAnnotationMathShape(annotation, points) {
 *     const px = points[0].getX();
 *     const py = points[0].getY();
 *     annotation.mathShape = new dwv.ROI([
 *       new dwv.Point2D(px+15,py), new dwv.Point2D(px+10,py-10),
 *       new dwv.Point2D(px,py), new dwv.Point2D(px-10,py-10),
 *       new dwv.Point2D(px-15,py), new dwv.Point2D(px,py+20)
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
 *     group.id(annotation.id);
 *     group.add(shape);
 *     return group;
 *   }
 * }
 * // pass it to dwv option list
 * dwv.toolOptions['draw'] = {LoveFactory};
 * // create the dwv app
 * const app = new dwv.App();
 * // initialise
 * const viewConfig0 = new dwv.ViewConfig('layerGroup0');
 * const viewConfigs = {'*': [viewConfig0]};
 * const options = new dwv.AppOptions(viewConfigs);
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