import { InfixParslet, PrefixParslet } from './Parslet';
import { TokenType } from '../lexer/Token';
import { Precedence } from '../Precedence';
import { Parser } from '../Parser';
import { TerminalResult, VariadicResult } from '../result/TerminalResult';
import { IntermediateResult } from '../result/IntermediateResult';
interface VariadicParsletOptions {
    allowEnclosingBrackets: boolean;
}
export declare class VariadicParslet implements PrefixParslet, InfixParslet {
    private readonly allowEnclosingBrackets;
    constructor(opts: VariadicParsletOptions);
    accepts(type: TokenType): boolean;
    getPrecedence(): Precedence;
    parsePrefix(parser: Parser): VariadicResult<TerminalResult>;
    parseInfix(parser: Parser, left: IntermediateResult): TerminalResult;
}
export {};
