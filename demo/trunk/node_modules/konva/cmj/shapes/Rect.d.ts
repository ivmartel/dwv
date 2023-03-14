import { Shape, ShapeConfig } from '../Shape';
import { GetSet } from '../types';
import { Context } from '../Context';
export interface RectConfig extends ShapeConfig {
    cornerRadius?: number | number[];
}
export declare class Rect extends Shape<RectConfig> {
    _sceneFunc(context: Context): void;
    cornerRadius: GetSet<number | number[], this>;
}
