import { TransformRules } from './transform';
import { TerminalResult } from '../result/TerminalResult';
export declare function quote(value: string, quote: 'single' | 'double' | undefined): string;
export declare function stringifyRules(): TransformRules<string>;
export declare function stringify(result: TerminalResult): string;
