import {WindowLevel} from './windowLevel';
import {Scroll} from './scroll';
import {ZoomAndPan} from './zoomPan';
import {Opacity} from './opacity';
import {Draw} from './draw';

import {ArrowFactory} from './arrow';
import {CircleFactory} from './circle';
import {EllipseFactory} from './ellipse';
import {ProtractorFactory} from './protractor';
import {RectangleFactory} from './rectangle';

import {Threshold, Sobel, Sharpen} from './filter';

export const toolList = {
  WindowLevel,
  Scroll,
  ZoomAndPan,
  Opacity,
  Draw
};

export const toolOptions = {
  draw: {
    ArrowFactory,
    CircleFactory,
    EllipseFactory,
    ProtractorFactory,
    RectangleFactory
  },
  filter: {
    Threshold,
    Sobel,
    Sharpen
  }
};