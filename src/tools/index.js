import {WindowLevel} from './windowLevel';
import {Scroll} from './scroll';
import {ZoomAndPan} from './zoomPan';
import {Opacity} from './opacity';
import {Draw} from './draw';
import {Floodfill} from './floodfill';
import {Livewire} from './livewire';
import {ZoomIn} from './zoomIn';
import {ZoomOut} from './zoomOut';
import {Pan} from './pan';


import {Select} from './select';
import {ArrowFactory} from './arrow';
import {CircleFactory} from './circle';
import {EllipseFactory} from './ellipse';
import {FreeHandFactory} from './freeHand';
import {ProtractorFactory} from './protractor';
import {RectangleFactory} from './rectangle';
import {RoiFactory} from './roi';
import {RulerFactory} from './ruler';

import {Filter, Threshold, Sobel, Sharpen} from './filter';

/**
 * List of client provided tools to be added to
 * the default ones.
 *
 * @type {Object<string, any>}
 */
export const toolList = {};

export const defaultToolList = {
  WindowLevel,
  Scroll,
  ZoomAndPan,
  Opacity,
  Draw,
  Filter,
  Floodfill,
  Livewire,
  ZoomIn,
  ZoomOut,
  Pan,
};

export const toolOptions = {
  draw: {
    ArrowFactory,
    CircleFactory,
    EllipseFactory,
    FreeHandFactory,
    ProtractorFactory,
    RectangleFactory,
    RoiFactory,
    RulerFactory,
    SelectFactory: Select,
  },
  filter: {
    Threshold,
    Sobel,
    Sharpen
  }
};