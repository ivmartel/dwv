import { Shape, ShapeConfig } from '../Shape';
import { Context } from '../Context';
import { GetSet, Vector2d } from '../types';
export interface EllipseConfig extends ShapeConfig {
    radiusX: number;
    radiusY: number;
}
export declare class Ellipse extends Shape<EllipseConfig> {
    _sceneFunc(context: Context): void;
    getWidth(): number;
    getHeight(): number;
    setWidth(width: number): void;
    setHeight(height: number): void;
    radius: GetSet<Vector2d, this>;
    radiusX: GetSet<number, this>;
    radiusY: GetSet<number, this>;
}
