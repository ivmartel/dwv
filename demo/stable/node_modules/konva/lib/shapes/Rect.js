import { Factory } from '../Factory.js';
import { Shape } from '../Shape.js';
import { _registerNode } from '../Global.js';
import { Util } from '../Util.js';
import { getNumberOrArrayOfNumbersValidator } from '../Validators.js';
export class Rect extends Shape {
    _sceneFunc(context) {
        var cornerRadius = this.cornerRadius(), width = this.width(), height = this.height();
        context.beginPath();
        if (!cornerRadius) {
            context.rect(0, 0, width, height);
        }
        else {
            Util.drawRoundedRectPath(context, width, height, cornerRadius);
        }
        context.closePath();
        context.fillStrokeShape(this);
    }
}
Rect.prototype.className = 'Rect';
_registerNode(Rect);
Factory.addGetterSetter(Rect, 'cornerRadius', 0, getNumberOrArrayOfNumbersValidator(4));
