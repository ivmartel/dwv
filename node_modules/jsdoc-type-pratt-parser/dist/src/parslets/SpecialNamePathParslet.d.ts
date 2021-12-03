import { PrefixParslet } from './Parslet';
import { TokenType } from '../lexer/Token';
import { Precedence } from '../Precedence';
import { Parser } from '../Parser';
import { SpecialNamePathType, TerminalResult } from '../result/TerminalResult';
interface SpecialNamePathParsletOptions {
    allowedTypes: SpecialNamePathType[];
}
export declare class SpecialNamePathParslet implements PrefixParslet {
    private readonly allowedTypes;
    constructor(opts: SpecialNamePathParsletOptions);
    accepts(type: TokenType, next: TokenType): boolean;
    getPrecedence(): Precedence;
    parsePrefix(parser: Parser): TerminalResult;
}
export {};
