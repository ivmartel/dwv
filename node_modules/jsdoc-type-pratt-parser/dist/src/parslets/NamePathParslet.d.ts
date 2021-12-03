import { InfixParslet } from './Parslet';
import { TokenType } from '../lexer/Token';
import { Precedence } from '../Precedence';
import { Parser } from '../Parser';
import { IntermediateResult } from '../result/IntermediateResult';
import { TerminalResult } from '../result/TerminalResult';
interface NamePathParsletOptions {
    allowJsdocNamePaths: boolean;
}
export declare class NamePathParslet implements InfixParslet {
    private readonly allowJsdocNamePaths;
    private readonly allowedPropertyTokenTypes;
    constructor(opts: NamePathParsletOptions);
    accepts(type: TokenType, next: TokenType): boolean;
    getPrecedence(): Precedence;
    parseInfix(parser: Parser, left: IntermediateResult): TerminalResult;
}
export {};
