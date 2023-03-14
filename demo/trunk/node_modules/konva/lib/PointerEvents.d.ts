import { KonvaEventObject } from './Node';
import { Shape } from './Shape';
import { Stage } from './Stage';
export interface KonvaPointerEvent extends KonvaEventObject<PointerEvent> {
    pointerId: number;
}
export declare function getCapturedShape(pointerId: number): Shape<import("./Shape").ShapeConfig> | Stage;
export declare function createEvent(evt: PointerEvent): KonvaPointerEvent;
export declare function hasPointerCapture(pointerId: number, shape: Shape | Stage): boolean;
export declare function setPointerCapture(pointerId: number, shape: Shape | Stage): void;
export declare function releaseCapture(pointerId: number, target?: Shape | Stage): void;
