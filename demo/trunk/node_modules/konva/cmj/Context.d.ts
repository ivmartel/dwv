import { Canvas } from './Canvas';
import { Shape } from './Shape';
import { IRect } from './types';
declare var CONTEXT_PROPERTIES: readonly ["fillStyle", "strokeStyle", "shadowColor", "shadowBlur", "shadowOffsetX", "shadowOffsetY", "lineCap", "lineDashOffset", "lineJoin", "lineWidth", "miterLimit", "font", "textAlign", "textBaseline", "globalAlpha", "globalCompositeOperation", "imageSmoothingEnabled"];
export declare class Context {
    canvas: Canvas;
    _context: CanvasRenderingContext2D;
    traceArr: Array<String>;
    constructor(canvas: Canvas);
    fillShape(shape: Shape): void;
    _fill(shape: Shape): void;
    strokeShape(shape: Shape): void;
    _stroke(shape: any): void;
    fillStrokeShape(shape: Shape): void;
    getTrace(relaxed?: any, rounded?: any): string;
    clearTrace(): void;
    _trace(str: any): void;
    reset(): void;
    getCanvas(): Canvas;
    clear(bounds?: IRect): void;
    _applyLineCap(shape: any): void;
    _applyOpacity(shape: any): void;
    _applyLineJoin(shape: Shape): void;
    setAttr(attr: string, val: any): void;
    arc(a0: number, a1: number, a2: number, a3: number, a4: number, a5?: boolean): void;
    arcTo(a0: number, a1: number, a2: number, a3: number, a4: number): void;
    beginPath(): void;
    bezierCurveTo(a0: number, a1: number, a2: number, a3: number, a4: number, a5: number): void;
    clearRect(a0: number, a1: number, a2: number, a3: number): void;
    clip(): void;
    closePath(): void;
    createImageData(a0: any, a1: any): ImageData;
    createLinearGradient(a0: number, a1: number, a2: number, a3: number): CanvasGradient;
    createPattern(a0: CanvasImageSource, a1: string | null): CanvasPattern;
    createRadialGradient(a0: number, a1: number, a2: number, a3: number, a4: number, a5: number): CanvasGradient;
    drawImage(a0: CanvasImageSource, a1: number, a2: number, a3?: number, a4?: number, a5?: number, a6?: number, a7?: number, a8?: number): void;
    ellipse(a0: number, a1: number, a2: number, a3: number, a4: number, a5: number, a6: number, a7?: boolean): void;
    isPointInPath(x: number, y: number, path?: Path2D, fillRule?: CanvasFillRule): boolean;
    fill(path2d?: Path2D): void;
    fillRect(x: number, y: number, width: number, height: number): void;
    strokeRect(x: number, y: number, width: number, height: number): void;
    fillText(text: string, x: number, y: number, maxWidth?: number): void;
    measureText(text: string): TextMetrics;
    getImageData(a0: number, a1: number, a2: number, a3: number): ImageData;
    lineTo(a0: number, a1: number): void;
    moveTo(a0: number, a1: number): void;
    rect(a0: number, a1: number, a2: number, a3: number): void;
    putImageData(a0: ImageData, a1: number, a2: number): void;
    quadraticCurveTo(a0: number, a1: number, a2: number, a3: number): void;
    restore(): void;
    rotate(a0: number): void;
    save(): void;
    scale(a0: number, a1: number): void;
    setLineDash(a0: number[]): void;
    getLineDash(): number[];
    setTransform(a0: number, a1: number, a2: number, a3: number, a4: number, a5: number): void;
    stroke(path2d?: Path2D): void;
    strokeText(a0: string, a1: number, a2: number, a3: number): void;
    transform(a0: number, a1: number, a2: number, a3: number, a4: number, a5: number): void;
    translate(a0: number, a1: number): void;
    _enableTrace(): void;
    _applyGlobalCompositeOperation(node: any): void;
}
type CanvasContextProps = Pick<CanvasRenderingContext2D, typeof CONTEXT_PROPERTIES[number]>;
export interface Context extends CanvasContextProps {
}
export declare class SceneContext extends Context {
    constructor(canvas: Canvas);
    _fillColor(shape: Shape): void;
    _fillPattern(shape: any): void;
    _fillLinearGradient(shape: any): void;
    _fillRadialGradient(shape: any): void;
    _fill(shape: any): void;
    _strokeLinearGradient(shape: any): void;
    _stroke(shape: any): void;
    _applyShadow(shape: any): void;
}
export declare class HitContext extends Context {
    constructor(canvas: Canvas);
    _fill(shape: any): void;
    strokeShape(shape: Shape): void;
    _stroke(shape: any): void;
}
export {};
