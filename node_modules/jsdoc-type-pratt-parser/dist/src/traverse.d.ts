import { NonTerminalResult } from './result/NonTerminalResult';
import { TerminalResult } from './result/TerminalResult';
declare type NodeVisitor = (node: NonTerminalResult, parentNode?: NonTerminalResult, property?: string) => void;
export declare function traverse(node: TerminalResult, onEnter?: NodeVisitor, onLeave?: NodeVisitor): void;
export {};
