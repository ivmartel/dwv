import { Shape, ShapeConfig } from '../Shape';
import { GetSet } from '../types';
import { Context } from '../Context';
export interface CircleConfig extends ShapeConfig {
    radius?: number;
}
export declare class Circle extends Shape<CircleConfig> {
    _sceneFunc(context: Context): void;
    getWidth(): number;
    getHeight(): number;
    setWidth(width: number): void;
    setHeight(height: number): void;
    radius: GetSet<number, this>;
}
